import {IConnectedTreeItem} from "../tree/ITree";
import {createRef, CSSProperties, Ref} from "react";
import {ICON_VARIATIONS, TREE_ELEMENT_X_OFFSET_PX} from "../../constants";
import {IScrollElementResult} from "../virtual_scroll/IVirtualScroll";
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
	ref?: Ref<HTMLDivElement>;
}

export const createTreeElement = (render: (props: ITreeElementProps) => JSX.Element | null): IScrollElementResult => {
	const ref = createRef<HTMLDivElement>();
	return { render: (props) => render({ ...props, ref }), ref };
};

const computeIcon = (data: IConnectedTreeItem, iconStyle?: string) => {
	let icon = null;

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

	return icon;
};

export const renderItem = ({ data, index, transformStyle, styles, iconStyle, toggleHide, ref }: ITreeElementProps) => {
	if (!data) {
		return null;
	}

	const icon = computeIcon(data, iconStyle);

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

export const renderItemV2 = ({ data, index, transformStyle, styles, iconStyle, toggleHide, ref }: ITreeElementProps) => {
	if (!data) {
		return null;
	}

	const icon = computeIcon(data, iconStyle);

	const childStyles = {
		backgroundColor: data.parent ? "red" : undefined,
		height: `${data.children.length * 30}px`,
		color: data.parent ? "white" : undefined,
		fontWeight: "bold",
	};

	return (
		<div
			key={index}
			className={"element"}
			style={{marginLeft: `${(data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px`, ...styles, ...transformStyle, ...childStyles}}
			ref={ref}
		>
			<div key={"button"} className={"element-button"} onClick={() => toggleHide(data.index || index)}>{icon}</div>
			<div key={"label"} className={"element-label"}>{data.label}</div>
		</div>
	);
};
