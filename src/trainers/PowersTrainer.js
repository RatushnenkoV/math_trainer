// Тренажёр степеней
class PowersTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerPowersSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            multiplication: true,
            division: true,
            power: true,
            negativeExponents: false
        };

        super({
            name: 'powers',
            generator: new PowersGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerPowersProgress'),
            settings: settings,
            storageKey: 'mathTrainerPowersSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('powers-screen'),
            backBtn: document.getElementById('powers-back-btn'),
            settingsBtn: document.getElementById('powers-settings-btn'),
            checkBtn: document.getElementById('powers-check-btn'),
            settingsScreen: document.getElementById('powers-settings-screen'),
            settingsBackBtn: document.getElementById('powers-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('powers-level-text'),
            progressText: document.getElementById('powers-progress-text'),
            progressFill: document.getElementById('powers-progress-fill'),
            resultMessage: document.getElementById('powers-result-message'),
            problemDisplay: document.getElementById('powers-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('powers-answer-input')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
    }

    // Инициализация обработчиков для полей ввода
    initInputHandlers() {
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        this.elements.answerInput.addEventListener('input', () => this.validateAnswer());
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        // Чекбоксы для операций
        const multiplicationCheckbox = document.getElementById('powers-multiplication');
        const divisionCheckbox = document.getElementById('powers-division');
        const powerCheckbox = document.getElementById('powers-power');
        const negativeExponentsCheckbox = document.getElementById('powers-negative-exponents');

        if (multiplicationCheckbox) {
            multiplicationCheckbox.checked = this.settings.multiplication;
            multiplicationCheckbox.addEventListener('change', (e) => {
                this.settings.multiplication = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (divisionCheckbox) {
            divisionCheckbox.checked = this.settings.division;
            divisionCheckbox.addEventListener('change', (e) => {
                this.settings.division = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (powerCheckbox) {
            powerCheckbox.checked = this.settings.power;
            powerCheckbox.addEventListener('change', (e) => {
                this.settings.power = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (negativeExponentsCheckbox) {
            negativeExponentsCheckbox.checked = this.settings.negativeExponents;
            negativeExponentsCheckbox.addEventListener('change', (e) => {
                this.settings.negativeExponents = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
    }

    // Проверка, есть ли валидные настройки
    hasOperationsSelected() {
        return this.settings.multiplication || this.settings.division || this.settings.power;
    }

    // Отображение примера
    displayProblem(problem) {
        const expressionElem = document.getElementById('powers-expression');
        const tex = problem.expression.texWithAnswer();
        katex.render(tex, expressionElem, {
            displayMode: true,
            throwOnError: false
        });
    }

    // Очистка полей ввода
    clearInputs() {
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
    }

    // Валидация ответа
    validateAnswer() {
        const input = this.elements.answerInput.value.trim();

        if (input === '') {
            this.elements.checkBtn.disabled = true;
        } else {
            this.elements.checkBtn.disabled = false;
        }
    }

    // Проверка ответа
    checkAnswer() {
        let input = this.elements.answerInput.value.trim();

        // Заменяем запятую на точку для корректного парсинга
        input = input.replace(',', '.');

        // Парсим ответ пользователя
        let userAnswer;

        // Поддержка дробей (например, "1/2")
        if (input.includes('/')) {
            const parts = input.split('/');
            if (parts.length === 2) {
                const numerator = parseFloat(parts[0]);
                const denominator = parseFloat(parts[1]);
                if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                    userAnswer = numerator / denominator;
                }
            }
        } else {
            userAnswer = parseFloat(input);
        }

        if (isNaN(userAnswer)) {
            this.handleWrongAnswer();
            return;
        }

        // Вычисляем правильный ответ через evaluate()
        const correctAnswer = this.currentProblem.result.evaluate();

        // Отладочная информация
        console.log('Пользователь ввёл:', userAnswer);
        console.log('Правильный ответ:', correctAnswer);
        console.log('Основание:', this.currentProblem.base);

        // Проверяем с учётом погрешности для дробей
        const epsilon = 0.0001;
        const isCorrect = Math.abs(userAnswer - correctAnswer) < epsilon;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Показать сообщение об отсутствии операций
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Не выбрано ни одного типа операций в настройках 😢</span>';
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <span class="expression-display" id="powers-expression"></span>
        `;
    }

    // Отключить поля ввода
    disableInputs() {
        super.disableInputs();
        this.elements.answerInput.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        super.enableInputs();
        this.elements.answerInput.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('powers-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('powers-screen');
    }
}
