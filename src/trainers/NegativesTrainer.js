// Тренажёр для отрицательных чисел
class NegativesTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerNegativeSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false
        };

        super({
            name: 'negatives',
            generator: new NegativeProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerNegativeProgress'),
            settings: settings,
            storageKey: 'mathTrainerNegativeSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('negatives-screen'),
            backBtn: document.getElementById('negatives-back-btn'),
            settingsBtn: document.getElementById('negatives-settings-btn'),
            checkBtn: document.getElementById('negatives-check-btn'),
            settingsScreen: document.getElementById('negatives-settings-screen'),
            settingsBackBtn: document.getElementById('negatives-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('negatives-level-text'),
            progressText: document.getElementById('negatives-progress-text'),
            progressFill: document.getElementById('negatives-progress-fill'),
            resultMessage: document.getElementById('negatives-result-message'),
            problemDisplay: document.getElementById('negatives-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('negative-answer-input'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('negatives-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
        this.initShareModalHandlers();
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
            'negatives-addition', 'negatives-subtraction',
            'negatives-multiplication', 'negatives-division'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('negatives-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());

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
        const num1Elem = document.getElementById('negative1');
        const operatorElem = document.getElementById('negatives-operator');
        const num2Elem = document.getElementById('negative2');

        // Первое число пишем как есть
        num1Elem.textContent = problem.num1;
        operatorElem.textContent = problem.operation;
        // Второе число берём в скобки, если оно отрицательное
        num2Elem.textContent = problem.num2 < 0 ? `(${problem.num2})` : problem.num2;
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

        // Парсим ответ пользователя
        const userAnswer = parseInt(input, 10);

        if (isNaN(userAnswer)) {
            this.handleWrongAnswer();
            return;
        }

        const correctAnswer = this.currentProblem.result;

        // Проверяем точное совпадение
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <span class="negative-display" id="negative1"></span>
            <span class="operator" id="negatives-operator"></span>
            <span class="negative-display" id="negative2"></span>
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
        this.showScreen('negatives-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('negatives-screen');
    }
}
