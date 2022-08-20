import {CSSProperties, forwardRef} from "react";
import "./IntersectionObserverElement.css";

interface IIntersectionObserverElement {
    style?: CSSProperties;
}

export const IntersectionObserverElement = forwardRef<HTMLDivElement, IIntersectionObserverElement>(({ style }, ref) => {
	return <div ref={ref} className={"intersection-observer"} style={style}/>;
});