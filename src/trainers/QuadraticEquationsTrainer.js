// Тренажёр для решения квадратных уравнений
class QuadraticEquationsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerQuadraticEquationsSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            nonStandardForm: false,
            aEqualsOne: false
        };

        super({
            name: 'quadratic-equations',
            generator: new QuadraticEquationsProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerQuadraticEquationsProgress'),
            settings: settings,
            storageKey: 'mathTrainerQuadraticEquationsSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('quadratic-equations-screen'),
            backBtn: document.getElementById('quadratic-equations-back-btn'),
            settingsBtn: document.getElementById('quadratic-equations-settings-btn'),
            settingsScreen: document.getElementById('quadratic-equations-settings-screen'),
            settingsBackBtn: document.getElementById('quadratic-equations-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('quadratic-equations-level-text'),
            progressText: document.getElementById('quadratic-equations-progress-text'),
            progressFill: document.getElementById('quadratic-equations-progress-fill'),
            resultMessage: document.getElementById('quadratic-equations-result-message'),
            problemDisplay: document.getElementById('quadratic-equations-problem-display'),

            // Поля ввода ответа
            x1Input: document.getElementById('quadratic-equations-x1-input'),
            x2Input: document.getElementById('quadratic-equations-x2-input'),
            checkBtn: document.getElementById('quadratic-equations-check-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
    }

    // Инициализация обработчиков для полей ввода
    initInputHandlers() {
        // Обработка Enter в полях ввода
        [this.elements.x1Input, this.elements.x2Input].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
        });

        // Автофокус на первое поле ввода
        this.elements.x1Input.focus();
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const nonStandardElement = document.getElementById('quadratic-equations-non-standard');
        const aEqualsOneElement = document.getElementById('quadratic-equations-a-equals-one');

        // Загрузка текущих настроек
        nonStandardElement.checked = this.settings.nonStandardForm;
        aEqualsOneElement.checked = this.settings.aEqualsOne;

        // Обработка изменений
        nonStandardElement.addEventListener('change', (e) => {
            this.settings.nonStandardForm = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        aEqualsOneElement.addEventListener('change', (e) => {
            this.settings.aEqualsOne = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });
    }

    // Проверка, выбран ли хотя бы один уровень сложности (всегда true для квадратных уравнений)
    hasOperationsSelected() {
        return true;
    }

    // Отображение уравнения
    displayProblem(problem) {
        const equationElem = document.getElementById('quadratic-equations-equation');

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
        this.elements.x1Input.focus();
    }

    // Проверка ответа
    checkAnswer() {
        const x1Input = this.elements.x1Input.value.trim();
        const x2Input = this.elements.x2Input.value.trim();

        // Проверяем, что ответы введены
        if (x1Input === '' || x2Input === '') {
            return;
        }

        // Парсим ответы пользователя
        const userX1 = this.parseAnswer(x1Input);
        const userX2 = this.parseAnswer(x2Input);

        if (userX1 === null || userX2 === null) {
            // Неверный формат ответа
            this.showInvalidFormatMessage();
            return;
        }

        const correctX1 = this.currentProblem.solution.x1;
        const correctX2 = this.currentProblem.solution.x2;

        // Отладочный вывод
        console.log('Введённые корни:', userX1, userX2);
        console.log('Правильные корни:', correctX1, correctX2);

        // Проверяем совпадение (с небольшой погрешностью для дробных чисел)
        // Корни могут быть введены в любом порядке
        const isCorrectOrder1 = Math.abs(userX1 - correctX1) < 0.01 && Math.abs(userX2 - correctX2) < 0.01;
        const isCorrectOrder2 = Math.abs(userX1 - correctX2) < 0.01 && Math.abs(userX2 - correctX1) < 0.01;

        if (isCorrectOrder1 || isCorrectOrder2) {
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
        this.elements.x1Input.value = '';
        this.elements.x2Input.value = '';
        this.elements.x1Input.focus();
    }

    // Скрыть сообщение об отсутствии уровней сложности
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="quadratic-equations-equation-container">
                <div id="quadratic-equations-equation" class="quadratic-equations-equation"></div>
            </div>
        `;
    }

    // Показать сообщение об отсутствии уровней сложности (не используется для квадратных уравнений)
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<div class="no-operations-message">Не выбран ни один уровень сложности 😢</div>';
    }

    // Отключить поля ввода
    disableInputs() {
        this.elements.x1Input.disabled = true;
        this.elements.x2Input.disabled = true;
        this.elements.checkBtn.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        this.elements.x1Input.disabled = false;
        this.elements.x2Input.disabled = false;
        this.elements.checkBtn.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('quadratic-equations-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('quadratic-equations-screen');
    }
}
