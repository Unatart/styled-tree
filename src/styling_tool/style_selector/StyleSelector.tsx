import {CSSProperties, FC} from "react";
import {COLORFUL_SCHEME, DEFAULT_SCHEME, FLAMINGO_SCHEME, RAINBOW_SCHEME} from "../schemes";
import {IStyleActionProps} from "../IStylingTool";
import {UiVariationBlock} from "../ui_variation_block/UiVariationBlock";

const STYLES = {
	"DEFAULT_SCHEME": DEFAULT_SCHEME,
	"COLORFUL_SCHEME": COLORFUL_SCHEME,
	"FLAMINGO_SCHEME": FLAMINGO_SCHEME,
	"RAINBOW_SCHEME": RAINBOW_SCHEME,
};

export const StyleSelector: FC<IStyleActionProps> = (props) => {
	return (
		<UiVariationBlock
			title={"Styles:"}
			keys={Object.keys(STYLES)}
			buttonTitle={"Select theme"}
			onClick={(key) => props.updateVisualState({ itemStyles: STYLES[key as keyof typeof STYLES] as CSSProperties })}
		/>
	);
};