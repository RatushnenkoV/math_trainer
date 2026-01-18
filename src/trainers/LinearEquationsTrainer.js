// Тренажёр для решения линейных уравнений
class LinearEquationsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerLinearEquationsSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            basic: true,
            easy: true,
            medium: true,
            hard: false
        };

        super({
            name: 'linear-equations',
            generator: new LinearEquationsProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerLinearEquationsProgress'),
            settings: settings,
            storageKey: 'mathTrainerLinearEquationsSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('linear-equations-screen'),
            backBtn: document.getElementById('linear-equations-back-btn'),
            settingsBtn: document.getElementById('linear-equations-settings-btn'),
            settingsScreen: document.getElementById('linear-equations-settings-screen'),
            settingsBackBtn: document.getElementById('linear-equations-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('linear-equations-level-text'),
            progressText: document.getElementById('linear-equations-progress-text'),
            progressFill: document.getElementById('linear-equations-progress-fill'),
            resultMessage: document.getElementById('linear-equations-result-message'),
            problemDisplay: document.getElementById('linear-equations-problem-display'),

            // Поле ввода ответа
            answerInput: document.getElementById('linear-equations-answer-input'),
            checkBtn: document.getElementById('linear-equations-check-btn'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('linear-equations-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
        this.initShareModalHandlers();
    }

    // Инициализация обработчиков для полей ввода
    initInputHandlers() {
        // Обработка Enter в поле ввода
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Автофокус на поле ввода
        this.elements.answerInput.focus();
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = [
            'linear-equations-basic',
            'linear-equations-easy',
            'linear-equations-medium',
            'linear-equations-hard'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('linear-equations-', '');

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

    // Проверка, выбран ли хотя бы один уровень сложности
    hasOperationsSelected() {
        return this.settings.basic || this.settings.easy ||
               this.settings.medium || this.settings.hard;
    }

    // Отображение уравнения
    displayProblem(problem) {
        const equationElem = document.getElementById('linear-equations-equation');

        if (problem.isLatex) {
            // Если уравнение содержит LaTeX, используем KaTeX для рендеринга
            equationElem.innerHTML = '';
            try {
                katex.render(problem.equation, equationElem, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                equationElem.textContent = problem.equation;
            }
        } else {
            // Обычный текст
            equationElem.textContent = problem.equation;
        }

        // Автофокус на поле ввода
        this.elements.answerInput.focus();
    }

    // Проверка ответа
    checkAnswer() {
        const userAnswer = this.elements.answerInput.value.trim();

        // Проверяем, что ответ введён
        if (userAnswer === '') {
            return;
        }

        // Парсим ответ пользователя
        const parsedAnswer = this.parseAnswer(userAnswer);
        if (parsedAnswer === null) {
            // Неверный формат ответа
            this.showInvalidFormatMessage();
            return;
        }

        const correctAnswer = this.currentProblem.solution;

        // Отладочный вывод
        console.log('Введённый ответ:', userAnswer);
        console.log('Распознанный ответ:', parsedAnswer);
        console.log('Правильный ответ:', correctAnswer);
        console.log('Разница:', Math.abs(parsedAnswer - correctAnswer));

        // Проверяем совпадение (с небольшой погрешностью для дробных чисел)
        const isCorrect = Math.abs(parsedAnswer - correctAnswer) < 0.0001;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Парсинг ответа пользователя
    parseAnswer(answer) {
        // Убираем пробелы
        answer = answer.replace(/\s/g, '');

        // Поддержка различных форматов:
        // 1. Целое число: "5", "-3"
        // 2. Десятичная дробь: "2.5", "-1.75"
        // 3. Обычная дробь: "3/4", "-2/3"
        // 4. Смешанная дробь: "1 1/2", "2_3/4" (с пробелом или подчёркиванием)

        // Проверка на смешанную дробь (с пробелом или подчёркиванием)
        const mixedMatch = answer.match(/^(-?\d+)[_\s](\d+)\/(\d+)$/);
        if (mixedMatch) {
            const whole = parseInt(mixedMatch[1]);
            const numerator = parseInt(mixedMatch[2]);
            const denominator = parseInt(mixedMatch[3]);
            if (denominator === 0) return null;
            const sign = whole < 0 ? -1 : 1;
            return whole + sign * (numerator / denominator);
        }

        // Проверка на обычную дробь
        const fractionMatch = answer.match(/^(-?\d+)\/(\d+)$/);
        if (fractionMatch) {
            const numerator = parseInt(fractionMatch[1]);
            const denominator = parseInt(fractionMatch[2]);
            if (denominator === 0) return null;
            return numerator / denominator;
        }

        // Проверка на целое или десятичное число
        const numberMatch = answer.match(/^-?\d+\.?\d*$/);
        if (numberMatch) {
            return parseFloat(answer);
        }

        return null;
    }

    // Показать сообщение о неверном формате
    showInvalidFormatMessage() {
        const messageElement = this.elements.resultMessage;
        messageElement.textContent = 'Неверный формат ответа';
        messageElement.className = 'result-message wrong show';

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 1000);
    }

    // Очистка полей ввода
    clearInputs() {
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
    }

    // Скрыть сообщение об отсутствии уровней сложности
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="linear-equations-equation-container">
                <div id="linear-equations-equation" class="linear-equations-equation"></div>
            </div>
        `;
    }

    // Показать сообщение об отсутствии уровней сложности
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<div class="no-operations-message">Не выбран ни один уровень сложности 😢</div>';
    }

    // Отключить поля ввода
    disableInputs() {
        this.elements.answerInput.disabled = true;
        this.elements.checkBtn.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        this.elements.answerInput.disabled = false;
        this.elements.checkBtn.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('linear-equations-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('linear-equations-screen');
    }
}
