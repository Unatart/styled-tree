export interface ITreeItem {
    id: string;
    label: string;
    children: IConnectedTreeItem[];
}

export interface IConnectedTreeItem extends ITreeItem {
    hiddenChildren?: boolean;
    level?: number;
    parent?: IConnectedTreeItem;
    index?: number;
}

export type ITree = IConnectedTreeItem[];