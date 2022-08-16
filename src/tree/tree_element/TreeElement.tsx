import {IConnectedTreeItem} from "../ITree";
import {CSSProperties, FC} from "react";

export interface ITreeElementProps {
	data: IConnectedTreeItem;
	style: CSSProperties;
	toggleHidden: (index: number)=> void;
}

export const renderTreeElement: FC<ITreeElementProps> = ({
	data,
	style,
	toggleHidden
}) => {
	return (
		<div
			className={"tree-element"}
			key={data.id}
			style={style}
			onClick={() => toggleHidden(data.index || 0)}
		>
			{data.label}
		</div>
	);
};
