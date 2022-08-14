import {ReactNode, CSSProperties, forwardRef} from "react";
import "./TreeElement.css";

type ITreeElementProps = {
	label?: string;
	children?: ReactNode;
	style?: CSSProperties;
	className?: string;
};

export const TreeElement = forwardRef<HTMLDivElement, ITreeElementProps>((
	{label, style, children, className},
	ref
) => (
	<div className={`tree-element ${className}`} style={style} ref={ref}>
		{label}
		{children}
	</div>
));
