import "./FileSelector.css";
import {ChangeEvent, FC, useEffect, useState} from "react";
import {IConnectedTreeItem} from "../../scroll_component/tree/ITree";
import {UiVariationBlock} from "../ui_variation_block/UiVariationBlock";
import {loadData} from "../../request/loadData";

interface IFileSelectorProps {
	setData: (data: IConnectedTreeItem[]) => void;
}

const FILES = {
	"100000 CHILDS": "data_samples/sample_big.json",
	"LEVELS": "data_samples/sample_levels.json",
	"TASK_EXAMPLE": "data_samples/sample_task.json"
};

export const FileSelector: FC<IFileSelectorProps> = ({ setData }) => {
	const [reader] = useState(new FileReader());

	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files) {
			reader.readAsText(files[0]);
		}
	};

	const onSetUrl = (url: string) => {
		loadData(url).then((data) => setData(data));
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
		<>
			<UiVariationBlock
				title={"Preset files:"}
				keys={Object.keys(FILES)}
				buttonTitle={"Select file"}
				onClick={(key) => onSetUrl(FILES[key as keyof typeof FILES])}
			/>
			<div className={"file-selector"}>
				<div className={"select-file-head"}>Load file:</div>
				<label className={"custom-file-upload"} htmlFor={"file-input"}>
					<input id={"file-input"} type={"file"} accept={".json"} onChange={onChange}/>
					<div>Click me</div>
				</label>
			</div>
		</>
	);
};