import {CSSProperties, ReactNode} from "react";
import "./ScrollArea.css";

interface IScrollAreaProps {
    children?: ReactNode[];
    style?: CSSProperties;
}

export const ScrollArea = ({ children, style }: IScrollAreaProps) => <div className={"scroll-area"} style={style}>{children}</div>;