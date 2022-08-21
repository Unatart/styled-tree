import {ITree} from "../ITree";

/**
 * Function for gen tree ITree by array which every element is amount of elements on tree level i
 * @param arrayOfLengthByLevels
 * @param level
 */
export function genTreeByLevels(arrayOfLengthByLevels: number[], level: number): ITree {
	const tree: ITree = [];
    
	if (arrayOfLengthByLevels[level] === undefined) {
		return tree;
	}
    
	for (let i = 0; i < arrayOfLengthByLevels[level]; i++) {
		tree.push({
			id: `${level}_${i}`,
			label: `${level}_${i}`,
			children: genTreeByLevels(arrayOfLengthByLevels, level + 1),
		});
	}
    
	return tree;
}