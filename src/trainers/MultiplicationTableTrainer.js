// Тренажёр таблицы умножения
class MultiplicationTableTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerMultiplicationTableSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            tables: [2, 3, 4, 5, 6, 7, 8, 9],
            maxMultiplier: 10,
            reverse: true
        };

        super({
            name: 'multiplication-table',
            generator: new MultiplicationTableGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerMultiplicationTableProgress'),
            settings: settings,
            storageKey: 'mathTrainerMultiplicationTableSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('multiplication-table-screen'),
            backBtn: document.getElementById('multiplication-table-back-btn'),
            settingsBtn: document.getElementById('multiplication-table-settings-btn'),
            checkBtn: document.getElementById('multiplication-table-check-btn'),
            settingsScreen: document.getElementById('multiplication-table-settings-screen'),
            settingsBackBtn: document.getElementById('multiplication-table-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('multiplication-table-level-text'),
            progressText: document.getElementById('multiplication-table-progress-text'),
            progressFill: document.getElementById('multiplication-table-progress-fill'),
            resultMessage: document.getElementById('multiplication-table-result-message'),
            problemDisplay: document.getElementById('multiplication-table-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('multiplication-table-answer-input')
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
        // Чекбоксы для таблиц умножения (2-9)
        for (let i = 2; i <= 9; i++) {
            const checkbox = document.getElementById(`multiplication-table-${i}`);
            if (checkbox) {
                // Загрузка текущих настроек
                checkbox.checked = this.settings.tables.includes(i);

                // Обработка изменений
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        // Добавляем таблицу, если её нет
                        if (!this.settings.tables.includes(i)) {
                            this.settings.tables.push(i);
                            this.settings.tables.sort((a, b) => a - b);
                        }
                    } else {
                        // Удаляем таблицу
                        this.settings.tables = this.settings.tables.filter(t => t !== i);
                    }
                    this.saveSettings();
                    this.updateGeneratorSettings();
                });
            }
        }

        // Чекбокс для обратного порядка
        const reverseCheckbox = document.getElementById('multiplication-table-reverse');
        if (reverseCheckbox) {
            reverseCheckbox.checked = this.settings.reverse;
            reverseCheckbox.addEventListener('change', (e) => {
                this.settings.reverse = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        // Слайдер для максимального множителя
        const maxMultiplierSlider = document.getElementById('multiplication-table-max-multiplier');
        const maxValueDisplay = document.getElementById('multiplication-table-max-value');

        if (maxMultiplierSlider && maxValueDisplay) {
            const updateSliderGradient = (value) => {
                const min = parseInt(maxMultiplierSlider.min);
                const max = parseInt(maxMultiplierSlider.max);
                const percentage = ((value - min) / (max - min)) * 100;
                maxMultiplierSlider.style.background = `linear-gradient(to right,
                    var(--tg-theme-button-color, #3390ec) 0%,
                    var(--tg-theme-button-color, #3390ec) ${percentage}%,
                    rgba(51, 144, 236, 0.3) ${percentage}%,
                    rgba(51, 144, 236, 0.3) 100%)`;
            };

            maxMultiplierSlider.value = this.settings.maxMultiplier || 10;
            maxValueDisplay.textContent = this.settings.maxMultiplier || 10;
            updateSliderGradient(this.settings.maxMultiplier || 10);

            maxMultiplierSlider.addEventListener('input', (e) => {
                maxValueDisplay.textContent = e.target.value;
                updateSliderGradient(e.target.value);
            });

            maxMultiplierSlider.addEventListener('change', (e) => {
                this.settings.maxMultiplier = parseInt(e.target.value, 10);
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
    }

    // Проверка, выбрана ли хотя бы одна таблица
    hasOperationsSelected() {
        return this.settings.tables && this.settings.tables.length > 0;
    }

    // Отображение примера
    displayProblem(problem) {
        const num1Elem = document.getElementById('multiplication-table-num1');
        const operatorElem = document.getElementById('multiplication-table-operator');
        const num2Elem = document.getElementById('multiplication-table-num2');

        num1Elem.textContent = problem.num1;
        operatorElem.textContent = problem.operation;
        num2Elem.textContent = problem.num2;
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
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Не выбрана ни одна таблица умножения в настройках 😢</span>';
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <span class="number-display" id="multiplication-table-num1"></span>
            <span class="operator" id="multiplication-table-operator"></span>
            <span class="number-display" id="multiplication-table-num2"></span>
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
        this.showScreen('multiplication-table-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('multiplication-table-screen');
    }
}
