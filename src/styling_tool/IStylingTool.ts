import {IVisualContext} from "../scroll_component/ScrollComponent";

export interface IStyleActionProps {
    updateVisualState: (state: Partial<IVisualContext>) => void;
}