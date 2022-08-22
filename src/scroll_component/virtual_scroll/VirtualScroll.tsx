import {useContext, useEffect, useRef, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "../scroll_area/ScrollArea";
import {ITreeManager, treeActionType, TreeManager} from "../tree/TreeManager";
import {IConnectedTreeItem} from "../tree/ITree";
import {useIntersectionObserver} from "../intersection_observer/useIntersectionObserver";
import {IntersectionObserverElement} from "../intersection_observer/IntersectionObserverElement";
import {ITreeElementProps} from "../tree_element/createTreeElement";
import {IScrollElementResult} from "./IVirtualScroll";
import {BASE_PAGE_SIZE, BASE_TOLERANCE} from "../../constants";
import {useActualCallback} from "../../hooks/useActualCallback";
import {VisualContext} from "../ScrollComponent";
import {moveDown, moveUp, update} from "./calcOffsetsHelpers";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollProps<T> {
	pageSize: number;
	tolerance: number;
	observerConfig: IntersectionObserverInit;
	createScrollItem: (props: ITreeElementProps) => IScrollElementResult;
	initialData?: T[];
	offsetDenominator: number;
	offsetRecalculationEnabled: boolean;
}

export const VirtualScroll = <T extends IConnectedTreeItem>({
	pageSize,
	tolerance,
	observerConfig,
	createScrollItem,
	initialData,
	offsetDenominator,
	offsetRecalculationEnabled
}: IVirtualScrollProps<T>) => {
	const context = useContext(VisualContext);
	const [DataManager, setDataManager] = useState<ITreeManager<IConnectedTreeItem> | undefined>(() => initialData
		? new TreeManager(initialData, { pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE })
		: undefined
	);

	const [itemsData, setItemsData] = useState<IConnectedTreeItem[]>([]);
	const [elements, setElements] = useState<IScrollElementResult[]>([]);

	const [maxBottomOffset, setMaxBottomOffset] = useState(0);
	const [topOffset, setTopOffset] = useState(0);
	const [bottomOffset, setBottomOffset] = useState(0);
	const [areaBottomPadding, setAreaBottomPadding] = useState(0);
	const [nextUpdateLimits, setNextUpdateLimits] = useState<[number, number | undefined]>([0, undefined]);
	const visibility = useRef<"visible" | "hidden">("visible");

	const clearState = () => {
		setMaxBottomOffset(0);
		setElements([]);
		setItemsData([]);
		setTopOffset(0);
		setBottomOffset(0);
		setAreaBottomPadding(0);
		visibility.current = "hidden";
	};

	const updateOnAction = useActualCallback((action: treeActionType) => {
		if (!elements.length || !itemsData.length || visibility.current === "hidden" || (itemsData[0].index === 0 && action === "up") || !DataManager) {
			return;
		}

		const data = DataManager.getNextChunk(action);
		if (!data.length || (data.length < pageSize && itemsData.length < pageSize && action !== "update")) {
			return;
		}
		setItemsData(data);
		updateVisual(action);
	});

	const updateVisual = useActualCallback((action: treeActionType) => {
		if (!elements.length) {
			return;
		}

		let newElements: IScrollElementResult[] = [];
		switch (action) {
			case "up":
				if (topOffset === 0) {
					return;
				}
				newElements = moveUp(elements, offsetDenominator, tolerance);
				if (offsetRecalculationEnabled) {
					setNextUpdateLimits([tolerance, 0]);
					visibility.current = "hidden";
				}
				break;
			case "down":
				newElements = moveDown(elements, 0, tolerance, offsetDenominator);
				if (offsetRecalculationEnabled) {
					setNextUpdateLimits([elements.length - tolerance, elements.length]);
					visibility.current = "hidden";
				}
				break;
			case "update":
				newElements = update(elements, offsetDenominator, topOffset, nextUpdateLimits[0], nextUpdateLimits[1]);
				if (offsetRecalculationEnabled) {
					setNextUpdateLimits([0, elements.length]);
					visibility.current = "hidden";
				}
		}

		const bottom = newElements[newElements.length - tolerance]?.transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(bottom ? newElements[newElements.length - 1]?.transformY || 0 : 0);
		setElements(newElements);
		if (bottom > maxBottomOffset) {
			setMaxBottomOffset(bottom);
		}
		setAreaBottomPadding(Math.max(0, maxBottomOffset - bottom));
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => entry.isIntersecting ? updateOnAction("up") : void 0;
	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => entry.isIntersecting ? updateOnAction("down") : void 0;
	const [topObsElement, bottomObsElement] = useIntersectionObserver(onTopIntersectionCallback, onBottomIntersectionCallback, observerConfig, visibility.current === "visible");
	const toggleHide = (i: number) => DataManager?.toggleHide(i) ? updateOnAction("update") : void 0;

	useEffect(() => {
		if (visibility.current === "visible" && initialData && initialData.length) {
			clearState();
			const manager = new TreeManager(initialData, { pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE });
			const chunk = manager.getNextChunk("update");
			setDataManager(manager);
			if (chunk.length) {
				setItemsData(chunk);
				const _elements = chunk.map((data, index) => ({ ...createScrollItem({data, index, toggleHide}) }));
				setElements(_elements);
			}
		}
	}, [context.itemStyles, initialData]);

	useEffect(() => {
		if (elements && elements.length && visibility.current === "hidden") {
			updateVisual("update");
			visibility.current = "visible";
			setNextUpdateLimits([0, undefined]);
		}
	}, [elements.length && visibility.current]);

	return (
		<div className={"virtual-scroll-container"}>
			<div className={"virtual-scroll"}>
				<ScrollArea style={{ paddingTop: `${topOffset}px`, paddingBottom: `${areaBottomPadding}px` }}>
					{elements?.map((element, index) => element?.render?.({
						data: itemsData[index],
						index,
						transformStyle: { transform: `translateY(${element.transformY}px)`, visibility: visibility.current },
						styles: context.itemStyles,
						iconStyle: context.iconStyle,
						toggleHide
					}))}
					<IntersectionObserverElement
						key={TOP_OBSERVER_ELEMENT_ID}
						ref={topObsElement}
						style={{transform: `translateY(${topOffset}px)`, display: topOffset === 0 ? "none" : "block"}}
					/>
					<IntersectionObserverElement
						key={BOTTOM_OBSERVER_ELEMENT_ID}
						ref={bottomObsElement}
						style={{transform: `translateY(${bottomOffset}px)`, display: bottomOffset === 0 ? "none" : "block"}}
					/>
				</ScrollArea>
			</div>
		</div>
	);
};

