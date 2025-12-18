// Тренажёр тригонометрических функций
class TrigonometryTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerTrigonometrySettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            functions: {
                sin: true,
                cos: true,
                tg: true,
                ctg: true
            },
            maxQuadrant: 4,
            useRadians: false
        };

        super({
            name: 'trigonometry',
            generator: new TrigonometryProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerTrigonometryProgress'),
            settings: settings,
            storageKey: 'mathTrainerTrigonometrySettings'
        });

        this.isAnswering = false; // Флаг для предотвращения множественных кликов
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('trigonometry-screen'),
            backBtn: document.getElementById('trigonometry-back-btn'),
            settingsBtn: document.getElementById('trigonometry-settings-btn'),
            settingsScreen: document.getElementById('trigonometry-settings-screen'),
            settingsBackBtn: document.getElementById('trigonometry-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('trigonometry-level-text'),
            progressText: document.getElementById('trigonometry-progress-text'),
            progressFill: document.getElementById('trigonometry-progress-fill'),
            resultMessage: document.getElementById('trigonometry-result-message'),
            problemDisplay: document.getElementById('trigonometry-problem-display'),
            questionElem: document.getElementById('trigonometry-question'),

            // Контейнер для кнопок ответов
            answersContainer: document.getElementById('trigonometry-answers-container')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
    }

    // Инициализация обработчиков событий (переопределяем базовый метод)
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
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        // Чекбоксы для функций
        ['sin', 'cos', 'tg', 'ctg'].forEach(func => {
            const checkbox = document.getElementById(`trigonometry-${func}`);
            if (checkbox) {
                checkbox.checked = this.settings.functions[func];
                checkbox.addEventListener('change', (e) => {
                    this.settings.functions[func] = e.target.checked;
                    this.saveSettings();
                    this.updateGeneratorSettings();
                });
            }
        });

        // Слайдер для максимальной четверти
        const maxQuadrantSlider = document.getElementById('trigonometry-max-quadrant');
        const quadrantValueDisplay = document.getElementById('trigonometry-quadrant-value');

        if (maxQuadrantSlider && quadrantValueDisplay) {
            const updateSliderGradient = (value) => {
                const min = parseInt(maxQuadrantSlider.min);
                const max = parseInt(maxQuadrantSlider.max);
                const percentage = ((value - min) / (max - min)) * 100;
                maxQuadrantSlider.style.background = `linear-gradient(to right,
                    var(--tg-theme-button-color, #3390ec) 0%,
                    var(--tg-theme-button-color, #3390ec) ${percentage}%,
                    rgba(51, 144, 236, 0.3) ${percentage}%,
                    rgba(51, 144, 236, 0.3) 100%)`;
            };

            maxQuadrantSlider.value = this.settings.maxQuadrant || 4;
            quadrantValueDisplay.textContent = this.settings.maxQuadrant || 4;
            updateSliderGradient(this.settings.maxQuadrant || 4);

            maxQuadrantSlider.addEventListener('input', (e) => {
                quadrantValueDisplay.textContent = e.target.value;
                updateSliderGradient(e.target.value);
            });

            maxQuadrantSlider.addEventListener('change', (e) => {
                this.settings.maxQuadrant = parseInt(e.target.value, 10);
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        // Радио-кнопки для единиц измерения
        const degreesRadio = document.getElementById('trigonometry-degrees');
        const radiansRadio = document.getElementById('trigonometry-radians');

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
        if (problem.isLatex) {
            // Используем KaTeX для рендеринга
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
        } else {
            this.elements.questionElem.textContent = problem.question;
        }

        // Создаём кнопки с вариантами ответов
        this.createAnswerButtons(problem.allAnswers);
        this.isAnswering = false;
    }

    // Создание кнопок с вариантами ответов
    createAnswerButtons(answers) {
        this.elements.answersContainer.innerHTML = '';

        answers.forEach((answer) => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.dataset.answerKey = answer.key;

            // Рендерим LaTeX для ответа
            try {
                if (typeof katex !== 'undefined') {
                    katex.render(answer.latex, button, {
                        displayMode: false,
                        throwOnError: false
                    });
                } else {
                    button.textContent = answer.latex;
                }
            } catch (e) {
                button.textContent = answer.latex;
            }

            // При клике сразу проверяем ответ
            button.addEventListener('click', () => {
                if (!this.isAnswering) {
                    this.checkAnswer(answer);
                }
            });

            this.elements.answersContainer.appendChild(button);
        });
    }

    // Проверка ответа
    checkAnswer(selectedAnswer) {
        if (this.isAnswering) {
            return; // Предотвращаем множественные клики
        }

        this.isAnswering = true;

        if (!this.currentProblem) {
            return;
        }

        const correctAnswer = this.currentProblem.correctAnswer;

        // Сравниваем ответы
        const isCorrect = this.compareAnswers(selectedAnswer, correctAnswer);

        // Блокируем все кнопки
        this.disableInputs();

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Обработка неправильного ответа (переопределяем метод из BaseTrainer)
    handleWrongAnswer() {
        this.progressTracker.wrongAnswer();
        this.showResultMessage(false);
        this.showEmoji(false);

        setTimeout(() => {
            this.updateProgressDisplay();
            this.isAnswering = false;
            this.enableInputs();
        }, 1000);
    }

    // Переопределяем обработку правильного ответа для сброса флага
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

    // Сравнение ответов
    compareAnswers(answer1, answer2) {
        // Если оба ответа undefined
        if (answer1.value === null && answer2.value === null) {
            return true;
        }

        // Если один undefined, а другой нет
        if (answer1.value === null || answer2.value === null) {
            return false;
        }

        // Сравниваем числовые значения с небольшой погрешностью
        return Math.abs(answer1.value - answer2.value) < 0.0001;
    }

    // Очистка полей ввода
    clearInputs() {
        // Ничего не делаем, так как нет полей для очистки
    }

    // Скрыть сообщение об отсутствии уровней сложности
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="trigonometry-question-container">
                <div id="trigonometry-question" class="trigonometry-question"></div>
            </div>
        `;
        // Обновляем ссылку на элемент после пересоздания HTML
        this.elements.questionElem = document.getElementById('trigonometry-question');
    }

    // Показать сообщение об отсутствии уровней сложности
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<div class="no-operations-message">Не выбрана ни одна функция 😢</div>';
    }

    // Отключить поля ввода
    disableInputs() {
        const allButtons = this.elements.answersContainer.querySelectorAll('.answer-button');
        allButtons.forEach(btn => btn.disabled = true);
    }

    // Включить поля ввода
    enableInputs() {
        const allButtons = this.elements.answersContainer.querySelectorAll('.answer-button');
        allButtons.forEach(btn => btn.disabled = false);
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('trigonometry-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('trigonometry-screen');
    }
}
