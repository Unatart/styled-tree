import {forwardRef} from "react";

interface IObserverElementProps {
    id: string;
    className: string;
}

export const ObserverElement = forwardRef<HTMLDivElement, IObserverElementProps>((props, ref) => {
	return <div ref={ref} id={props.id} className={props.className}/>;
});