import {useCallback, useRef} from "react";

export const useActualCallback = <T extends unknown[], R>(callback: (...args: T)=> R) => {
	const callback_ref = useRef(callback);
	callback_ref.current = callback;

	return useCallback((...args: T) => callback_ref.current(...args), []);
};