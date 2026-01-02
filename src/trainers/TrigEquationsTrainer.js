// Тренажёр простейших тригонометрических уравнений
class TrigEquationsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerTrigEquationsSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            functions: {
                sin: true,
                cos: true,
                tg: true,
                ctg: true
            },
            useRadians: false
        };

        super({
            name: 'trigEquations',
            generator: new TrigEquationsProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerTrigEquationsProgress'),
            settings: settings,
            storageKey: 'mathTrainerTrigEquationsSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('trig-equations-screen'),
            backBtn: document.getElementById('trig-equations-back-btn'),
            settingsBtn: document.getElementById('trig-equations-settings-btn'),
            settingsScreen: document.getElementById('trig-equations-settings-screen'),
            settingsBackBtn: document.getElementById('trig-equations-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('trig-equations-level-text'),
            progressText: document.getElementById('trig-equations-progress-text'),
            progressFill: document.getElementById('trig-equations-progress-fill'),
            resultMessage: document.getElementById('trig-equations-result-message'),
            equationDisplay: document.getElementById('trig-equations-equation'),

            // Конструктор ответа
            constructorContainer: document.getElementById('trig-equations-answer-constructor'),
            checkBtn: document.getElementById('trig-equations-check-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
    }

    // Инициализация обработчиков событий
    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Кнопка настроек
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsScreen();
        });

        // Кнопка назад из настроек
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
            this.generateNewProblem();
        });

        // Кнопка проверки ответа
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        // Чекбоксы для функций
        ['sin', 'cos', 'tg', 'ctg'].forEach(func => {
            const checkbox = document.getElementById(`trig-equations-${func}`);
            if (checkbox) {
                checkbox.checked = this.settings.functions[func];
                checkbox.addEventListener('change', (e) => {
                    this.settings.functions[func] = e.target.checked;
                    this.saveSettings();
                    this.updateGeneratorSettings();
                });
            }
        });

        // Радио-кнопки для единиц измерения
        const degreesRadio = document.getElementById('trig-equations-degrees');
        const radiansRadio = document.getElementById('trig-equations-radians');

        if (degreesRadio && radiansRadio) {
            degreesRadio.checked = !this.settings.useRadians;
            radiansRadio.checked = this.settings.useRadians;

            degreesRadio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.settings.useRadians = false;
                    this.saveSettings();
                    this.updateGeneratorSettings();
                }
            });

            radiansRadio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.settings.useRadians = true;
                    this.saveSettings();
                    this.updateGeneratorSettings();
                }
            });
        }
    }

    // Проверка, выбрана ли хотя бы одна функция
    hasOperationsSelected() {
        return Object.values(this.settings.functions).some(val => val);
    }

    // Отображение задачи
    displayProblem(problem) {
        // Рендерим уравнение
        if (typeof katex !== 'undefined') {
            katex.render(problem.equation, this.elements.equationDisplay, {
                displayMode: true,
                throwOnError: false
            });
        } else {
            this.elements.equationDisplay.textContent = problem.equation;
        }

        // Создаём конструктор ответа
        this.createAnswerConstructor(problem);
    }

    // Создание конструктора ответа
    createAnswerConstructor(problem) {
        this.elements.constructorContainer.innerHTML = '';

        const solution = problem.solution;
        const func = solution.function;

        // Создаём контейнер для элементов конструктора
        const constructorDiv = document.createElement('div');
        constructorDiv.className = 'answer-constructor-parts';

        // Универсальный конструктор для всех функций
        // x = [начальная добавка] · [множитель] · [угол] + [период]n

        // x =
        constructorDiv.appendChild(this.createLabel('x ='));

        // Начальная добавка (вращающееся колёсико)
        const coeffWheel = this.createCoefficientWheel('coefficient');
        constructorDiv.appendChild(coeffWheel);

        // Множитель перед углом (числовой input)Мне не
        const multiplierInput = this.createMultiplierInput('multiplier');
        constructorDiv.appendChild(multiplierInput);

        // Угол (вращающееся колёсико)
        const angleWheel = this.createAngleWheel('baseAngle');
        constructorDiv.appendChild(angleWheel);

        // +
        constructorDiv.appendChild(this.createLabel('+'));

        // Period (вращающееся колёсико)
        const periodWheel = this.createPeriodWheel('period');
        constructorDiv.appendChild(periodWheel);
        constructorDiv.appendChild(this.createLabel('n'));

        this.elements.constructorContainer.appendChild(constructorDiv);
    }

    // Создание текстовой метки
    createLabel(text) {
        const span = document.createElement('span');
        span.className = 'constructor-label';
        span.textContent = text;
        return span;
    }

    // Создание селектора
    createSelect(name, options) {
        const select = document.createElement('select');
        select.className = 'constructor-select';
        select.dataset.name = name;

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.latex) {
                option.dataset.latex = opt.latex;
            }
            select.appendChild(option);
        });

        return select;
    }

    // Создание поля для ввода множителя
    createMultiplierInput(name) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'constructor-input multiplier-input';
        input.dataset.name = name;
        input.placeholder = '1';
        input.value = '1';
        input.step = '1';
        return input;
    }

    // Создание picker column (точная копия структуры react-mobile-picker-scroll)
    createWheel(name, options) {
        const ITEM_HEIGHT = 36;
        const HEIGHT = 216;

        // Создаем контейнер
        const container = document.createElement('div');
        // Добавляем класс в зависимости от типа колеса
        if (name === 'coefficient') {
            container.className = 'picker-container picker-wide';
        } else {
            container.className = 'picker-container picker-narrow';
        }
        container.dataset.name = name;

        // Создаем inner
        const inner = document.createElement('div');
        inner.className = 'picker-inner';

        // Создаем column
        const column = document.createElement('div');
        column.className = 'picker-column';

        // Создаем scroller
        const scroller = document.createElement('div');
        scroller.className = 'picker-scroller';

        let selectedIndex = 0;
        let touchStartY = 0;
        let scrollerStartY = 0;
        let lastWheelTime = 0;
        const wheelThrottle = 150; // Задержка между прокрутками колесом мыши

        // Добавляем элементы
        options.forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'picker-item';
            item.dataset.index = index;
            item.dataset.value = option.value;
            if (option.degrees !== undefined) {
                item.dataset.degrees = option.degrees;
            }

            if (typeof katex !== 'undefined' && option.latex && option.latex !== '') {
                try {
                    katex.render(option.latex, item, { displayMode: false, throwOnError: false });
                } catch (e) {
                    item.textContent = option.display || '';
                }
            } else {
                item.textContent = option.display || '';
            }

            scroller.appendChild(item);
        });

        // Создаем highlight
        const highlight = document.createElement('div');
        highlight.className = 'picker-highlight';

        // Обновление выбранного элемента
        const updateSelection = () => {
            const items = scroller.querySelectorAll('.picker-item');
            items.forEach((item, i) => {
                if (i === selectedIndex) {
                    item.classList.add('picker-item-selected');
                } else {
                    item.classList.remove('picker-item-selected');
                }
            });
        };

        // Прокрутка к индексу
        const scrollToIndex = (index) => {
            selectedIndex = Math.max(0, Math.min(options.length - 1, index));
            // Исправленная формула: центр контейнера минус половина элемента минус смещение для индекса
            const y = HEIGHT / 2 - ITEM_HEIGHT / 2 - selectedIndex * ITEM_HEIGHT;
            scroller.style.transform = `translate3d(0, ${y}px, 0)`;
            updateSelection();
        };

        // Touch обработчики
        const handleTouchStart = (clientY) => {
            touchStartY = clientY;
            const transform = scroller.style.transform;
            const match = transform.match(/translate3d\(0,\s*([-\d.]+)px,\s*0\)/);
            // Если transform не найден, вычисляем позицию на основе текущего индекса
            scrollerStartY = match ? parseFloat(match[1]) : (HEIGHT / 2 - ITEM_HEIGHT / 2 - selectedIndex * ITEM_HEIGHT);
            scroller.style.transition = 'none';
        };

        const handleTouchMove = (clientY) => {
            const deltaY = clientY - touchStartY;
            const y = scrollerStartY + deltaY;
            scroller.style.transform = `translate3d(0, ${y}px, 0)`;
        };

        const handleTouchEnd = () => {
            const transform = scroller.style.transform;
            const match = transform.match(/translate3d\(0,\s*([-\d.]+)px,\s*0\)/);
            const currentY = match ? parseFloat(match[1]) : 0;

            // Обратная формула: из currentY вычисляем индекс
            const index = Math.round((HEIGHT / 2 - ITEM_HEIGHT / 2 - currentY) / ITEM_HEIGHT);
            const clampedIndex = Math.max(0, Math.min(options.length - 1, index));

            scroller.style.transition = '300ms';
            scrollToIndex(clampedIndex);
            touchStartY = 0;
        };

        // Touch события
        column.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(e.touches[0].clientY);
        }, { passive: false });

        column.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleTouchMove(e.touches[0].clientY);
        }, { passive: false });

        column.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleTouchEnd();
        }, { passive: false });

        // Колесо мыши с throttling
        column.addEventListener('wheel', (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastWheelTime < wheelThrottle) {
                return; // Игнорируем слишком частые события
            }
            lastWheelTime = now;

            const delta = e.deltaY > 0 ? 1 : -1;
            scrollToIndex(selectedIndex + delta);
        }, { passive: false });

        // Клик по элементу
        scroller.addEventListener('click', (e) => {
            const item = e.target.closest('.picker-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    scrollToIndex(index);
                }
            }
        });

        // Инициализация
        scrollToIndex(0);

        // Собираем DOM
        column.appendChild(scroller);
        column.appendChild(highlight);
        inner.appendChild(column);
        container.appendChild(inner);

        return container;
    }

    // Создание колёсика для углов
    createAngleWheel(name) {
        const angleValues = this.settings.useRadians ? [
            { value: '0', degrees: 0, display: '0', latex: '0' },
            { value: 'π/6', degrees: 30, display: 'π/6', latex: '\\frac{\\pi}{6}' },
            { value: 'π/4', degrees: 45, display: 'π/4', latex: '\\frac{\\pi}{4}' },
            { value: 'π/3', degrees: 60, display: 'π/3', latex: '\\frac{\\pi}{3}' },
            { value: 'π/2', degrees: 90, display: 'π/2', latex: '\\frac{\\pi}{2}' },
            { value: 'π', degrees: 180, display: 'π', latex: '\\pi' }
        ] : [
            { value: '0°', degrees: 0, display: '0°', latex: '0^\\circ' },
            { value: '30°', degrees: 30, display: '30°', latex: '30^\\circ' },
            { value: '45°', degrees: 45, display: '45°', latex: '45^\\circ' },
            { value: '60°', degrees: 60, display: '60°', latex: '60^\\circ' },
            { value: '90°', degrees: 90, display: '90°', latex: '90^\\circ' },
            { value: '180°', degrees: 180, display: '180°', latex: '180^\\circ' }
        ];

        return this.createWheel(name, angleValues);
    }

    // Создание колёсика для коэффициентов
    createCoefficientWheel(name) {
        const coeffValues = [
            { value: 'none', display: '', latex: '' },
            { value: 'plusminus', display: '±', latex: '\\pm' },
            { value: 'alternating', display: '(-1)ⁿ', latex: '(-1)^n' }
        ];

        return this.createWheel(name, coeffValues);
    }

    // Создание колёсика для периодов
    createPeriodWheel(name) {
        const periodValues = this.settings.useRadians ? [
            { value: 'π', degrees: 180, display: 'π', latex: '\\pi' },
            { value: '2π', degrees: 360, display: '2π', latex: '2\\pi' }
        ] : [
            { value: '180°', degrees: 180, display: '180°', latex: '180^\\circ' },
            { value: '360°', degrees: 360, display: '360°', latex: '360^\\circ' }
        ];

        return this.createWheel(name, periodValues);
    }

    // Получение ответа пользователя
    getUserAnswer() {
        const coeffWheelContainer = this.elements.constructorContainer.querySelector('.picker-container[data-name="coefficient"]');
        const multiplierInput = this.elements.constructorContainer.querySelector('[data-name="multiplier"]');
        const angleWheelContainer = this.elements.constructorContainer.querySelector('.picker-container[data-name="baseAngle"]');
        const periodWheelContainer = this.elements.constructorContainer.querySelector('.picker-container[data-name="period"]');

        // Получаем выбранный коэффициент из колёсика
        let coeffValue = null;
        if (coeffWheelContainer) {
            const selectedItem = coeffWheelContainer.querySelector('.picker-item-selected');
            coeffValue = selectedItem ? selectedItem.dataset.value : null;
        }

        // Получаем значение множителя
        const multiplier = multiplierInput ? multiplierInput.value.trim() : '';
        const multiplierValue = multiplier === '' || multiplier === '1' ? 1 : parseFloat(multiplier);

        // Получаем выбранный элемент из колёсика углов
        let angleValue = null;
        if (angleWheelContainer) {
            const selectedItem = angleWheelContainer.querySelector('.picker-item-selected');
            angleValue = selectedItem ? parseFloat(selectedItem.dataset.degrees) : null;
        }

        // Получаем выбранный элемент из колёсика периодов
        let periodValue = null;
        if (periodWheelContainer) {
            const selectedItem = periodWheelContainer.querySelector('.picker-item-selected');
            periodValue = selectedItem ? parseFloat(selectedItem.dataset.degrees) : null;
        }

        return {
            coefficient: coeffValue,
            multiplier: isNaN(multiplierValue) ? null : multiplierValue,
            baseAngleDegrees: angleValue,
            periodDegrees: periodValue
        };
    }

    // Очистка полей ввода
    clearInputs() {
        // Сбрасываем все колёсики на первую позицию
        const wheels = this.elements.constructorContainer.querySelectorAll('.wheel-value');
        wheels.forEach(wheel => {
            wheel.dataset.index = 0;
            // Значение будет сброшено при пересоздании конструктора
        });
    }

    // Проверка ответа
    checkAnswer() {
        if (!this.currentProblem) {
            return;
        }

        const solution = this.currentProblem.solution;
        const func = solution.function;

        // Получаем значения из конструктора
        const userAnswer = this.getUserAnswer();

        // Сравниваем с правильным ответом
        const isCorrect = this.compareAnswers(userAnswer, solution);

        this.disableInputs();

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Переопределяем обработку неправильного ответа
    handleWrongAnswer() {
        this.progressTracker.wrongAnswer();
        this.showResultMessage(false);
        this.showEmoji(false);

        setTimeout(() => {
            this.updateProgressDisplay();
            this.enableInputs();
        }, 1000);
    }

    // Сравнение ответов
    compareAnswers(userAnswer, correctSolution) {
        const func = correctSolution.function;

        // Проверяем коэффициент - определяем правильный коэффициент на основе решения
        const expectedCoefficient = correctSolution.coefficient;
        let correctCoefficient;

        // Определяем правильный коэффициент на основе массива coefficient из решения
        if (expectedCoefficient.length === 1 && expectedCoefficient[0] === 1) {
            // Нет коэффициента (для tg, ctg и особых случаев sin/cos = ±1)
            correctCoefficient = 'none';
        } else if (expectedCoefficient.length === 2 && expectedCoefficient[0] === -1 && expectedCoefficient[1] === 1) {
            // (-1)^n для общих случаев sin
            correctCoefficient = 'alternating';
        } else if (expectedCoefficient.length === 2 && expectedCoefficient[0] === 1 && expectedCoefficient[1] === -1) {
            // ± для общих случаев cos
            correctCoefficient = 'plusminus';
        } else {
            // Для других случаев используем старую логику
            if (func === 'sin') {
                correctCoefficient = 'alternating';
            } else if (func === 'cos') {
                correctCoefficient = 'plusminus';
            } else {
                correctCoefficient = 'none';
            }
        }

        // Проверяем, что пользователь выбрал правильный коэффициент
        if (userAnswer.coefficient !== correctCoefficient) {
            return false;
        }

        // Проверяем множитель
        const multiplier = userAnswer.multiplier === null ? 1 : userAnswer.multiplier;

        // Проверяем базовый угол с учётом множителя
        const expectedAngleDegrees = correctSolution.baseAngleDegrees;
        const userAngleDegrees = userAnswer.baseAngleDegrees;

        if (userAngleDegrees === null) {
            return false;
        }

        // Итоговый угол с учётом множителя
        const totalUserAngleDegrees = multiplier * userAngleDegrees;
        const period = correctSolution.periodDegrees;

        // Нормализуем углы к диапазону [0, period)
        const normalizeAngle = (angle, per) => {
            let normalized = angle % per;
            if (normalized < 0) normalized += per;
            return normalized;
        };

        const normalizedUserAngle = normalizeAngle(totalUserAngleDegrees, period);
        const normalizedExpectedAngle = normalizeAngle(expectedAngleDegrees, period);

        // Сравниваем нормализованные углы
        const angleDiff = Math.abs(normalizedUserAngle - normalizedExpectedAngle);

        // Углы считаются равными, если разница меньше 0.1° или близка к периоду
        const isAngleCorrect = angleDiff < 0.1 || Math.abs(angleDiff - period) < 0.1;

        if (!isAngleCorrect) {
            return false;
        }

        // Проверяем период
        const expectedPeriodDegrees = correctSolution.periodDegrees;
        const userPeriodDegrees = userAnswer.periodDegrees;

        if (userPeriodDegrees === null || Math.abs(userPeriodDegrees - expectedPeriodDegrees) > 0.1) {
            return false;
        }

        return true;
    }


    // Показать сообщение об отсутствии выбранных функций
    showNoOperationsMessage() {
        this.elements.equationDisplay.innerHTML = '<div class="no-operations-message">Не выбрана ни одна функция 😢</div>';
        this.elements.constructorContainer.innerHTML = '';
    }

    // Скрыть сообщение об отсутствии выбранных функций
    hideNoOperationsMessage() {
        this.elements.equationDisplay.innerHTML = '';
    }

    // Отключить поля ввода
    disableInputs() {
        // Отключаем picker columns
        const pickerColumns = this.elements.constructorContainer.querySelectorAll('.picker-column');
        pickerColumns.forEach(column => {
            column.style.pointerEvents = 'none';
            column.style.opacity = '0.5';
        });

        // Отключаем числовые input
        const inputs = this.elements.constructorContainer.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);

        this.elements.checkBtn.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        // Включаем picker columns
        const pickerColumns = this.elements.constructorContainer.querySelectorAll('.picker-column');
        pickerColumns.forEach(column => {
            column.style.pointerEvents = '';
            column.style.opacity = '';
        });

        // Включаем числовые input
        const inputs = this.elements.constructorContainer.querySelectorAll('input');
        inputs.forEach(input => input.disabled = false);

        this.elements.checkBtn.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('trig-equations-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('trig-equations-screen');
    }
}
