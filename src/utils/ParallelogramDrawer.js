// Компонент для рисования параллелограммов с подписями
class ParallelogramDrawer {
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
            console.log("tex: " + latex);
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
     * Рисует дугу угла
     * @param {number} x - координата X вершины угла
     * @param {number} y - координата Y вершины угла
     * @param {number} angle - угол в градусах
     * @param {number} size - размер дуги (радиус)
     * @returns {SVGGElement} - группа с дугой и подписью угла
     */
    drawAngleArc(x, y, angle, size = 35) {
        const g = this.createSVGElement('g');
        const rad = angle * Math.PI / 180;
        const x2 = x + size * Math.cos(rad);
        const y2 = y - size * Math.sin(rad);

        g.appendChild(this.createSVGElement('path', {
            d: `M ${x + size},${y} A ${size},${size} 0 0 0 ${x2},${y2}`,
            fill: 'none',
            stroke: '#ff5722',
            'stroke-width': '2'
        }));

        g.appendChild(this.createSVGElement('text', {
            x: x + size + 5,
            y: y - 10,
            fontSize: '14',
            fill: '#ff5722',
            'font-weight': 'normal'
        }, `${angle}°`));

        return g;
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
     * Рисует параллелограмм по двум сторонам и углу между ними
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.sideA - длина основания
     * @param {number} config.sideB - длина боковой стороны
     * @param {number} config.angle - угол между сторонами a и b (в градусах)
     * @param {Object} config.labels - объект с подписями {a: string, b: string, showAngle: boolean}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawBySidesAndAngle(config) {
        const {
            baseX = 150,
            baseY = 350,
            sideA,
            sideB,
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
        const dx = sideB * Math.cos(rad);
        const h = sideB * Math.sin(rad);

        // Четыре вершины параллелограмма
        const points = `${baseX + dx},${baseY - h} ${baseX + dx + sideA},${baseY - h} ${baseX + sideA},${baseY} ${baseX},${baseY}`;

        // Рисуем параллелограмм
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + sideA / 2, baseY + 25, labels.a));
        }
        if (labels.b) {
            g.appendChild(this.createLabel(baseX + dx / 2 - 15, baseY - h / 2, labels.b));
        }
        if (labels.showAngle) {
            g.appendChild(this.drawAngleArc(baseX, baseY, angle));
        }

        return g;
    }

    /**
     * Рисует параллелограмм по основанию и высоте
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.sideA - длина основания
     * @param {number} config.height - высота параллелограмма
     * @param {number} config.offset - смещение верхней стороны (по умолчанию 30)
     * @param {Object} config.labels - объект с подписями {a: string, h: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawBySideAndHeight(config) {
        const {
            baseX = 150,
            baseY = 350,
            sideA,
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

        // Четыре вершины параллелограмма
        const points = `${baseX + offset},${baseY - height} ${baseX + offset + sideA},${baseY - height} ${baseX + sideA},${baseY} ${baseX},${baseY}`;

        // Рисуем параллелограмм
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

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + sideA / 2, baseY + 25, labels.a));
        }
        if (labels.h) {
            g.appendChild(this.createLabel(baseX + offset - 10, baseY - height / 2, labels.h));
        }

        return g;
    }

    /**
     * Рисует прямоугольник
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.width - ширина прямоугольника
     * @param {number} config.height - высота прямоугольника
     * @param {Object} config.labels - объект с подписями {a: string, b: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawRectangle(config) {
        const {
            baseX = 150,
            baseY = 350,
            width,
            height,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Рисуем прямоугольник
        g.appendChild(this.createSVGElement('rect', {
            x: baseX,
            y: baseY - height,
            width: width,
            height: height,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Добавляем маркеры прямых углов
        g.appendChild(this.drawRightAngleMarker(baseX, baseY, 15));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + width / 2, baseY + 25, labels.a));
        }
        if (labels.b) {
            g.appendChild(this.createLabel(baseX + width + 15, baseY - height / 2, labels.b));
        }

        return g;
    }

    /**
     * Рисует квадрат
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.side - длина стороны квадрата
     * @param {Object} config.labels - объект с подписями {a: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawSquare(config) {
        const {
            baseX = 150,
            baseY = 350,
            side,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Рисуем квадрат
        g.appendChild(this.createSVGElement('rect', {
            x: baseX,
            y: baseY - side,
            width: side,
            height: side,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Добавляем маркер прямого угла
        g.appendChild(this.drawRightAngleMarker(baseX, baseY, 15));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + side / 2, baseY + 25, labels.a));
        }

        return g;
    }

    /**
     * Рисует ромб по стороне и высоте
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.side - длина стороны ромба
     * @param {number} config.height - высота ромба
     * @param {Object} config.labels - объект с подписями {a: string, h: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawRhombusBySideAndHeight(config) {
        const {
            baseX = 150,
            baseY = 350,
            side,
            height,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Вычисляем смещение верхних вершин
        const h = Math.min(height, side - 1);
        const dx = Math.sqrt(Math.max(0, side * side - h * h));

        // Четыре вершины ромба
        const points = `${baseX + dx},${baseY - h} ${baseX + dx + side},${baseY - h} ${baseX + side},${baseY} ${baseX},${baseY}`;

        // Рисуем ромб
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем высоту (пунктирная линия)
        g.appendChild(this.createSVGElement('line', {
            x1: baseX + dx,
            y1: baseY - h,
            x2: baseX + dx,
            y2: baseY,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем маркер прямого угла для высоты
        g.appendChild(this.drawRightAngleMarker(baseX + dx, baseY, 15));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + side / 2, baseY + 25, labels.a));
        }
        if (labels.h) {
            g.appendChild(this.createLabel(baseX + dx - 10, baseY - h / 2, labels.h));
        }

        return g;
    }

    /**
     * Рисует ромб по стороне и углу
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.side - длина стороны ромба
     * @param {number} config.angle - угол в градусах
     * @param {Object} config.labels - объект с подписями {a: string, showAngle: boolean}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawRhombusBySideAndAngle(config) {
        const {
            baseX = 150,
            baseY = 350,
            side,
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
        const dx = side * Math.cos(rad);
        const h = side * Math.sin(rad);

        // Четыре вершины ромба
        const points = `${baseX + dx},${baseY - h} ${baseX + dx + side},${baseY - h} ${baseX + side},${baseY} ${baseX},${baseY}`;

        // Рисуем ромб
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + side / 2, baseY + 25, labels.a));
        }
        if (labels.showAngle) {
            g.appendChild(this.drawAngleArc(baseX, baseY, angle));
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
}
