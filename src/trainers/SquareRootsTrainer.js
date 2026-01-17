// Тренажёр корней
class SquareRootsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerSquareRootsSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            maxRoot: 10
        };

        super({
            name: 'square-roots',
            generator: new SquareRootsGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerSquareRootsProgress'),
            settings: settings,
            storageKey: 'mathTrainerSquareRootsSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('square-roots-screen'),
            backBtn: document.getElementById('square-roots-back-btn'),
            settingsBtn: document.getElementById('square-roots-settings-btn'),
            checkBtn: document.getElementById('square-roots-check-btn'),
            settingsScreen: document.getElementById('square-roots-settings-screen'),
            settingsBackBtn: document.getElementById('square-roots-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('square-roots-level-text'),
            progressText: document.getElementById('square-roots-progress-text'),
            progressFill: document.getElementById('square-roots-progress-fill'),
            resultMessage: document.getElementById('square-roots-result-message'),
            problemDisplay: document.getElementById('square-roots-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('square-roots-answer-input')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
        this.initShareModalHandlers();
    }

    // Инициализация обработчиков событий (переопределяем, чтобы добавить shareBtn)
    initEventHandlers() {
        // Вызываем базовый метод
        super.initEventHandlers();

        // Добавляем ссылку на кнопку "Поделиться"
        this.elements.shareBtn = document.getElementById('square-roots-share-btn');
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
        // Слайдер для максимального корня
        const maxRootSlider = document.getElementById('square-roots-max-root');
        const maxValueDisplay = document.getElementById('square-roots-max-value');

        if (maxRootSlider && maxValueDisplay) {
            const updateSliderGradient = (value) => {
                const min = parseInt(maxRootSlider.min);
                const max = parseInt(maxRootSlider.max);
                const percentage = ((value - min) / (max - min)) * 100;
                maxRootSlider.style.background = `linear-gradient(to right,
                    var(--tg-theme-button-color, #3390ec) 0%,
                    var(--tg-theme-button-color, #3390ec) ${percentage}%,
                    rgba(51, 144, 236, 0.3) ${percentage}%,
                    rgba(51, 144, 236, 0.3) 100%)`;
            };

            maxRootSlider.value = this.settings.maxRoot || 10;
            maxValueDisplay.textContent = this.settings.maxRoot || 10;
            updateSliderGradient(this.settings.maxRoot || 10);

            maxRootSlider.addEventListener('input', (e) => {
                maxValueDisplay.textContent = e.target.value;
                updateSliderGradient(e.target.value);
            });

            maxRootSlider.addEventListener('change', (e) => {
                this.settings.maxRoot = parseInt(e.target.value, 10);
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
    }

    // Проверка, есть ли валидные настройки
    hasOperationsSelected() {
        return true; // Всегда можно генерировать задачи
    }

    // Отображение примера
    displayProblem(problem) {
        const numberElem = document.getElementById('square-roots-number');
        katex.render("\\sqrt{" + problem.number + "}", numberElem, {
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

    // Показать сообщение об отсутствии операций
    showNoOperationsMessage() {
        // Не используется для корней
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        // Не используется для корней
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
        this.showScreen('square-roots-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('square-roots-screen');
    }
}
