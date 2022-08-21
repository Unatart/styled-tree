import {IConnectedTreeItem, ITree} from "./ITree";

export type treeActionType = "up" | "down" | "update";

export interface ITreeManagerConfig {
	pageSize: number;
	tolerance: number;
}

export interface ITreeManager<T> {
	getNextChunk: (action: treeActionType) => T[];
	toggleHide: (index: number) => boolean;
}


export class TreeManager implements ITreeManager<IConnectedTreeItem> {
	constructor(tree: ITree, private config: ITreeManagerConfig) {
		for (let i = tree.length - 1; i >= 0; i--) {
			this.stackContext.push(tree[i]);
		}
	}

	public toggleHide(index: number) {
		if (!this.traverseArray[index] || this.traverseArray[index].children.length === 0) {
			return false;
		}

		this.traverseArray[index].hiddenChildren = !this.traverseArray[index].hiddenChildren;
		this.chunk = [];
		return true;
	}

	public getNextChunk(action: "up" | "down" | "update") {
		const [prevStart, prevEnd] = this.setLimits(action);

		let from = this.chunkLimits[0];
		let to = this.chunkLimits[1];

		if (prevStart === from && prevEnd === to && action !== "update") {
			return this.chunk;
		}

		if (action === "update") {
			return this.update(from, to);
		}

		const result = action === "up"
			? this.goUp(from, to, prevStart)
			: this.goDown(from, to, prevEnd);

		const lastElement = result[result.length - 1].index;
		if ((result.length >= this.config.pageSize) ||
			(result[0].index === from && lastElement && lastElement >= to) ||
			(this.stackContext.length === 0 && result[0].index === 0)) {
			this.chunkLimits[0] = result[0].index || this.chunkLimits[0];
			return result;
		}

		if (action === "up") {
			from = this.chunkLimits[0];
			to = this.chunkLimits[1] + (this.config.pageSize - result.length);
			return this.goDown(from, to, this.chunkLimits[1]);
		}

		from = this.chunkLimits[0] - (this.config.pageSize - result.length);
		to = this.chunkLimits[1];
		return this.goUp(from, to, this.chunkLimits[0]);
	}

	private traverseNext(index: number) {
		const pointer = this.stackContext.pop();
		if (pointer) {
			pointer.level = pointer.level ?? 0;
			pointer.index = index;
			pointer.hiddenChildren = pointer.hiddenChildren || false;
			for (let j = pointer.children.length - 1; j >= 0; j--) {
				pointer.children[j].level = pointer.level + 1;
				pointer.children[j].parent = pointer;
				this.stackContext.push(pointer.children[j]);
			}
			this.traverseArray.push(pointer);
		}
		return pointer;
	}

	private setLimits(action: "up" | "down" | "update") {
		const prevLimits = [...this.chunkLimits];
		let to = this.chunkLimits[1];

		if (action === "update") {
			this.chunkLimits[1] = to > this.config.pageSize ? to : to + this.config.pageSize;
			return prevLimits;
		}

		let from = this.chunkLimits[0];
		if (action === "down") {
			const toleranceLimit = this.chunk[prevLimits[0] + this.config.tolerance]?.index;
			const newFrom = toleranceLimit !== undefined ? toleranceLimit : from + this.config.tolerance;
			if (to + this.config.tolerance > this.traverseArray.length - 1 && this.stackContext.length === 0) {
				from -= (to - this.traverseArray.length);
				to = this.traverseArray.length;
			} else {
				from = newFrom;
				to = Math.max(newFrom + this.config.tolerance, to + this.config.tolerance);
			}

			this.chunkLimits = [from, to];
			return prevLimits;
		}

		if (action === "up") {
			const toleranceLimit = this.chunk[this.chunkLimits[1] - this.config.tolerance]?.index;
			const nextTo = Math.max(this.config.pageSize, toleranceLimit !== undefined ? toleranceLimit : to - this.config.tolerance);
			const nextFrom = nextTo - this.config.pageSize;
			this.chunkLimits = [Math.max(0, nextFrom), nextTo];
		}
		return prevLimits;
	}

	private goUp(from: number, to: number, startIndex: number) {
		let result = this.chunk.filter((element) => element.index !== undefined && element.index >= startIndex && element.index < to);
		let start = from;
		let i = startIndex - 1;
		while (i >= Math.max(start, 0)) {
			let child: IConnectedTreeItem | undefined = this.traverseArray[i];
			let firstParentWithHiddenChild: IConnectedTreeItem | undefined;
			while (child) {
				if (child.parent?.hiddenChildren) {
					firstParentWithHiddenChild = child.parent;
				}
				child = child.parent;
			}
			if (firstParentWithHiddenChild) {
				start = firstParentWithHiddenChild?.index === undefined ? start-- : start - (i - firstParentWithHiddenChild?.index);
				i = firstParentWithHiddenChild?.index === undefined ? i-- : firstParentWithHiddenChild?.index;
			} else {
				result.unshift(this.traverseArray[i]);
				i--;
			}
		}

		if (result.length > this.config.pageSize) {
			result = result.slice(0, this.config.pageSize);
		}

		this.chunk = result;
		this.chunkLimits = [Math.max(result[0].index || 0, 0), Math.max(to, (result[result.length - 1]?.index || 0) + 1)];
		return result;
	}

	private update = (from: number, to: number) => {
		const result = [];
		let end = to;
		let hidden_level: number | undefined = undefined;
		let i = from;
		while (i < end && result.length < this.config.pageSize) {
			if (this.traverseArray[i] === undefined) {
				const addedPointer = this.traverseNext(i);
				if (addedPointer === undefined) {
					break;
				}
			}
			const item = this.traverseArray[i];
			const level = item.level;
			if ((item.hiddenChildren && hidden_level !== undefined && level !== undefined && level <= hidden_level) ||
				(item.hiddenChildren && hidden_level === undefined)) {
				hidden_level = item.level;
				result.push(item);
				i++;
				continue;
			}
			if (hidden_level !== undefined && level !== undefined && level > hidden_level) {
				i++;
				end++;
				continue;
			}
			hidden_level = undefined;
			result.push(item);
			i++;
		}

		this.chunk = result;
		const lastElement = result[result.length - 1].index;
		this.chunkLimits[1] = lastElement !== undefined ?  lastElement + 1 : end - 1;

		return result;
	};

	public goDown(from: number, to: number, prevEnd: number) {
		const result = this.chunk.filter((element) => element.index !== undefined && element.index >= from && element.index <= prevEnd);
		let end = to;
		let i = prevEnd;
		let hidden_level: number | undefined = undefined;
		while (i < end && result.length < this.config.pageSize) {
			if (this.traverseArray[i] === undefined) {
				const addedPointer = this.traverseNext(i);
				if (addedPointer === undefined) {
					break;
				}
			}
			const item = this.traverseArray[i];
			const level = item.level;
			if ((item.hiddenChildren && hidden_level !== undefined && level !== undefined && level <= hidden_level) ||
				(item.hiddenChildren && hidden_level === undefined)) {
				hidden_level = item.level;
				result.push(item);
				i++;
				continue;
			}
			if (hidden_level !== undefined && level !== undefined && level > hidden_level) {
				i++;
				end++;
				continue;
			}
			hidden_level = undefined;
			result.push(item);
			i++;
		}

		this.chunk = result;
		const lastElement = result[result.length - 1].index;
		this.chunkLimits[1] = lastElement ?  lastElement + 1 : end - 1;

		return result;
	}

	private chunkLimits: [number, number] = [0, 0];
	private chunk: IConnectedTreeItem[] = [];
	private traverseArray: IConnectedTreeItem[] = [];
	private stackContext: IConnectedTreeItem[] = [];
}

