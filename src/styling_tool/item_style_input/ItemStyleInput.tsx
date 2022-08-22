import {ChangeEvent, ChangeEventHandler, CSSProperties, useState} from "react";
import "./ItemStyleInput.css";
import {IStyleActionProps} from "../IStylingTool";
import {FLAMINGO_SCHEME} from "../schemes";

export const ItemStyleInput = ({ updateVisualState }: IStyleActionProps) => {
	const [style, setStyle] = useState<string>(JSON.stringify(FLAMINGO_SCHEME));
	const [error, setError] = useState<string>("");

	const handleChange: ChangeEventHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setStyle(event.target.value);
		setError("");
	};

	const onClick = () => {
		if (style) {
			try {
				const stylesObj: CSSProperties = JSON.parse(style.replace(/&quot;/ig, "\""));
				updateVisualState({itemStyles: stylesObj});
			} catch (e) {
				setError(`Catch error: ${e}`);
				setStyle(JSON.stringify(FLAMINGO_SCHEME));
			}
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
			{error && <div className={"styling-error"}>{error}</div>}
			<div className={"styling-button"} onClick={onClick}>Submit</div>
		</div>
	);
};