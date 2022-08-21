import {IVisualContext} from "../App";
import {IConnectedTreeItem} from "../tree/ITree";

export interface IStyleActionProps {
    updateVisualState: (state: Partial<IVisualContext<IConnectedTreeItem>>) => void;
}