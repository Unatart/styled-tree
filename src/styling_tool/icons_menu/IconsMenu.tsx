import {ICON_VARIATIONS} from "../../constants";
import {IStyleActionProps} from "../IStylingTool";
import {useContext} from "react";
import {VisualContext} from "../../App";
import {UiVariationBlock} from "../ui_variation_block/UiVariationBlock";

export const IconsMenu = (props: IStyleActionProps) => {
	const context = useContext(VisualContext);

	return (
		<UiVariationBlock
			title={"Icons:"}
			keys={Object.keys(ICON_VARIATIONS)}
			buttonTitle={context.iconStyle}
			onClick={(key) => props.updateVisualState({ iconStyle: ICON_VARIATIONS[key as keyof typeof ICON_VARIATIONS] })}
		/>
	);
};