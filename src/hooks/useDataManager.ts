import {useEffect, useState} from "react";
import {ITreeManagerConfig, TreeManagerType} from "../tree/createTreeManager";

export const useDataManager = <T>(
	data: T[] | undefined,
	treeManagerConfig: ITreeManagerConfig,
	getTreeManager: (tree: T[], config: ITreeManagerConfig) => TreeManagerType<T>
): TreeManagerType<T> | undefined => {
	const [dataManager, setDataManager] = useState<TreeManagerType<T> | undefined>(undefined);
    
	useEffect(() => {
		if (!data || data.length === 0) {
			return;
		}

		setDataManager(getTreeManager(data, treeManagerConfig));
	}, [data]);

	return dataManager;
};