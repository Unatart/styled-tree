import {IConnectedTreeItem, ITree} from "./ITree";

export type getNextRenderChunkType<T> = {
	getNextChunk: (action: "up" | "down" | "update")=> T[];
	hideElement: (index: number)=> void;
}

export const getNextRenderChunk = (tree: ITree, pageSize: number, tolerance: number) => {
	const treeTraverseArray: IConnectedTreeItem[] = [];
	let chunk: IConnectedTreeItem[] = [];
	let chunkLimits: [number, number] = [0, 0];
	const stackContext: IConnectedTreeItem[] = [];
	for (let i = tree.length - 1; i >= 0; i--) {
		stackContext.push(tree[i]);
	}

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
			chunkLimits[1] = to > 0 ? to : to + pageSize;
			return prevLimits;
		}

		let from = chunkLimits[0];
		if (action === "down") {
			from += tolerance;
			to += tolerance;
			if (to > treeTraverseArray.length && stackContext.length === 0) {
				from -= to - treeTraverseArray.length;
				to -= to - treeTraverseArray.length;
			}

			chunkLimits = [from, to];
			return prevLimits;
		}

		if (action === "up") {
			chunkLimits = [Math.max(0, from - tolerance), Math.max(pageSize, to - tolerance)];
		}
		return prevLimits;
	};

	const getNextChunk = (action: "up" | "down" | "update") => {
		const [prevStart, prevEnd] = setLimits(action);

		// console.log(prevStart, prevEnd, chunkLimits);
		let from = chunkLimits[0];
		const to = chunkLimits[1];
		// Едем вниз или перерисовываем текущее
		let result: IConnectedTreeItem[] = [];
		if (action !== "up") {
			result = chunk.filter((element) => element.index !== undefined && element.index >= from && element.index <= prevEnd);
			// console.log("sliced:", [...result], from, prevEnd);
			let i = action === "update" ? from : prevEnd;
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
			chunkLimits[1] = end;

			console.log("DOWN", result, treeTraverseArray);
			if (result.length >= end - from) {
				return result;
			}
			console.log("result length is small");
			from -= end - to;
			// console.log(from);
		}

		// Едем вверх
		let i = prevStart - 1;
		let start = from;
		result = chunk.filter((element) => element.index !== undefined && element.index >= prevStart && element.index < to);
		// console.log("sliced:", [...result], prevStart, to);
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

		console.log("UP:", result, treeTraverseArray);
		return result;
	};

	const hideElement = (index: number): boolean => {
		if (!treeTraverseArray[index] || treeTraverseArray[index].children.length === 0) {
			return false;
		}

		treeTraverseArray[index].hiddenChildren = !treeTraverseArray[index].hiddenChildren;
		chunk = [];
		return true;
	};

	return {
		getNextChunk,
		hideElement
	};
};

