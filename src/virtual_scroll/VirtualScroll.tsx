import {useContext, useEffect, useRef, useState} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "../scroll_area/ScrollArea";
import {ITreeManager, treeActionType, TreeManager} from "../tree/TreeManager";
import {IConnectedTreeItem} from "../tree/ITree";
import {useIntersectionObserver} from "../intersection_observer/useIntersectionObserver";
import {IntersectionObserverElement} from "../intersection_observer/IntersectionObserverElement";
import {ITreeElementProps} from "../tree/tree_element/createTreeElement";
import {IScrollElementResult} from "./IVirtualScroll";
import {VisualContext} from "../App";
import {BASE_PAGE_SIZE, BASE_TOLERANCE} from "../constants";
import {useActualCallback} from "../hooks/useActualCallback";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollProps<T> {
	tolerance: number;
	observerConfig: IntersectionObserverInit;
	createScrollItem: (props: ITreeElementProps) => IScrollElementResult;
	initialData?: T[];
	offsetDenominator: number;
}

export const VirtualScroll = <T extends IConnectedTreeItem>({
	tolerance,
	observerConfig,
	createScrollItem,
	initialData,
	offsetDenominator
}: IVirtualScrollProps<T>) => {
	const context = useContext(VisualContext);

	const [DataManager, setDataManager] = useState<ITreeManager<IConnectedTreeItem> | undefined>(() => initialData ? new TreeManager(initialData, { pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE }) : undefined);

	const [itemsData, setItemsData] = useState<IConnectedTreeItem[]>([]);
	const [elements, setElements] = useState<IScrollElementResult[] | undefined>();

	const [maxBottomOffset, setMaxBottomOffset] = useState(0);
	const [margin, setMargin] = useState(0);
	const [topOffset, setTopOffset] = useState(0);
	const [bottomOffset, setBottomOffset] = useState(0);
	const [areaBottomPadding, setAreaBottomPadding] = useState(0);
	const visibility = useRef<"visible" | "hidden">("visible");

	const moveDown = (renderedElements: IScrollElementResult[], from = 0, to = tolerance) => {
		const newElements = renderedElements.slice(to, renderedElements.length);

		const lastHeight = Math.ceil(renderedElements[renderedElements.length - 1].ref?.current?.getBoundingClientRect().height || 0);
		const lastElementOffset = Math.ceil(renderedElements[renderedElements.length - 1].transformY || 0);
		const verticalMargin = margin || Math.ceil((renderedElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);

		let transformY = lastElementOffset ? lastElementOffset + lastHeight + verticalMargin : 0;
		for (let i = from; i < to; i++) {
			newElements.push({ ...renderedElements[i], transformY });
			const currentRef = renderedElements[i]?.ref?.current;
			transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || 0) + verticalMargin;
		}

		const bottom = newElements[newElements.length - 1].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setBottomOffset(bottom);
		setElements(newElements);
		setMargin(verticalMargin);
		if (bottom > maxBottomOffset) {
			setMaxBottomOffset(bottom);
		}
		setAreaBottomPadding(maxBottomOffset - bottom);
	};

	const moveUp = (renderedElements: IScrollElementResult[]) => {
		if (topOffset === 0) {
			return;
		}

		const verticalMargin = margin || Math.ceil((renderedElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);
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
		setMargin(verticalMargin);
		setAreaBottomPadding(maxBottomOffset - bottom);
	};

	const update = (renderedElements: IScrollElementResult[]) => {
		const newElements = [];
		const verticalMargin = margin || Math.ceil((renderedElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);
		let transformY = topOffset;
		for (let i = 0; i < renderedElements.length; i++) {
			newElements.push({ ...renderedElements[i], transformY });
			const currentRef = renderedElements[i]?.ref?.current;
			transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || 0) + verticalMargin;
		}

		const _bottom = newElements[newElements.length - tolerance].transformY || 0;
		setTopOffset(newElements[0].transformY || 0);
		setMargin(verticalMargin);
		setBottomOffset(_bottom);
		setElements(newElements);
	};

	useEffect(() => {
		if (elements) {
			update(elements);
		}
	}, [elements && elements[elements?.length - 1].ref?.current?.getBoundingClientRect().height]);

	const updateData = useActualCallback((action: treeActionType, isIntersecting: boolean) => {
		if (!elements || elements.length === 0 || itemsData.length === 0 || visibility.current === "hidden") {
			return;
		}

		if (itemsData[0].index === 0 && action === "up") {
			return;
		}

		const height = elements[0]?.ref?.current?.getBoundingClientRect().height;
		if (isIntersecting && elements.length && height) {
			const data = DataManager?.getNextChunk(action);
			if (!data ||
				(data.length === 0 || (
					data[data.length - 1].index === itemsData[itemsData.length - 1].index &&
					data[0].index === itemsData[0].index
				))
			) {
				return;
			}
			setItemsData(data);
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
	const [topObsElement, bottomObsElement] = useIntersectionObserver(onTopIntersectionCallback, onBottomIntersectionCallback, observerConfig, visibility.current === "visible");

	const toggleHide = (i: number) => DataManager?.toggleHide(i) ? updateData("update", true) : void 0;

	const clearState = () => {
		setMaxBottomOffset(0);
		setMargin(0);
		setElements(undefined);
		setItemsData([]);
		setTopOffset(0);
		setBottomOffset(0);
		setAreaBottomPadding(0);
	};

	useEffect(() => {
		if (visibility.current === "visible" && initialData?.length) {
			const manager = new TreeManager(initialData, { pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE });
			clearState();
			const result = manager.getNextChunk("update");
			setDataManager(manager);
			if (result) {
				const _elements = result.map((data, index) => ({...createScrollItem({data, index, toggleHide})}));
				setItemsData(result);
				setElements(_elements);
				visibility.current = "hidden";
			}
		}
	}, [context.itemStyles, initialData]);

	useEffect(() => {
		if (visibility.current === "hidden" && elements && elements.length) {
			update(elements);
			visibility.current = "visible";
		}
	}, [elements]);

	return (
		<div className={"virtual-scroll-container"}>
			<div className={"virtual-scroll"}>
				<ScrollArea style={{ paddingTop: `${topOffset}px`, paddingBottom: `${Math.max(0, areaBottomPadding)}px` }}>
					{elements?.map((element, index) => element.render({
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

