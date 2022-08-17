import {IConnectedTreeItem} from "../ITree";
import {forwardRef, Ref} from "react";
import {TREE_ELEMENT_X_OFFSET_PX} from "../../constants";
import "./TreeElement.css";

export interface ITreeElementProps {
	data: IConnectedTreeItem;
	index: number;
	height: number;
	toggleHidden: (index: number)=> void;
}

const TreeElement = ({ data, index, toggleHidden, height }: ITreeElementProps, ref: Ref<HTMLDivElement>) => {
	return (
		<div
			className={"tree-element"}
			key={index}
			ref={ref}
			style={{ transform: `translate(${(data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px, ${index * height}px)` }}
			onClick={() => toggleHidden(data.index || index)}
		>
			{data.label}
		</div>
	);
};

export const TreeElementWithRef = forwardRef<HTMLDivElement, ITreeElementProps>(TreeElement);
