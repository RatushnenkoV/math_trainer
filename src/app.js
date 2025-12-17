// Главный файл приложения

let generator;
let progressTracker;
let currentProblem;
let settings;

// Для десятичных дробей
let decimalGenerator;
let decimalProgressTracker;
let currentDecimalProblem;
let decimalSettings;

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Загрузка настроек
    loadSettings();
    loadDecimalSettings();

    // Инициализация генератора и трекера прогресса
    generator = new ProblemGenerator(settings);
    progressTracker = new ProgressTracker();

    decimalGenerator = new DecimalProblemGenerator(decimalSettings);
    decimalProgressTracker = new DecimalProgressTracker();

    // Инициализация экранов
    initMainMenu();
    initFractionsScreen();
    initSettingsScreen();
    initDecimalsScreen();
    initDecimalsSettingsScreen();

    // Показываем главное меню
    showScreen('main-menu');
}

// Загрузка настроек
function loadSettings() {
    const saved = localStorage.getItem('mathTrainerSettings');
    if (saved) {
        settings = JSON.parse(saved);
    } else {
        settings = {
            mixedFractions: true,
            decimalFractions: false,
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
            negativeNumbers: false,
            requireSimplification: true
        };
    }
}

// Сохранение настроек
function saveSettings() {
    localStorage.setItem('mathTrainerSettings', JSON.stringify(settings));
}

// Загрузка настроек для десятичных дробей
function loadDecimalSettings() {
    const saved = localStorage.getItem('mathTrainerDecimalSettings');
    if (saved) {
        decimalSettings = JSON.parse(saved);
    } else {
        decimalSettings = {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
            negativeNumbers: false
        };
    }
}

// Сохранение настроек для десятичных дробей
function saveDecimalSettings() {
    localStorage.setItem('mathTrainerDecimalSettings', JSON.stringify(decimalSettings));
}

// Показ экрана
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Инициализация главного меню
function initMainMenu() {
    const fractionsBtn = document.getElementById('fractions-btn');
    fractionsBtn.addEventListener('click', () => {
        showScreen('fractions-screen');
        startFractionsTest();
    });

    const decimalsBtn = document.getElementById('decimals-btn');
    decimalsBtn.addEventListener('click', () => {
        showScreen('decimals-screen');
        startDecimalsTest();
    });
}

// Инициализация экрана тестирования
function initFractionsScreen() {
    // Кнопка назад
    document.getElementById('back-btn').addEventListener('click', () => {
        showScreen('main-menu');
    });

    // Кнопка настроек
    document.getElementById('settings-btn').addEventListener('click', () => {
        showScreen('settings-screen');
    });

    // Кнопка проверки
    document.getElementById('check-btn').addEventListener('click', checkAnswer);

    // Enter для проверки ответа
    const inputs = ['whole-input', 'numerator-input', 'denominator-input'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });

        // Добавляем слушатель на изменение значений для валидации
        document.getElementById(id).addEventListener('input', validateAnswer);
    });
}

// Инициализация экрана настроек
function initSettingsScreen() {
    // Кнопка назад
    document.getElementById('settings-back-btn').addEventListener('click', () => {
        showScreen('fractions-screen');
        // Перегенерируем пример с новыми настройками
        generateNewProblem();
    });

    // Загрузка текущих настроек
    document.getElementById('mixed-fractions').checked = settings.mixedFractions;
    document.getElementById('decimal-fractions').checked = settings.decimalFractions;
    document.getElementById('addition').checked = settings.addition;
    document.getElementById('subtraction').checked = settings.subtraction;
    document.getElementById('multiplication').checked = settings.multiplication;
    document.getElementById('division').checked = settings.division;
    document.getElementById('negative-numbers').checked = settings.negativeNumbers;
    document.getElementById('require-simplification').checked = settings.requireSimplification;

    // Обработка изменений настроек
    const settingIds = [
        'mixed-fractions', 'decimal-fractions', 'addition', 'subtraction',
        'multiplication', 'division', 'negative-numbers', 'require-simplification'
    ];

    settingIds.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            settings[key] = e.target.checked;
            saveSettings();
            generator.updateSettings(settings);
        });
    });
}

// Начало теста дробей
function startFractionsTest() {
    updateProgressDisplay();
    generateNewProblem();
}

// Проверка, выбрана ли хотя бы одна операция
function hasOperationsSelected() {
    return settings.addition || settings.subtraction ||
           settings.multiplication || settings.division;
}

// Генерация нового примера
function generateNewProblem() {
    if (!hasOperationsSelected()) {
        showNoOperationsMessage();
        disableInputs();
        return;
    }

    hideNoOperationsMessage();
    enableInputs();
    currentProblem = generator.generate();
    displayProblem(currentProblem);
    clearInputs();
    validateAnswer(); // Валидируем после очистки полей
}

// Отображение примера
function displayProblem(problem) {
    displayFraction('fraction1', problem.fraction1);
    document.getElementById('operator').textContent = problem.operation;
    displayFraction('fraction2', problem.fraction2);
}

// Проверка, является ли число степенью десятки
function isPowerOfTen(n) {
    if (n < 1) return false;
    while (n > 1) {
        if (n % 10 !== 0) return false;
        n = n / 10;
    }
    return true;
}

// Проверка, можно ли представить знаменатель как десятичную дробь
function canBeDecimal(denominator) {
    // Знаменатели, которые легко конвертируются в десятичные: 2, 4, 5, 20, и степени 10
    const simpleDecimals = [2, 4, 5, 20];
    return simpleDecimals.includes(denominator) || isPowerOfTen(denominator);
}

// Отображение дроби
function displayFraction(elementId, fraction) {
    const element = document.getElementById(elementId);
    const frac = fraction.clone();

    // Проверяем, нужно ли показывать как десятичную дробь
    if (settings.decimalFractions && canBeDecimal(frac.denominator)) {
        const decimal = frac.toDecimal();
        element.innerHTML = `<span class="whole">${decimal}</span>`;
        return;
    }

    if (settings.mixedFractions) {
        frac.toMixed();
    }

    let html = '';

    if (frac.whole !== 0) {
        html += `<span class="whole">${frac.whole}</span>`;
    }

    if (frac.numerator !== 0 || frac.whole === 0) {
        html += `<span class="frac">`;
        html += `<span class="numerator">${Math.abs(frac.numerator)}</span>`;
        html += `<span class="fraction-line"></span>`;
        html += `<span class="denominator">${frac.denominator}</span>`;
        html += `</span>`;
    }

    if (html === '') {
        html = '<span class="whole">0</span>';
    }

    element.innerHTML = html;
}

// Очистка полей ввода
function clearInputs() {
    document.getElementById('whole-input').value = '';
    document.getElementById('numerator-input').value = '';
    document.getElementById('denominator-input').value = '';
    document.getElementById('numerator-input').focus();
    validateAnswer(); // Проверяем валидность после очистки
}

// Валидация ответа - блокируем кнопку если введены нули
function validateAnswer() {
    const wholeInputValue = document.getElementById('whole-input').value.trim();
    const numeratorInput = parseInt(document.getElementById('numerator-input').value) || 0;
    const checkBtn = document.getElementById('check-btn');

    // Парсим целую часть (может быть "-" для отрицательной дроби)
    let wholeInput = 0;
    if (wholeInputValue === '-') {
        wholeInput = 0; // Знак минус без числа означает отрицательную дробь без целой части
    } else {
        wholeInput = parseInt(wholeInputValue) || 0;
    }

    // Если и целая часть, и числитель равны нулю - блокируем кнопку
    // Но если введён только минус, кнопка должна быть активна
    if (wholeInput === 0 && numeratorInput === 0 && wholeInputValue !== '-') {
        checkBtn.disabled = true;
    } else {
        checkBtn.disabled = false;
    }
}

// Проверка ответа
function checkAnswer() {
    const wholeInputValue = document.getElementById('whole-input').value.trim();
    let numeratorInput = parseInt(document.getElementById('numerator-input').value) || 0;
    const denominatorInput = parseInt(document.getElementById('denominator-input').value) || 1;

    // Проверка на ноль в знаменателе
    if (denominatorInput === 0) {
        showResultMessage(false);
        showEmoji(false);
        return;
    }

    // Обработка целой части и знака
    let wholeInput = 0;
    let isNegative = false;

    if (wholeInputValue === '-') {
        // Только минус означает отрицательную дробь без целой части
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
    const correctAnswer = currentProblem.result.clone();

    // Проверка на правильность
    let isCorrect = userAnswer.equals(correctAnswer);

    // Если требуется сокращение, проверяем
    if (isCorrect && settings.requireSimplification) {
        if (!userAnswer.isSimplified()) {
            isCorrect = false;
        }
    }

    // Обработка результата
    if (isCorrect) {
        const result = progressTracker.correctAnswer();
        showResultMessage(true);
        showEmoji(true);

        if (result.levelUp) {
            setTimeout(() => {
                alert(`Поздравляем! Вы перешли на ${result.newLevel} уровень!`);
            }, 500);
        }

        setTimeout(() => {
            generateNewProblem();
            updateProgressDisplay();
        }, 1000);
    } else {
        progressTracker.wrongAnswer();
        showResultMessage(false);
        showEmoji(false);

        setTimeout(() => {
            updateProgressDisplay();
        }, 1000);
    }
}

// Обновление отображения прогресса
function updateProgressDisplay() {
    document.getElementById('level-text').textContent = progressTracker.getLevelName();
    document.getElementById('progress-text').textContent = progressTracker.getProgressText();
    document.getElementById('progress-fill').style.width = progressTracker.getProgressPercent() + '%';
}

// Показ сообщения с результатом
function showResultMessage(isCorrect) {
    const messageElement = document.getElementById('result-message');

    if (isCorrect) {
        messageElement.textContent = 'Верно!';
        messageElement.className = 'result-message correct show';
    } else {
        messageElement.textContent = 'Неверно';
        messageElement.className = 'result-message wrong show';
    }

    // Скрыть сообщение через 1 секунду
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 1000);
}

// Показ эмодзи при ответе
function showEmoji(isCorrect) {
    const correctEmojis = ['🎉', '✨', '🌟', '💫', '🎊', '👏', '🎯', '⭐', '💪', '🔥'];
    const wrongEmojis = ['😢', '😞', '😔', '💔', '😓', '😰', '😥', '🤔', '😕', '😖'];

    const emojis = isCorrect ? correctEmojis : wrongEmojis;
    const container = document.getElementById('emoji-container');

    // Генерируем 5-8 эмодзи
    const count = Math.floor(Math.random() * 4) + 5;

    for (let i = 0; i < count; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const particle = document.createElement('div');
        particle.className = 'emoji-particle';
        particle.textContent = emoji;

        // Случайная позиция
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        container.appendChild(particle);

        // Удаление после анимации
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Показать сообщение об отсутствии операций
function showNoOperationsMessage() {
    const problemDisplay = document.getElementById('problem-display');
    problemDisplay.innerHTML = '<span class="no-operations-message">Не выбрано ни одной операции в настройках 😢</span>';
}

// Скрыть сообщение об отсутствии операций
function hideNoOperationsMessage() {
    const problemDisplay = document.getElementById('problem-display');
    // Восстанавливаем нормальную структуру
    problemDisplay.innerHTML = `
        <span class="fraction-display" id="fraction1"></span>
        <span class="operator" id="operator"></span>
        <span class="fraction-display" id="fraction2"></span>
        <span class="equals">=</span>
        <span class="question">?</span>
    `;
}

// Отключить поля ввода и кнопку
function disableInputs() {
    document.getElementById('whole-input').disabled = true;
    document.getElementById('numerator-input').disabled = true;
    document.getElementById('denominator-input').disabled = true;
    document.getElementById('check-btn').disabled = true;
}

// Включить поля ввода и кнопку
function enableInputs() {
    document.getElementById('whole-input').disabled = false;
    document.getElementById('numerator-input').disabled = false;
    document.getElementById('denominator-input').disabled = false;
    document.getElementById('check-btn').disabled = false;
}

// ============== ФУНКЦИИ ДЛЯ ДЕСЯТИЧНЫХ ДРОБЕЙ ==============

// Инициализация экрана десятичных дробей
function initDecimalsScreen() {
    // Кнопка назад
    document.getElementById('decimals-back-btn').addEventListener('click', () => {
        showScreen('main-menu');
    });

    // Кнопка настроек
    document.getElementById('decimals-settings-btn').addEventListener('click', () => {
        showScreen('decimals-settings-screen');
    });

    // Кнопка проверки
    document.getElementById('decimals-check-btn').addEventListener('click', checkDecimalAnswer);

    // Enter для проверки ответа
    document.getElementById('decimal-answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkDecimalAnswer();
        }
    });

    // Валидация ввода
    document.getElementById('decimal-answer-input').addEventListener('input', validateDecimalAnswer);
}

// Инициализация экрана настроек для десятичных дробей
function initDecimalsSettingsScreen() {
    // Кнопка назад
    document.getElementById('decimals-settings-back-btn').addEventListener('click', () => {
        showScreen('decimals-screen');
        generateNewDecimalProblem();
    });

    // Загрузка текущих настроек
    document.getElementById('decimals-addition').checked = decimalSettings.addition;
    document.getElementById('decimals-subtraction').checked = decimalSettings.subtraction;
    document.getElementById('decimals-multiplication').checked = decimalSettings.multiplication;
    document.getElementById('decimals-division').checked = decimalSettings.division;
    document.getElementById('decimals-negative-numbers').checked = decimalSettings.negativeNumbers;

    // Обработка изменений настроек
    const settingIds = [
        'decimals-addition', 'decimals-subtraction', 'decimals-multiplication',
        'decimals-division', 'decimals-negative-numbers'
    ];

    settingIds.forEach(id => {
        document.getElementById(id).addEventListener('change', (e) => {
            const key = id.replace('decimals-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            decimalSettings[key] = e.target.checked;
            saveDecimalSettings();
            decimalGenerator.updateSettings(decimalSettings);
        });
    });
}

// Начало теста десятичных дробей
function startDecimalsTest() {
    updateDecimalProgressDisplay();
    generateNewDecimalProblem();
}

// Проверка, выбрана ли хотя бы одна операция
function hasDecimalOperationsSelected() {
    return decimalSettings.addition || decimalSettings.subtraction ||
           decimalSettings.multiplication || decimalSettings.division;
}

// Генерация нового примера с десятичными дробями
function generateNewDecimalProblem() {
    if (!hasDecimalOperationsSelected()) {
        showNoDecimalOperationsMessage();
        disableDecimalInputs();
        return;
    }

    hideNoDecimalOperationsMessage();
    enableDecimalInputs();
    currentDecimalProblem = decimalGenerator.generate();
    displayDecimalProblem(currentDecimalProblem);
    clearDecimalInputs();
}

// Отображение примера с десятичными дробями
function displayDecimalProblem(problem) {
    document.getElementById('decimal1').textContent = problem.num1;
    document.getElementById('decimals-operator').textContent = problem.operation;
    document.getElementById('decimal2').textContent = problem.num2;
}

// Очистка полей ввода для десятичных дробей
function clearDecimalInputs() {
    document.getElementById('decimal-answer-input').value = '';
    document.getElementById('decimal-answer-input').focus();
}

// Валидация ответа для десятичных дробей
function validateDecimalAnswer() {
    const input = document.getElementById('decimal-answer-input').value.trim();
    const checkBtn = document.getElementById('decimals-check-btn');

    if (input === '' || input === '-') {
        checkBtn.disabled = true;
    } else {
        checkBtn.disabled = false;
    }
}

// Проверка ответа для десятичных дробей
function checkDecimalAnswer() {
    const input = document.getElementById('decimal-answer-input').value.trim();

    // Заменяем запятую на точку для парсинга
    const normalizedInput = input.replace(',', '.');

    // Парсим ответ пользователя
    const userAnswer = parseFloat(normalizedInput);

    if (isNaN(userAnswer)) {
        showDecimalResultMessage(false);
        showEmoji(false);
        return;
    }

    const correctAnswer = currentDecimalProblem.result;

    // Проверяем с учетом погрешности для десятичных дробей
    const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.001;

    if (isCorrect) {
        const result = decimalProgressTracker.correctAnswer();
        showDecimalResultMessage(true);
        showEmoji(true);

        if (result.levelUp) {
            setTimeout(() => {
                alert(`Поздравляем! Вы перешли на ${result.newLevel} уровень!`);
            }, 500);
        }

        setTimeout(() => {
            generateNewDecimalProblem();
            updateDecimalProgressDisplay();
        }, 1000);
    } else {
        decimalProgressTracker.wrongAnswer();
        showDecimalResultMessage(false);
        showEmoji(false);

        setTimeout(() => {
            updateDecimalProgressDisplay();
        }, 1000);
    }
}

// Обновление отображения прогресса для десятичных дробей
function updateDecimalProgressDisplay() {
    document.getElementById('decimals-level-text').textContent = decimalProgressTracker.getLevelName();
    document.getElementById('decimals-progress-text').textContent = decimalProgressTracker.getProgressText();
    document.getElementById('decimals-progress-fill').style.width = decimalProgressTracker.getProgressPercent() + '%';
}

// Показ сообщения с результатом для десятичных дробей
function showDecimalResultMessage(isCorrect) {
    const messageElement = document.getElementById('decimals-result-message');

    if (isCorrect) {
        messageElement.textContent = 'Верно!';
        messageElement.className = 'result-message correct show';
    } else {
        messageElement.textContent = 'Неверно';
        messageElement.className = 'result-message wrong show';
    }

    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 1000);
}

// Показать сообщение об отсутствии операций для десятичных дробей
function showNoDecimalOperationsMessage() {
    const problemDisplay = document.getElementById('decimals-problem-display');
    problemDisplay.innerHTML = '<span class="no-operations-message">Не выбрано ни одной операции в настройках 😢</span>';
}

// Скрыть сообщение об отсутствии операций для десятичных дробей
function hideNoDecimalOperationsMessage() {
    const problemDisplay = document.getElementById('decimals-problem-display');
    problemDisplay.innerHTML = `
        <span class="decimal-display" id="decimal1"></span>
        <span class="operator" id="decimals-operator"></span>
        <span class="decimal-display" id="decimal2"></span>
        <span class="equals">=</span>
        <span class="question">?</span>
    `;
}

// Отключить поля ввода и кнопку для десятичных дробей
function disableDecimalInputs() {
    document.getElementById('decimal-answer-input').disabled = true;
    document.getElementById('decimals-check-btn').disabled = true;
}

// Включить поля ввода и кнопку для десятичных дробей
function enableDecimalInputs() {
    document.getElementById('decimal-answer-input').disabled = false;
    document.getElementById('decimals-check-btn').disabled = false;
}
