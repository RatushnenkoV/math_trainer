// Компонент для рисования различных геометрических фигур
class ShapeDrawer {
    constructor() {
        // SVG namespace
        this.svgNS = 'http://www.w3.org/2000/svg';
    }

    /**
     * Создает SVG элемент с заданными атрибутами
     * @param {string} tag - имя SVG тега
     * @param {Object} attrs - атрибуты элемента
     * @param {string} text - текстовое содержимое (опционально)
     * @returns {SVGElement}
     */
    createSVGElement(tag, attrs = {}, text = '') {
        const el = document.createElementNS(this.svgNS, tag);
        Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));
        if (tag === 'text' && !attrs['font-weight']) {
            el.setAttribute('font-weight', 'normal');
        }
        if (text) el.textContent = text;
        return el;
    }

    /**
     * Создает текстовую подпись с поддержкой LaTeX через KaTeX
     * @param {number} x - координата X центра подписи
     * @param {number} y - координата Y центра подписи
     * @param {string} latex - LaTeX строка для рендеринга
     * @param {number} width - ширина foreignObject
     * @param {number} height - высота foreignObject
     * @returns {SVGForeignObjectElement}
     */
    createLabel(x, y, latex, width = 150, height = 50) {
        const fo = this.createSVGElement('foreignObject', {
            x: x - width / 2,
            y: y - height / 2,
            width: width.toString(),
            height: height.toString()
        });

        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: center; align-items: center; height: 100%; font-size: 28px; pointer-events: none;';

        try {
            // eslint-disable-next-line no-undef
            katex.render(latex, div, {
                throwOnError: false,
                displayMode: false
            });
        } catch (e) {
            div.textContent = latex;
        }

        fo.appendChild(div);
        return fo;
    }

    /**
     * Рисует маркер прямого угла
     * @param {number} x - координата X вершины угла
     * @param {number} y - координата Y вершины угла
     * @param {number} size - размер маркера
     * @returns {SVGRectElement}
     */
    drawRightAngleMarker(x, y, size = 15) {
        return this.createSVGElement('rect', {
            x: x,
            y: y - size,
            width: size,
            height: size,
            fill: 'none',
            stroke: '#2196F3',
            'stroke-width': '2'
        });
    }

    /**
     * Рисует круг по радиусу
     * @param {Object} config - конфигурация
     * @param {number} config.centerX - X координата центра
     * @param {number} config.centerY - Y координата центра
     * @param {number} config.radius - радиус круга
     * @param {Object} config.labels - объект с подписями {r: string, showDiameter: boolean, d: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawCircle(config) {
        const {
            centerX = 300,
            centerY = 250,
            radius,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Рисуем круг
        g.appendChild(this.createSVGElement('circle', {
            cx: centerX,
            cy: centerY,
            r: radius,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем радиус (линия от центра вправо)
        g.appendChild(this.createSVGElement('line', {
            x1: centerX,
            y1: centerY,
            x2: centerX + radius,
            y2: centerY,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Добавляем подписи
        if (labels.r) {
            g.appendChild(this.createLabel(centerX + radius / 2, centerY - 15, labels.r));
        }

        // Опционально рисуем диаметр
        if (labels.showDiameter) {
            g.appendChild(this.createSVGElement('line', {
                x1: centerX - radius,
                y1: centerY,
                x2: centerX + radius,
                y2: centerY,
                stroke: '#9e9e9e',
                'stroke-width': '1.5',
                'stroke-dasharray': '5,5'
            }));

            if (labels.d) {
                g.appendChild(this.createLabel(centerX, centerY + 25, labels.d));
            }
        }

        return g;
    }

    /**
     * Рисует трапецию по двум основаниям и высоте
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.base1 - длина нижнего основания (большее)
     * @param {number} config.base2 - длина верхнего основания (меньшее)
     * @param {number} config.height - высота трапеции
     * @param {number} config.offset - смещение верхнего основания от левого края (по умолчанию центрирование)
     * @param {Object} config.labels - объект с подписями {a: string, b: string, h: string, showMidline: boolean, m: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawTrapezoid(config) {
        const {
            baseX = 150,
            baseY = 350,
            base1,
            base2,
            height,
            offset = (base1 - base2) / 2, // По умолчанию центрируем верхнее основание
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Четыре вершины трапеции
        const points = `${baseX + offset},${baseY - height} ${baseX + offset + base2},${baseY - height} ${baseX + base1},${baseY} ${baseX},${baseY}`;

        // Рисуем трапецию
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем высоту (пунктирная линия)
        g.appendChild(this.createSVGElement('line', {
            x1: baseX + offset,
            y1: baseY - height,
            x2: baseX + offset,
            y2: baseY,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем маркер прямого угла для высоты
        g.appendChild(this.drawRightAngleMarker(baseX + offset, baseY, 15));

        // Опционально рисуем среднюю линию
        if (labels.showMidline) {
            const midlineY = baseY - height / 2;
            const midlineLeft = baseX + offset / 2;
            const midlineRight = baseX + base1 - offset / 2;

            g.appendChild(this.createSVGElement('line', {
                x1: midlineLeft,
                y1: midlineY,
                x2: midlineRight,
                y2: midlineY,
                stroke: '#ff9800',
                'stroke-width': '2',
                'stroke-dasharray': '5,5'
            }));

            if (labels.m) {
                g.appendChild(this.createLabel((midlineLeft + midlineRight) / 2, midlineY - 20, labels.m));
            }
        }

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + base1 / 2, baseY + 25, labels.a));
        }
        if (labels.b) {
            g.appendChild(this.createLabel(baseX + offset + base2 / 2, baseY - height - 20, labels.b));
        }
        if (labels.h) {
            g.appendChild(this.createLabel(baseX + offset - 10, baseY - height / 2, labels.h));
        }

        return g;
    }

    /**
     * Рисует параллелограмм по диагоналям и углу между ними
     * @param {Object} config - конфигурация
     * @param {number} config.centerX - X координата центра (точка пересечения диагоналей)
     * @param {number} config.centerY - Y координата центра
     * @param {number} config.diagonal1 - длина первой диагонали
     * @param {number} config.diagonal2 - длина второй диагонали
     * @param {number} config.angle - угол между диагоналями (в градусах)
     * @param {Object} config.labels - объект с подписями {d1: string, d2: string, showAngle: boolean}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawParallelogramByDiagonals(config) {
        const {
            centerX = 300,
            centerY = 300,
            diagonal1,
            diagonal2,
            angle,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');
        const rad = angle * Math.PI / 180;

        // Половины диагоналей
        const d1Half = diagonal1 / 2;
        const d2Half = diagonal2 / 2;

        // Координаты вершин параллелограмма
        // Первая диагональ горизонтальная
        const x1 = centerX + d1Half;
        const y1 = centerY;
        const x3 = centerX - d1Half;
        const y3 = centerY;

        // Вторая диагональ под углом
        const x2 = centerX + d2Half * Math.cos(rad);
        const y2 = centerY - d2Half * Math.sin(rad);
        const x4 = centerX - d2Half * Math.cos(rad);
        const y4 = centerY + d2Half * Math.sin(rad);

        // Рисуем параллелограмм
        const points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем диагонали (пунктирные линии)
        g.appendChild(this.createSVGElement('line', {
            x1: x1,
            y1: y1,
            x2: x3,
            y2: y3,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        g.appendChild(this.createSVGElement('line', {
            x1: x2,
            y1: y2,
            x2: x4,
            y2: y4,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем подписи
        if (labels.d1) {
            g.appendChild(this.createLabel((x1 + centerX) / 2, centerY + 20, labels.d1));
        }
        if (labels.d2) {
            const midX = (x2 + centerX) / 2;
            const midY = (y2 + centerY) / 2;
            g.appendChild(this.createLabel(midX + 10, midY - 10, labels.d2));
        }

        if (labels.showAngle) {
            this.drawAngleArc(g, centerX, centerY, angle);
        }

        return g;
    }

    /**
     * Рисует дугу угла
     * @param {SVGGElement} parent - родительский элемент для добавления дуги
     * @param {number} x - координата X вершины угла
     * @param {number} y - координата Y вершины угла
     * @param {number} angle - угол в градусах
     * @param {number} size - размер дуги (радиус)
     */
    drawAngleArc(parent, x, y, angle, size = 35) {
        const rad = angle * Math.PI / 180;
        const x2 = x + size * Math.cos(rad);
        const y2 = y - size * Math.sin(rad);

        parent.appendChild(this.createSVGElement('path', {
            d: `M ${x + size},${y} A ${size},${size} 0 0 0 ${x2},${y2}`,
            fill: 'none',
            stroke: '#ff5722',
            'stroke-width': '2'
        }));

        parent.appendChild(this.createSVGElement('text', {
            x: x + size + 5,
            y: y - 10,
            fontSize: '14',
            fill: '#ff5722',
            'font-weight': 'normal'
        }, `${angle}°`));
    }

    /**
     * Рисует ромб по диагоналям
     * @param {Object} config - конфигурация
     * @param {number} config.centerX - X координата центра
     * @param {number} config.centerY - Y координата центра
     * @param {number} config.diagonal1 - длина первой диагонали (горизонтальная)
     * @param {number} config.diagonal2 - длина второй диагонали (вертикальная)
     * @param {Object} config.labels - объект с подписями {d1: string, d2: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawRhombusByDiagonals(config) {
        const {
            centerX = 300,
            centerY = 300,
            diagonal1,
            diagonal2,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Половины диагоналей
        const d1Half = diagonal1 / 2;
        const d2Half = diagonal2 / 2;

        // Координаты вершин ромба (диагонали перпендикулярны)
        const points = `${centerX + d1Half},${centerY} ${centerX},${centerY - d2Half} ${centerX - d1Half},${centerY} ${centerX},${centerY + d2Half}`;

        // Рисуем ромб
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем диагонали (пунктирные линии)
        g.appendChild(this.createSVGElement('line', {
            x1: centerX - d1Half,
            y1: centerY,
            x2: centerX + d1Half,
            y2: centerY,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        g.appendChild(this.createSVGElement('line', {
            x1: centerX,
            y1: centerY - d2Half,
            x2: centerX,
            y2: centerY + d2Half,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем подписи
        if (labels.d1) {
            g.appendChild(this.createLabel(centerX, centerY + 25, labels.d1));
        }
        if (labels.d2) {
            g.appendChild(this.createLabel(centerX + 15, centerY - d2Half / 2, labels.d2));
        }

        return g;
    }

    /**
     * Рисует трапецию по средней линии и высоте
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.midline - длина средней линии
     * @param {number} config.height - высота трапеции
     * @param {number} config.offset - смещение (для визуализации наклонных сторон)
     * @param {Object} config.labels - объект с подписями {m: string, h: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawTrapezoidByMidline(config) {
        const {
            baseX = 150,
            baseY = 350,
            midline,
            height,
            offset = 30,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Вычисляем основания: a = m + offset/2, b = m - offset/2
        // Это визуальное представление, реальные a и b не важны
        const visualBase1 = midline * 1.3;
        const visualBase2 = midline * 0.7;
        const visualOffset = (visualBase1 - visualBase2) / 2;

        // Четыре вершины трапеции
        const points = `${baseX + visualOffset},${baseY - height} ${baseX + visualOffset + visualBase2},${baseY - height} ${baseX + visualBase1},${baseY} ${baseX},${baseY}`;

        // Рисуем трапецию
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем высоту (пунктирная линия)
        g.appendChild(this.createSVGElement('line', {
            x1: baseX + visualOffset,
            y1: baseY - height,
            x2: baseX + visualOffset,
            y2: baseY,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем маркер прямого угла для высоты
        g.appendChild(this.drawRightAngleMarker(baseX + visualOffset, baseY, 15));

        // Рисуем среднюю линию
        const midlineY = baseY - height / 2;
        const midlineLeft = baseX + visualOffset / 2;
        const midlineRight = baseX + visualBase1 - visualOffset / 2;

        g.appendChild(this.createSVGElement('line', {
            x1: midlineLeft,
            y1: midlineY,
            x2: midlineRight,
            y2: midlineY,
            stroke: '#ff9800',
            'stroke-width': '2'
        }));

        // Добавляем подписи
        if (labels.m) {
            g.appendChild(this.createLabel((midlineLeft + midlineRight) / 2, midlineY - 20, labels.m));
        }
        if (labels.h) {
            g.appendChild(this.createLabel(baseX + visualOffset - 10, baseY - height / 2, labels.h));
        }

        return g;
    }

    /**
     * Рисует прямоугольник по диагонали и углу между диагоналями
     * @param {Object} config - конфигурация
     * @param {number} config.centerX - X координата центра
     * @param {number} config.centerY - Y координата центра
     * @param {number} config.diagonal - длина диагонали
     * @param {number} config.angle - угол между диагоналями (в градусах)
     * @param {Object} config.labels - объект с подписями {d: string, showAngle: boolean}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawRectangleByDiagonal(config) {
        const {
            centerX = 300,
            centerY = 250,
            diagonal,
            angle,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Для прямоугольника диагонали равны и делятся пополам точкой пересечения
        const dHalf = diagonal / 2;
        const rad = angle * Math.PI / 180;

        // Координаты вершин
        const x1 = centerX + dHalf;
        const y1 = centerY;
        const x2 = centerX + dHalf * Math.cos(rad);
        const y2 = centerY - dHalf * Math.sin(rad);
        const x3 = centerX - dHalf;
        const y3 = centerY;
        const x4 = centerX - dHalf * Math.cos(rad);
        const y4 = centerY + dHalf * Math.sin(rad);

        // Рисуем прямоугольник
        const points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем диагонали (пунктирные линии)
        g.appendChild(this.createSVGElement('line', {
            x1: x1,
            y1: y1,
            x2: x3,
            y2: y3,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        g.appendChild(this.createSVGElement('line', {
            x1: x2,
            y1: y2,
            x2: x4,
            y2: y4,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем подписи
        if (labels.d) {
            g.appendChild(this.createLabel((x1 + centerX) / 2, centerY + 20, labels.d));
        }

        if (labels.showAngle) {
            this.drawAngleArc(g, centerX, centerY, angle);
        }

        return g;
    }

    /**
     * Вычисляет границы фигуры (bounding box)
     * @param {SVGElement} svgElement - SVG элемент фигуры
     * @returns {Object} - объект с полями {minX, minY, maxX, maxY, width, height}
     */
    calculateBounds(svgElement) {
        try {
            const bbox = svgElement.getBBox();
            return {
                minX: bbox.x,
                minY: bbox.y,
                maxX: bbox.x + bbox.width,
                maxY: bbox.y + bbox.height,
                width: bbox.width,
                height: bbox.height
            };
        } catch (e) {
            // Fallback если getBBox не работает
            return {
                minX: 0,
                minY: 0,
                maxX: 650,
                maxY: 500,
                width: 650,
                height: 500
            };
        }
    }

    /**
     * Вычисляет масштаб для вмещения фигуры в SVG контейнер
     * @param {Object} bounds - границы фигуры
     * @param {number} svgWidth - ширина SVG контейнера
     * @param {number} svgHeight - высота SVG контейнера
     * @param {number} padding - отступы
     * @returns {number} - коэффициент масштабирования
     */
    calculateScale(bounds, svgWidth = 650, svgHeight = 500, padding = 50) {
        const boundsWidth = bounds.width || (bounds.maxX - bounds.minX);
        const boundsHeight = bounds.height || (bounds.maxY - bounds.minY);

        const scaleX = (svgWidth - 2 * padding) / boundsWidth;
        const scaleY = (svgHeight - 2 * padding) / boundsHeight;

        // Берем минимальный масштаб, чтобы фигура поместилась по обеим осям
        return Math.min(scaleX, scaleY, 1); // Не увеличиваем больше 1
    }

    /**
     * Рисует квадрат по диагонали
     * @param {Object} config - конфигурация
     * @param {number} config.centerX - X координата центра
     * @param {number} config.centerY - Y координата центра
     * @param {number} config.diagonal - длина диагонали
     * @param {Object} config.labels - объект с подписями
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawSquareByDiagonal(config) {
        const {
            centerX = 300,
            centerY = 250,
            diagonal,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // У квадрата диагонали расположены под углом 45° к сторонам
        const dHalf = diagonal / 2;

        // Вершины квадрата (повернуты на 45°)
        const x1 = centerX + dHalf; // правая вершина
        const y1 = centerY;
        const x2 = centerX; // верхняя вершина
        const y2 = centerY - dHalf;
        const x3 = centerX - dHalf; // левая вершина
        const y3 = centerY;
        const x4 = centerX; // нижняя вершина
        const y4 = centerY + dHalf;

        // Рисуем квадрат
        const points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем диагонали (пунктирные линии)
        g.appendChild(this.createSVGElement('line', {
            x1: x1,
            y1: y1,
            x2: x3,
            y2: y3,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        g.appendChild(this.createSVGElement('line', {
            x1: x2,
            y1: y2,
            x2: x4,
            y2: y4,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Подписи диагоналей
        if (labels.d) {
            // Горизонтальная диагональ
            g.appendChild(this.createLabel(centerX, centerY - 25, labels.d, 150, 50));
        }

        return g;
    }
}
