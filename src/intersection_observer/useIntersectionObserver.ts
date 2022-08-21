import {Ref, useEffect, useRef, useState} from "react";

export const useIntersectionObserver = (
	onTopCallback: IntersectionObserverCallback,
	onBottomCallback: IntersectionObserverCallback,
	config: IntersectionObserverInit,
	isReady: boolean,
): [Ref<HTMLDivElement>, Ref<HTMLDivElement>] => {
	const topObsElement = useRef(null);
	const bottomObsElement = useRef(null);
	const [topObserver, setTopObserver] = useState<IntersectionObserver>();
	const [bottomObserver, setBottomObserver] = useState<IntersectionObserver>();

	useEffect(() => {
		if (topObsElement.current) {
			topObserver?.observe(topObsElement.current);
		}

		if (bottomObsElement.current) {
			bottomObserver?.observe(bottomObsElement.current);
		}

		return () => {
			if (topObserver && topObsElement.current) {
				topObserver.unobserve(topObsElement.current);
			}

			if (bottomObserver && bottomObsElement.current) {
				bottomObserver.unobserve(bottomObsElement.current);
			}
		};
	}, [topObsElement.current, bottomObsElement.current, topObserver, bottomObserver]);
    
	useEffect(() => {
		if (isReady) {
			setTopObserver(new IntersectionObserver(onTopCallback, config));
			setBottomObserver(new IntersectionObserver(onBottomCallback, config));
		}
	}, [isReady]);

	return [topObsElement, bottomObsElement];
};
