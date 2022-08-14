import {IConnectedTreeItem, ITree} from "../ITree";
import {useEffect, useRef, useState} from "react";

export const useTreeTraversal = (treeData: ITree | undefined, from: number, to: number): IConnectedTreeItem | undefined => {
	const stackContext = useRef<IConnectedTreeItem[]>([]);
	const prevTreeItem = useRef<IConnectedTreeItem>();
	const [nextToRender, setNextToRender] = useState<IConnectedTreeItem>();

	useEffect(() => {
		if (!treeData) {
			return;
		}

		treeData.forEach(element => stackContext.current.push(element));
		const [stack, prevItem, thisStart] = treeTraversal(stackContext.current, to, from, prevTreeItem.current);
		stackContext.current = stack;
		prevTreeItem.current = prevItem;
		setNextToRender(thisStart);
	}, [treeData?.length, from, to]);

	return nextToRender;
};

function treeTraversal(
	stackContext: IConnectedTreeItem[],
	to: number,
	index: number,
	initialPrevItem: IConnectedTreeItem | undefined,
): [IConnectedTreeItem[], IConnectedTreeItem | undefined, IConnectedTreeItem | undefined] {
	let prevItem = initialPrevItem;
	let thisStart = initialPrevItem;

	while (stackContext.length !== 0 && index <= to) {
		const element = stackContext.pop();
		if (element) {
			element.level = element.level || 0;
			element.hidden = false;
			element.children.forEach(child => {
				child.level = (element.level || 0) + 1;
				stackContext.push(child);
			});
			element.next = stackContext[stackContext.length - 1];
			if (prevItem) {
				element.prev = prevItem;
			}
		}

		prevItem = element;
		if (!thisStart) {
			thisStart = prevItem;
		}

		index++;
	}

	return [stackContext, prevItem, thisStart];
}
