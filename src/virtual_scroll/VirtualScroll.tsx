import {useCallback, useContext, useEffect, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./scroll-area/ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";
import {treeActionType, TreeManagerType} from "../tree/createTreeManager";
import {IConnectedTreeItem} from "../tree/ITree";
import {useIntersectionObserver} from "../intersection_observer/useIntersectionObserver";
import {IntersectionObserverElement} from "../intersection_observer/IntersectionObserverElement";
import {ITreeElementProps} from "../tree/tree_element/createTreeElement";
import {IScrollElementResult} from "./IVirtualScroll";
import {VisualContext} from "../App";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollProps<T> {
	tolerance: number;
	verticalMargin: number;
	observerConfig: IntersectionObserverInit;
	createScrollItem: (props: ITreeElementProps) => IScrollElementResult;
	dataManager: TreeManagerType<T>;
}

export const VirtualScroll = <T extends IConnectedTreeItem>({
	tolerance,
	verticalMargin,
	observerConfig,
	createScrollItem,
	dataManager
}: IVirtualScrollProps<T>) => {
	const context = useContext(VisualContext);
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

			nextTransform = nextTransform + Math.ceil((currentRef?.getBoundingClientRect().height || 0) + verticalMargin);
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
			transformY = Math.max(0, transformY - Math.ceil((elements[i].ref?.current?.getBoundingClientRect().height || 0) + verticalMargin));
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
			transformY = transformY + Math.ceil((currentRef?.getBoundingClientRect().height || 0) + verticalMargin);
		}

		const _bottom = newElements[newElements.length - tolerance].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(_bottom);
		setElements(newElements);
	};

	const updateData = useActualCallback((action: treeActionType, isIntersecting: boolean) => {
		if (dataManager && isIntersecting && elements.length) {
			const dataToRender = dataManager.getNextChunk(action);
			if (
				dataToRender[dataToRender.length - 1].index === renderData[renderData.length - 1].index &&
				dataToRender[0].index === renderData[0].index
			) {
				return;
			}
			setRenderData(dataToRender);
			switch (action) {
				case "up":
					moveUp();
					break;
				case "down":
					moveDown(0, tolerance);
					break;
				case "update":
					update();
			}
		}
	});

	const toggleHide = useCallback((i: number) => dataManager && dataManager.toggleHide(i) ? updateData("update", true) : void 0, [dataManager]);
	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => updateData("up", entry.isIntersecting);
	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => updateData("down", entry.isIntersecting);
	const [topObsElement, bottomObsElement] = useIntersectionObserver(onTopIntersectionCallback, onBottomIntersectionCallback, observerConfig, !!dataManager);

	useEffect(() => {
		const result = dataManager?.getNextChunk("update");
		if (result) {
			const _elements = result.map((data, index) => ({ ...createScrollItem({ data, index, toggleHide }), transformY: elements[index]?.transformY }));
			setRenderData(result);
			setElements(_elements);
		}
	}, [dataManager]);

	useEffect(() => {
		moveDown();
	}, [elements.length]);

	useEffect(() => {
		// TODO: улучшить
		updateData("update", true);
	}, [context.itemStyles]);

	return (
		<div className={"virtual-scroll-container"}>
			<div className={"virtual-scroll"}>
				<ScrollArea style={{ paddingTop: `${topOffset}px`, paddingBottom: `${Math.max(0, areaBottomPadding - topOffset)}px` }}>
					{elements.map((element, index) => element.render({
						data: renderData[index],
						index,
						transformStyle: { transform: `translateY(${element.transformY}px)`},
						styles: context.itemStyles,
						iconStyle: context.iconStyle,
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
			</div>
		</div>
	);
};

