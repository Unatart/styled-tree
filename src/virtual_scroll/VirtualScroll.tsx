import {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";
import {getNextRenderPointerType} from "../getNextRenderPointer";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IListElement<T> {
	next?: T;
	prev?: T;
	index?: number;
}

interface IVirtualScrollConfig<T extends IListElement<T>> {
	tolerance: number;
	pageSize: number;
	elementOffsetPx: number;
	loadData: (url: string)=> Promise<T[]>;
	getNextDataPointer: (tree: T[])=> getNextRenderPointerType<T>;
	renderElement: (data: T, offset: number)=> ReactNode;
	observerConfig: IntersectionObserverInit;
	dataUrl: string;
}

export const VirtualScroll = <T extends IListElement<T>>(config: IVirtualScrollConfig<T>) => {
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(config.pageSize);
	const [data, setData] = useState<T[] | undefined>(undefined);
	const [renderHeadElement, setRenderHeadElement] = useState<T | undefined>(undefined);
	const getNextDataPointerRef = useRef<getNextRenderPointerType<T> | undefined>(undefined);

	const update = useActualCallback((direction: "up" | "down") => {
		if (data) {
			if (direction === "up") {
				const _start = Math.max(start - config.tolerance, 0);
				if (renderHeadElement?.index === _start) {
					return;
				}
				const _end = Math.max(end - config.tolerance, config.pageSize);
				setStart(_start);
				setEnd(_end);
				const dataHead =  getNextDataPointerRef.current?.(_start, _end, renderHeadElement);
				setRenderHeadElement(dataHead);
			}
			if (direction === "down") {
				if (renderHeadElement?.index === start + config.tolerance) {
					return;
				}
				const dataHead =  getNextDataPointerRef.current?.(start + config.tolerance, end + config.tolerance, renderHeadElement);
				if (!dataHead) {
					return;
				}
				setEnd((prevState) => prevState + config.tolerance);
				setStart((prevState) => prevState + config.tolerance);
				setRenderHeadElement(dataHead);
			}
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => {
		if (entry.intersectionRatio > 0) {
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

	useEffect(() => {
		config.loadData(config.dataUrl)
			.then((data) => {
				setData(data);
				setTopObserver(new IntersectionObserver(onTopIntersectionCallback, config.observerConfig));
				setBottomObserver(new IntersectionObserver(onBottomIntersectionCallback, config.observerConfig));
				if (getNextDataPointerRef.current || renderHeadElement?.index === start) {
					return;
				}
				getNextDataPointerRef.current = config.getNextDataPointer(data);
				const dataHead = getNextDataPointerRef.current?.(start, end, renderHeadElement);
				setRenderHeadElement(dataHead);
			});
	}, []);

	// TODO: хранить Refs List и обновлять данные и сдвиг ? чтобы было меньше обновлений
	const renderComponents = (head?: T): [ReactNode, number, number] => {
		let current = head;
		const components = [];
		let index = start;
		while (current && index < end) {
			components.push(config.renderElement(current, index * config.elementOffsetPx));
			current = current.next;
			index++;
		}
		return [components, start * config.elementOffsetPx, (index - config.tolerance) * config.elementOffsetPx];
	};

	const [memoComponent, topOffset, bottomOffset] = useMemo(() => renderComponents(renderHeadElement), [renderHeadElement?.index]);
	const topHeight = Math.max(45, (topOffset - 45));

	return (
		<ScrollArea>
			<div id={TOP_OBSERVER_ELEMENT_ID} ref={topObsElement} className={"intersection-observer"} style={{transform: `translate(0px, ${topOffset - topHeight}px)`, height: `${topHeight}px`}}/>
			{memoComponent}
			<div id={BOTTOM_OBSERVER_ELEMENT_ID} ref={bottomObsElement} className={"intersection-observer"} style={{transform: `translate(0px, ${bottomOffset + 45}px)`}}/>
		</ScrollArea>
	);
};
