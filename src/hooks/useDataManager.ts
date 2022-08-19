import {useEffect, useState} from "react";
import {ITreeManagerConfig, TreeManagerType} from "../tree/createTreeManager";

export const useDataManager = <T>(
	dataUrl: string,
	treeManagerConfig: ITreeManagerConfig,
	loadData: (url: string) => Promise<T[]>,
	getTreeManager: (tree: T[], config: ITreeManagerConfig) => TreeManagerType<T>
): [TreeManagerType<T> | undefined, string | undefined] => {
	const [dataManager, setDataManager] = useState<TreeManagerType<T> | undefined>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);
    
	useEffect(() => {
		loadData(dataUrl)
			.then((data) => {
				if (dataManager) {
					return;
				}
				setDataManager(getTreeManager(data, treeManagerConfig));
			})
			.catch((error) => {
				setError(error);
			});
	}, []);

	return [dataManager, error];
};