import {IConnectedTreeItem, ITree} from "./tree/ITree";


export const getNextRenderPointer = (tree: ITree) => {
	const stackContext: IConnectedTreeItem[] = [];
	tree.forEach(element => stackContext.push(element));

	return (from: number, to: number, previousPointer?: IConnectedTreeItem): IConnectedTreeItem | undefined => {
		// Если предыдущий пойнтер за концом - вычислить пойнтер начала, это значит что дерево связано до этого момента
		if (previousPointer?.index || 0 >= to) {
			let current = previousPointer;
			let index = current?.index || 0;
			while (current && index > from) {
				current = current?.prev;
				index--;
			}
            
			return current;
		}

		// Если предыдущий пойнтер перед концом или его нет - вычислить пойнтер начала и пройтись по дереву, связать next и prev - если не связаны
		if (previousPointer?.index || 0 <= to) {
			let startPointer = previousPointer ? previousPointer : stackContext.pop();
			let current = startPointer;
			let index = current?.index || 0;
			while (current && index < to) {
				current.level = current.level || 0;
				current.hidden = false;
				current.children.forEach(child => {
					child.level = current ? (current.level || 0) + 1 : 1;
					stackContext.push(child);
				});
				current.index = index;
				current.next = stackContext.pop();

				current = current.next;
				index++;
			}

			// Дошагиваем до from, чтобы вернуть ссылку на место, откуда надо начинать рисовать дерево
			while (startPointer && (startPointer.index || 0) > from) {
				startPointer = startPointer?.prev;
			}

			return startPointer;
		}
	};
};

