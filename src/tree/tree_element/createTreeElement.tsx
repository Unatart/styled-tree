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
	data?: IConnectedTreeItem;
	index: number;
	transformStyle?: CSSProperties;
	styles?: CSSProperties;
	iconStyle?: string;
	toggleHide: (index: number) => void;
}

export const createTreeElement = (): IScrollElementResult => {
	const ref = createRef<HTMLDivElement>();

	const render = ({ data, index, transformStyle, styles, iconStyle, toggleHide }: ITreeElementProps) => {
		let icon = null;

		if (!data) {
			return null;
		}

		if (data.children.length) {
			switch (iconStyle) {
				case ICON_VARIATIONS.MINUS_PLUS:
					icon = data.hiddenChildren ? <AiOutlinePlusCircle/> : <AiOutlineMinusCircle/>;
					break;
				case ICON_VARIATIONS.CHEVRON:
					icon = data.hiddenChildren ? <TiChevronRight/> : <TiChevronRightOutline/>;
					break;
				case ICON_VARIATIONS.FOLDER:
					icon = data.hiddenChildren ? <AiFillFolder/> : <AiOutlineFolderOpen/>;
					break;
			}
		}

		return (
			<div
				key={index}
				className={"element"}
				style={{marginLeft: `${(data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px`, ...styles, ...transformStyle}}
				ref={ref}
			>
				<div key={"button"} className={"element-button"} onClick={() => toggleHide(data.index || index)}>{icon}</div>
				<div key={"label"} className={"element-label"}>{data.label}</div>
			</div>
		);
	};

	return { render, ref };
};