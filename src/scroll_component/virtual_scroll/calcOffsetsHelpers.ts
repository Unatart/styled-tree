import {IScrollElementResult} from "./IVirtualScroll";

export const moveDown = (renderedElements: IScrollElementResult[], from = 0, to: number, offsetDenominator: number) => {
	const newElements = renderedElements.slice(to, renderedElements.length);

	const lastHeight = Math.ceil(renderedElements[renderedElements.length - 1].ref?.current?.getBoundingClientRect().height || 0);
	const lastElementOffset = Math.ceil(renderedElements[renderedElements.length - 1].transformY || 0);
	let verticalMargin = Math.ceil((renderedElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);

	let transformY = lastElementOffset ? lastElementOffset + lastHeight + verticalMargin : 0;
	for (let i = from; i < to; i++) {
		newElements.push({ ...renderedElements[i], transformY });
		const currentRef = renderedElements[i]?.ref?.current;
		transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || 0) + verticalMargin;
		verticalMargin = Math.ceil((renderedElements[i - 1]?.ref?.current?.getBoundingClientRect().height || verticalMargin) / offsetDenominator);
	}

	return newElements;
};

export const moveUp = (renderedElements: IScrollElementResult[], offsetDenominator: number, tolerance: number) => {
	let verticalMargin = Math.ceil((renderedElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);
	const newElements = renderedElements.slice(0, renderedElements.length - tolerance);
	let transformY = renderedElements[0].transformY || 0;
	for (let i = renderedElements.length - 1; i >= renderedElements.length - tolerance; i--) {
		transformY = Math.max(0, transformY - Math.ceil((renderedElements[i].ref?.current?.getBoundingClientRect().height || 0) + verticalMargin));
		newElements.unshift({ ...renderedElements[i], transformY });
		verticalMargin = Math.ceil((renderedElements[i - 1]?.ref?.current?.getBoundingClientRect().height || verticalMargin) / offsetDenominator);
	}

	return newElements;
};

export const update = (renderedElements: IScrollElementResult[], offsetDenominator: number, topOffset: number) => {
	const newElements = [];
	let verticalMargin = Math.ceil((renderedElements[0].ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator);
	let transformY = topOffset;
	for (let i = 0; i < renderedElements.length; i++) {
		newElements.push({ ...renderedElements[i], transformY });
		const currentRef = renderedElements[i]?.ref?.current;
		transformY = transformY + Math.ceil(currentRef?.getBoundingClientRect().height || 0) + verticalMargin;
		verticalMargin = Math.ceil((renderedElements[i - 1]?.ref?.current?.getBoundingClientRect().height || 0) / offsetDenominator) || verticalMargin;
	}

	return newElements;
};