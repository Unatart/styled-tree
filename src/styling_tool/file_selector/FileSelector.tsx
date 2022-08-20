import {IVisualContext} from "../../App";
import "./FileSelector.css";
import {FC, useEffect, useState} from "react";

interface IFileSelectorProps {
    updateVisualState: (state: Partial<IVisualContext>) => void;
}

export const FileSelector: FC<IFileSelectorProps> = (props) => {
	const [reader] = useState(new FileReader());
	const onChange = (files: FileList | null) => {
		console.log(files);
		if (files) {
			reader.readAsText(files[0]);
		}
	};

	useEffect(() => {
		reader.addEventListener("load", (event) => {
			console.log(event.target?.result);
		});
	}, []);

	return <input type="file" id="file-selector" accept={".json"} onChange={(e) => onChange(e.target.files)}/>;
};