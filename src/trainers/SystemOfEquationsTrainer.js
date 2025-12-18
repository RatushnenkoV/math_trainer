// Тренажёр для решения систем линейных уравнений
class SystemOfEquationsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerSystemOfEquationsSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            standardForm: true,
            nonStandardForm: false
        };

        super({
            name: 'system-of-equations',
            generator: new SystemOfEquationsProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerSystemOfEquationsProgress'),
            settings: settings,
            storageKey: 'mathTrainerSystemOfEquationsSettings'
        });
    }

    // Проверка, выбран ли хотя бы один тип задач
    hasOperationsSelected() {
        return this.settings.standardForm || this.settings.nonStandardForm;
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('system-of-equations-screen'),
            backBtn: document.getElementById('system-of-equations-back-btn'),
            settingsBtn: document.getElementById('system-of-equations-settings-btn'),
            settingsScreen: document.getElementById('system-of-equations-settings-screen'),
            settingsBackBtn: document.getElementById('system-of-equations-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('system-of-equations-level-text'),
            progressText: document.getElementById('system-of-equations-progress-text'),
            progressFill: document.getElementById('system-of-equations-progress-fill'),
            resultMessage: document.getElementById('system-of-equations-result-message'),
            problemDisplay: document.getElementById('system-of-equations-problem-display'),

            // Поля ввода ответов
            answerXInput: document.getElementById('system-of-equations-answer-x'),
            answerYInput: document.getElementById('system-of-equations-answer-y'),
            checkBtn: document.getElementById('system-of-equations-check-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
    }

    // Инициализация обработчиков для полей ввода
    initInputHandlers() {
        // Обработка Enter в полях ввода
        this.elements.answerXInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.answerYInput.focus();
            }
        });

        this.elements.answerYInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Валидация ввода
        this.elements.answerXInput.addEventListener('input', () => this.validateInputs());
        this.elements.answerYInput.addEventListener('input', () => this.validateInputs());

        // Автофокус на первое поле
        this.elements.answerXInput.focus();
    }

    // Валидация полей ввода
    validateInputs() {
        const xValue = this.elements.answerXInput.value.trim();
        const yValue = this.elements.answerYInput.value.trim();

        if (xValue === '' || xValue === '-' || yValue === '' || yValue === '-') {
            this.elements.checkBtn.disabled = true;
        } else {
            this.elements.checkBtn.disabled = false;
        }
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = [
            'system-of-equations-standard-form',
            'system-of-equations-non-standard-form'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('system-of-equations-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());

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

    // Отображение системы уравнений
    displayProblem(problem) {
        const eq1Elem = document.getElementById('system-of-equations-eq1');
        const eq2Elem = document.getElementById('system-of-equations-eq2');

        // Рендерим уравнения с помощью KaTeX
        try {
            katex.render(problem.equation1, eq1Elem, {
                displayMode: false,
                throwOnError: false
            });
            katex.render(problem.equation2, eq2Elem, {
                displayMode: false,
                throwOnError: false
            });
        } catch (e) {
            eq1Elem.textContent = problem.equation1;
            eq2Elem.textContent = problem.equation2;
        }

        // Автофокус на первое поле ввода
        this.elements.answerXInput.focus();
    }

    // Проверка ответа
    checkAnswer() {
        const xValue = this.elements.answerXInput.value.trim();
        const yValue = this.elements.answerYInput.value.trim();

        // Проверяем, что оба ответа введены
        if (xValue === '' || yValue === '') {
            return;
        }

        // Парсим ответы пользователя
        const parsedX = this.parseAnswer(xValue);
        const parsedY = this.parseAnswer(yValue);

        if (parsedX === null || parsedY === null) {
            // Неверный формат ответа
            this.showInvalidFormatMessage();
            return;
        }

        const correctX = this.currentProblem.solutionX;
        const correctY = this.currentProblem.solutionY;

        // Отладочный вывод
        console.log('Введённые ответы:', { x: xValue, y: yValue });
        console.log('Распознанные ответы:', { x: parsedX, y: parsedY });
        console.log('Правильные ответы:', { x: correctX, y: correctY });

        // Проверяем совпадение (с небольшой погрешностью)
        const isCorrectX = Math.abs(parsedX - correctX) < 0.0001;
        const isCorrectY = Math.abs(parsedY - correctY) < 0.0001;
        const isCorrect = isCorrectX && isCorrectY;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Парсинг ответа пользователя (поддержка целых, дробных и десятичных чисел)
    parseAnswer(answer) {
        // Убираем пробелы
        answer = answer.replace(/\s/g, '');

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
        this.elements.answerXInput.value = '';
        this.elements.answerYInput.value = '';
        this.elements.answerXInput.focus();
        this.validateInputs();
    }

    // Скрыть сообщение об отсутствии типов задач
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="system-of-equations-container">
                <div class="system-bracket">{</div>
                <div class="system-equations">
                    <div id="system-of-equations-eq1" class="system-equation"></div>
                    <div id="system-of-equations-eq2" class="system-equation"></div>
                </div>
            </div>
        `;
    }

    // Отключить поля ввода
    disableInputs() {
        super.disableInputs();
        this.elements.answerXInput.disabled = true;
        this.elements.answerYInput.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        super.enableInputs();
        this.elements.answerXInput.disabled = false;
        this.elements.answerYInput.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('system-of-equations-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('system-of-equations-screen');
    }
}
