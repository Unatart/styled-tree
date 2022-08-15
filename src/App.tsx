import React from "react";
import {VirtualScroll} from "./virtual_scroll/VirtualScroll";
import {loadTreeData} from "./hooks/useTreeDataLoading";
import {renderTreeElement} from "./tree/tree_element/TreeElement";
import {getNextRenderPointer} from "./getNextRenderPointer";
import {BASE_PAGE_SIZE, BASE_TOLERANCE, BASE_TREE_LINK, TREE_ELEMENT_Y_OFFSET} from "./constants";

/**
 * Тут пишу все свои идеи и TODO по реализации дерева и скролла:
 * - корнеркейсы:  очень длинный список, список с большой вложенностью, маленький(обычный) список, пустой список
 * - должны хранить ссылку на уровень и на элемент в уровне, где остановились
 * - виртуализация загрузки дерева вглубь и вширину (возможно единый метод с помощью двух ссылок выше)
 * - IntersectionObserver
 */

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
			<VirtualScroll
				tolerance={BASE_TOLERANCE}
				pageSize={BASE_PAGE_SIZE}
				elementOffsetPx={TREE_ELEMENT_Y_OFFSET}
				getNextDataPointer={getNextRenderPointer}
				loadData={loadTreeData}
				renderElement={renderTreeElement}
				dataUrl={BASE_TREE_LINK}
				observerConfig={{ threshold: 0.25 }}
			/>
			{/*<StylingTool/>*/}
		</>
	);
}

export default App;
