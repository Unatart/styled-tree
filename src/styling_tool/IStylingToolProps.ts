import {IVisualContext} from "../App";

export interface IStylingToolProps {
    updateVisualState: (state: Partial<IVisualContext>) => void;
}