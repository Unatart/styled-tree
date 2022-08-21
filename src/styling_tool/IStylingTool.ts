import {IVisualContext} from "../App";

export interface IStyleActionProps {
    updateVisualState: (state: Partial<IVisualContext>) => void;
}