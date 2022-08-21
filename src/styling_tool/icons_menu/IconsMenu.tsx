import "./IconsMenu.css";
import {ICON_VARIATIONS} from "../../constants";
import {IStyleActionProps} from "../IStylingTool";

export const IconsMenu = (props: IStyleActionProps) => {
	return (
		<div className="dropdown">
			<button className="drop-button">Icon style</button>
			<div className="dropdown-content">
				{Object.keys(ICON_VARIATIONS).map((key) => {
					const iconStyle = ICON_VARIATIONS[key as keyof typeof ICON_VARIATIONS];
					return (
						<div key={key} onClick={() => props.updateVisualState({ iconStyle })}>
							{ key }
						</div>
					);
				})}
			</div>
		</div>
	);
};