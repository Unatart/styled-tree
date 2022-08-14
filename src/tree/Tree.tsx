import {FC, forwardRef, useMemo} from 'react';
import {withVirtualScroll} from "../virtual_scroll/VirtualScroll";
import {useTreeDataLoading} from "./hooks/useTreeDataLoading";
import {useTreeTraversal} from "./hooks/useTreeTraversal";
import {TreeElement} from "./tree_element/TreeElement";
import {TREE_ELEMENT_X_OFFSET, TREE_ELEMENT_Y_OFFSET} from "./constants";

interface ITreeProps {
    treeLink?: string;
    from?: number;
    to?: number;
    itemClassName?: string;
}

const BASE_TREE_LINK = '/data_samples/sample_task.json';
const LIMIT = 25;

const Tree:FC<ITreeProps> = forwardRef<HTMLDivElement, ITreeProps>((
    { treeLink = BASE_TREE_LINK, from= 0, to= LIMIT, itemClassName = ''},
    ref
) => {
    const treeData = useTreeDataLoading(treeLink);
    let nextToRender = useTreeTraversal(treeData, from, to);

    const componentTree = useMemo(() => {
        let current = nextToRender;
        let components = [];
        let index = from;
        while (current && index < to) {
            components.push(
                <TreeElement
                    label={current.label}
                    className={itemClassName}
                    key={current.id}
                    ref={index === from ? ref : undefined}
                    style={{ transform: `translate(${(current.level || 0) * TREE_ELEMENT_X_OFFSET}pt, ${index * TREE_ELEMENT_Y_OFFSET}pt)` }}
                />
            );
            current = current.next;
            index++;
        }
        return components;
    }, [nextToRender?.id]);

    return (
        <div>
            {componentTree}
        </div>
    )
});

export const ScrollConnectedTree = withVirtualScroll(Tree);