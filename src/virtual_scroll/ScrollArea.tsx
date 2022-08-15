import {ReactNode} from "react";

interface IScrollAreaProps {
    children?: ReactNode;
}

export const ScrollArea = ({ children }: IScrollAreaProps) => {
	return <div className={"virtual-scroll"}>{children}</div>;
};