// Тренажёр для визуализации дробей
class FractionVisualTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('fractionVisualSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            taskTypeDraw: true,
            taskTypeInput: false,
            improperFractions: false,
            requireSimplification: false,
            unsimplifiedFractions: false
        };

        super({
            name: 'fractionVisual',
            generator: new FractionVisualGenerator(settings),
            progressTracker: new ProgressTracker('fractionVisualProgress'),
            settings: settings,
            storageKey: 'fractionVisualSettings'
        });

        // Состояние для отслеживания закрашенных сегментов
        this.filledSegments = [];
        this.shapes = [];
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('fraction-visual-screen'),
            backBtn: document.getElementById('fraction-visual-back-btn'),
            settingsBtn: document.getElementById('fraction-visual-settings-btn'),
            checkBtn: document.getElementById('fraction-visual-check-btn'),
            settingsScreen: document.getElementById('fraction-visual-settings-screen'),
            settingsBackBtn: document.getElementById('fraction-visual-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('fraction-visual-level-text'),
            progressText: document.getElementById('fraction-visual-progress-text'),
            progressFill: document.getElementById('fraction-visual-progress-fill'),
            resultMessage: document.getElementById('fraction-visual-result-message'),
            problemDisplay: document.getElementById('fraction-visual-problem-display'),

            // Контейнер для фигур
            shapesContainer: document.getElementById('shapes-container'),
            addShapeBtn: document.getElementById('add-shape-btn'),

            // Поля ввода для обратной задачи
            inputContainer: document.getElementById('fraction-input-container'),
            numeratorInput: document.getElementById('fraction-visual-numerator-input'),
            denominatorInput: document.getElementById('fraction-visual-denominator-input')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
    }

    // Инициализация обработчиков событий
    initEventHandlers() {
        super.initEventHandlers();

        // Кнопка добавления фигуры
        if (this.elements.addShapeBtn) {
            this.elements.addShapeBtn.addEventListener('click', () => {
                this.addShape();
            });
        }
    }

    // Инициализация обработчиков для полей ввода
    initInputHandlers() {
        // Сохраняем начальную позицию скролла
        let initialScrollTop = 0;

        const handleFocus = (e) => {
            // Сохраняем текущую позицию скролла
            initialScrollTop = window.scrollY || document.documentElement.scrollTop;

            // Небольшая задержка, чтобы дать браузеру время отобразить клавиатуру
            setTimeout(() => {
                // Прокручиваем к элементу, но не слишком далеко
                e.target.scrollIntoView({
                    behavior: 'auto',
                    block: 'center',
                    inline: 'nearest'
                });
            }, 100);
        };

        const handleBlur = () => {
            // При закрытии клавиатуры возвращаем скролл на исходную позицию
            setTimeout(() => {
                window.scrollTo({
                    top: initialScrollTop,
                    behavior: 'smooth'
                });
            }, 100);
        };

        if (this.elements.numeratorInput) {
            this.elements.numeratorInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
            this.elements.numeratorInput.addEventListener('focus', handleFocus);
            this.elements.numeratorInput.addEventListener('blur', handleBlur);
        }

        if (this.elements.denominatorInput) {
            this.elements.denominatorInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
            this.elements.denominatorInput.addEventListener('focus', handleFocus);
            this.elements.denominatorInput.addEventListener('blur', handleBlur);
        }
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        // Обработка чекбоксов для типа задачи
        const drawCheckbox = document.getElementById('task-type-draw');
        const inputCheckbox = document.getElementById('task-type-input');

        if (drawCheckbox && inputCheckbox) {
            drawCheckbox.checked = this.settings.taskTypeDraw;
            inputCheckbox.checked = this.settings.taskTypeInput;

            drawCheckbox.addEventListener('change', (e) => {
                this.settings.taskTypeDraw = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });

            inputCheckbox.addEventListener('change', (e) => {
                this.settings.taskTypeInput = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        // Обработка остальных чекбоксов
        const improperCheckbox = document.getElementById('improper-fractions');
        const requireSimplificationCheckbox = document.getElementById('require-simplification');
        const unsimplifiedCheckbox = document.getElementById('unsimplified-fractions');

        if (improperCheckbox) {
            improperCheckbox.checked = this.settings.improperFractions;
            improperCheckbox.addEventListener('change', (e) => {
                this.settings.improperFractions = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (requireSimplificationCheckbox) {
            requireSimplificationCheckbox.checked = this.settings.requireSimplification;
            requireSimplificationCheckbox.addEventListener('change', (e) => {
                this.settings.requireSimplification = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (unsimplifiedCheckbox) {
            unsimplifiedCheckbox.checked = this.settings.unsimplifiedFractions;
            unsimplifiedCheckbox.addEventListener('change', (e) => {
                this.settings.unsimplifiedFractions = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
    }

    // Отображение примера
    displayProblem(problem) {
        this.filledSegments = [];
        this.shapes = [];

        if (problem.taskType === 'drawByFraction') {
            // Показываем дробь и просим закрасить фигуры
            this.displayDrawingTask(problem);
        } else {
            // Показываем закрашенные фигуры и просим ввести дробь
            this.displayInputTask(problem);
        }
    }

    // Отображение задачи на рисование
    displayDrawingTask(problem) {
        // Скрываем поле ввода
        this.elements.inputContainer.style.display = 'none';

        // Показываем контейнер для фигур
        this.elements.shapesContainer.style.display = 'grid';

        // Если включены несокращенные дроби, показываем сокращённую дробь
        let displayNumerator = problem.numerator;
        let displayDenominator = problem.denominator;

        if (this.settings.unsimplifiedFractions) {
            // Создаём дробь и сокращаем её для отображения
            const fraction = new Fraction(problem.numerator, problem.denominator);
            fraction.simplify();
            displayNumerator = fraction.numerator;
            displayDenominator = fraction.denominator;
        }

        // Отображаем дробь (сокращённую, если включена настройка)
        this.elements.problemDisplay.innerHTML = this.renderFraction(displayNumerator, displayDenominator);

        // Создаем начальные фигуры
        this.elements.shapesContainer.innerHTML = '';

        // Всегда начинаем с одной фигуры
        this.addShape();

        // Добавляем заглушку для кнопки добавления, если включены неправильные дроби
        if (this.settings.improperFractions && this.shapes.length < 4) {
            this.addPlaceholder();
        }
    }

    // Отображение задачи на ввод
    displayInputTask(problem) {
        // Показываем поле ввода
        this.elements.inputContainer.style.display = 'flex';

        // Скрываем текст задачи
        this.elements.problemDisplay.innerHTML = '';

        // Создаем фигуры с уже закрашенными сегментами
        this.elements.shapesContainer.innerHTML = '';

        const shapesCount = problem.shapesCount || 1;
        let remainingToFill = problem.numerator;

        for (let i = 0; i < shapesCount; i++) {
            // Создаём контейнер для фигуры (без кнопок)
            const shapeWrapper = document.createElement('div');
            shapeWrapper.className = 'shape-wrapper';
            shapeWrapper.dataset.shapeIndex = i;

            const shapeElement = this.createShape(problem.shapeType, problem.denominator, i);
            shapeWrapper.appendChild(shapeElement);

            this.shapes.push(shapeWrapper);
            this.elements.shapesContainer.appendChild(shapeWrapper);

            // Закрашиваем нужное количество сегментов
            const segments = shapeElement.querySelectorAll('.segment');
            const toFillInThisShape = Math.min(remainingToFill, problem.denominator);

            for (let j = 0; j < toFillInThisShape; j++) {
                segments[j].classList.add('filled');
                this.filledSegments.push({ shapeIndex: i, segmentIndex: j });
            }

            remainingToFill -= toFillInThisShape;
        }

        // Обновляем размеры фигур в зависимости от их количества
        this.updateShapeSizes();

        // Показываем фигуры в режиме просмотра (без интерактивности)
        this.elements.shapesContainer.style.display = 'grid';
        this.elements.shapesContainer.classList.add('view-only');
    }

    // Добавление новой фигуры
    addShape() {
        // Проверяем максимальное количество фигур
        if (this.shapes.length >= 4) {
            return;
        }

        const problem = this.currentProblem;
        const shapeIndex = this.shapes.length;

        // Создаём контейнер для фигуры с кнопками
        const shapeWrapper = document.createElement('div');
        shapeWrapper.className = 'shape-wrapper';
        shapeWrapper.dataset.shapeIndex = shapeIndex;

        const shapeElement = this.createShape(problem.shapeType, problem.denominator, shapeIndex);
        shapeWrapper.appendChild(shapeElement);

        // Создаём контейнер для кнопок под фигурой
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'shape-buttons';

        // Кнопка "Закрасить полностью" (синий кружок)
        const fillAllBtn = document.createElement('button');
        fillAllBtn.className = 'shape-fill-all-btn';
        fillAllBtn.innerHTML = '<span class="blue-circle"></span>';
        fillAllBtn.addEventListener('click', () => {
            // Получаем актуальный индекс из data-атрибута
            const currentIndex = parseInt(shapeWrapper.dataset.shapeIndex);
            this.fillAllSegments(currentIndex);
        });

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'shape-delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', () => {
            // Получаем актуальный индекс из data-атрибута
            const currentIndex = parseInt(shapeWrapper.dataset.shapeIndex);
            this.removeShape(currentIndex);
        });

        buttonsContainer.appendChild(fillAllBtn);
        buttonsContainer.appendChild(deleteBtn);
        shapeWrapper.appendChild(buttonsContainer);

        this.shapes.push(shapeWrapper);
        this.elements.shapesContainer.appendChild(shapeWrapper);

        // Обновляем видимость кнопок удаления
        this.updateDeleteButtons();

        // Обновляем заглушку
        this.updatePlaceholder();

        // Обновляем размеры фигур в зависимости от их количества (после placeholder)
        this.updateShapeSizes();
    }

    // Удаление фигуры
    removeShape(shapeIndex) {
        // Нельзя удалить последнюю фигуру
        if (this.shapes.length <= 1) {
            return;
        }

        // Проверяем, что индекс валиден
        if (shapeIndex < 0 || shapeIndex >= this.shapes.length) {
            return;
        }

        // Проверяем, что элемент существует
        if (!this.shapes[shapeIndex]) {
            return;
        }

        // Удаляем закрашенные сегменты этой фигуры
        this.filledSegments = this.filledSegments.filter(seg => seg.shapeIndex !== shapeIndex);

        // Пересчитываем индексы для сегментов оставшихся фигур
        this.filledSegments = this.filledSegments.map(seg => {
            if (seg.shapeIndex > shapeIndex) {
                return { ...seg, shapeIndex: seg.shapeIndex - 1 };
            }
            return seg;
        });

        // Удаляем элемент из DOM
        this.shapes[shapeIndex].remove();
        this.shapes.splice(shapeIndex, 1);

        // Обновляем индексы у оставшихся фигур
        this.shapes.forEach((shapeWrapper, index) => {
            shapeWrapper.dataset.shapeIndex = index;
            const shape = shapeWrapper.querySelector('.shape');
            if (shape) {
                shape.dataset.shapeIndex = index;
                // Обновляем data-атрибуты сегментов
                const segments = shape.querySelectorAll('.segment');
                segments.forEach(seg => {
                    seg.dataset.shapeIndex = index;
                });
            }
        });

        // Обновляем видимость кнопок удаления
        this.updateDeleteButtons();

        // Обновляем заглушку
        this.updatePlaceholder();

        // Обновляем размеры фигур (после placeholder)
        this.updateShapeSizes();
    }

    // Переключить состояние всех сегментов фигуры (закрасить все / очистить все)
    fillAllSegments(shapeIndex) {
        const shapeWrapper = this.shapes[shapeIndex];
        const shape = shapeWrapper.querySelector('.shape');
        const segments = shape.querySelectorAll('.segment');

        // Проверяем, все ли сегменты закрашены
        const allFilled = Array.from(segments).every((segment, segmentIndex) => {
            return this.filledSegments.find(
                s => s.shapeIndex === shapeIndex && s.segmentIndex === segmentIndex
            );
        });

        if (allFilled) {
            // Если все закрашены - очищаем все
            this.filledSegments = this.filledSegments.filter(
                s => s.shapeIndex !== shapeIndex
            );
            segments.forEach(segment => {
                segment.classList.remove('filled');
            });
        } else {
            // Иначе закрашиваем все
            segments.forEach((segment, segmentIndex) => {
                const exists = this.filledSegments.find(
                    s => s.shapeIndex === shapeIndex && s.segmentIndex === segmentIndex
                );

                if (!exists) {
                    this.filledSegments.push({ shapeIndex, segmentIndex });
                    segment.classList.add('filled');
                }
            });
        }
    }

    // Добавление заглушки для кнопки добавления
    addPlaceholder() {
        // Удаляем старую заглушку, если есть
        this.removePlaceholder();

        const placeholder = document.createElement('div');
        placeholder.className = 'add-shape-placeholder';
        placeholder.innerHTML = '<span class="plus-icon-large">+</span>';
        placeholder.addEventListener('click', () => {
            this.addShape();
        });

        this.elements.shapesContainer.appendChild(placeholder);
    }

    // Удаление заглушки
    removePlaceholder() {
        const placeholder = this.elements.shapesContainer.querySelector('.add-shape-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }

    // Обновление заглушки
    updatePlaceholder() {
        if (this.settings.improperFractions && this.shapes.length < 4) {
            this.addPlaceholder();
        } else {
            this.removePlaceholder();
        }
    }

    // Обновление размеров фигур в зависимости от их количества
    updateShapeSizes() {
        const container = this.elements.shapesContainer;
        const count = this.shapes.length;
        const hasPlaceholder = container.querySelector('.add-shape-placeholder') !== null;

        // Убираем старые классы
        container.classList.remove('shapes-1', 'shapes-2', 'shapes-3', 'shapes-4',
                                   'shapes-1-plus', 'shapes-2-plus', 'shapes-3-plus');

        // Добавляем класс в зависимости от количества
        if (hasPlaceholder) {
            container.classList.add(`shapes-${count}-plus`);
        } else {
            container.classList.add(`shapes-${count}`);
        }
    }

    // Обновление видимости кнопок удаления
    updateDeleteButtons() {
        this.shapes.forEach(shapeWrapper => {
            const deleteBtn = shapeWrapper.querySelector('.shape-delete-btn');
            if (deleteBtn) {
                // Скрываем кнопку удаления, если фигура всего одна
                if (this.shapes.length <= 1) {
                    deleteBtn.style.display = 'none';
                } else {
                    deleteBtn.style.display = 'flex';
                }
            }
        });
    }

    // Вычисление оптимальных размеров прямоугольника
    getOptimalRectangleDimensions(segments) {
        // Ищем делители числа, чтобы получить прямоугольник
        const divisors = [];
        for (let i = 1; i <= segments; i++) {
            if (segments % i === 0) {
                divisors.push(i);
            }
        }

        // Выбираем делитель, который даст наиболее близкое к квадрату соотношение
        let bestCols = 1;
        let bestRows = segments;
        let bestRatio = Math.max(bestRows / bestCols, bestCols / bestRows);

        for (const cols of divisors) {
            const rows = segments / cols;
            const ratio = Math.max(rows / cols, cols / rows);

            // Ищем соотношение, близкое к 1 (квадрат), но предпочитаем горизонтальный прямоугольник
            if (ratio < bestRatio || (ratio === bestRatio && cols > rows)) {
                bestCols = cols;
                bestRows = rows;
                bestRatio = ratio;
            }
        }

        return { cols: bestCols, rows: bestRows };
    }

    // Создание фигуры (круг или прямоугольник)
    createShape(type, segments, shapeIndex) {
        const shapeDiv = document.createElement('div');
        shapeDiv.className = `shape ${type}`;
        shapeDiv.dataset.shapeIndex = shapeIndex;

        if (type === 'circle') {
            // Создаем круг с секторами
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '-1.2 -1.2 2.4 2.4');
            svg.classList.add('circle-svg');

            const anglePerSegment = 360 / segments;

            for (let i = 0; i < segments; i++) {
                const startAngle = i * anglePerSegment - 90; // -90 для старта сверху
                const endAngle = (i + 1) * anglePerSegment - 90;

                const segment = this.createCircleSegment(startAngle, endAngle, i, shapeIndex);
                svg.appendChild(segment);
            }

            shapeDiv.appendChild(svg);
        } else {
            // Создаем прямоугольник с ячейками
            const { cols, rows } = this.getOptimalRectangleDimensions(segments);

            shapeDiv.classList.add('rectangle-grid');
            shapeDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            shapeDiv.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

            for (let i = 0; i < segments; i++) {
                const segment = document.createElement('div');
                segment.className = 'segment rectangle-segment';
                segment.dataset.segmentIndex = i;
                segment.dataset.shapeIndex = shapeIndex;

                segment.addEventListener('click', () => {
                    this.toggleSegment(shapeIndex, i, segment);
                });

                shapeDiv.appendChild(segment);
            }
        }

        return shapeDiv;
    }

    // Создание сектора круга
    createCircleSegment(startAngle, endAngle, segmentIndex, shapeIndex) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('segment', 'circle-segment');
        path.dataset.segmentIndex = segmentIndex;
        path.dataset.shapeIndex = shapeIndex;

        const start = this.polarToCartesian(0, 0, 1, endAngle);
        const end = this.polarToCartesian(0, 0, 1, startAngle);

        const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

        const d = [
            'M', 0, 0,
            'L', start.x, start.y,
            'A', 1, 1, 0, largeArc, 0, end.x, end.y,
            'Z'
        ].join(' ');

        path.setAttribute('d', d);

        path.addEventListener('click', () => {
            this.toggleSegment(shapeIndex, segmentIndex, path);
        });

        return path;
    }

    // Преобразование полярных координат в декартовы
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    // Переключение состояния сегмента
    toggleSegment(shapeIndex, segmentIndex, element) {
        // Проверяем, включен ли режим просмотра
        if (this.elements.shapesContainer.classList.contains('view-only')) {
            return;
        }

        const key = `${shapeIndex}-${segmentIndex}`;
        const index = this.filledSegments.findIndex(
            s => s.shapeIndex === shapeIndex && s.segmentIndex === segmentIndex
        );

        if (index !== -1) {
            // Убираем закраску
            this.filledSegments.splice(index, 1);
            element.classList.remove('filled');
        } else {
            // Добавляем закраску
            this.filledSegments.push({ shapeIndex, segmentIndex });
            element.classList.add('filled');
        }
    }

    // Рендеринг дроби
    renderFraction(numerator, denominator) {
        return `
            <div class="fraction-display-large">
                <span class="numerator">${numerator}</span>
                <span class="fraction-line"></span>
                <span class="denominator">${denominator}</span>
            </div>
        `;
    }

    // Очистка полей ввода
    clearInputs() {
        if (this.elements.numeratorInput) {
            this.elements.numeratorInput.value = '';
        }
        if (this.elements.denominatorInput) {
            this.elements.denominatorInput.value = '';
        }
        if (this.elements.numeratorInput && this.currentProblem.taskType === 'fractionByDrawing') {
            this.elements.numeratorInput.focus();
        }
    }

    // Проверка ответа
    checkAnswer() {
        const problem = this.currentProblem;

        if (problem.taskType === 'drawByFraction') {
            // Проверяем количество закрашенных сегментов
            const filledCount = this.filledSegments.length;
            const correctCount = problem.numerator;

            if (filledCount === correctCount) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
        } else {
            // Проверяем введенную дробь
            const numeratorInput = parseInt(this.elements.numeratorInput.value) || 0;
            const denominatorInput = parseInt(this.elements.denominatorInput.value) || 1;

            // Проверка на ноль в знаменателе
            if (denominatorInput === 0) {
                this.handleWrongAnswer();
                return;
            }

            // Создаем дроби для сравнения
            const userFraction = new Fraction(numeratorInput, denominatorInput);
            const correctFraction = new Fraction(problem.numerator, problem.denominator);

            // Если требуется сокращение
            let isCorrect = userFraction.equals(correctFraction);

            if (isCorrect && this.settings.requireSimplification) {
                if (!userFraction.isSimplified()) {
                    isCorrect = false;
                }
            }

            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleWrongAnswer();
            }
        }
    }

    // Проверка, выбрана ли хотя бы одна операция
    hasOperationsSelected() {
        // Проверяем, выбран ли хотя бы один тип задачи
        return this.settings.taskTypeDraw || this.settings.taskTypeInput;
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '';
        this.elements.shapesContainer.style.display = 'grid';
    }

    // Показать сообщение об отсутствии операций
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Не выбран ни один тип задачи 😢</span>';
        this.elements.shapesContainer.style.display = 'none';
        this.elements.inputContainer.style.display = 'none';
    }

    // Отключить поля ввода
    disableInputs() {
        super.disableInputs();
        if (this.elements.numeratorInput) {
            this.elements.numeratorInput.disabled = true;
        }
        if (this.elements.denominatorInput) {
            this.elements.denominatorInput.disabled = true;
        }
        // Отключаем клики по сегментам
        this.elements.shapesContainer.classList.add('disabled');
    }

    // Включить поля ввода
    enableInputs() {
        super.enableInputs();
        if (this.elements.numeratorInput) {
            this.elements.numeratorInput.disabled = false;
        }
        if (this.elements.denominatorInput) {
            this.elements.denominatorInput.disabled = false;
        }
        // Включаем клики по сегментам
        this.elements.shapesContainer.classList.remove('disabled');
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('fraction-visual-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('fraction-visual-screen');
    }
}
