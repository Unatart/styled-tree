import {IConnectedTreeItem} from "../ITree";
import {createRef, CSSProperties} from "react";
import {TREE_ELEMENT_X_OFFSET_PX} from "../../constants";
import {IScrollElementResult} from "../../virtual_scroll/IVirtualScroll";
import "./TreeElement.css";

export interface ITreeElementProps {
	data: IConnectedTreeItem;
	index: number;
	style?: CSSProperties;
	toggleHide: (index: number) => void;
}

export const createTreeElement = (): IScrollElementResult => {
	const ref = createRef<HTMLDivElement>();

	const render = (props: ITreeElementProps) => (
		<div
			key={props.index}
			className={"element"}
			style={{ paddingLeft: `${(props.data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px`, ...props.style }}
			ref={ref}
		>
			<div className={"element-button"} onClick={() => props.toggleHide(props.data.index || props.index)} > {props.data.children.length ? (props.data.hiddenChildren ? "+" : "-") : ""} </div>
			<div className={"element-label"}>{props.data.label}</div>
		</div>
	);

	return { render, ref };
};