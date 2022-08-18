import {IConnectedTreeItem, ITree} from "./ITree";

export type treeActionType = "up" | "down" | "update";

export interface ITreeManagerConfig {
	pageSize: number;
	tolerance: number;
}

export type TreeManagerType<T> = {
	getNextChunk: (action: treeActionType)=> T[];
	toggleHide: (index: number)=> boolean;
}


export const createTreeManager = (tree: ITree, config: ITreeManagerConfig) => {
	const treeTraverseArray: IConnectedTreeItem[] = [];
	const stackContext: IConnectedTreeItem[] = [];
	for (let i = tree.length - 1; i >= 0; i--) {
		stackContext.push(tree[i]);
	}

	let chunk: IConnectedTreeItem[] = [];
	let chunkLimits: [number, number] = [0, 0];

	const toggleHide = (index: number) => {
		if (!treeTraverseArray[index] || treeTraverseArray[index].children.length === 0) {
			return false;
		}

		treeTraverseArray[index].hiddenChildren = !treeTraverseArray[index].hiddenChildren;
		chunk = [];
		return true;
	};

	const traverseNext = (index: number) => {
		const pointer = stackContext.pop();
		if (pointer) {
			pointer.level = pointer.level ?? 0;
			pointer.index = index;
			pointer.hiddenChildren = pointer.hiddenChildren || false;
			for (let j = pointer.children.length - 1; j >= 0; j--) {
				pointer.children[j].level = pointer.level + 1;
				pointer.children[j].parent = pointer;
				stackContext.push(pointer.children[j]);
			}
			treeTraverseArray.push(pointer);
		}
		return pointer;
	};

	const setLimits = (action: "up" | "down" | "update") => {
		const prevLimits = [...chunkLimits];
		let to = chunkLimits[1];

		if (action === "update") {
			chunkLimits[1] = to > 0 ? to : to + config.pageSize;
			return prevLimits;
		}

		let from = chunkLimits[0];
		if (action === "down") {
			if (to + config.tolerance > treeTraverseArray.length - 1 && stackContext.length === 0) {
				from -= (to - treeTraverseArray.length);
				to = treeTraverseArray.length;
			} else {
				from += config.tolerance;
				to += config.tolerance;
			}

			chunkLimits = [from, to];
			return prevLimits;
		}

		if (action === "up") {
			chunkLimits = [Math.max(0, from - config.tolerance), Math.max(config.pageSize, to - config.tolerance)];
		}
		return prevLimits;
	};

	const goDown = (from: number, to: number, prevStart: number, prevEnd: number, i: number) => {
		const result = chunk.filter((element) => element.index !== undefined && element.index >= from && element.index <= prevEnd);
		let end = to;
		let hidden_level: number | undefined = undefined;
		while (i < end) {
			if (treeTraverseArray[i] === undefined) {
				const addedPointer = traverseNext(i);
				if (addedPointer === undefined) {
					break;
				}
			}
			const item = treeTraverseArray[i];
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

		chunk = result;
		const lastElement = result[result.length - 1].index;
		chunkLimits[1] = lastElement ?  lastElement + 1 : end - 1;
		if (result.length >= config.pageSize) {
			return result;
		}
		if (result[0].index === from && lastElement && lastElement >= end) {
			return result;
		}
		if (stackContext.length === 0 && result[0].index === 0) {
			return result;
		}
	};

	const goUp = (from: number, to: number, startIndex: number) => {
		const result = chunk.filter((element) => element.index !== undefined && element.index >= startIndex && element.index < to);
		let start = from;
		let i = startIndex - 1;
		while ( i >= Math.max(start, 0) ) {
			let child: IConnectedTreeItem | undefined = treeTraverseArray[i];
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
				result.unshift(treeTraverseArray[i]);
				i--;
			}
		}

		chunk = result;
		chunkLimits = [Math.max(start, 0), to];
		return result;
	};

	const getNextChunk = (action: "up" | "down" | "update") => {
		const [prevStart, prevEnd] = setLimits(action);

		let from = chunkLimits[0];
		let to = chunkLimits[1];

		if (action !== "up") {
			const result = goDown(from, to, prevStart, prevEnd, action === "update" ? from : prevEnd);
			if (result && result.length) {
				return result;
			}

			from = chunkLimits[1] - config.tolerance;
			to = chunkLimits[1];
			return goUp(from, to, to);
		}

		return goUp(from, to, prevStart);
	};

	return {
		getNextChunk,
		toggleHide
	};
};

