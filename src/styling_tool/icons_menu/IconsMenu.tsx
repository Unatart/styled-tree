import {ICON_VARIATIONS} from "../../constants";
import {IStyleActionProps} from "../IStylingTool";
import {useContext} from "react";
import {UiVariationBlock} from "../ui_variation_block/UiVariationBlock";
import {VisualContext} from "../../scroll_component/ScrollComponent";

export const IconsMenu = ({ updateVisualState }: IStyleActionProps) => {
	const context = useContext(VisualContext);

	return (
		<UiVariationBlock
			title={"Icons:"}
			keys={Object.keys(ICON_VARIATIONS)}
			buttonTitle={context.iconStyle}
			onClick={(key) => updateVisualState({ iconStyle: ICON_VARIATIONS[key as keyof typeof ICON_VARIATIONS] })}
		/>
	);
};