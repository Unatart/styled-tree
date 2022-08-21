import {useCallback, useContext, useEffect, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "../scroll-area/ScrollArea";
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

	const [itemsData, setItemsData] = useState<T[]>([]);
	const [elements, setElements] = useState<IScrollElementResult[] | undefined>();

	const [maxBottomOffset, setMaxBottomOffset] = useState(0);
	const [topOffset, setTopOffset] = useState(0);
	const [bottomOffset, setBottomOffset] = useState(0);
	const [areaBottomPadding, setAreaBottomPadding] = useState(0);
	const [visibility, setVisibility] = useState<"visible" | "hidden">("hidden");

	const moveDown = (renderedElements: IScrollElementResult[], from = 0, to = tolerance) => {
		const newElements = renderedElements.slice(to, renderedElements.length);
		const lastHeight = bottomOffset === 0 ? 0 : Math.ceil(renderedElements[renderedElements.length - 1].ref?.current?.getBoundingClientRect().height || 0);
		let nextTransform = bottomOffset + lastHeight || 0;
		for (let i = from; i < to; i++) {
			const currentRef = renderedElements[i]?.ref?.current;
			const transformY = currentRef ? nextTransform : 0;

			nextTransform = nextTransform + Math.ceil((currentRef?.getBoundingClientRect().height || 0) + verticalMargin);
			newElements.push({ ...renderedElements[i], transformY });
		}

		const _bottom = newElements[newElements.length - 1].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(_bottom);
		setElements(newElements);
		if (_bottom > maxBottomOffset) {
			setMaxBottomOffset(_bottom);
		}
	};

	const moveUp = (renderedElements: IScrollElementResult[]) => {
		if (topOffset === 0) {
			return;
		}

		const newElements = renderedElements.slice(0, renderedElements.length - tolerance);
		let transformY = renderedElements[0].transformY || 0;
		for (let i = renderedElements.length - 1; i >= renderedElements.length - tolerance; i--) {
			transformY = Math.max(0, transformY - Math.ceil((renderedElements[i].ref?.current?.getBoundingClientRect().height || 0) + verticalMargin));
			newElements.unshift({ ...renderedElements[i], transformY });
		}

		const bottom = newElements[newElements.length - 1].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(bottom);
		setElements(newElements);
		setAreaBottomPadding(maxBottomOffset - (maxBottomOffset - (maxBottomOffset - bottom)));
	};

	const update = (renderedElements: IScrollElementResult[]) => {
		const newElements = [];
		let transformY = topOffset;
		for (let i = 0; i < renderedElements.length; i++) {
			const currentRef = renderedElements[i]?.ref?.current;
			newElements.push({ ...renderedElements[i], transformY });
			transformY = transformY + Math.ceil((currentRef?.getBoundingClientRect().height || 0) + verticalMargin);
		}

		const _bottom = newElements[newElements.length - tolerance].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(_bottom);
		setElements(newElements);
	};

	const updateData = useActualCallback((action: treeActionType, isIntersecting: boolean) => {
		if (!elements || elements.length === 0 || itemsData.length === 0 || visibility === "hidden") {
			return;
		}

		const height = elements[0]?.ref?.current?.getBoundingClientRect().height;
		if (isIntersecting && elements.length && height) {
			const dataToRender = dataManager.getNextChunk(action);
			if (
				dataToRender[dataToRender.length - 1].index === itemsData[itemsData.length - 1].index &&
				dataToRender[0].index === itemsData[0].index
			) {
				return;
			}
			setItemsData(dataToRender);
			switch (action) {
				case "up":
					moveUp(elements);
					break;
				case "down":
					moveDown(elements);
					break;
				case "update":
					update(elements);
			}
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => updateData("up", entry.isIntersecting);
	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => updateData("down", entry.isIntersecting);
	const [topObsElement, bottomObsElement] = useIntersectionObserver(onTopIntersectionCallback, onBottomIntersectionCallback, observerConfig, [!!dataManager]);

	const toggleHide = useCallback((i: number) => dataManager.toggleHide(i) ? updateData("update", true) : void 0, []);

	useEffect(() => {
		const result = dataManager.getNextChunk("update");
		const _elements = result.map((data, index) => ({...createScrollItem({data, index, toggleHide})}));
		setItemsData(result);
		setElements(_elements);
		setVisibility("hidden");
	}, [context.itemStyles]);

	useEffect(() => {
		if (visibility === "hidden" && elements && elements.length) {
			update(elements);
			setVisibility("visible");
		}
	}, [elements]);

	return (
		<div className={"virtual-scroll-container"}>
			<div className={"virtual-scroll"}>
				<ScrollArea style={{ paddingTop: `${topOffset}px`, paddingBottom: `${Math.max(0, areaBottomPadding - topOffset)}px` }}>
					{elements?.map((element, index) => element.render({
						data: itemsData[index],
						index,
						transformStyle: { transform: `translateY(${element.transformY}px)`, visibility },
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

