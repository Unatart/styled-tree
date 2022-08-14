import {ReactNode} from "react";

interface IScrollAreaProps {
    children?: ReactNode;
}

export function ScrollArea({ children }:IScrollAreaProps) {
    return <div className={"virtual-scroll"}>{children}</div>
}