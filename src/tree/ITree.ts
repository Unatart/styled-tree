export interface ITreeItem {
    id: string;
    label: string;
    children: IConnectedTreeItem[];
}

export interface IConnectedTreeItem extends ITreeItem {
    hidden?: boolean;
    level?: number;
}

export type ITree = IConnectedTreeItem[];