import {useCallback, useEffect, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";
import {ITreeManagerConfig, treeActionType, TreeManagerType} from "../tree/createTreeManager";
import {IConnectedTreeItem} from "../tree/ITree";
import {useIntersectionObserver} from "../IntersectionObserver/useIntersectionObserver";
import {IntersectionObserverElement} from "../IntersectionObserver/IntersectionObserverElement";
import {ITreeElementProps} from "../tree/tree_element/createTreeElement";
import {useDataManager} from "../hooks/useDataManager";
import {IScrollElementResult} from "./IVirtualScroll";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollProps<T> {
	dataUrl: string;
	tolerance: number;
	observerConfig: IntersectionObserverInit;
	treeManagerConfig: ITreeManagerConfig;
	createScrollItem: (props: ITreeElementProps)=> IScrollElementResult;
	loadData: (url: string)=> Promise<T[]>;
	getTreeManager: (tree: T[], config: ITreeManagerConfig)=> TreeManagerType<T>;
}

export const VirtualScroll = <T extends IConnectedTreeItem>({
	dataUrl,
	tolerance,
	observerConfig,
	treeManagerConfig,
	createScrollItem,
	loadData,
	getTreeManager
}: IVirtualScrollProps<T>) => {
	const [dataManager, error] = useDataManager(dataUrl, treeManagerConfig, loadData, getTreeManager);
	const [renderData, setRenderData] = useState<T[]>([]);
	const [elements, setElements] = useState<IScrollElementResult[]>([]);
	const [maxBottomOffset, setMaxBottomOffset] = useState(0);
	const [topOffset, setTopOffset] = useState(0);
	const [bottomOffset, setBottomOffset] = useState(0);
	const [areaBottomPadding, setAreaBottomPadding] = useState(0);

	const moveDown = (from = 0, to = elements.length) => {
		if (!elements.length) {
			return;
		}

		const newElements = elements.slice(to, elements.length);
		const lastHeight = bottomOffset === 0 ? 0 : Math.ceil(elements[elements.length - 1].ref?.current?.getBoundingClientRect().height || 0);
		let nextTransform = bottomOffset + lastHeight || 0;
		for (let i = from; i < to; i++) {
			const currentRef = elements[i]?.ref?.current;
			const transformY = currentRef ? nextTransform : 0;

			nextTransform = nextTransform + Math.ceil(currentRef?.getBoundingClientRect().height || 0);
			newElements.push({ ...elements[i], transformY });
		}

		const _bottom = newElements[newElements.length - 1].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(_bottom);
		setElements(newElements);

		if (_bottom > maxBottomOffset) {
			setMaxBottomOffset(_bottom);
		}
	};

	const moveUp = () => {
		if (!elements.length) {
			return;
		}

		if (topOffset === 0) {
			return;
		}

		const newElements = elements.slice(0, elements.length - tolerance);
		let transformY = elements[0].transformY || 0;
		for (let i = elements.length - 1; i >= elements.length - tolerance; i--) {
			transformY = Math.max(0, transformY - Math.ceil(elements[i].ref?.current?.getBoundingClientRect().height || 0));
			newElements.unshift({ ...elements[i], transformY });
		}

		const bottom = newElements[newElements.length - 1].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(bottom);
		setElements(newElements);

		setAreaBottomPadding(maxBottomOffset - (maxBottomOffset - (maxBottomOffset - bottom)));
	};

	const update = () => {
		if (!elements.length) {
			return;
		}

		const newElements = [];
		let transformY = topOffset;
		for (let i = 0; i < elements.length; i++) {
			const currentRef = elements[i]?.ref?.current;
			newElements.push({ ...elements[i], transformY });
			transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || 0);
		}

		const _bottom = newElements[newElements.length - 1].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(_bottom);
		setElements(newElements);
	};

	const updateData = useActualCallback((action: treeActionType) => {
		if (dataManager) {
			const dataToRender = dataManager.getNextChunk(action);
			console.log("new data", dataToRender);
			setRenderData(dataToRender);
			if (action === "down") {
				moveDown(0, tolerance);
			}
			if (action === "up") {
				moveUp();
			}
			if (action === "update") {
				update();
			}
		}
	});

	const toggleHide = useCallback((i: number) => {
		console.log(i);
		if (dataManager && dataManager.toggleHide(i)) {
			updateData("update");
		}
	}, [dataManager]);

	const onIntersection = useActualCallback((direction: treeActionType, isIntersecting: boolean) => {
		if (isIntersecting && elements.length) {
			updateData(direction);
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => onIntersection("up", entry.isIntersecting);
	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => onIntersection("down", entry.isIntersecting);
	const [topObsElement, bottomObsElement] = useIntersectionObserver(onTopIntersectionCallback, onBottomIntersectionCallback, observerConfig, !!dataManager);

	useEffect(() => {
		const result = dataManager?.getNextChunk("update");
		if (result) {
			const _elements = result.map((data, index) => ({ ...createScrollItem({ data, index, toggleHide }), transformY: elements[index]?.transformY }));
			setRenderData(result);
			setElements(_elements);
		}
	}, [dataManager]);

	// TODO: можно избавиться
	useEffect(() => {
		moveDown();
	}, [elements.length]);

	if (error) {
		return (
			<div>
				{error}
			</div>
		);
	}

	console.log(renderData);
	return (
		<ScrollArea style={{paddingTop: `${topOffset}px`, paddingBottom: `${areaBottomPadding}px`}}>
			{elements.map((element, index) => element.render({
				data: renderData[index],
				index,
				transformY: element.transformY,
				toggleHide
			}))}
			<IntersectionObserverElement
				key={TOP_OBSERVER_ELEMENT_ID}
				ref={topObsElement}
				style={{transform: `translateY(${topOffset}px)`}}
			/>
			<IntersectionObserverElement
				key={BOTTOM_OBSERVER_ELEMENT_ID}
				ref={bottomObsElement}
				style={{transform: `translateY(${bottomOffset}px)`}}
			/>
		</ScrollArea>
	);
};

