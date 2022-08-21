import "./FileSelector.css";
import {ChangeEvent, FC, useEffect, useState} from "react";
import {IStylingToolProps} from "../IStylingToolProps";

export const FileSelector: FC<IStylingToolProps> = (props) => {
	const [reader] = useState(new FileReader());

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		console.log(event);
		const files = event.target.files;
		if (files) {
			reader.readAsText(files[0]);
		}
	};

	useEffect(() => {
		const listener = (event: ProgressEvent<FileReader>) => {
			console.log(event.target?.result);
		};

		reader.addEventListener("load", listener);

		return () => {
			reader.removeEventListener("load", listener);
		};
	}, []);

	return (
		<div className={"file-selector"}>
			<div className={"select-file-head"}>Data file:</div>
			<label className={"custom-file-upload"} htmlFor={"file-input"}>
				<input id={"file-input"} type={"file"} accept={".json"} onChange={onChange}/>
				<div>Click me</div>
			</label>
		</div>
	);
};