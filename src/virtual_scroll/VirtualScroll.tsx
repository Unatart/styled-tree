import {
	ComponentType,
	Ref,
	useCallback,
	useEffect, useMemo,
	useRef,
	useState
} from "react";
import "./VirtualScroll.css";
import {ScrollArea} from "./ScrollArea";
import {useActualCallback} from "../hooks/useActualCallback";
import {getNextRenderChunkType, ITreeManagerConfig, treeActionType} from "../tree/createTreeManager";
import {IConnectedTreeItem} from "../tree/ITree";
import {useIntersectionObserver} from "../IntersectionObserver/useIntersectionObserver";
import {IntersectionObserverElement} from "../IntersectionObserver/IntersectionObserverElement";
import {ITreeElementProps} from "../tree/tree_element/TreeElement";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollProps<T> {
	dataUrl: string;
	observerConfig: IntersectionObserverInit;
	treeManagerConfig: ITreeManagerConfig;
	ScrollItem: ComponentType<ITreeElementProps> & { ref?: Ref<HTMLDivElement> };

	loadData: (url: string)=> Promise<T[]>;
	getNextDataChunk: (tree: T[], config: ITreeManagerConfig)=> getNextRenderChunkType<T>;
}

export const VirtualScroll = <T extends IConnectedTreeItem>({
	dataUrl,
	observerConfig,
	treeManagerConfig,
	loadData,
	getNextDataChunk,
	ScrollItem
}: IVirtualScrollProps<T>) => {
	const [renderData, setRenderData] = useState<T[]>([]);
	const getNextDataChunkRef = useRef<getNextRenderChunkType<T> | undefined>(undefined);
	const elementRef = useRef<HTMLDivElement>(null);

	const updateData = useActualCallback((direction: treeActionType, isIntersecting: boolean) => {
		if (getNextDataChunkRef.current && isIntersecting) {
			const dataToRender = getNextDataChunkRef.current.getNextChunk(direction);
			setRenderData(dataToRender);
		}
	});

	const onTopIntersectionCallback: IntersectionObserverCallback = async ([entry]) => updateData("up", entry.isIntersecting);
	const onBottomIntersectionCallback: IntersectionObserverCallback = async ([entry]) => updateData("down", entry.isIntersecting);

	const [topObsElement, bottomObsElement] = useIntersectionObserver(onTopIntersectionCallback, onBottomIntersectionCallback, observerConfig, !!getNextDataChunkRef.current);

	useEffect(() => {
		loadData(dataUrl)
			.then((data) => {
				if (getNextDataChunkRef.current || renderData.length) {
					return;
				}
				getNextDataChunkRef.current = getNextDataChunk(data, treeManagerConfig);
				setRenderData(getNextDataChunkRef.current?.getNextChunk("update"));
			})
			.catch((error) => {
				console.log(error);
			});
	}, []);

	const startIndex = renderData[0]?.index || 0;
	const toggleHidden = useCallback((i: number) => {
		if (getNextDataChunkRef.current) {
			const result = getNextDataChunkRef.current.toggleHideElement(i);
			if (result) {
				const dataToRender = getNextDataChunkRef.current?.getNextChunk("update");
				setRenderData(dataToRender);
			}
		}
	}, []);

	const height = useMemo(() => elementRef.current?.getBoundingClientRect().height || 0, [!!elementRef.current]);
	return useMemo(() => (
		<ScrollArea style={{paddingTop: `${startIndex * height}px`}}>
			<IntersectionObserverElement
				id={TOP_OBSERVER_ELEMENT_ID}
				ref={topObsElement}
			/>
			{renderData.map((data, index) => <ScrollItem {...{data, index, toggleHidden, height, ref: index === 0 ? elementRef : null}}/>)}
			<IntersectionObserverElement
				id={BOTTOM_OBSERVER_ELEMENT_ID}
				ref={bottomObsElement}
				style={{transform: `translateY(${(renderData.length - 1) * height}px)`}}
			/>
		</ScrollArea>
	), [renderData, height]);
};

