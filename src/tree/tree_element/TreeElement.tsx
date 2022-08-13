import {ReactNode, CSSProperties} from 'react';
import './TreeElement.css';

interface ITreeElementProps {
    label: string;
    children?: ReactNode,
    style?: CSSProperties;
}

export function TreeElement({ label, style, children }:ITreeElementProps) {
    return (
        <div className={"tree-element"} style={style}>
            {label}
            {children}
        </div>
    );
}