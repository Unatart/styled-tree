import {FC, useState} from "react";
import "./StylingTool.css";
import {HiOutlineChevronDoubleLeft, HiOutlineChevronDoubleRight} from "react-icons/hi";
import {IconsMenu} from "./icons_menu/IconsMenu";
import {IVisualContext} from "../App";
import {ItemStyleInput} from "./item_style_input/ItemStyleInput";
import {FileSelector} from "./file_selector/FileSelector";

type StylingToolStatus = "open" | "closed";
interface IStylingToolProps {
	updateVisualState: (state: Partial<IVisualContext>) => void;
}

export const StylingTool: FC<IStylingToolProps> = (props) => {
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
			<div className={"close-button"} onClick={toggleStatus}><HiOutlineChevronDoubleLeft/></div>
			<ItemStyleInput updateVisualState={props.updateVisualState}/>
			<FileSelector updateVisualState={props.updateVisualState}/>
			<IconsMenu updateVisualState={props.updateVisualState}/>
		</div>
	);
};

