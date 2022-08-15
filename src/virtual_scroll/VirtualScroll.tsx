import {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";
import {getNextRenderChunkType} from "../getNextRenderChunk";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollConfig<T extends { hidden?: boolean }> {
	tolerance: number;
	pageSize: number;
	elementOffsetPx: number;
	loadData: (url: string)=> Promise<T[]>;
	getNextDataChunk: (tree: T[])=> getNextRenderChunkType<T>;
	renderElement: (data: T, offset: number, onClick: (index: number)=> void, index: number)=> ReactNode;
	observerConfig: IntersectionObserverInit;
	dataUrl: string;
}

export const VirtualScroll = <T extends { hidden?: boolean; children?: T[] }>(config: IVirtualScrollConfig<T>) => {
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(config.pageSize);
	const [renderData, setRenderData] = useState<T[]>([]);
	const getNextDataChunkRef = useRef<getNextRenderChunkType<T> | undefined>(undefined);

	const update = useActualCallback((direction: "up" | "down") => {
		if (getNextDataChunkRef.current) {
			if (direction === "up") {
				const _start = Math.max(start - config.tolerance, 0);
				const _end = Math.max(end - config.tolerance, config.pageSize);
				const dataToRender = getNextDataChunkRef.current?.getNextChunk(_start, _end);
				if (dataToRender && dataToRender[_start]) {
					setRenderData(dataToRender);
					setStart(_start);
					setEnd(_end);
				}
			}
			if (direction === "down") {
				const _start = start + config.tolerance;
				const _end = end + config.tolerance;
				const dataToRender = getNextDataChunkRef.current?.getNextChunk(_start, _end);
				if (dataToRender && dataToRender[_start]) {
					setRenderData(dataToRender);
					setStart(_start);
					setEnd(_end);
				}
			}
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => {
		// TODO: тут по хорошему поиграться с intersectionRatio и размером объекта
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
		config.loadData(config.dataUrl).then((data) => {
			setTopObserver(new IntersectionObserver(onTopIntersectionCallback, config.observerConfig));
			setBottomObserver(new IntersectionObserver(onBottomIntersectionCallback, config.observerConfig));
			if (getNextDataChunkRef.current || renderData.length) {
				return;
			}
			getNextDataChunkRef.current = config.getNextDataChunk(data);
			setRenderData(getNextDataChunkRef.current?.getNextChunk(start, end));
		});
	}, []);

	const renderComponents = (renderData: T[]): [ReactNode, number, number] => {
		const components = [];
		let i: number = start;
		for (; i < end && renderData[i]; i++) {
			const onClick = (index: number) => {
				console.log(index, renderData[index]);
				getNextDataChunkRef.current?.hideElement(index);
				const dataToRender = getNextDataChunkRef.current?.getNextChunk(start, end);
				if (dataToRender) {
					setRenderData(dataToRender);
				}
			};
			components.push(config.renderElement(renderData[i], i * config.elementOffsetPx, (i) => onClick(i), i));
		}
		return [components, start * config.elementOffsetPx, (i - config.tolerance) * config.elementOffsetPx];
	};

	const [memoComponent, topOffset, bottomOffset] = useMemo(() => renderComponents(renderData), [renderData, start, end]);
	const topHeight = Math.max(45, (topOffset - 45));

	return (
		<ScrollArea>
			<div id={TOP_OBSERVER_ELEMENT_ID} ref={topObsElement} className={"intersection-observer"} style={{transform: `translate(0px, ${topOffset - topHeight}px)`, height: `${topHeight}px`}}/>
			{memoComponent}
			<div id={BOTTOM_OBSERVER_ELEMENT_ID} ref={bottomObsElement} className={"intersection-observer"} style={{transform: `translate(0px, ${bottomOffset + 45}px)`}}/>
		</ScrollArea>
	);
};

