// Компонент для рисования треугольников с подписями
class TriangleDrawer {
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
     * Рисует треугольник по двум сторонам и углу между ними
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.sideA - длина основания (горизонтальная сторона)
     * @param {number} config.sideB - длина второй стороны
     * @param {number} config.angle - угол между сторонами a и b (в градусах)
     * @param {Object} config.labels - объект с подписями {a: string, b: string, c: string, showAngle: boolean}
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
        const bx = sideB * Math.cos(rad);
        const by = sideB * Math.sin(rad);

        // Третья вершина треугольника
        const cx = baseX + bx;
        const cy = baseY - by;

        // Вычисляем длину третьей стороны (для подписи c)
        const sideC = Math.sqrt((sideA - bx) ** 2 + by ** 2);

        // Рисуем треугольник
        const points = `${baseX},${baseY} ${baseX + sideA},${baseY} ${cx},${cy}`;
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
            g.appendChild(this.createLabel(baseX + bx / 2 - 15, baseY - by / 2, labels.b));
        }
        if (labels.c) {
            // Середина третьей стороны
            const midX = (baseX + sideA + cx) / 2;
            const midY = (baseY + cy) / 2;
            g.appendChild(this.createLabel(midX + 15, midY, labels.c));
        }
        if (labels.showAngle) {
            g.appendChild(this.drawAngleArc(baseX, baseY, angle));
        }

        return g;
    }

    /**
     * Рисует треугольник по трем сторонам (используя теорему косинусов)
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.sideA - длина основания (горизонтальная сторона)
     * @param {number} config.sideB - длина второй стороны
     * @param {number} config.sideC - длина третьей стороны
     * @param {Object} config.labels - объект с подписями {a: string, b: string, c: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawByThreeSides(config) {
        const {
            baseX = 150,
            baseY = 350,
            sideA,
            sideB,
            sideC,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Используем теорему косинусов для вычисления угла
        // cos(angle) = (b² + a² - c²) / (2ab)
        const cosAngle = (sideB * sideB + sideA * sideA - sideC * sideC) / (2 * sideB * sideA);
        const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))); // Ограничиваем диапазон [-1, 1]

        const bx = sideB * Math.cos(angle);
        const by = sideB * Math.sin(angle);

        // Третья вершина треугольника
        const cx = baseX + bx;
        const cy = baseY - by;

        // Рисуем треугольник
        const points = `${baseX},${baseY} ${baseX + sideA},${baseY} ${cx},${cy}`;
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
            g.appendChild(this.createLabel(baseX + bx / 2 - 15, baseY - by / 2, labels.b));
        }
        if (labels.c) {
            // Середина третьей стороны
            const midX = (baseX + sideA + cx) / 2;
            const midY = (baseY + cy) / 2;
            g.appendChild(this.createLabel(midX + 15, midY, labels.c));
        }

        return g;
    }

    /**
     * Рисует треугольник по основанию и высоте
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.base - длина основания
     * @param {number} config.height - высота треугольника
     * @param {number} config.heightPosition - положение высоты от левого края (по умолчанию base/3)
     * @param {Object} config.labels - объект с подписями {a: string, h: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawByBaseAndHeight(config) {
        const {
            baseX = 150,
            baseY = 350,
            base,
            height,
            heightPosition = base / 3,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Вершина треугольника
        const topX = baseX + heightPosition;
        const topY = baseY - height;

        // Рисуем треугольник
        const points = `${baseX},${baseY} ${baseX + base},${baseY} ${topX},${topY}`;
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Рисуем высоту (пунктирная линия)
        g.appendChild(this.createSVGElement('line', {
            x1: topX,
            y1: topY,
            x2: topX,
            y2: baseY,
            stroke: '#9e9e9e',
            'stroke-width': '1.5',
            'stroke-dasharray': '5,5'
        }));

        // Добавляем маркер прямого угла для высоты
        g.appendChild(this.drawRightAngleMarker(topX, baseY, 15));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + base / 2, baseY + 25, labels.a));
        }
        if (labels.h) {
            g.appendChild(this.createLabel(topX - 10, baseY - height / 2, labels.h));
        }

        return g;
    }

    /**
     * Рисует прямоугольный треугольник (с прямым углом в нижнем левом углу)
     * @param {Object} config - конфигурация
     * @param {number} config.baseX - X координата нижней левой вершины
     * @param {number} config.baseY - Y координата нижней левой вершины
     * @param {number} config.cathetus1 - длина первого катета (горизонтальный)
     * @param {number} config.cathetus2 - длина второго катета (вертикальный)
     * @param {Object} config.labels - объект с подписями {a: string, b: string, c: string}
     * @param {Object} config.style - стили фигуры
     * @returns {SVGGElement}
     */
    drawRightTriangle(config) {
        const {
            baseX = 150,
            baseY = 350,
            cathetus1,
            cathetus2,
            labels = {},
            style = {
                fill: "rgba(33, 150, 243, 0.08)",
                stroke: "#2196F3",
                strokeWidth: "2"
            }
        } = config;

        const g = this.createSVGElement('g');

        // Вычисляем гипотенузу
        const hypotenuse = Math.sqrt(cathetus1 ** 2 + cathetus2 ** 2);

        // Рисуем треугольник
        const points = `${baseX},${baseY} ${baseX + cathetus1},${baseY} ${baseX},${baseY - cathetus2}`;
        g.appendChild(this.createSVGElement('polygon', {
            points,
            fill: style.fill,
            stroke: style.stroke,
            'stroke-width': style.strokeWidth
        }));

        // Добавляем маркер прямого угла
        g.appendChild(this.drawRightAngleMarker(baseX, baseY, 15));

        // Добавляем подписи
        if (labels.a) {
            g.appendChild(this.createLabel(baseX + cathetus1 / 2, baseY + 25, labels.a));
        }
        if (labels.b) {
            g.appendChild(this.createLabel(baseX - 15, baseY - cathetus2 / 2, labels.b));
        }
        if (labels.c) {
            // Середина гипотенузы
            const midX = (baseX + cathetus1 + baseX) / 2;
            const midY = (baseY + baseY - cathetus2) / 2;
            g.appendChild(this.createLabel(midX + 15, midY, labels.c));
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
