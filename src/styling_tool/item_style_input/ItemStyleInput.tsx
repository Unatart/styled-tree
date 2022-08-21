import {ChangeEvent, ChangeEventHandler, CSSProperties, useState} from "react";
import "./ItemStyleInput.css";
import {IStyleActionProps} from "../IStylingTool";
import {FLAMINGO_SCHEME} from "../schemes";

export const ItemStyleInput = (props: IStyleActionProps) => {
	const [style, setStyle] = useState<string>(JSON.stringify(FLAMINGO_SCHEME));

	const handleChange: ChangeEventHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setStyle(event.target.value);
	};

	const onClick = () => {
		if (style) {
			const stylesObj: CSSProperties = JSON.parse(style.replace(/&quot;/ig, "\""));
			props.updateVisualState({itemStyles: stylesObj});
		}
	};

	return (
		<div className={"styling-input"}>
			<div className={"headline"}>Enter item CSS Properties: </div>
			<textarea
				className={"input"}
				value={style}
				onChange={handleChange}
			/>
			<div className={"styling-button"} onClick={onClick}>Submit</div>
		</div>
	);
};