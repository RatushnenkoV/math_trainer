// Тренажёр для обыкновенных дробей
class FractionsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            mixedFractions: true,
            decimalFractions: false,
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
            negativeNumbers: false,
            requireSimplification: true
        };

        super({
            name: 'fractions',
            generator: new ProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerProgress'),
            settings: settings,
            storageKey: 'mathTrainerSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('fractions-screen'),
            backBtn: document.getElementById('back-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            checkBtn: document.getElementById('check-btn'),
            settingsScreen: document.getElementById('settings-screen'),
            settingsBackBtn: document.getElementById('settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('level-text'),
            progressText: document.getElementById('progress-text'),
            progressFill: document.getElementById('progress-fill'),
            resultMessage: document.getElementById('result-message'),
            problemDisplay: document.getElementById('problem-display'),

            // Элементы ввода
            wholeInput: document.getElementById('whole-input'),
            numeratorInput: document.getElementById('numerator-input'),
            denominatorInput: document.getElementById('denominator-input'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('fractions-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
        this.initShareModalHandlers();
    }

    // Инициализация обработчиков для полей ввода
    initInputHandlers() {
        const inputs = [this.elements.wholeInput, this.elements.numeratorInput, this.elements.denominatorInput];

        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
            input.addEventListener('input', () => this.validateAnswer());
        });
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = [
            'mixed-fractions', 'decimal-fractions', 'addition', 'subtraction',
            'multiplication', 'division', 'negative-numbers', 'require-simplification'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            // Загрузка текущих настроек
            const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
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
        this.displayFraction('fraction1', problem.fraction1, false);
        document.getElementById('operator').textContent = problem.operation;

        // Проверяем, нужны ли скобки для второй дроби
        const needsParentheses = this.isNegativeFraction(problem.fraction2);
        this.displayFraction('fraction2', problem.fraction2, needsParentheses);
    }

    // Проверка, является ли дробь отрицательной
    isNegativeFraction(fraction) {
        return fraction.whole < 0 || (fraction.whole === 0 && fraction.numerator < 0);
    }

    // Отображение дроби
    displayFraction(elementId, fraction, withParentheses = false) {
        const element = document.getElementById(elementId);
        const frac = fraction.clone();

        // Проверяем, нужно ли показывать как десятичную дробь
        if (this.settings.decimalFractions && this.canBeDecimal(frac.denominator)) {
            const decimal = frac.toDecimal();
            const decimalText = withParentheses && decimal < 0 ? `(${decimal})` : decimal;
            element.innerHTML = `<span class="whole">${decimalText}</span>`;
            return;
        }

        if (this.settings.mixedFractions) {
            frac.toMixed();
        }

        let html = '';

        // Добавляем открывающую скобку, если нужно
        if (withParentheses) {
            html += '<span class="parenthesis">(</span>';
        }

        // Определяем, отрицательная ли дробь
        const isNegative = frac.whole < 0 || (frac.whole === 0 && frac.numerator < 0);

        // Добавляем минус перед дробью, если она отрицательная
        if (isNegative && frac.whole === 0) {
            html += '<span class="minus">−</span>';
        }

        if (frac.whole !== 0) {
            html += `<span class="whole">${frac.whole}</span>`;
        }

        if (frac.numerator !== 0 || frac.whole === 0) {
            html += `<span class="frac">`;
            // Числитель всегда показываем как положительное число
            html += `<span class="numerator">${Math.abs(frac.numerator)}</span>`;
            html += `<span class="fraction-line"></span>`;
            html += `<span class="denominator">${frac.denominator}</span>`;
            html += `</span>`;
        }

        if (html === '' || (withParentheses && html === '<span class="parenthesis">(</span>')) {
            html += '<span class="whole">0</span>';
        }

        // Добавляем закрывающую скобку, если нужно
        if (withParentheses) {
            html += '<span class="parenthesis">)</span>';
        }

        element.innerHTML = html;
    }

    // Проверка, можно ли представить как десятичную дробь
    canBeDecimal(denominator) {
        const simpleDecimals = [2, 4, 5, 20];
        return simpleDecimals.includes(denominator) || this.isPowerOfTen(denominator);
    }

    // Проверка, является ли число степенью десятки
    isPowerOfTen(n) {
        if (n < 1) return false;
        while (n > 1) {
            if (n % 10 !== 0) return false;
            n = n / 10;
        }
        return true;
    }

    // Очистка полей ввода
    clearInputs() {
        this.elements.wholeInput.value = '';
        this.elements.numeratorInput.value = '';
        this.elements.denominatorInput.value = '';
        this.elements.numeratorInput.focus();
        this.validateAnswer();
    }

    // Валидация ответа
    validateAnswer() {
        const wholeInputValue = this.elements.wholeInput.value.trim();
        const numeratorInput = parseInt(this.elements.numeratorInput.value) || 0;

        let wholeInput = 0;
        if (wholeInputValue === '-') {
            wholeInput = 0;
        } else {
            wholeInput = parseInt(wholeInputValue) || 0;
        }

        // if (wholeInput === 0 && numeratorInput === 0 && wholeInputValue !== '-') {
        //     this.elements.checkBtn.disabled = true;
        // } else {
        //     this.elements.checkBtn.disabled = false;
        // }
    }

    // Проверка ответа
    checkAnswer() {
        const wholeInputValue = this.elements.wholeInput.value.trim();
        let numeratorInput = parseInt(this.elements.numeratorInput.value) || 0;
        const denominatorInput = parseInt(this.elements.denominatorInput.value) || 1;

        // Проверка на ноль в знаменателе
        if (denominatorInput === 0) {
            this.handleWrongAnswer();
            return;
        }

        // Обработка целой части и знака
        let wholeInput = 0;
        let isNegative = false;

        if (wholeInputValue === '-') {
            isNegative = true;
            wholeInput = 0;
        } else {
            wholeInput = parseInt(wholeInputValue) || 0;
            if (wholeInput < 0) {
                isNegative = true;
            }
        }

        // Если дробь отрицательная, делаем числитель отрицательным
        if (isNegative && wholeInput === 0) {
            numeratorInput = -Math.abs(numeratorInput);
        }

        const userAnswer = new Fraction(numeratorInput, denominatorInput, wholeInput);
        const correctAnswer = this.currentProblem.result.clone();
        console.log(correctAnswer);

        // Проверка на правильность
        let isCorrect = userAnswer.equals(correctAnswer);

        // Если требуется сокращение, проверяем
        if (isCorrect && this.settings.requireSimplification) {
            if (!userAnswer.isSimplified()) {
                isCorrect = false;
            }
        }

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <span class="fraction-display" id="fraction1"></span>
            <span class="operator" id="operator"></span>
            <span class="fraction-display" id="fraction2"></span>
            <span class="equals">=</span>
            <span class="question">?</span>
        `;
    }

    // Отключить поля ввода
    disableInputs() {
        super.disableInputs();
        this.elements.wholeInput.disabled = true;
        this.elements.numeratorInput.disabled = true;
        this.elements.denominatorInput.disabled = true;
    }

    // Включить поля ввода
    enableInputs() {
        super.enableInputs();
        this.elements.wholeInput.disabled = false;
        this.elements.numeratorInput.disabled = false;
        this.elements.denominatorInput.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('fractions-screen');
    }
}
