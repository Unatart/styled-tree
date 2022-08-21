import * as React from "react";
import {ScrollComponent} from "./scroll_component/ScrollComponent";
import {BASE_DENOMINATOR, BASE_TOLERANCE} from "./constants";
import {renderItem} from "./scroll_component/tree_element/createTreeElement";


function App() {
	return (
		<ScrollComponent
			tolerance={BASE_TOLERANCE}
			offsetDenominator={BASE_DENOMINATOR}
			withStylingTool={true}
			render={renderItem}
		/>
	);
}

export default App;
