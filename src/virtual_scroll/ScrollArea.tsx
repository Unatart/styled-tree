import {CSSProperties, ReactNode} from "react";

interface IScrollAreaProps {
    children?: ReactNode[];
    style?: CSSProperties;
}

export const ScrollArea = ({ children, style }: IScrollAreaProps) => {
	return <div className={"virtual-scroll"} style={style}>{children}</div>;
};