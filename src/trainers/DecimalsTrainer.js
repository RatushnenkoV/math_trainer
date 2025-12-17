// Тренажёр для десятичных дробей
class DecimalsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerDecimalSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
            negativeNumbers: false
        };

        super({
            name: 'decimals',
            generator: new DecimalProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerDecimalProgress'),
            settings: settings,
            storageKey: 'mathTrainerDecimalSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('decimals-screen'),
            backBtn: document.getElementById('decimals-back-btn'),
            settingsBtn: document.getElementById('decimals-settings-btn'),
            checkBtn: document.getElementById('decimals-check-btn'),
            settingsScreen: document.getElementById('decimals-settings-screen'),
            settingsBackBtn: document.getElementById('decimals-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('decimals-level-text'),
            progressText: document.getElementById('decimals-progress-text'),
            progressFill: document.getElementById('decimals-progress-fill'),
            resultMessage: document.getElementById('decimals-result-message'),
            problemDisplay: document.getElementById('decimals-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('decimal-answer-input')
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
        const settingIds = [
            'decimals-addition', 'decimals-subtraction', 'decimals-multiplication',
            'decimals-division', 'decimals-negative-numbers'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('decimals-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());

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

    // Отображение примера
    displayProblem(problem) {
        document.getElementById('decimal1').textContent = problem.num1;
        document.getElementById('decimals-operator').textContent = problem.operation;

        // Если второе число отрицательное, берём его в скобки
        const num2Text = problem.num2 < 0 ? `(${problem.num2})` : problem.num2;
        document.getElementById('decimal2').textContent = num2Text;
    }

    // Очистка полей ввода
    clearInputs() {
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
    }

    // Валидация ответа
    validateAnswer() {
        const input = this.elements.answerInput.value.trim();

        if (input === '' || input === '-') {
            this.elements.checkBtn.disabled = true;
        } else {
            this.elements.checkBtn.disabled = false;
        }
    }

    // Проверка ответа
    checkAnswer() {
        const input = this.elements.answerInput.value.trim();

        // Заменяем запятую на точку для парсинга
        const normalizedInput = input.replace(',', '.');

        // Парсим ответ пользователя
        const userAnswer = parseFloat(normalizedInput);

        if (isNaN(userAnswer)) {
            this.handleWrongAnswer();
            return;
        }

        const correctAnswer = this.currentProblem.result;

        // Проверяем с учетом погрешности для десятичных дробей
        const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.001;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <span class="decimal-display" id="decimal1"></span>
            <span class="operator" id="decimals-operator"></span>
            <span class="decimal-display" id="decimal2"></span>
            <span class="equals">=</span>
            <span class="question">?</span>
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
        this.showScreen('decimals-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('decimals-screen');
    }
}
