import {FC, ReactNode} from "react";
import "./MainScreen.css";

interface IMainScreenProps {
    children?: ReactNode;
}

export const MainScreen: FC<IMainScreenProps> = (props) => {
	return (
		<div className={"main-screen"}>{props.children}</div>
	);
};