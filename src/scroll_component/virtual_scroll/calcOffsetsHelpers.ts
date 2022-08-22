import {IScrollElementResult} from "./IVirtualScroll";

export const moveDown = (prevElements: IScrollElementResult[], from = 0, to: number, offsetDenominator: number) => {
	const elements = prevElements.slice(to, prevElements.length);

	const lastHeight = Math.ceil(prevElements[prevElements.length - 1].ref?.current?.getBoundingClientRect().height || 0);
	const lastElementOffset = Math.ceil(prevElements[prevElements.length - 1].transformY || 0);
	let verticalMargin = Math.ceil((prevElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);
	let transformY = lastElementOffset ? lastElementOffset + lastHeight + verticalMargin : 0;
	for (let i = from; i < to; i++) {
		if (prevElements[i] === undefined) {
			break;
		}
		elements.push({ ...prevElements[i], transformY });
		const currentRef = prevElements[i]?.ref?.current;
		transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || 0) + verticalMargin;
		verticalMargin = Math.ceil((prevElements[i - 1]?.ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator) || verticalMargin;
	}

	return elements;
};

export const moveUp = (prevElements: IScrollElementResult[], offsetDenominator: number, tolerance: number) => {
	const elements = prevElements.slice(0, prevElements.length - tolerance);

	let verticalMargin = Math.ceil((prevElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);
	let transformY = prevElements[0].transformY || 0;
	for (let i = prevElements.length - 1; i >= prevElements.length - tolerance; i--) {
		if (prevElements[i] === undefined) {
			break;
		}
		transformY = Math.max(0, transformY - Math.ceil(prevElements[i].ref?.current?.getBoundingClientRect().height || 0) - verticalMargin);
		elements.unshift({ ...prevElements[i], transformY });
		verticalMargin = Math.ceil((prevElements[0]?.ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator) || verticalMargin;
	}

	return elements;
};

export const update = (prevElements: IScrollElementResult[], offsetDenominator: number, topOffset: number, from = 0, to: number = prevElements.length) => {
	let elements: IScrollElementResult[] = [];
	const defaultHeight = Math.ceil(prevElements[0].ref?.current?.getBoundingClientRect().height || 0);
	const defaultMargin = Math.ceil(defaultHeight / offsetDenominator);
	if (to >= from) {
		elements = [...elements, ...prevElements.slice(0, from)];
		let verticalMargin = Math.ceil((prevElements[from - 1]?.ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator) || defaultMargin;
		let transformY = from === 0 ? topOffset : prevElements[from]?.transformY || 0;
		for (let i = from; i < to; i++) {
			if (prevElements[i] === undefined) {
				break;
			}
			elements.push({ ...prevElements[i], transformY });
			const currentRef = prevElements[i]?.ref?.current;
			transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || defaultHeight) + verticalMargin;
			verticalMargin = Math.ceil((prevElements[i]?.ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator) || verticalMargin;
		}
		elements = [...elements, ...prevElements.slice(to)];
	} else {
		elements = [...elements, ...prevElements.slice(0, to)];
		let verticalMargin = Math.ceil((prevElements[from - 1]?.ref?.current?.getBoundingClientRect().height || defaultHeight) / offsetDenominator);
		let transformY = prevElements[from].transformY || 0;
		for (let i = from - 1; i >= to; i--) {
			if (prevElements[i] === undefined) {
				break;
			}
			transformY = Math.max(0, transformY - Math.ceil(prevElements[i].ref?.current?.getBoundingClientRect().height || 0) - verticalMargin);
			elements.unshift({ ...prevElements[i], transformY });
			verticalMargin = Math.ceil((prevElements[i - 1]?.ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator) || 0;
		}
		elements = [...elements, ...prevElements.slice(from)];
	}
	return elements;
};