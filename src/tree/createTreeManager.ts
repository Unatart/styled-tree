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

// TODO: рефачить только по необходимости или после написания тестов -_-
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
		// console.log(pointer);
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
		// console.log(prevLimits);
		let to = chunkLimits[1];

		if (action === "update") {
			chunkLimits[1] = to > 0 ? to : to + config.pageSize;
			// console.log(chunkLimits);
			return prevLimits;
		}

		let from = chunkLimits[0];
		if (action === "down") {
			// console.log(to, treeTraverseArray.length, stackContext.length, to > treeTraverseArray.length - 1 && stackContext.length === 0);
			if (to + config.tolerance > treeTraverseArray.length - 1 && stackContext.length === 0) {
				from -= (to - treeTraverseArray.length);
				to = treeTraverseArray.length;
			} else {
				from += config.tolerance;
				to += config.tolerance;
			}

			chunkLimits = [from, to];
			// console.log(chunkLimits);
			return prevLimits;
		}

		if (action === "up") {
			// console.log(chunkLimits);
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
			// console.log(i, treeTraverseArray[i]);
			if (treeTraverseArray[i].hiddenChildren) {
				hidden_level = treeTraverseArray[i].level;
				result.push(treeTraverseArray[i]);
				// console.log("push parent", [...result], hidden_level);
				i++;
				continue;
			}
			const level = treeTraverseArray[i].level;
			if (hidden_level !== undefined && level !== undefined && level > hidden_level) {
				i++;
				end++;
				// console.log("continue");
				continue;
			}
			hidden_level = undefined;
			result.push(treeTraverseArray[i]);
			i++;
		}

		chunk = result;
		const lastElement = result[result.length - 1].index;
		chunkLimits[1] = lastElement ?  lastElement + 1 : end - 1;

		// console.log("DOWN", result, treeTraverseArray);
		if (result.length >= end - 1 - from) {
			return result;
		}
		if (stackContext.length === 0 && chunkLimits[0] === 0) {
			return result;
		}
	};

	const goUp = (from: number, to: number, startIndex: number) => {
		const result = chunk.filter((element) => element.index !== undefined && element.index >= startIndex && element.index < to);
		// console.log("sliced:", [...result], prevStart, to);
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
				result.unshift(firstParentWithHiddenChild);
				// console.log("added", firstParentWithHiddenChild);
				start = firstParentWithHiddenChild?.index === undefined ? start-- : start - (i - firstParentWithHiddenChild?.index);
				i = firstParentWithHiddenChild?.index === undefined ? i-- : firstParentWithHiddenChild?.index;
			} else {
				result.unshift(treeTraverseArray[i]);
				// console.log("added", treeTraverseArray[i]);
				i--;
			}
		}

		chunk = result;
		chunkLimits = [Math.max(start, 0), to];

		// console.log("UP:", result, treeTraverseArray);
		return result;
	};

	const getNextChunk = (action: "up" | "down" | "update") => {
		// console.log(treeTraverseArray);
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

		// console.log(from, to, prevStart, prevEnd);
		return goUp(from, to, prevStart);
	};

	return {
		getNextChunk,
		toggleHide
	};
};

