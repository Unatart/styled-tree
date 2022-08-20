import React, {CSSProperties, useState} from "react";
import {VirtualScroll} from "./virtual_scroll/VirtualScroll";
import {loadTreeData} from "./request/loadTreeData";
import {createTreeElement} from "./tree/tree_element/createTreeElement";
import {createTreeManager} from "./tree/createTreeManager";
import {BASE_PAGE_SIZE, BASE_TOLERANCE, BASE_TREE_LINK, ICON_VARIATIONS} from "./constants";
import {IConnectedTreeItem} from "./tree/ITree";
import {MainScreen} from "./main_screen/MainScreen";
import {StylingTool} from "./styling_tool/StylingTool";

export interface IVisualContext {
	iconStyle: ICON_VARIATIONS;
	itemStyles: CSSProperties;
	dataUrl: string;
}

const defaultValue = { iconStyle: ICON_VARIATIONS.MINUS_PLUS, itemStyles: {}, dataUrl: BASE_TREE_LINK };
export const VisualContext = React.createContext<IVisualContext>(defaultValue);

function App() {
	const [visualContextState, setState] = useState(defaultValue);
	const updateState = ( state: Partial<IVisualContext> ) => setState({ ...visualContextState, ...state });

	return (
		<VisualContext.Provider value={visualContextState}>
			<MainScreen>
				<StylingTool updateVisualState={updateState}/>
				<VirtualScroll<IConnectedTreeItem>
					tolerance={BASE_TOLERANCE}
					createTreeManager={createTreeManager}
					loadData={loadTreeData}
					createScrollItem={createTreeElement}
					observerConfig={{ threshold: 0.25 }}
					treeManagerConfig={{ pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE }}
				/>
			</MainScreen>
		</VisualContext.Provider>
	);
}

export default App;
