import React from "react";
import {ScrollConnectedTree} from "./tree/Tree";

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
			<ScrollConnectedTree/>
			{/*<StylingTool/>*/}
		</>
	);
}

export default App;
