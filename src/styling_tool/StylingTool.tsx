import {FC, useState} from "react";
import "./StylingTool.css";
import {HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight} from "react-icons/hi";
import {IconsMenu} from "./icons_menu/IconsMenu";
import {ItemStyleInput} from "./item_style_input/ItemStyleInput";
import {FileSelector} from "./file_selector/FileSelector";
import {GoColorfulButton} from "./go_colorful_button/GoColorfulButton";
import {IVisualContext} from "../App";
import {IConnectedTreeItem} from "../tree/ITree";

type StylingToolStatus = "open" | "closed";

interface IStylingToolActionProps {
	updateVisualState: (state: Partial<IVisualContext<IConnectedTreeItem>>) => void;
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
			<div className={"styling-tool open-button"} onClick={toggleStatus}>
				<HiOutlineChevronDoubleRight/>
			</div>
		);
	}

	return (
		<div className={"styling-tool open-tool"}>
			<div className={"close-button"} onClick={toggleStatus}>
				<HiOutlineChevronDoubleLeft/>
			</div>
			<ItemStyleInput updateVisualState={props.updateVisualState}/>
			<FileSelector setData={props.setData}/>
			<IconsMenu updateVisualState={props.updateVisualState}/>
			<GoColorfulButton updateVisualState={props.updateVisualState}/>
		</div>
	);
};

