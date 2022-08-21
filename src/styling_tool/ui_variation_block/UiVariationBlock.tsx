import "./UiVariationBlock.css";

interface IUiVariationBlockProps {
    title?: string;
	buttonTitle?: string;
    keys: string[];
    onClick: (key: string) => void;
}

export const UiVariationBlock = ({ title, buttonTitle, keys, onClick }: IUiVariationBlockProps) => {
	return (
		<div className={"variation-block"}>
			<div className="drop-headline">{title}</div>
			<div className="dropdown">
				<button className="drop-button">{buttonTitle}</button>
				<div className="dropdown-content">
					{keys.map((key) => {
						return (
							<div key={key} onClick={() => onClick(key)}>
								{ key }
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};