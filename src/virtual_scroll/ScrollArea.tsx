import {CSSProperties, ReactNode} from "react";

interface IScrollAreaProps {
    children?: ReactNode[];
    style?: CSSProperties;
}

export const ScrollArea = ({ children, style }: IScrollAreaProps) => <div className={"virtual-scroll"} style={style}>{children}</div>;