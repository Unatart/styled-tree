export interface ITreeItem {
    id: string;
    label: string;
}

export interface IConnectedTreeItem extends ITreeItem {
    children: IConnectedTreeItem[];
    next?: IConnectedTreeItem;
    prev?: IConnectedTreeItem;
    hidden?: boolean;
    level?: number;
    index?: number;
}

export type ITree = IConnectedTreeItem[];