import React from "react";
import {VirtualScroll} from "./virtual_scroll/VirtualScroll";
import {loadTreeData} from "./request/loadTreeData";
import {TreeElementWithRef} from "./tree/tree_element/TreeElement";
import {createTreeManager} from "./tree/createTreeManager";
import {
	BASE_PAGE_SIZE,
	BASE_TOLERANCE,
	BASE_TREE_LINK
} from "./constants";
import {IConnectedTreeItem} from "./tree/ITree";

/**
 * Отдельно пишу TODO по стилям и кастомизации:
 * - с отступами от родителя - без отступов
 * - цветовые темы
 * - иконки разные
 * - collapsed (true/false)
 * - отображение размера элементов (по количеству детей, без учета всех внуков, правнуков и т.д.)
 * - возможность загрузки своего списка в формате json (добавить инструкцию в каком виде) + дать список примеров
 */

function App() {
	return (
		<>
			<VirtualScroll<IConnectedTreeItem>
				getNextDataChunk={createTreeManager}
				loadData={loadTreeData}
				ScrollItem={TreeElementWithRef}
				dataUrl={BASE_TREE_LINK}
				observerConfig={{ threshold: 0.25 }}
				treeManagerConfig={{ pageSize: BASE_PAGE_SIZE, tolerance: BASE_TOLERANCE }}
			/>
			{/*<StylingTool/>*/}
		</>
	);
}

export default App;
