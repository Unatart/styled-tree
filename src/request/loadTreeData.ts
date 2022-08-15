import {ITree} from "../tree/ITree";

const CACHE_STORAGE_NAME = "storeTreeCache";

export const loadTreeData = async (url?: string) => {
	if (!url) {
		return Promise.reject("Provide url for request");
	}

	if ("caches" in window) {
		const cache = await caches.open(CACHE_STORAGE_NAME);
		const response = await cache.match(url);

		if (response) {
			const parsedTreeData = await response.json() as { result: ITree };
			return parsedTreeData.result;
		}
	}

	const loadInfo = async () => {
		const response = await fetch(url);
		if ("caches" in window) {
			const cache = await caches.open(CACHE_STORAGE_NAME);
			await cache.put(url, response);
		}
		const parsedTreeData = await response.json() as {result: ITree};
		return parsedTreeData.result;
	};

	return loadInfo()
		.catch(error => {
			console.log(`Caught error while loading tree. Filename: ${url}. Error: `, error);
			return error;
		});
};
