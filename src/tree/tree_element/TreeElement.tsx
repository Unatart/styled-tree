import "./TreeElement.css";
import {IConnectedTreeItem} from "../ITree";
import {TREE_ELEMENT_X_OFFSET} from "../../constants";

export const renderTreeElement = (data: IConnectedTreeItem, offsetX: number) => (
	<div className={"tree-element"} key={data.id} style={{transform: `translate(${(data.level || 0) * TREE_ELEMENT_X_OFFSET}pt, ${offsetX}pt)`}}>
		{data.label}
	</div>
);
