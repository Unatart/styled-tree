import {ITree} from "../scroll_component/tree/ITree";

const CACHE_STORAGE_NAME = "storeTreeCache";

export const loadData = async (url?: string) => {
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
		const clone = response.clone();
		const parsedTreeData = await clone.json() as {result: ITree};
		if ("caches" in window) {
			const cache = await caches.open(CACHE_STORAGE_NAME);
			await cache.put(url, response);
		}
		return parsedTreeData.result;
	};

	return loadInfo().catch(error => Promise.reject(`Caught error while loading tree. Filename: ${url}. Error: ${error}`));
};
