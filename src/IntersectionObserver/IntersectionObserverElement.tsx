import {CSSProperties, forwardRef} from "react";
import "./IntersectionObserverElement.css";

interface IIntersectionObserverElement {
    id: string;
    style?: CSSProperties;
}

export const IntersectionObserverElement = forwardRef<HTMLDivElement, IIntersectionObserverElement>(({ id, style }, ref) => {
	return <div id={id} ref={ref} className={"intersection-observer"} style={style}/>;
});