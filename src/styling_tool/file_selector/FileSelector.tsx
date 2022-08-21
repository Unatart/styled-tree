import "./FileSelector.css";
import {ChangeEvent, FC, useEffect, useState} from "react";
import {IConnectedTreeItem} from "../../tree/ITree";

interface IFileSelectorProps {
	setData: (data: IConnectedTreeItem[]) => void;
}

export const FileSelector: FC<IFileSelectorProps> = ({ setData }) => {
	const [reader] = useState(new FileReader());

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			reader.readAsText(files[0]);
		}
	};

	useEffect(() => {
		const listener = (event: ProgressEvent<FileReader>) => {
			const file = event.target?.result;
			if (file && typeof file === "string") {
				const tree: IConnectedTreeItem[] = JSON.parse(file).result;
				setData(tree);
			}
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