// Базовый класс для тренажёров с числовой прямой
// Предоставляет общую функциональность для работы с точками и областями

class NumberLineTrainer extends BaseTrainer {
    constructor(config) {
        super(config);

        // Состояние интерактивной числовой прямой
        this.points = [];  // Массив точек: { value, included, circleElement, inputElement, foreignObject }
        this.regions = [];  // Массив областей: { element, selected }

        // Настройки числовой прямой (можно переопределить в наследниках)
        this.numberLineConfig = {
            minPoints: config.minPoints || 0,
            maxPoints: config.maxPoints || 2,
            allowAddRemove: config.allowAddRemove !== false,  // По умолчанию true
            lineStart: 50,
            lineEnd: 550,
            lineY: 50
        };
    }

    // ========= УПРАВЛЕНИЕ ТОЧКАМИ =========

    // Вычисление позиции X для точки по индексу
    calculatePointX(index, totalPoints) {
        const lineLength = this.numberLineConfig.lineEnd - this.numberLineConfig.lineStart;
        const segments = totalPoints + 1;
        const segmentLength = lineLength / segments;
        return this.numberLineConfig.lineStart + segmentLength * (index + 1);
    }

    // Добавление новой точки
    addPoint() {
        if (this.points.length >= this.numberLineConfig.maxPoints) {
            return;  // Достигнут лимит точек
        }

        const newPointIndex = this.points.length;

        // Создаём элемент точки на SVG
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cy', this.numberLineConfig.lineY);
        circle.setAttribute('r', '16');
        circle.setAttribute('fill', 'white');
        circle.setAttribute('stroke', '#007bff');
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('cursor', 'pointer');
        circle.classList.add('point');

        // Создаём foreignObject для поля ввода
        const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreignObject.setAttribute('y', '80');
        foreignObject.setAttribute('width', '100');
        foreignObject.setAttribute('height', '80');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '?';
        input.inputMode = 'decimal';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.padding = '0';
        input.style.fontSize = '32px';
        input.style.textAlign = 'center';
        input.style.border = '3px solid #007bff';
        input.style.borderRadius = '12px';
        input.style.background = 'white';
        input.style.boxSizing = 'border-box';

        foreignObject.appendChild(input);

        // Добавляем элементы в SVG
        this.elements.pointsGroup.appendChild(circle);
        this.elements.pointsGroup.appendChild(foreignObject);

        // Создаём объект точки
        const point = {
            value: null,
            included: false,
            circleElement: circle,
            inputElement: input,
            foreignObject: foreignObject
        };

        this.points.push(point);

        // Обработчик клика по точке
        circle.addEventListener('click', () => {
            this.togglePointInclusion(point);
        });

        // Обработчик ввода координаты
        input.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                point.value = value;
            } else if (e.target.value.trim() === '') {
                point.value = null;
            }
        });

        // Обработчик Enter в поле ввода
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Перестраиваем позиции всех точек
        this.repositionPoints();

        // Перестраиваем области
        this.rebuildRegions();

        // Обновляем состояние кнопок
        this.updateButtonStates();

        // Фокус на новом поле ввода
        input.focus();
    }

    // Удаление последней точки
    removeLastPoint() {
        if (this.points.length === 0 || this.points.length <= this.numberLineConfig.minPoints) {
            return;
        }

        const lastPoint = this.points[this.points.length - 1];

        // Удаляем элементы из DOM
        lastPoint.circleElement.remove();
        lastPoint.foreignObject.remove();

        // Удаляем из массива
        this.points.pop();

        // Перестраиваем позиции оставшихся точек
        this.repositionPoints();

        // Перестраиваем области
        this.rebuildRegions();

        // Обновляем состояние кнопок
        this.updateButtonStates();
    }

    // Перестроение позиций точек
    repositionPoints() {
        const totalPoints = this.points.length;
        this.points.forEach((point, index) => {
            const xPosition = this.calculatePointX(index, totalPoints);
            point.circleElement.setAttribute('cx', xPosition);
            point.foreignObject.setAttribute('x', xPosition - 50);  // Центрируем поле (100/2 = 50)
        });
    }

    // Переключение включения/исключения точки
    togglePointInclusion(point) {
        point.included = !point.included;

        if (point.included) {
            // Закрашенная точка
            point.circleElement.setAttribute('fill', '#007bff');
        } else {
            // Полая точка
            point.circleElement.setAttribute('fill', 'white');
        }
    }

    // ========= УПРАВЛЕНИЕ ОБЛАСТЯМИ =========

    // Перестроение областей на основе количества точек
    rebuildRegions() {
        // Очищаем существующие области
        this.elements.regionsGroup.innerHTML = '';
        this.regions = [];

        const numPoints = this.points.length;
        const numRegions = numPoints + 1;  // Областей всегда на 1 больше, чем точек

        if (numRegions === 0) return;

        // Вычисляем границы областей
        const boundaries = [this.numberLineConfig.lineStart];

        // Добавляем позиции точек как границы
        this.points.forEach((point, index) => {
            boundaries.push(this.calculatePointX(index, numPoints));
        });

        boundaries.push(this.numberLineConfig.lineEnd);

        // Создаём области между границами
        for (let i = 0; i < numRegions; i++) {
            const x1 = boundaries[i];
            const x2 = boundaries[i + 1];
            const width = x2 - x1;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x1);
            rect.setAttribute('y', this.numberLineConfig.lineY - 15);
            rect.setAttribute('width', width);
            rect.setAttribute('height', 50);
            rect.setAttribute('fill', 'transparent');
            rect.setAttribute('stroke', 'none');
            rect.setAttribute('cursor', 'pointer');
            rect.classList.add('region');

            const region = {
                element: rect,
                selected: false
            };

            this.regions.push(region);

            // Обработчик клика по области
            rect.addEventListener('click', () => {
                this.toggleRegion(region);
            });

            this.elements.regionsGroup.appendChild(rect);
        }
    }

    // Переключение области
    toggleRegion(region) {
        region.selected = !region.selected;

        if (region.selected) {
            region.element.setAttribute('fill', 'rgba(0, 123, 255, 0.3)');
        } else {
            region.element.setAttribute('fill', 'transparent');
        }
    }

    // Обновление состояния кнопок добавления/удаления
    updateButtonStates() {
        if (!this.numberLineConfig.allowAddRemove) {
            return;  // Кнопки недоступны
        }

        // Кнопка добавления
        if (this.elements.addPointBtn) {
            if (this.points.length >= this.numberLineConfig.maxPoints) {
                this.elements.addPointBtn.disabled = true;
            } else {
                this.elements.addPointBtn.disabled = false;
            }
        }

        // Кнопка удаления
        if (this.elements.removePointBtn) {
            if (this.points.length <= this.numberLineConfig.minPoints) {
                this.elements.removePointBtn.disabled = true;
            } else {
                this.elements.removePointBtn.disabled = false;
            }
        }
    }

    // ========= ПОСТРОЕНИЕ МНОЖЕСТВА ИЗ ОТВЕТА ПОЛЬЗОВАТЕЛЯ =========

    buildUserSolutionSet() {
        // Если точек нет, значит выбраны только области
        if (this.points.length === 0) {
            const hasSelectedRegions = this.regions.some(r => r.selected);
            if (!hasSelectedRegions) {
                return new EmptySet();
            }

            // Если выбрана вся прямая (одна область и она выбрана)
            if (this.regions.length === 1 && this.regions[0].selected) {
                return new Interval(-1e9, 1e9, true, true);
            }

            return new EmptySet();
        }

        // Проверяем, что все точки имеют введённые значения
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const inputValue = point.inputElement.value.trim();

            if (inputValue === '' || point.value === null) {
                // Поле не заполнено
                point.inputElement.style.borderColor = '#dc3545';
                this.showInvalidFormatMessage();

                setTimeout(() => {
                    point.inputElement.style.borderColor = '#007bff';
                }, 2000);

                return null;  // Возвращаем null для обозначения ошибки ввода
            }
        }

        // Сортируем точки по значению
        const sortedPoints = [...this.points].sort((a, b) => a.value - b.value);

        // Границы числовой прямой
        const INF = 1e9;
        const boundaries = [-INF, ...sortedPoints.map(p => p.value), INF];

        // Строим массив интервалов
        const intervals = [];

        for (let i = 0; i < this.regions.length; i++) {
            const region = this.regions[i];

            if (!region.selected) {
                continue;
            }

            const leftBoundary = boundaries[i];
            const rightBoundary = boundaries[i + 1];

            // Определяем, закрыты ли границы
            let leftClosed;
            if (i === 0) {
                leftClosed = true;  // -∞
            } else {
                leftClosed = sortedPoints[i - 1].included;
            }

            let rightClosed;
            if (i === this.regions.length - 1) {
                rightClosed = true;  // +∞
            } else {
                rightClosed = sortedPoints[i].included;
            }

            intervals.push(new Interval(leftBoundary, rightBoundary, leftClosed, rightClosed));
        }

        // Проверяем изолированные точки
        for (let i = 0; i < sortedPoints.length; i++) {
            const point = sortedPoints[i];

            if (!point.included) {
                continue;
            }

            const leftRegionSelected = (i < this.regions.length) && this.regions[i].selected;
            const rightRegionSelected = (i + 1 < this.regions.length) && this.regions[i + 1].selected;

            if (!leftRegionSelected && !rightRegionSelected) {
                intervals.push(new Interval(point.value, point.value, true, true));
            }
        }

        // Нормализуем через UnionSet
        if (intervals.length === 0) {
            return new EmptySet();
        }

        return UnionSet.normalize(intervals);
    }

    // ========= ОЧИСТКА И УПРАВЛЕНИЕ СОСТОЯНИЕМ =========

    clearInputs() {
        // Удаляем все точки (кроме минимального количества)
        while (this.points.length > this.numberLineConfig.minPoints) {
            this.removeLastPoint();
        }

        // Очищаем значения оставшихся точек
        this.points.forEach(point => {
            point.value = null;
            point.included = false;
            point.inputElement.value = '';
            point.circleElement.setAttribute('fill', 'white');
        });

        // Очищаем выбор областей
        this.regions.forEach(region => {
            region.selected = false;
            region.element.setAttribute('fill', 'transparent');
        });

        // Очистка сообщения об ошибке
        this.elements.resultMessage.classList.remove('show');

        // Обновляем состояние кнопок
        this.updateButtonStates();
    }

    disableInputs() {
        this.elements.checkBtn.disabled = true;

        if (this.elements.addPointBtn) {
            this.elements.addPointBtn.disabled = true;
        }
        if (this.elements.removePointBtn) {
            this.elements.removePointBtn.disabled = true;
        }

        this.points.forEach(point => {
            point.inputElement.disabled = true;
            point.circleElement.style.pointerEvents = 'none';
        });

        this.regions.forEach(region => {
            region.element.style.pointerEvents = 'none';
        });
    }

    enableInputs() {
        this.elements.checkBtn.disabled = false;
        this.updateButtonStates();

        this.points.forEach(point => {
            point.inputElement.disabled = false;
            point.circleElement.style.pointerEvents = 'auto';
        });

        this.regions.forEach(region => {
            region.element.style.pointerEvents = 'auto';
        });
    }

    // Показать сообщение о неверном формате
    showInvalidFormatMessage() {
        const messageElement = this.elements.resultMessage;
        messageElement.textContent = 'Введите координаты точек';
        messageElement.className = 'result-message wrong show';

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 1000);
    }
}
