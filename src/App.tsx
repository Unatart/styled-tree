import React, {CSSProperties, ReactNode, useEffect, useState} from "react";
import {VirtualScroll} from "./virtual_scroll/VirtualScroll";
import {createTreeElement} from "./tree/tree_element/createTreeElement";
import {createTreeManager} from "./tree/createTreeManager";
import {BASE_PAGE_SIZE, BASE_TOLERANCE, BASE_TREE_LINK, BASE_VERTICAL_MARGIN, ICON_VARIATIONS} from "./constants";
import {MainScreen} from "./main_screen/MainScreen";
import {StylingTool} from "./styling_tool/StylingTool";
import {useDataManager} from "./hooks/useDataManager";
import {IConnectedTreeItem} from "./tree/ITree";
import {loadData} from "./request/loadData";

export interface IVisualContext<T> {
	iconStyle: ICON_VARIATIONS;
	itemStyles: CSSProperties;
	data?: T[];
}

const defaultValue = { iconStyle: ICON_VARIATIONS.MINUS_PLUS, itemStyles: {} };
export const VisualContext = React.createContext<IVisualContext<IConnectedTreeItem>>(defaultValue);

function App() {
	const [visualContextState, setState] = useState(defaultValue);
	const updateState = ( state: Partial<IVisualContext<IConnectedTreeItem>> ) => setState({ ...visualContextState, ...state });

	const [dataUrl, setDataUrl] = useState(BASE_TREE_LINK);
	const [data, setData] = useState<IConnectedTreeItem[] | undefined>();
	const dataManager = useDataManager(data, { pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE }, createTreeManager);
	const [virtualScrollComponent, setVirtualScrollComponent] = useState<ReactNode>();

	useEffect(() => {
		setDataUrl(dataUrl);
		loadData(dataUrl)
			.then((result) => setData(result));
	}, [dataUrl]);
	
	useEffect(() => {
		if (dataManager) {
			setVirtualScrollComponent(
				<VirtualScroll
					tolerance={BASE_TOLERANCE}
					verticalMargin={BASE_VERTICAL_MARGIN}
					createScrollItem={createTreeElement}
					observerConfig={{ threshold: 0.25 }}
					dataManager={dataManager}
				/>
			);
		}
	}, [dataManager]);

	return (
		<VisualContext.Provider value={visualContextState}>
			<MainScreen>
				<StylingTool updateVisualState={updateState} setData={setData}/>
				{virtualScrollComponent}
			</MainScreen>
		</VisualContext.Provider>
	);
}

export default App;
