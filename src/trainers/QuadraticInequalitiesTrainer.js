// Тренажёр для решения квадратных неравенств
class QuadraticInequalitiesTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerQuadraticInequalitiesSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            nonStandardForm: false,
            aEqualsOne: false,
            allowIncomplete: true
        };

        super({
            name: 'quadratic-inequalities',
            generator: new QuadraticInequalitiesProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerQuadraticInequalitiesProgress'),
            settings: settings,
            storageKey: 'mathTrainerQuadraticInequalitiesSettings'
        });

        // Состояние интерактивной числовой прямой
        this.points = [];  // Массив точек: { value, included, circleElement, inputElement, foreignObject }
        this.regions = [];  // Массив областей: { element, selected }

        this.maxPoints = 2;  // Максимальное количество точек

        // Константы для SVG
        this.lineStart = 50;
        this.lineEnd = 550;
        this.lineY = 50;
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('quadratic-inequalities-screen'),
            backBtn: document.getElementById('quadratic-inequalities-back-btn'),
            settingsBtn: document.getElementById('quadratic-inequalities-settings-btn'),
            settingsScreen: document.getElementById('quadratic-inequalities-settings-screen'),
            settingsBackBtn: document.getElementById('quadratic-inequalities-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('quadratic-inequalities-level-text'),
            progressText: document.getElementById('quadratic-inequalities-progress-text'),
            progressFill: document.getElementById('quadratic-inequalities-progress-fill'),
            resultMessage: document.getElementById('quadratic-inequalities-result-message'),
            problemDisplay: document.getElementById('quadratic-inequalities-problem-display'),

            // Элементы числовой прямой
            pointsGroup: document.getElementById('points-group'),
            regionsGroup: document.getElementById('regions-group'),
            addPointBtn: document.getElementById('add-point-btn'),
            removePointBtn: document.getElementById('remove-point-btn'),

            // Кнопка проверки
            checkBtn: document.getElementById('quadratic-inequalities-check-btn'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('quadratic-inequalities-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initNumberLineHandlers();
        this.initShareModalHandlers();
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

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = [
            'quadratic-inequalities-non-standard-form',
            'quadratic-inequalities-a-equals-one',
            'quadratic-inequalities-allow-incomplete'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('quadratic-inequalities-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());

            // Загрузка текущих настроек
            element.checked = this.settings[key];

            // Обработка изменений
            element.addEventListener('change', (e) => {
                this.settings[key] = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        });
    }

    // Проверка, выбран ли хотя бы один уровень сложности
    hasOperationsSelected() {
        return true;  // Всегда возвращаем true, так как нет выбора сложности
    }

    // Отображение неравенства
    displayProblem(problem) {
        const inequalityElem = document.getElementById('quadratic-inequalities-inequality');

        if (problem.isLatex) {
            // Используем KaTeX для рендеринга
            inequalityElem.innerHTML = '';
            try {
                katex.render(problem.inequality, inequalityElem, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                inequalityElem.textContent = problem.inequality;
            }
        } else {
            inequalityElem.textContent = problem.inequality;
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

    // Проверка ответа
    checkAnswer() {
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

                return;
            }
        }

        const correctSolution = this.currentProblem.solution;

        console.log('Правильное решение:', correctSolution);
        console.log('Ответ пользователя - точки:', this.points);
        console.log('Ответ пользователя - области:', this.regions);

        // Проверка типа решения
        if (correctSolution.type === 'none') {
            // Нет решений - не должно быть выбранных областей
            const hasNoRegions = this.regions.every(r => !r.selected);

            if (hasNoRegions) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
            return;
        }

        if (correctSolution.type === 'all') {
            // Решение: вся числовая прямая - должна быть выбрана одна область (вся прямая)
            const allRegionsSelected = this.regions.length === 1 && this.regions[0].selected;

            if (allRegionsSelected && this.points.length === 0) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
            return;
        }

        if (correctSolution.type === 'point') {
            // Решение: одна точка
            if (this.points.length !== 1) {
                this.handleWrongAnswer();
                return;
            }

            const userPoint = this.points[0];
            const correctPoint = correctSolution.points[0];

            const pointCorrect = Math.abs(userPoint.value - correctPoint.value) < 0.01;
            const inclusionCorrect = userPoint.included === correctPoint.included;
            const noRegionsSelected = this.regions.every(r => !r.selected);

            if (pointCorrect && inclusionCorrect && noRegionsSelected) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
            return;
        }

        if (correctSolution.type === 'all_except_point') {
            // Вся прямая кроме одной точки (редкий случай)
            // Должны быть выбраны обе области по краям от точки
            if (this.points.length !== 1 || this.regions.length !== 2) {
                this.handleWrongAnswer();
                return;
            }

            const userPoint = this.points[0];
            const correctPoint = correctSolution.points[0];

            const pointCorrect = Math.abs(userPoint.value - correctPoint.value) < 0.01;
            const pointNotIncluded = !userPoint.included;
            const bothRegionsSelected = this.regions[0].selected && this.regions[1].selected;

            if (pointCorrect && pointNotIncluded && bothRegionsSelected) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
            return;
        }

        // Случаи 'between' и 'outside' - два корня
        if (correctSolution.type === 'between' || correctSolution.type === 'outside') {
            // Проверяем количество точек
            if (this.points.length !== 2) {
                this.handleWrongAnswer();
                return;
            }

            // Получаем и сортируем точки пользователя
            const userPoints = [...this.points].sort((a, b) => a.value - b.value);
            const correctPoints = [...correctSolution.points].sort((a, b) => a.value - b.value);

            // Проверяем координаты точек
            const point1Correct = Math.abs(userPoints[0].value - correctPoints[0].value) < 0.01;
            const point2Correct = Math.abs(userPoints[1].value - correctPoints[1].value) < 0.01;

            // Проверяем включение точек
            const inclusion1Correct = userPoints[0].included === correctPoints[0].included;
            const inclusion2Correct = userPoints[1].included === correctPoints[1].included;

            // Проверяем области (должно быть 3 области)
            let regionsCorrect = false;
            if (this.regions.length === 3) {
                if (correctSolution.type === 'between') {
                    // Решение между корнями - выбрана средняя область
                    regionsCorrect = !this.regions[0].selected && this.regions[1].selected && !this.regions[2].selected;
                } else {
                    // Решение вне корней - выбраны крайние области
                    regionsCorrect = this.regions[0].selected && !this.regions[1].selected && this.regions[2].selected;
                }
            }

            const isCorrect = point1Correct && point2Correct &&
                            inclusion1Correct && inclusion2Correct &&
                            regionsCorrect;

            console.log('Результаты проверки:', {
                point1Correct,
                point2Correct,
                inclusion1Correct,
                inclusion2Correct,
                regionsCorrect,
                numRegions: this.regions.length,
                isCorrect
            });

            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
            return;
        }

        // Если дошли до сюда - неизвестный тип решения
        console.error('Неизвестный тип решения:', correctSolution.type);
        this.handleWrongAnswer();
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
        const inequalityElem = document.getElementById('quadratic-inequalities-inequality');
        inequalityElem.innerHTML = '';
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

    // Вспомогательная функция для генерации неравенства с заданными корнями через консоль
    // Использование: trainers.quadraticInequalities.generateWithRoots(-7, 3, '\\geq')
    generateWithRoots(x1, x2, sign = null) {
        this.currentProblem = this.generator.generateWithRoots(x1, x2, sign);
        this.displayProblem(this.currentProblem);
        this.clearInputs();
        this.enableInputs();
        return this.currentProblem;
    }
}
