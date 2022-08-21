import {VisualContext} from "../../App";
import {CSSProperties, FC, useContext, useEffect, useState} from "react";
import "./GoColorfulButton.css";
import {COLORFUL_SCHEME} from "../schemes";
import {IStylingToolProps} from "../IStylingToolProps";

export const GoColorfulButton: FC<IStylingToolProps> = (props) => {
	const [toggled, setToggled] = useState(false);
	const [defaultStyles, setDefaultStyles] = useState<CSSProperties>({});
	const context = useContext(VisualContext);

	useEffect(() => {
		if (context.itemStyles !== COLORFUL_SCHEME) {
			setToggled(false);
		}
	}, [context.itemStyles]);
    
	const onClick = () => {
		if (!toggled) {
			setDefaultStyles(context.itemStyles);
			props.updateVisualState({ itemStyles: COLORFUL_SCHEME as CSSProperties });
		} else {
			props.updateVisualState({ itemStyles: defaultStyles });
		}
		setToggled(!toggled);
	};

	return <div className={`go-colorful-button ${toggled ? "off" : ""}`} onClick={onClick}/>;
};