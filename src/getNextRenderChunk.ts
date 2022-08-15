import {IConnectedTreeItem, ITree} from "./tree/ITree";

export type getNextRenderChunkType<T> = (from: number, to: number)=> T[];

export const getNextRenderChunk: (tree: ITree)=> getNextRenderChunkType<IConnectedTreeItem> = (tree: ITree) => {
	const treeTraverseArray: IConnectedTreeItem[] = [];
	const stackContext: IConnectedTreeItem[] = [];
	for (let i = tree.length - 1; i >= 0; i--) {
		stackContext.push(tree[i]);
	}

	return (from: number, to: number) => {
		if (treeTraverseArray[from] && treeTraverseArray[to]) {
			return treeTraverseArray;
		}

		let index = Math.max(0, treeTraverseArray.length - 1);
		while (stackContext.length && index < to) {
			const pointer = stackContext.pop();
			if (pointer) {
				pointer.level = pointer.level ?? 0;
				pointer.hidden = pointer.hidden ?? false;
				for (let j = pointer.children.length - 1; j >= 0; j--) {
					pointer.children[j].level = pointer.level + 1;
					stackContext.push(pointer.children[j]);
				}
				treeTraverseArray.push(pointer);
			}
			index++;
		}

		return treeTraverseArray;
	};
};

