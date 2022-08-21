import {Ref, useEffect, useRef} from "react";

export const useIntersectionObserver = (
	onTopCallback: IntersectionObserverCallback,
	onBottomCallback: IntersectionObserverCallback,
	config: IntersectionObserverInit,
	isReady: boolean,
): [Ref<HTMLDivElement>, Ref<HTMLDivElement>] => {
	const topObsElement = useRef(null);
	const bottomObsElement = useRef(null);

	useEffect(() => {
		if (isReady) {
			const topObserver = new IntersectionObserver(onTopCallback, config);
			const bottomObserver = new IntersectionObserver(onBottomCallback, config);

			if (topObsElement.current && topObserver) {
				topObserver?.observe(topObsElement.current);
			}

			if (bottomObsElement.current && bottomObserver) {
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
		}
	}, [isReady, topObsElement.current, bottomObsElement.current]);

	return [topObsElement, bottomObsElement];
};
