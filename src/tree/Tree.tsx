import {FC, ReactNode, useEffect, useMemo, useState} from 'react';
import {ITree, ITreeItem} from "./ITree";
import {TreeElement} from "./tree_element/TreeElement";

interface ITreeProps {
    treeLink?: string;
}

const BASE_TREE_LINK = '/data_samples/sample1.json';

export const Tree:FC<ITreeProps> = ({
    treeLink = BASE_TREE_LINK
}) => {
    const [treeData, setTreeData] = useState<ITree | undefined>();

    useEffect(() => {
        const loadInfo = async () => {
            const response = await fetch(treeLink);
            const parsedTreeData = await response.json();
            setTreeData(parsedTreeData.result);
        }

        loadInfo().catch((error) => console.log(error));
    }, [treeLink]);

    const componentTree = useMemo(() => {
        if (treeData === undefined) {
            return null;
        }

        return (
            <>
                {treeData.map((element) => createSubTrees(element))}
            </>
        );
    },[treeData]);

    return (
        <div>
            {componentTree}
        </div>
    )
}

function createSubTrees(root:ITreeItem):ReactNode {
    const children = root.children.map((child_node) => createSubTrees(child_node));
    return <TreeElement label={root.label} key={root.label}>{children}</TreeElement>;
}