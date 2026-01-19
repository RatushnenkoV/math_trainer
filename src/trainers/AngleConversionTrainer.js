// Тренажёр перевода градусов в радианы и обратно
class AngleConversionTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerAngleConversionSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            conversionTypes: {
                degreesToRadians: true,
                radiansToDegrees: true
            },
            includeNonTabular: false
        };

        super({
            name: 'angle-conversion',
            generator: new AngleConversionProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerAngleConversionProgress'),
            settings: settings,
            storageKey: 'mathTrainerAngleConversionSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('angle-conversion-screen'),
            backBtn: document.getElementById('angle-conversion-back-btn'),
            settingsBtn: document.getElementById('angle-conversion-settings-btn'),
            checkBtn: document.getElementById('angle-conversion-check-btn'),
            settingsScreen: document.getElementById('angle-conversion-settings-screen'),
            settingsBackBtn: document.getElementById('angle-conversion-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('angle-conversion-level-text'),
            progressText: document.getElementById('angle-conversion-progress-text'),
            progressFill: document.getElementById('angle-conversion-progress-fill'),
            resultMessage: document.getElementById('angle-conversion-result-message'),
            problemDisplay: document.getElementById('angle-conversion-problem-display'),
            questionElem: document.getElementById('angle-conversion-question'),

            // Контейнер для полей ввода
            answerInput: document.getElementById('angle-conversion-answer-input'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('angle-conversion-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initShareModalHandlers();
    }

    // Инициализация обработчиков событий
    initEventHandlers() {
        // Вызываем базовый метод для инициализации кнопки "Поделиться"
        super.initEventHandlers();

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

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        // Чекбоксы для типов конверсии
        ['degreesToRadians', 'radiansToDegrees'].forEach(type => {
            const checkbox = document.getElementById(`angle-conversion-${type}`);
            if (checkbox) {
                checkbox.checked = this.settings.conversionTypes[type];
                checkbox.addEventListener('change', (e) => {
                    this.settings.conversionTypes[type] = e.target.checked;
                    this.saveSettings();
                    this.updateGeneratorSettings();
                });
            }
        });

        // Чекбокс для нетабличных значений
        const includeNonTabularCheckbox = document.getElementById('angle-conversion-include-non-tabular');
        if (includeNonTabularCheckbox) {
            includeNonTabularCheckbox.checked = this.settings.includeNonTabular;
            includeNonTabularCheckbox.addEventListener('change', (e) => {
                this.settings.includeNonTabular = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
    }

    // Проверка, выбран ли хотя бы один тип конверсии
    hasOperationsSelected() {
        return Object.values(this.settings.conversionTypes).some(val => val);
    }

    // Отображение задачи
    displayProblem(problem) {
        // Рендерим вопрос
        this.elements.questionElem.innerHTML = '';
        try {
            if (typeof katex !== 'undefined') {
                katex.render(problem.question, this.elements.questionElem, {
                    displayMode: true,
                    throwOnError: false
                });
            } else {
                this.elements.questionElem.textContent = problem.question;
            }
        } catch (e) {
            this.elements.questionElem.textContent = problem.question;
        }

        // Создаём поля ввода в зависимости от типа задачи
        this.createInputFields(problem.conversionType);
    }

    // Создание полей ввода
    createInputFields(conversionType) {
        this.elements.answerInput.innerHTML = '';

        if (conversionType === 'degreesToRadians') {
            // Градусы → Радианы: дробь + π
            this.elements.answerInput.innerHTML = `
                <div class="fraction-input-with-pi">
                    <div class="fraction-input">
                        <div class="input-group">
                            <input type="number" id="angle-conversion-numerator" placeholder="0" required>
                        </div>
                        <div class="fraction-line"></div>
                        <div class="input-group">
                            <input type="number" id="angle-conversion-denominator" placeholder="1" required>
                        </div>
                    </div>
                    <div class="pi-symbol" id="angle-conversion-pi"></div>
                </div>
            `;

            // Рендерим π в отдельном div
            const piSymbol = document.getElementById('angle-conversion-pi');
            if (piSymbol && typeof katex !== 'undefined') {
                katex.render('\\pi', piSymbol, {
                    displayMode: false,
                    throwOnError: false
                });
            }

            // Добавляем обработчики Enter
            const numerator = document.getElementById('angle-conversion-numerator');
            const denominator = document.getElementById('angle-conversion-denominator');

            numerator.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    denominator.focus();
                }
            });

            denominator.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });

            // Фокусируемся на первом поле
            numerator.focus();
        } else {
            // Радианы → Градусы: число + символ градусов
            this.elements.answerInput.innerHTML = `
                <div class="input-with-degrees">
                    <div class="input-group">
                        <input type="number" id="angle-conversion-degrees" placeholder="0" required>
                    </div>
                    <div class="degree-symbol" id="angle-conversion-degree-symbol"></div>
                </div>
            `;

            // Рендерим символ градусов
            const degreeSymbol = document.getElementById('angle-conversion-degree-symbol');
            if (degreeSymbol && typeof katex !== 'undefined') {
                katex.render('^\\circ', degreeSymbol, {
                    displayMode: false,
                    throwOnError: false
                });
            }

            const degreesInput = document.getElementById('angle-conversion-degrees');
            degreesInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });

            degreesInput.focus();
        }
    }

    // Проверка ответа
    checkAnswer() {
        if (!this.currentProblem) {
            return;
        }

        const correctAnswer = this.currentProblem.correctAnswer;
        let isCorrect = false;

        if (this.currentProblem.conversionType === 'degreesToRadians') {
            // Проверка дроби
            const numeratorInput = document.getElementById('angle-conversion-numerator');
            const denominatorInput = document.getElementById('angle-conversion-denominator');

            const userNumerator = parseInt(numeratorInput.value, 10);
            const userDenominator = parseInt(denominatorInput.value, 10);

            // Проверяем, что поля заполнены
            if (isNaN(userNumerator) || isNaN(userDenominator) || userDenominator === 0) {
                return;
            }

            // Упрощаем пользовательскую дробь
            const gcd = this.gcd(Math.abs(userNumerator), Math.abs(userDenominator));
            const simplifiedUserNum = userNumerator / gcd;
            const simplifiedUserDen = userDenominator / gcd;

            // Сравниваем с правильным ответом
            isCorrect = (simplifiedUserNum === correctAnswer.numerator &&
                        simplifiedUserDen === correctAnswer.denominator);
        } else {
            // Проверка градусов
            const degreesInput = document.getElementById('angle-conversion-degrees');
            const userDegrees = parseInt(degreesInput.value, 10);

            if (isNaN(userDegrees)) {
                return;
            }

            isCorrect = (userDegrees === correctAnswer.degrees);
        }

        // Блокируем кнопку и поля
        this.disableInputs();

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // НОД для упрощения дробей
    gcd(a, b) {
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    // Обработка неправильного ответа
    handleWrongAnswer() {
        this.progressTracker.wrongAnswer();
        this.showResultMessage(false);
        this.showEmoji(false);

        setTimeout(() => {
            this.updateProgressDisplay();
            this.enableInputs();
            this.clearInputs();
        }, 1000);
    }

    // Обработка правильного ответа
    handleCorrectAnswer() {
        const result = this.progressTracker.correctAnswer();
        this.showResultMessage(true);
        this.showEmoji(true);

        if (result.levelUp) {
            setTimeout(() => {
                alert(`Поздравляем! Вы перешли на ${result.newLevel} уровень!`);
            }, 500);
        }

        setTimeout(() => {
            this.generateNewProblem();
            this.updateProgressDisplay();
        }, 1000);
    }

    // Очистка полей ввода
    clearInputs() {
        if (this.currentProblem.conversionType === 'degreesToRadians') {
            const numerator = document.getElementById('angle-conversion-numerator');
            const denominator = document.getElementById('angle-conversion-denominator');
            if (numerator) {
                numerator.value = '';
                numerator.focus();
            }
            if (denominator) denominator.value = '';
        } else {
            const degrees = document.getElementById('angle-conversion-degrees');
            if (degrees) {
                degrees.value = '';
                degrees.focus();
            }
        }
    }

    // Скрыть сообщение об отсутствии типов конверсии
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="angle-conversion-question-container">
                <div id="angle-conversion-question" class="angle-conversion-question"></div>
            </div>
        `;
        // Обновляем ссылку на элемент после пересоздания HTML
        this.elements.questionElem = document.getElementById('angle-conversion-question');
    }

    // Показать сообщение об отсутствии типов конверсии
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<div class="no-operations-message">Не выбран ни один тип конверсии 😢</div>';
    }

    // Отключить поля ввода
    disableInputs() {
        this.elements.checkBtn.disabled = true;
        const inputs = this.elements.answerInput.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);
    }

    // Включить поля ввода
    enableInputs() {
        this.elements.checkBtn.disabled = false;
        const inputs = this.elements.answerInput.querySelectorAll('input');
        inputs.forEach(input => input.disabled = false);
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('angle-conversion-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('angle-conversion-screen');
    }
}
