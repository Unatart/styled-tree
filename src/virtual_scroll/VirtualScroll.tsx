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
import {TreeManagerType, ITreeManagerConfig, treeActionType} from "../tree/createTreeManager";
import {IConnectedTreeItem} from "../tree/ITree";
import {useIntersectionObserver} from "../IntersectionObserver/useIntersectionObserver";
import {IntersectionObserverElement} from "../IntersectionObserver/IntersectionObserverElement";
import {ITreeElementProps} from "../tree/tree_element/TreeElement";
import {TREE_ELEMENT_X_OFFSET_PX} from "../constants";

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

interface IVirtualScrollProps<T> {
	dataUrl: string;
	observerConfig: IntersectionObserverInit;
	treeManagerConfig: ITreeManagerConfig;
	ScrollItem: ComponentType<ITreeElementProps> & { ref?: Ref<HTMLDivElement> };

	loadData: (url: string)=> Promise<T[]>;
	getNextDataChunk: (tree: T[], config: ITreeManagerConfig)=> TreeManagerType<T>;
}

export const VirtualScroll = <T extends IConnectedTreeItem>({
	dataUrl,
	observerConfig,
	treeManagerConfig,
	loadData,
	getNextDataChunk
}: IVirtualScrollProps<T>) => {
	const [renderData, setRenderData] = useState<T[]>([]);
	const getNextDataChunkRef = useRef<TreeManagerType<T> | undefined>(undefined);
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
			const result = getNextDataChunkRef.current.toggleHide(i);
			if (result) {
				const dataToRender = getNextDataChunkRef.current?.getNextChunk("update");
				setRenderData(dataToRender);
			}
		}
	}, []);

	console.log(renderData);
	const height = useMemo(() => elementRef.current?.getBoundingClientRect().height || 0, [!!elementRef.current]);
	return (
		<ScrollArea style={{paddingTop: `${startIndex * height}px`}}>
			<IntersectionObserverElement
				key={TOP_OBSERVER_ELEMENT_ID}
				ref={topObsElement}
			/>
			{renderData.map((data, index) => (
				<div
					className={"tree-element"}
					key={index}
					ref={index === 0 ? elementRef : null}
					style={{ transform: `translate(${(data.level || 0) * TREE_ELEMENT_X_OFFSET_PX}px, ${index * height}px)` }}
					onClick={() => toggleHidden(data.index || index)}
				>
					{`${data.label} ${data.hiddenChildren ? "(h)" : ""}`}
				</div>
			))}
			<IntersectionObserverElement
				key={BOTTOM_OBSERVER_ELEMENT_ID}
				ref={bottomObsElement}
				style={{transform: `translateY(${(renderData.length - 1) * height}px)`}}
			/>
		</ScrollArea>
	);
};

