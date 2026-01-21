// Тренажёр для решения систем неравенств

class SystemOfInequalitiesTrainer extends BaseTrainer {
    constructor() {
        super({
            name: 'system-of-inequalities',
            generator: new SystemOfInequalitiesProblemGenerator({}),
            progressTracker: new ProgressTracker('mathTrainerSystemOfInequalitiesProgress'),
            settings: {},
            storageKey: 'mathTrainerSystemOfInequalitiesSettings'
        });

        // Состояние интерактивной числовой прямой
        this.points = [];  // Массив точек: { value, included, circleElement, inputElement, foreignObject }
        this.regions = [];  // Массив областей: { element, selected }

        this.maxPoints = 4;  // Максимальное количество точек для систем

        // Константы для SVG
        this.lineStart = 50;
        this.lineEnd = 550;
        this.lineY = 50;
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('system-of-inequalities-screen'),
            backBtn: document.getElementById('system-of-inequalities-back-btn'),
            settingsBtn: document.getElementById('system-of-inequalities-settings-btn'),
            settingsScreen: document.getElementById('system-of-inequalities-settings-screen'),
            settingsBackBtn: document.getElementById('system-of-inequalities-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('system-of-inequalities-level-text'),
            progressText: document.getElementById('system-of-inequalities-progress-text'),
            progressFill: document.getElementById('system-of-inequalities-progress-fill'),
            resultMessage: document.getElementById('system-of-inequalities-result-message'),
            problemDisplay: document.getElementById('system-of-inequalities-problem-display'),

            // Элементы числовой прямой
            pointsGroup: document.getElementById('system-points-group'),
            regionsGroup: document.getElementById('system-regions-group'),
            addPointBtn: document.getElementById('system-add-point-btn'),
            removePointBtn: document.getElementById('system-remove-point-btn'),

            // Кнопка проверки
            checkBtn: document.getElementById('system-of-inequalities-check-btn'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('system-of-inequalities-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initNumberLineHandlers();
        this.initShareModalHandlers();
    }

    // Переопределение initEventHandlers
    initEventHandlers() {
        // Вызываем базовый метод (обрабатывает backBtn, settingsBtn, shareBtn, checkBtn, settingsBackBtn)
        super.initEventHandlers();
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.elements.screen.classList.remove('active');
        this.elements.settingsScreen.classList.add('active');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
        this.elements.screen.classList.add('active');
    }

    // Инициализация обработчиков числовой прямой
    initNumberLineHandlers() {
        // Добавление точки
        this.elements.addPointBtn.addEventListener('click', () => {
            this.addPoint();
        });

        // Удаление точки
        this.elements.removePointBtn.addEventListener('click', () => {
            this.removeLastPoint();
        });

        // Инициализация с нулём точек
        this.rebuildRegions();
    }

    // Вычисление позиции X для точки по индексу
    calculatePointX(index, totalPoints) {
        // Распределяем точки равномерно
        const lineLength = this.lineEnd - this.lineStart;
        const segments = totalPoints + 1;
        const segmentLength = lineLength / segments;
        return this.lineStart + segmentLength * (index + 1);
    }

    // Добавление новой точки
    addPoint() {
        if (this.points.length >= this.maxPoints) {
            return;  // Достигнут лимит точек
        }

        const newPointIndex = this.points.length;

        // Создаём элемент точки на SVG
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cy', this.lineY);
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
        input.type = 'number';
        input.placeholder = '?';
        // input.inputMode = 'decimal';
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
            value: null,  // Изначально null, чтобы отличить от введённого 0
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
        if (this.points.length === 0) return;

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

    // Перестроение областей на основе количества точек
    rebuildRegions() {
        // Очищаем существующие области
        this.elements.regionsGroup.innerHTML = '';
        this.regions = [];

        const numPoints = this.points.length;
        const numRegions = numPoints + 1;  // Областей всегда на 1 больше, чем точек

        if (numRegions === 0) return;

        // Вычисляем границы областей
        const boundaries = [this.lineStart];

        // Добавляем позиции точек как границы
        this.points.forEach((point, index) => {
            boundaries.push(this.calculatePointX(index, numPoints));
        });

        boundaries.push(this.lineEnd);

        // Создаём области между границами
        for (let i = 0; i < numRegions; i++) {
            const x1 = boundaries[i];
            const x2 = boundaries[i + 1];
            const width = x2 - x1;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x1);
            rect.setAttribute('y', this.lineY - 15);
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

    // Обновление состояния кнопок
    updateButtonStates() {
        // Кнопка добавления
        if (this.points.length >= this.maxPoints) {
            this.elements.addPointBtn.disabled = true;
        } else {
            this.elements.addPointBtn.disabled = false;
        }

        // Кнопка удаления
        if (this.points.length === 0) {
            this.elements.removePointBtn.disabled = true;
        } else {
            this.elements.removePointBtn.disabled = false;
        }
    }

    // Проверка, выбран ли хотя бы один уровень сложности
    hasOperationsSelected() {
        return true;  // Всегда возвращаем true, так как нет настроек
    }

    // Отображение системы неравенств
    displayProblem(problem) {
        const problemDisplay = document.getElementById('system-of-inequalities-problem-display');

        // Формируем LaTeX код для системы неравенств
        const latex = `\\begin{cases}
${problem.inequality1.inequality} \\\\
${problem.inequality2.inequality}
\\end{cases}`;

        // Рендерим систему через KaTeX
        problemDisplay.innerHTML = '';
        try {
            katex.render(latex, problemDisplay, {
                displayMode: true,
                throwOnError: false
            });

            // Автоматическое уменьшение шрифта, если не влезает
            setTimeout(() => {
                this.adjustSystemFontSize(problemDisplay);
            }, 0);
        } catch (e) {
            // Если не получилось отрендерить, показываем текстом
            problemDisplay.innerHTML = `
                <div style="font-size: 24px;">
                    {<br>
                    &nbsp;&nbsp;${problem.inequality1.inequality}<br>
                    &nbsp;&nbsp;${problem.inequality2.inequality}
                </div>
            `;
        }
    }

    // Автоматическая подстройка размера шрифта системы
    adjustSystemFontSize(element) {
        const container = element.parentElement;
        if (!container) return;

        const containerWidth = container.clientWidth - 32; // вычитаем padding
        let currentSize = 28; // начальный размер из CSS clamp

        // Сбрасываем размер
        element.style.fontSize = '';

        // Проверяем, влезает ли
        if (element.scrollWidth <= containerWidth) {
            return; // Всё влезает, ничего не делаем
        }

        // Уменьшаем шрифт пока не влезет
        while (element.scrollWidth > containerWidth && currentSize > 16) {
            currentSize -= 2;
            element.style.fontSize = currentSize + 'px';
        }
    }

    // Очистка полей ввода и состояния числовой прямой
    clearInputs() {
        // Удаляем все точки
        while (this.points.length > 0) {
            this.removeLastPoint();
        }

        // Очистка сообщения об ошибке
        this.elements.resultMessage.classList.remove('show');

        // Обновляем состояние кнопок
        this.updateButtonStates();
    }

    // Построение множества RealSet из ответа пользователя
    buildUserSolutionSet() {
        // Если точек нет, значит выбраны только области
        if (this.points.length === 0) {
            // Проверяем, выбрана ли хотя бы одна область
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

                // Сброс цвета границы через 2 секунды
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
            // Левая граница: закрыта, если это -∞ (первая область) или точка слева включена
            let leftClosed;
            if (i === 0) {
                leftClosed = true;  // -∞ всегда с открытой скобкой в коде, но для интервала используем true
            } else {
                leftClosed = sortedPoints[i - 1].included;
            }

            // Правая граница: закрыта, если это +∞ (последняя область) или точка справа включена
            let rightClosed;
            if (i === this.regions.length - 1) {
                rightClosed = true;  // +∞ всегда с открытой скобкой в коде, но для интервала используем true
            } else {
                rightClosed = sortedPoints[i].included;
            }

            intervals.push(new Interval(leftBoundary, rightBoundary, leftClosed, rightClosed));
        }

        // Проверяем изолированные точки (точка включена, но ни одна из соседних областей не выбрана)
        for (let i = 0; i < sortedPoints.length; i++) {
            const point = sortedPoints[i];

            if (!point.included) {
                continue;
            }

            const leftRegionSelected = (i < this.regions.length) && this.regions[i].selected;
            const rightRegionSelected = (i + 1 < this.regions.length) && this.regions[i + 1].selected;

            // Если точка включена, но соседние области не выбраны - это изолированная точка
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

    // Проверка ответа
    checkAnswer() {
        const userSet = this.buildUserSolutionSet();

        // Если null - ошибка ввода (не все поля заполнены)
        if (userSet === null) {
            return;
        }

        const correctSolution = this.currentProblem.solution.solution;  // RealSet объект

        console.log('Правильное решение:', correctSolution.toString());
        console.log('Ответ пользователя:', userSet.toString());

        // Сравниваем множества
        const isCorrect = userSet.equals(correctSolution);

        console.log('Результат проверки:', isCorrect);

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
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

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        const problemDisplay = document.getElementById('system-of-inequalities-problem-display');
        problemDisplay.innerHTML = '';
    }

    // Отключить поля ввода
    disableInputs() {
        this.elements.checkBtn.disabled = true;
        this.elements.addPointBtn.disabled = true;
        this.elements.removePointBtn.disabled = true;

        this.points.forEach(point => {
            point.inputElement.disabled = true;
            point.circleElement.style.pointerEvents = 'none';
        });

        this.regions.forEach(region => {
            region.element.style.pointerEvents = 'none';
        });
    }

    // Включить поля ввода
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
}
