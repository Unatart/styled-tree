import {IConnectedTreeItem} from "../ITree";
import {createRef} from "react";
import {TREE_ELEMENT_X_OFFSET_PX} from "../../constants";
import {IScrollElementResult} from "../../virtual_scroll/IVirtualScroll";
import "./TreeElement.css";

export interface ITreeElementProps {
	data: IConnectedTreeItem;
	index: number;
	transformY?: number;
	toggleHide: (index: number)=> void;
}

export const createTreeElement = (): IScrollElementResult => {
	const ref = createRef<HTMLDivElement>();

	const render = (props: ITreeElementProps) => (
		<div
			className={"tree-element"}
			key={props.index}
			ref={ref}
			style={{ transform: `translate(${(props.data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px, ${props.transformY || 0}px)` }}
			onClick={() => props.toggleHide(props.data.index || props.index)}
		>
			{props.data.label}
		</div>
	);

	return { render, ref };
};