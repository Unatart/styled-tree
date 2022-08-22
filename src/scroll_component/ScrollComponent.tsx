import React, {CSSProperties, FC, useEffect, useState} from "react";
import {IConnectedTreeItem} from "./tree/ITree";
import {createTreeElement, ITreeElementProps} from "./tree_element/createTreeElement";
import {BASE_TREE_LINK, ICON_VARIATIONS} from "../constants";
import {loadData} from "../request/loadData";
import {MainScreen} from "../main_screen/MainScreen";
import {StylingTool} from "../styling_tool/StylingTool";
import {VirtualScroll} from "./virtual_scroll/VirtualScroll";

interface IScrollComponentProps {
    withStylingTool: boolean;
    initialData?: IConnectedTreeItem[];
	pageSize: number;
    tolerance: number;
    offsetDenominator: number;
	offsetRecalculationEnabled: boolean;
    render: (props: ITreeElementProps) => JSX.Element | null;
}

export interface IVisualContext {
    iconStyle: ICON_VARIATIONS;
    itemStyles: CSSProperties;
}

const defaultValue = { iconStyle: ICON_VARIATIONS.MINUS_PLUS, itemStyles: {} };
export const VisualContext = React.createContext<IVisualContext>(defaultValue);

export const ScrollComponent: FC<IScrollComponentProps> = ({
	withStylingTool = false,
	initialData,
	pageSize,
	tolerance,
	offsetDenominator,
	offsetRecalculationEnabled,
	render
}) => {
	const [visualContextState, setState] = useState(defaultValue);
	const updateState = ( state: Partial<IVisualContext> ) => setState({ ...visualContextState, ...state });
	const [data, setData] = useState<IConnectedTreeItem[] | undefined>(initialData);

	useEffect(() => {
		if (data) {
			return;
		}
		loadData(BASE_TREE_LINK).then((result) => setData(result));
	}, []);

	return (
		<VisualContext.Provider value={visualContextState}>
			<MainScreen>
				{withStylingTool && <StylingTool
					updateVisualState={updateState}
					setData={setData}
				/>}
				<VirtualScroll
					pageSize={pageSize}
					offsetDenominator={offsetDenominator}
					tolerance={tolerance}
					createScrollItem={() => createTreeElement(render)}
					observerConfig={{ threshold: 0.1 }}
					initialData={data}
					offsetRecalculationEnabled={offsetRecalculationEnabled}
				/>
			</MainScreen>
		</VisualContext.Provider>
	);
};
