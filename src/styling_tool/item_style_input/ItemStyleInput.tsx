import {ChangeEvent, ChangeEventHandler, CSSProperties, KeyboardEventHandler, useState} from "react";
import {IVisualContext} from "../../App";
import "./ItemStyleInput.css";

interface IItemStyleInputProps {
    updateVisualState: (state: Partial<IVisualContext>) => void;
}

export const ItemStyleInput = (props: IItemStyleInputProps) => {
	const [style, setStyle] = useState<string>();

	const handleChange: ChangeEventHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setStyle(event.target.value);
	};

	const onKeyDown: KeyboardEventHandler = (event) => {
		if(event.key === "Enter" && style) {
			const stylesObj: CSSProperties = JSON.parse(style.replace(/&quot;/ig,"\""));
			props.updateVisualState({ itemStyles: stylesObj });
		}
	};

	return (
		<div className={"styling-input"}>
			<div className={"headline"}>Enter value: </div>
			<textarea
				className={"input"}
				value={style}
				onChange={handleChange}
				onKeyDown={onKeyDown}
			/>
		</div>
	);
};