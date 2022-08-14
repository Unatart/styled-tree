export interface ITreeItem {
    id: string;
    label: string;
}

export interface IConnectedTreeItem extends ITreeItem {
    id: string;
    label: string;
    children: IConnectedTreeItem[];
    next?: IConnectedTreeItem;
    prev?: IConnectedTreeItem;
    hidden?: boolean;
    level?: number;
}

export type ITree = IConnectedTreeItem[];