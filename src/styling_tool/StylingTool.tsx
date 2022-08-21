import {FC, useState} from "react";
import "./StylingTool.css";
import {HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight} from "react-icons/hi";
import {IconsMenu} from "./icons_menu/IconsMenu";
import {ItemStyleInput} from "./item_style_input/ItemStyleInput";
import {FileSelector} from "./file_selector/FileSelector";
import {StyleSelector} from "./style_selector/StyleSelector";
import {IVisualContext} from "../App";
import {IConnectedTreeItem} from "../tree/ITree";

type StylingToolStatus = "open" | "closed";

interface IStylingToolActionProps {
	updateVisualState: (state: Partial<IVisualContext>) => void;
	setData: (data: IConnectedTreeItem[]) => void;
}

export const StylingTool: FC<IStylingToolActionProps> = (props) => {
	const [status, setStatus] = useState<StylingToolStatus>("closed");

	const toggleStatus = () => {
		if (status === "closed") {
			setStatus("open");
		} else {
			setStatus("closed");
		}
	};

	if (status === "closed") {
		return (
			<div className={"styling-tool"} onClick={toggleStatus}>
				<div className={"open-button"}><HiOutlineChevronDoubleRight/></div>
			</div>
		);
	}

	return (
		<div className={"styling-tool"}>
			<div className={"close-button"} onClick={toggleStatus}>
				<HiOutlineChevronDoubleLeft/>
			</div>
			<IconsMenu updateVisualState={props.updateVisualState}/>
			<StyleSelector updateVisualState={props.updateVisualState}/>
			<FileSelector setData={props.setData}/>
			<ItemStyleInput updateVisualState={props.updateVisualState}/>
		</div>
	);
};

