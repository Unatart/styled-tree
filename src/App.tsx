import React, {CSSProperties, useEffect, useState} from "react";
import {VirtualScroll} from "./virtual_scroll/VirtualScroll";
import {createTreeElement, ITreeElementProps, render} from "./tree/tree_element/createTreeElement";
import {BASE_DENOMINATOR, BASE_TOLERANCE, BASE_TREE_LINK, ICON_VARIATIONS} from "./constants";
import {MainScreen} from "./main_screen/MainScreen";
import {StylingTool} from "./styling_tool/StylingTool";
import {IConnectedTreeItem} from "./tree/ITree";
import {loadData} from "./request/loadData";

export interface IVisualContext {
	iconStyle: ICON_VARIATIONS;
	itemStyles: CSSProperties;
}

const defaultValue = { iconStyle: ICON_VARIATIONS.MINUS_PLUS, itemStyles: {} };
export const VisualContext = React.createContext<IVisualContext>(defaultValue);

function App() {
	const [visualContextState, setState] = useState(defaultValue);
	const updateState = ( state: Partial<IVisualContext> ) => setState({ ...visualContextState, ...state });

	const [dataUrl, setDataUrl] = useState(BASE_TREE_LINK);
	const [data, setData] = useState<IConnectedTreeItem[] | undefined>();

	useEffect(() => {
		setDataUrl(dataUrl);
		loadData(dataUrl).then((result) => setData(result));
	}, [dataUrl]);

	return (
		<VisualContext.Provider value={visualContextState}>
			<MainScreen>
				<StylingTool updateVisualState={updateState} setData={setData}/>
				<VirtualScroll
					offsetDenominator={BASE_DENOMINATOR}
					tolerance={BASE_TOLERANCE}
					createScrollItem={() => createTreeElement(render)}
					observerConfig={{ threshold: 0.25 }}
					initialData={data}
				/>
			</MainScreen>
		</VisualContext.Provider>
	);
}

export default App;
