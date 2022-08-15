import "./TreeElement.css";
import {IConnectedTreeItem} from "../ITree";
import {TREE_ELEMENT_X_OFFSET} from "../../constants";

export const renderTreeElement = (data: IConnectedTreeItem, offsetX: number, onClick: (index: number)=> void, index: number) => {
	return (
		<div
			className={"tree-element"}
			key={data.id}
			style={{ transform: `translate(${(data.level || 0) * TREE_ELEMENT_X_OFFSET}px, ${offsetX}px)` }}
			onClick={() => onClick(index)}
		>
			{data.label}
		</div>
	);
};
