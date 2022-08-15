import {IConnectedTreeItem, ITree} from "./tree/ITree";

export type getNextRenderPointerType<T> = (from: number, to: number, previousPointer?: T)=> T | undefined;

export const getNextRenderPointer = (tree: ITree) => {
	const stackContext: IConnectedTreeItem[] = [];
	for (let i = tree.length - 1; i >= 0; i--) {
		stackContext.push(tree[i]);
	}

	const updateCurrent = (currentPointer: IConnectedTreeItem, currentPrevPointer?: IConnectedTreeItem) => {
		currentPointer.level = currentPointer.level ?? 0;
		for (let i = currentPointer?.children?.length - 1; i >= 0; i--) {
			currentPointer.children[i].level = currentPointer.level + 1;
			stackContext.push(currentPointer.children[i]);
		}
		currentPointer.hidden = currentPointer.hidden ?? false;
		currentPointer.index = currentPrevPointer?.index !== undefined ? currentPrevPointer.index + 1 : 0;
		currentPointer.prev = currentPointer.prev ?? currentPrevPointer;
		console.log(stackContext);
		currentPointer.next = currentPointer.next ?? stackContext.pop();
		console.log(currentPointer.next);
	};

	return (from: number, to: number, previousPointer?: IConnectedTreeItem): IConnectedTreeItem | undefined => {
		console.log("INITIAL DATA:", from, to, previousPointer);
		if (previousPointer && previousPointer.index !== undefined) {
			const previousPointerIndex = previousPointer.index;
			if (previousPointerIndex === from) {
				console.log("RETURN prev:", previousPointer);
				return previousPointer;
			}

			// Отрицательное - мы за from, положительное - мы перед from
			const fromPreviousToFromSize = from - previousPointerIndex + 1;
			console.log(fromPreviousToFromSize);
			let currentPointer: IConnectedTreeItem | undefined = previousPointer;
			if (fromPreviousToFromSize < 0) {
				for (let i = 0; i <= Math.abs(fromPreviousToFromSize); i++) {
					currentPointer = currentPointer?.prev;
				}

				console.log("RETURN from PREV:", currentPointer);
				return currentPointer;
			}

			for (let i = 0; i < Math.abs(fromPreviousToFromSize); i++) {
				const nextPointer: IConnectedTreeItem | undefined = currentPointer?.next ?? stackContext.pop();
				if (nextPointer) {
					updateCurrent(nextPointer, currentPointer);
				}
				currentPointer = nextPointer;
			}

			const startPointer = currentPointer;
			if (currentPointer?.index) {
				for (let i = currentPointer?.index; i < to; i++) {
					const nextPointer: IConnectedTreeItem | undefined = currentPointer?.next ?? stackContext.pop();
					if (nextPointer) {
						updateCurrent(nextPointer, currentPointer);
					}
					currentPointer = nextPointer;
				}
			}

			console.log("RETURN from:", currentPointer);
			return startPointer;
		}

		console.log("CREATE FROM NONE");
		let index = 0;
		let currentPointer = stackContext.pop();
		console.log("currentPointer", currentPointer);
		const resultPointer = currentPointer;
		let currentPrevPointer: IConnectedTreeItem | undefined = undefined;

		if (!currentPointer) {
			return;
		}

		while (currentPointer && index <= to) {
			console.log(currentPointer, index <= to, currentPointer && index <= to);
			console.log(index, to, currentPointer, currentPointer.next);
			updateCurrent(currentPointer, currentPrevPointer);
			console.log("after update", currentPointer, currentPointer.next);
			currentPrevPointer = currentPointer;
			currentPointer = currentPointer.next;
			index++;
		}

		console.log("RETURN make:", resultPointer);
		return resultPointer;
	};
};

