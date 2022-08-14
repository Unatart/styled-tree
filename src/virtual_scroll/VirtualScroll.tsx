import {FC, useEffect, useRef, useState} from 'react';
import './VirtualScroll.css';
import {ScrollArea} from "./ScrollArea";
import {ObserverElement} from "./ObserverElement";

interface IVirtualScrollAdditionalProps {
    from?: number;
    to?: number;
}

const TOP_OBSERVER_ELEMENT_ID = "top-observer-element-id";
const BOTTOM_OBSERVER_ELEMENT_ID = "bottom-observer-element-id";

const defaultObserverConfig: IntersectionObserverInit = { threshold: 0.25 };

export function withVirtualScroll<P>(
    WrappedComponent: FC<P & IVirtualScrollAdditionalProps>
) {
    return (props: P & IVirtualScrollAdditionalProps) => {
        const [from, setFrom] = useState(0);
        const [to, setTo] = useState(50);

        const onTopIntersectionCallback:IntersectionObserverCallback = async ([entry]) => {
            if (entry.intersectionRatio > 0.1) {
                console.log("UP");
            }
        }

        const onBottomIntersectionCallback:IntersectionObserverCallback = async ([entry]) => {
            if (entry.intersectionRatio > 0.1) {
                console.log("DOWN");
                setTo((prevState) => prevState + 25);
            }
        }

        const [topObserver] = useState(() => new IntersectionObserver(onTopIntersectionCallback, defaultObserverConfig));
        const [bottomObserver] = useState(() => new IntersectionObserver(onBottomIntersectionCallback, defaultObserverConfig));

        const topElementRef = useRef<HTMLDivElement>(null);
        const bottomElementRef = useRef<HTMLDivElement>(null);
        const wrappedComponentElementRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            if (topElementRef.current) {
                topObserver.observe(topElementRef.current);
            }

            if (bottomElementRef.current) {
                bottomObserver.observe(bottomElementRef.current);
                bottomElementRef.current.style.top = `${window.innerHeight}px`;
            }

            return () => {
                if (topElementRef.current) {
                    topObserver.unobserve(topElementRef.current);
                }

                if (bottomElementRef.current) {
                    bottomObserver.unobserve(bottomElementRef.current);
                }
            }
        }, []);

        return (
            <ScrollArea>
                <ObserverElement ref={topElementRef} id={TOP_OBSERVER_ELEMENT_ID} className={"intersection-observer"}/>
                <WrappedComponent {...props} ref={wrappedComponentElementRef} itemClassName={"absolute-center"} from={from} to={to}/>
                <ObserverElement ref={bottomElementRef} id={BOTTOM_OBSERVER_ELEMENT_ID} className={"intersection-observer"}/>
            </ScrollArea>
        );
    }
}