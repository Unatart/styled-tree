import {IConnectedTreeItem, ITree} from "./tree/ITree";

export type getNextRenderChunkType<T> = {
	getNextChunk: (from: number, to: number)=> T[];
	hideElement: (index: number)=> void;
}

export const getNextRenderChunk = (tree: ITree) => {
	const treeTraverseArray: IConnectedTreeItem[] = [];
	const stackContext: IConnectedTreeItem[] = [];
	for (let i = tree.length - 1; i >= 0; i--) {
		stackContext.push(tree[i]);
	}

	const getNextChunk = (from: number, to: number) => {
		if ((!treeTraverseArray[from] || !treeTraverseArray[to]) && stackContext.length > 0) {
			let index = Math.max(0, treeTraverseArray.length - 1);
			while (stackContext.length && index < to) {
				const pointer = stackContext.pop();
				if (pointer) {
					pointer.level = pointer.level ?? 0;
					pointer.hidden = pointer.hidden || false;
					for (let j = pointer.children.length - 1; j >= 0; j--) {
						pointer.children[j].level = pointer.level + 1;
						stackContext.push(pointer.children[j]);
					}
					treeTraverseArray.push(pointer);
				}
				index++;
			}
		}

		let hidden_level: number | undefined = undefined;
		const result = [];
		for (let i = 0; i < treeTraverseArray.length; i++) {
			if (treeTraverseArray[i].hidden) {
				hidden_level = treeTraverseArray[i].level;
				result.push(treeTraverseArray[i]);
				continue;
			}
			const level = treeTraverseArray[i].level;
			if (hidden_level !== undefined && level !== undefined && level > hidden_level) {
				continue;
			}
			hidden_level = undefined;
			result.push(treeTraverseArray[i]);
		}

		return result;
	};

	const hideElement = (index: number) => {
		if (!treeTraverseArray[index] || !treeTraverseArray[index].children.length) {
			return;
		}

		treeTraverseArray[index].hidden = !treeTraverseArray[index].hidden;
	};

	return {
		getNextChunk,
		hideElement
	};
};

