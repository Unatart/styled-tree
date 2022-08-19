import {createTreeManager} from "../createTreeManager";
import {genTreeByLevels} from "./genTestExamples";

describe("createTreeManager", () => {
	it("constructor returns TreeManagerType object", () => {
		const treeManager = createTreeManager([{ id: "1", label: "Files", children: [] }], { pageSize: 80, tolerance: 40 });

		expect(typeof treeManager).toEqual("object");
		expect(treeManager["getNextChunk"]).not.toEqual(undefined);
		expect(treeManager["toggleHide"]).not.toEqual(undefined);
	});

	describe("getNextChunk", () => {
		describe("gives as much elements as pageSize", () => {
			it("if tree has as much elements as pageSize", () => {
				const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

				const treeManager = createTreeManager(tree, { pageSize: 120, tolerance: 30 });

				let elements = treeManager.getNextChunk("update");
				expect(elements.length).toEqual(120);

				elements = treeManager.getNextChunk("down");
				expect(elements.length).toEqual(120);

				elements = treeManager.getNextChunk("up");
				expect(elements.length).toEqual(120);
			});

			it("if tree has different amount of elements as pageSize", () => {
				const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

				const treeManager = createTreeManager(tree, { pageSize: 40, tolerance: 10 });

				let elements = treeManager.getNextChunk("update");
				expect(elements.length).toEqual(40);

				elements = treeManager.getNextChunk("down");
				expect(elements.length).toEqual(40);

				elements = treeManager.getNextChunk("up");
				expect(elements.length).toEqual(40);
			});
		});

		it("set indexes in increasing order", () => {
			const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

			const treeManager = createTreeManager(tree, { pageSize: 40, tolerance: 40 });

			let index = 0;
			let elements = treeManager.getNextChunk("update");
			for (let i = 0; i < elements.length; i++) {
				expect(elements[i].index).toEqual(index);
				index++;
			}

			elements = treeManager.getNextChunk("down");
			for (let i = 0; i < elements.length; i++) {
				expect(elements[i].index).toEqual(index);
				index++;
			}

			elements = treeManager.getNextChunk("down");
			for (let i = 0; i < elements.length; i++) {
				expect(elements[i].index).toEqual(index);
				index++;
			}
		});

		describe("if goes down", () => {
			it("continues from index = prevStart + tolerance", () => {
				const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

				const treeManager = createTreeManager(tree, { pageSize: 50, tolerance: 10 });

				let start = 0;
				let index = start;
				let elements = treeManager.getNextChunk("update");
				for (let i = 0; i < elements.length; i++) {
					expect(elements[i].index).toEqual(index);
					index++;
				}

				start += 10;
				index = start;
				elements = treeManager.getNextChunk("down");
				for (let i = 0; i < elements.length; i++) {
					expect(elements[i].index).toEqual(index);
					index++;
				}

				index = start + 10;
				elements = treeManager.getNextChunk("down");
				for (let i = 0; i < elements.length; i++) {
					expect(elements[i].index).toEqual(index);
					index++;
				}
			});

			it("returns max elements from pageSize and (tree.end - from)", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 20, tolerance: 5 });
				const result = treeManager.getNextChunk("update");
				expect(result.length).toEqual(15);
			});

			it("if predicted end of chunk is bigger than end of tree, gets all elements from (end - pageSize) to (end) of tree", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 7, tolerance: 7 });
				treeManager.getNextChunk("update");

				treeManager.getNextChunk("down");
				const elements = treeManager.getNextChunk("down");

				expect(elements.length).toEqual(7);
				expect(elements[0].index).toEqual(8);
				expect(elements[elements.length - 1].index).toEqual(14);
			});
		});

		describe("if goes down and then up", () => {
			it("stops at 0 and gives pageSize amount of elements when scrolling to the very top", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 7, tolerance: 7 });
				treeManager.getNextChunk("update");

				treeManager.getNextChunk("down");
				treeManager.getNextChunk("down");

				let result = treeManager.getNextChunk("up");
				expect(result.length).toEqual(7);
				result = treeManager.getNextChunk("up");
				expect(result.length).toEqual(7);
				expect(result[0].index).toEqual(0);
			});

			it("gives right indexes", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 7, tolerance: 7 });
				let index = 0;
				let result = treeManager.getNextChunk("update");
				for (let i = 0; i < result.length; i++) {
					expect(result[i].index).toEqual(index);
					index++;
				}

				result = treeManager.getNextChunk("down");
				for (let i = 0; i < result.length; i++) {
					expect(result[i].index).toEqual(index);
					index++;
				}

				index = 8;
				result = treeManager.getNextChunk("down");
				for (let i = 0; i < result.length; i++) {
					expect(result[i].index).toEqual(index);
					index++;
				}

				index = 8 - 1;
				result = treeManager.getNextChunk("up");
				for (let i = result.length - 1; i > 0; i--) {
					expect(result[i].index).toEqual(index);
					index--;
				}

				index = 0;
				result = treeManager.getNextChunk("up");
				for (let i = 0; i < result.length; i++) {
					expect(result[i].index).toEqual(index);
					index++;
				}
			});
		});
	});

	describe("toggleHide", () => {
		it("toggleHide true if element with given index exist in watched tree and has children", () => {
			const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

			const treeManager = createTreeManager(tree, { pageSize: 120, tolerance: 30 });
			treeManager.getNextChunk("update");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			expect(treeManager.toggleHide(50)).toEqual(true);
		});

		it("toggleHide false if element with given index exist in watched tree but has no children", () => {
			const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

			const treeManager = createTreeManager(tree, { pageSize: 120, tolerance: 30 });
			treeManager.getNextChunk("update");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			treeManager.getNextChunk("down");
			expect(treeManager.toggleHide(20)).toEqual(false);
		});

		it("toggleHide false if element with given index not exist in watched tree", () => {
			const tree = genTreeByLevels([5, 4, 3, 2, 1], 0);

			const treeManager = createTreeManager(tree, { pageSize: 120, tolerance: 30 });
			expect(treeManager.toggleHide(50)).toEqual(false);
		});
	});

	describe("toggleHide + getNextChunk", () => {
		describe("- toggleHide closes element", () => {
			it("element with field hiddenChildren is in result, but his children don't", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 7, tolerance: 7 });
				const beforeResult = treeManager.getNextChunk("update");
				const firstElementIndex = beforeResult[0].index;
				const children = beforeResult[1].children;
				const lastChildrenIndex = children[children.length - 1].index;
				treeManager.toggleHide(1);
				const afterResult = treeManager.getNextChunk("update");

				expect(afterResult[0].index).toEqual(firstElementIndex);
				expect(beforeResult.length >= afterResult.length).toBeTruthy();
				expect(afterResult[2].index).toEqual((lastChildrenIndex || 0) + 1);
			});

			it("elements consistent while scrolling down and up after hide", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 7, tolerance: 2 });
				treeManager.getNextChunk("update");
				treeManager.toggleHide(1);
				treeManager.getNextChunk("update");
				treeManager.getNextChunk("down");
				treeManager.getNextChunk("down");
				const snapshotUp1 = treeManager.getNextChunk("up");
				expect(snapshotUp1[0].index).toEqual(1);
				expect(snapshotUp1[snapshotUp1.length - 1].index).toEqual(8);
				const snapshotUp2 = treeManager.getNextChunk("up");
				expect(snapshotUp2[0].index).toEqual(0);
				expect(snapshotUp2[snapshotUp2.length - 1].index).toEqual(6);
			});
		});

		describe("- toggleHide opens element", () => {
			it("element with field hiddenChildren stays in result, result got all non hidden children on inner levels", () => {
				const tree = genTreeByLevels([3, 2, 1], 0);
				const treeManager = createTreeManager(tree, { pageSize: 7, tolerance: 2 });
				treeManager.getNextChunk("update");
				treeManager.toggleHide(1);
				let result = treeManager.getNextChunk("update");
				const childIndex = result[1].children[0].index;
				treeManager.toggleHide(0);
				treeManager.getNextChunk("update");
				treeManager.toggleHide(0);
				result = treeManager.getNextChunk("update");
				let oneChildClosed = true;
				for (let i = 0; i < result.length; i++) {
					if (result[i].index === childIndex) {
						oneChildClosed = false;
					}
				}
				expect(oneChildClosed).toBeTruthy();
			});
		});
	});
});
