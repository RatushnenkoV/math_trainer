// Тренажёр для процентов
class PercentagesTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerPercentagesSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            findPartOfNumber: true,
            findNumberByPart: true,
            findPercentage: true
        };

        super({
            name: 'percentages',
            generator: new PercentagesProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerPercentagesProgress'),
            settings: settings,
            storageKey: 'mathTrainerPercentagesSettings'
        });
    }

    // Проверка, выбран ли хотя бы один тип задач
    hasOperationsSelected() {
        return this.settings.findPartOfNumber ||
               this.settings.findNumberByPart ||
               this.settings.findPercentage;
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('percentages-screen'),
            backBtn: document.getElementById('percentages-back-btn'),
            settingsBtn: document.getElementById('percentages-settings-btn'),
            checkBtn: document.getElementById('percentages-check-btn'),
            settingsScreen: document.getElementById('percentages-settings-screen'),
            settingsBackBtn: document.getElementById('percentages-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('percentages-level-text'),
            progressText: document.getElementById('percentages-progress-text'),
            progressFill: document.getElementById('percentages-progress-fill'),
            resultMessage: document.getElementById('percentages-result-message'),
            problemDisplay: document.getElementById('percentages-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('percentages-answer-input')
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
            'percentages-find-part-of-number',
            'percentages-find-number-by-part',
            'percentages-find-percentage'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('percentages-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());

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
        this.elements.problemDisplay.textContent = problem.question;
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

        // Проверяем точное совпадение (все числа целые)
        const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.01;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '';
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
        this.showScreen('percentages-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('percentages-screen');
    }
}
