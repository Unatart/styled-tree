import {useEffect, useState} from "react";
import {ITree} from "../ITree";

export const useTreeDataLoading = (treeLink: string): ITree | undefined => {
	const [treeData, setTreeData] = useState<ITree | undefined>();

	useEffect(() => {
		const loadInfo = async (): Promise<ITree> => {
			const response = await fetch(treeLink);
			const parsedTreeData = await response.json() as {result: ITree};
			return parsedTreeData.result;
		};

		loadInfo()
			.then(result => {
				setTreeData(result);
			})
			.catch(error => {
				console.log(`Caught error while loading tree. Filename: ${treeLink}. Error: `, error);
			});
	}, [treeLink]);

	return treeData;
};
