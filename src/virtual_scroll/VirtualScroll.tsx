import {ReactNode, useEffect, useRef, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";
import {getNextRenderChunkType} from "../tree/getNextRenderChunk";
import {TREE_ELEMENT_X_OFFSET} from "../constants";
import {ITreeElementProps, renderTreeElement} from "../tree/tree_element/TreeElement";
import {IConnectedTreeItem} from "../tree/ITree";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollConfig<T> {
	tolerance: number;
	pageSize: number;
	elementOffsetPx: number;
	loadData: (url: string)=> Promise<T[]>;
	getNextDataChunk: (tree: T[], pageSize: number, tolerance: number)=> getNextRenderChunkType<T>;
	renderElement: (props: ITreeElementProps )=> ReactNode;
	observerConfig: IntersectionObserverInit;
	dataUrl: string;
}

export const VirtualScroll = <T extends IConnectedTreeItem>(config: IVirtualScrollConfig<T>) => {
	const [renderData, setRenderData] = useState<T[]>([]);
	const getNextDataChunkRef = useRef<getNextRenderChunkType<T> | undefined>(undefined);

	const update = useActualCallback((direction: "up" | "down") => {
		if (getNextDataChunkRef.current) {
			const dataToRender = getNextDataChunkRef.current?.getNextChunk(direction);
			if (dataToRender && dataToRender[0]) {
				setRenderData(dataToRender);
			}
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => {
		// console.log("up", entry);
		if (entry.intersectionRatio > 0.1) {
			update("up");
		}
	};

	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => {
		// console.log("down", entry);
		if (entry.intersectionRatio > 0.1 && entry.intersectionRatio < 1) {
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
			getNextDataChunkRef.current = config.getNextDataChunk(data, config.pageSize, config.tolerance);
			setRenderData(getNextDataChunkRef.current?.getNextChunk("update"));
		});
	}, []);

	const startIndex = renderData[0]?.index || 0;
	const topOffset = startIndex * config.elementOffsetPx;
	const bottomOffset = (renderData.length - 1) * config.elementOffsetPx;
	const toggleHidden = (i: number) => {
		const result = getNextDataChunkRef.current?.hideElement(i);
		if (result) {
			const dataToRender = getNextDataChunkRef.current?.getNextChunk("update");
			if (dataToRender) {
				setRenderData(dataToRender);
			}
		}
	};

	// console.log("RENDER:", startIndex, renderData, renderData.length, config.tolerance, bottomOffset, topOffset);

	return (
		<ScrollArea style={{paddingTop: `${topOffset}px`}}>
			<div id={TOP_OBSERVER_ELEMENT_ID} ref={topObsElement} className={"intersection-observer"}/>
			{renderData.map((data, index) =>
				renderTreeElement({
					data,
					style: { zIndex: 1, position: "absolute", transform: `translate(${(data.level || 0) * TREE_ELEMENT_X_OFFSET}px, ${index * config.elementOffsetPx}px)` },
					toggleHidden
				})
			)}
			<div id={BOTTOM_OBSERVER_ELEMENT_ID} ref={bottomObsElement} className={"intersection-observer"} style={{transform: `translateY(${bottomOffset}px)`}}/>
		</ScrollArea>
	);
};

