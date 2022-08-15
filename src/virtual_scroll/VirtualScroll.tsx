import {ReactNode, useEffect, useRef, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IListElement<T> {
	next?: T;
	prev?: T;
}

interface IVirtualScrollConfig<T extends IListElement<T>> {
	tolerance: number;
	pageSize: number;
	elementOffsetPx: number;
	loadData: (url: string)=> Promise<T[]>;
	getNextDataPointer: (tree: T[])=> (from: number, to: number, previousPointer?: T)=> T | undefined;
	renderElement: (data: T, offset: number)=> ReactNode;
	observerConfig: IntersectionObserverInit;
	dataUrl: string;
}

// TODO: скролл наверх ?
export const VirtualScroll = <T extends IListElement<T>>(config: IVirtualScrollConfig<T>) => {
	const [reservedOffset] = useState(0);
	const [start] = useState(0);
	const [end, setEnd] = useState(config.pageSize);
	const [data, setData] = useState<T[] | undefined>(undefined);
	const [renderHeadElement, setRenderHeadElement] = useState<T | undefined>(undefined);

	const update = useActualCallback((direction: "up" | "down") => {
		if (data) {
			if (direction === "down") {
				setEnd((prevState) => prevState + config.pageSize);
				const dataHead = config.getNextDataPointer(data)(start, end + config.pageSize, renderHeadElement);
				setRenderHeadElement(dataHead);
			}
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => {
		if (entry.isIntersecting) {
			update("up");
		}
	};

	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => {
		if (entry.isIntersecting) {
			update("down");
		}
	};

	const topObsElement = useRef(null);
	const bottomObsElement = useRef(null);
	const [topObserver, setTopObserver] = useState<IntersectionObserver>();
	const [bottomObserver, setBottomObserver] = useState<IntersectionObserver>();

	useEffect(() => {
		config.loadData(config.dataUrl)
			.then((data) => {
				setData(data);
				setTopObserver(new IntersectionObserver(onTopIntersectionCallback, config.observerConfig));
				setBottomObserver(new IntersectionObserver(onBottomIntersectionCallback, config.observerConfig));
				const dataHead = config.getNextDataPointer(data)(start, end + config.pageSize, renderHeadElement);
				setRenderHeadElement(dataHead);
			});
	}, [config.dataUrl]);

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
	}, [topObserver, bottomObserver]);

	// TODO: оптимизировать перерасчет тут
	let current = renderHeadElement;
	const components = [];
	let index = 0;
	while (current && index < end) {
		components.push(config.renderElement(current, index * config.elementOffsetPx));
		current = current.next;
		index++;
	}

	return (
		<ScrollArea>
			<div id={TOP_OBSERVER_ELEMENT_ID} ref={topObsElement} className={"intersection-observer"} style={{top: reservedOffset + start * config.elementOffsetPx}}/>
			{components}
			<div id={BOTTOM_OBSERVER_ELEMENT_ID} ref={bottomObsElement} className={"intersection-observer"} style={{top: reservedOffset + end * config.elementOffsetPx * 2}}/>
		</ScrollArea>
	);
};
