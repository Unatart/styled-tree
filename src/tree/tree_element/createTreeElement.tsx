import {IConnectedTreeItem} from "../ITree";
import {createRef, CSSProperties} from "react";
import {ICON_VARIATIONS, TREE_ELEMENT_X_OFFSET_PX} from "../../constants";
import {IScrollElementResult} from "../../virtual_scroll/IVirtualScroll";
import "./TreeElement.css";
import {
	AiFillFolder,
	AiOutlineFolderOpen,
	AiOutlineMinusCircle,
	AiOutlinePlusCircle
} from "react-icons/ai";
import {
	TiChevronRight,
	TiChevronRightOutline
} from "react-icons/ti";

export interface ITreeElementProps {
	data: IConnectedTreeItem;
	index: number;
	transformStyle?: CSSProperties;
	styles?: CSSProperties;
	iconStyle?: string;
	toggleHide: (index: number) => void;
}

export const createTreeElement = (): IScrollElementResult => {
	const ref = createRef<HTMLDivElement>();

	const render = (props: ITreeElementProps) => {
		let icon = null;

		if (props.data.children.length) {
			switch (props.iconStyle) {
				case ICON_VARIATIONS.MINUS_PLUS:
					icon = props.data.hiddenChildren ? <AiOutlinePlusCircle/> : <AiOutlineMinusCircle/>;
					break;
				case ICON_VARIATIONS.CHEVRON:
					icon = props.data.hiddenChildren ? <TiChevronRight/> : <TiChevronRightOutline/>;
					break;
				case ICON_VARIATIONS.FOLDER:
					icon = props.data.hiddenChildren ? <AiFillFolder/> : <AiOutlineFolderOpen/>;
					break;
			}
		}

		return (
			<div
				key={props.index}
				className={"element"}
				style={{marginLeft: `${(props.data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px`, ...props.styles, ...props.transformStyle}}
				ref={ref}
			>
				<div key={"button"} className={"element-button"} onClick={() => props.toggleHide(props.data.index || props.index)}>{icon}</div>
				<div key={"label"} className={"element-label"}>{props.data.label}</div>
			</div>
		);
	};

	return { render, ref };
};