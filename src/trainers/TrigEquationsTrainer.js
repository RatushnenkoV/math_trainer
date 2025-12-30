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

        // Начальная добавка (для всех функций)
        const coeffSelect = this.createSelect('coefficient', [
            { value: 'none', label: '' },
            { value: 'plusminus', label: '±' },
            { value: 'alternating', label: '(-1)ⁿ', latex: '(-1)^n' }
        ]);
        constructorDiv.appendChild(coeffSelect);

        // Множитель перед углом (необязательный)
        constructorDiv.appendChild(this.createLabel('·'));
        const multiplierInput = this.createMultiplierInput('multiplier');
        constructorDiv.appendChild(multiplierInput);

        // Угол (выбирается кнопками)
        constructorDiv.appendChild(this.createLabel('·'));
        const angleDisplay = this.createAngleDisplay('baseAngle');
        constructorDiv.appendChild(angleDisplay);

        // +
        constructorDiv.appendChild(this.createLabel('+'));

        // Period (выбирается кнопками)
        const periodDisplay = this.createPeriodDisplay('period');
        constructorDiv.appendChild(periodDisplay);
        constructorDiv.appendChild(this.createLabel('n'));

        this.elements.constructorContainer.appendChild(constructorDiv);

        // Добавляем кнопки выбора углов и периодов
        this.addQuickSelectButtons();
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

    // Создание поля для ввода множителя перед углом
    createMultiplierInput(name) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'constructor-input multiplier-input';
        input.dataset.name = name;
        input.placeholder = '1';
        return input;
    }

    // Создание дисплея для отображения выбранного угла
    createAngleDisplay(name) {
        const display = document.createElement('span');
        display.className = 'angle-display';
        display.dataset.name = name;
        display.dataset.value = '';
        display.textContent = '_';
        return display;
    }

    // Создание дисплея для отображения выбранного периода
    createPeriodDisplay(name) {
        const display = document.createElement('span');
        display.className = 'period-display';
        display.dataset.name = name;
        display.dataset.value = '';
        display.textContent = '_';
        return display;
    }

    // Добавление кнопок быстрого выбора углов и периодов
    addQuickSelectButtons() {
        // Кнопки для базового угла
        const angleButtonsDiv = document.createElement('div');
        angleButtonsDiv.className = 'quick-select-container';

        const angleLabel = document.createElement('div');
        angleLabel.className = 'quick-select-label';
        angleLabel.textContent = 'Выберите угол α:';
        angleButtonsDiv.appendChild(angleLabel);

        const angleButtons = document.createElement('div');
        angleButtons.className = 'quick-select-buttons';

        const angleValues = this.settings.useRadians ? [
            { display: '0', value: '0', degrees: 0 },
            { display: '\\frac{\\pi}{6}', value: 'π/6', degrees: 30 },
            { display: '\\frac{\\pi}{4}', value: 'π/4', degrees: 45 },
            { display: '\\frac{\\pi}{3}', value: 'π/3', degrees: 60 },
            { display: '\\frac{\\pi}{2}', value: 'π/2', degrees: 90 },
            { display: '\\pi', value: 'π', degrees: 180 }
        ] : [
            { display: '0°', value: '0°', degrees: 0 },
            { display: '30°', value: '30°', degrees: 30 },
            { display: '45°', value: '45°', degrees: 45 },
            { display: '60°', value: '60°', degrees: 60 },
            { display: '90°', value: '90°', degrees: 90 },
            { display: '180°', value: '180°', degrees: 180 }
        ];

        angleValues.forEach(angle => {
            const btn = document.createElement('button');
            btn.className = 'quick-select-btn';
            btn.type = 'button';
            btn.dataset.degrees = angle.degrees;

            // Рендерим LaTeX для отображения
            if (typeof katex !== 'undefined' && this.settings.useRadians) {
                try {
                    katex.render(angle.display, btn, {
                        displayMode: false,
                        throwOnError: false
                    });
                } catch (e) {
                    btn.textContent = angle.value;
                }
            } else {
                btn.textContent = angle.display;
            }

            btn.addEventListener('click', () => {
                const angleDisplay = this.elements.constructorContainer.querySelector('.angle-display[data-name="baseAngle"]');
                if (angleDisplay) {
                    angleDisplay.dataset.value = angle.value;
                    angleDisplay.dataset.degrees = angle.degrees;

                    // Отображаем выбранное значение с LaTeX
                    if (typeof katex !== 'undefined' && this.settings.useRadians && angle.display !== '0') {
                        try {
                            angleDisplay.innerHTML = '';
                            katex.render(angle.display, angleDisplay, {
                                displayMode: false,
                                throwOnError: false
                            });
                        } catch (e) {
                            angleDisplay.textContent = angle.value;
                        }
                    } else {
                        angleDisplay.textContent = angle.value;
                    }

                    // Подсвечиваем выбранную кнопку
                    angleButtons.querySelectorAll('.quick-select-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                }
            });

            angleButtons.appendChild(btn);
        });

        angleButtonsDiv.appendChild(angleButtons);
        this.elements.constructorContainer.appendChild(angleButtonsDiv);

        // Кнопки для периода
        const periodButtonsDiv = document.createElement('div');
        periodButtonsDiv.className = 'quick-select-container';

        const periodLabel = document.createElement('div');
        periodLabel.className = 'quick-select-label';
        periodLabel.textContent = 'Выберите период:';
        periodButtonsDiv.appendChild(periodLabel);

        const periodButtons = document.createElement('div');
        periodButtons.className = 'quick-select-buttons';

        const periodValues = this.settings.useRadians ? [
            { display: '\\pi', value: 'π', degrees: 180 },
            { display: '2\\pi', value: '2π', degrees: 360 }
        ] : [
            { display: '180°', value: '180°', degrees: 180 },
            { display: '360°', value: '360°', degrees: 360 }
        ];

        periodValues.forEach(period => {
            const btn = document.createElement('button');
            btn.className = 'quick-select-btn';
            btn.type = 'button';
            btn.dataset.degrees = period.degrees;

            // Рендерим LaTeX для отображения
            if (typeof katex !== 'undefined' && this.settings.useRadians) {
                try {
                    katex.render(period.display, btn, {
                        displayMode: false,
                        throwOnError: false
                    });
                } catch (e) {
                    btn.textContent = period.value;
                }
            } else {
                btn.textContent = period.display;
            }

            btn.addEventListener('click', () => {
                const periodDisplay = this.elements.constructorContainer.querySelector('.period-display[data-name="period"]');
                if (periodDisplay) {
                    periodDisplay.dataset.value = period.value;
                    periodDisplay.dataset.degrees = period.degrees;

                    // Отображаем выбранное значение с LaTeX
                    if (typeof katex !== 'undefined' && this.settings.useRadians) {
                        try {
                            periodDisplay.innerHTML = '';
                            katex.render(period.display, periodDisplay, {
                                displayMode: false,
                                throwOnError: false
                            });
                        } catch (e) {
                            periodDisplay.textContent = period.value;
                        }
                    } else {
                        periodDisplay.textContent = period.value;
                    }

                    // Подсвечиваем выбранную кнопку
                    periodButtons.querySelectorAll('.quick-select-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                }
            });

            periodButtons.appendChild(btn);
        });

        periodButtonsDiv.appendChild(periodButtons);
        this.elements.constructorContainer.appendChild(periodButtonsDiv);
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

    // Получение ответа пользователя
    getUserAnswer() {
        const coeffSelect = this.elements.constructorContainer.querySelector('[data-name="coefficient"]');
        const multiplierInput = this.elements.constructorContainer.querySelector('[data-name="multiplier"]');
        const angleDisplay = this.elements.constructorContainer.querySelector('.angle-display[data-name="baseAngle"]');
        const periodDisplay = this.elements.constructorContainer.querySelector('.period-display[data-name="period"]');

        const multiplier = multiplierInput ? multiplierInput.value.trim() : '';
        const multiplierValue = multiplier === '' || multiplier === '1' ? 1 : parseFloat(multiplier);

        return {
            coefficient: coeffSelect ? coeffSelect.value : null,
            multiplier: isNaN(multiplierValue) ? null : multiplierValue,
            baseAngleDegrees: angleDisplay ? parseFloat(angleDisplay.dataset.degrees) : null,
            periodDegrees: periodDisplay ? parseFloat(periodDisplay.dataset.degrees) : null
        };
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

        // Сравниваем с учётом того, что углы могут отличаться на период
        const angleDiff = Math.abs(totalUserAngleDegrees - expectedAngleDegrees);
        const period = correctSolution.periodDegrees;

        // Проверяем, что разница кратна периоду или близка к нулю
        const isAngleCorrect = angleDiff < 0.1 || Math.abs(angleDiff % period) < 0.1 || Math.abs((period - (angleDiff % period))) < 0.1;

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

    // Очистка полей ввода
    clearInputs() {
        const inputs = this.elements.constructorContainer.querySelectorAll('input');
        inputs.forEach(input => input.value = '');

        const selects = this.elements.constructorContainer.querySelectorAll('select');
        selects.forEach(select => select.selectedIndex = 0);

        const angleDisplay = this.elements.constructorContainer.querySelector('.angle-display');
        if (angleDisplay) {
            angleDisplay.textContent = '_';
            angleDisplay.dataset.value = '';
            angleDisplay.dataset.degrees = '';
        }

        const periodDisplay = this.elements.constructorContainer.querySelector('.period-display');
        if (periodDisplay) {
            periodDisplay.textContent = '_';
            periodDisplay.dataset.value = '';
            periodDisplay.dataset.degrees = '';
        }

        // Убираем выделение с кнопок
        const selectedBtns = this.elements.constructorContainer.querySelectorAll('.quick-select-btn.selected');
        selectedBtns.forEach(btn => btn.classList.remove('selected'));
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
        const inputs = this.elements.constructorContainer.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = true);

        const buttons = this.elements.constructorContainer.querySelectorAll('.quick-select-btn');
        buttons.forEach(btn => btn.disabled = true);

        this.elements.checkBtn.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        const inputs = this.elements.constructorContainer.querySelectorAll('input, select');
        inputs.forEach(input => input.disabled = false);

        const buttons = this.elements.constructorContainer.querySelectorAll('.quick-select-btn');
        buttons.forEach(btn => btn.disabled = false);

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
