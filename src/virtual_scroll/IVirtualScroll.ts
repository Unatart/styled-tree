import {MutableRefObject} from "react";
import {ITreeElementProps} from "../tree/tree_element/createTreeElement";

export interface IScrollElementResult {
    render: (props: ITreeElementProps) => JSX.Element | null;
    ref?: MutableRefObject<HTMLDivElement | null>;
    transformY?: number;
}