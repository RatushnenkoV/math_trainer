// Главный файл приложения

// Флаг для переключения режима загрузки
// true - ленивая загрузка (lazy loading) - модули загружаются при клике
// false - загрузка всех модулей при запуске приложения
const LAZY_LOADING = true;

// Реестр тренажёров
const trainers = {};

// Реестр загруженных тренажёров (для lazy loading)
const loadedTrainers = new Set();

// Реестр загруженных CSS файлов
const loadedStyles = new Set();

// Конфигурация тренажёров - единый источник информации
const trainerConfig = {
    'multiplication-table-btn': {
        name: 'Таблица умножения',
        screen: 'multiplication-table-screen',
        trainer: 'multiplicationTable'
    },
    'divisibility-btn': {
        name: 'Делимость',
        screen: 'divisibility-screen',
        trainer: 'divisibility'
    },
    'square-roots-btn': {
        name: 'Квадратные корни',
        screen: 'square-roots-screen',
        trainer: 'squareRoots'
    },
    'percentages-btn': {
        name: 'Проценты',
        screen: 'percentages-screen',
        trainer: 'percentages'
    },
    'negatives-btn': {
        name: 'Отрицательные числа',
        screen: 'negatives-screen',
        trainer: 'negatives'
    },
    'fraction-visual-btn': {
        name: 'Определение дроби',
        screen: 'fraction-visual-screen',
        trainer: 'fractionVisual'
    },
    'fraction-sense-btn': {
        name: 'Чувство дроби',
        screen: 'fraction-sense-screen',
        trainer: 'fractionSense',
    },
    'fractions-btn': {
        name: 'Обыкновенные дроби',
        screen: 'fractions-screen',
        trainer: 'fractions'
    },
    'decimals-btn': {
        name: 'Десятичные дроби',
        screen: 'decimals-screen',
        trainer: 'decimals'
    },
    'linear-equations-btn': {
        name: 'Линейные уравнения',
        screen: 'linear-equations-screen',
        trainer: 'linearEquations'
    },
    'linear-inequalities-btn': {
        name: 'Линейные неравенства',
        screen: 'linear-inequalities-screen',
        trainer: 'linearInequalities'
    },
    'quadratic-equations-btn': {
        name: 'Квадратные уравнения',
        screen: 'quadratic-equations-screen',
        trainer: 'quadraticEquations'
    },
    'quadratic-inequalities-btn': {
        name: 'Квадратные неравенства',
        screen: 'quadratic-inequalities-screen',
        trainer: 'quadraticInequalities'
    },
    'system-of-equations-btn': {
        name: 'Системы линейных уравнений',
        screen: 'system-of-equations-screen',
        trainer: 'systemOfEquations'
    },
    'system-of-inequalities-btn': {
        name: 'Системы неравенств',
        screen: 'system-of-inequalities-screen',
        trainer: 'systemOfInequalities'
    },
    'trigonometry-btn': {
        name: 'Табличные значения',
        screen: 'trigonometry-screen',
        trainer: 'trigonometry'
    },
    'trig-equations-btn': {
        name: 'Простейшие уравнения',
        screen: 'trig-equations-screen',
        trainer: 'trigEquations'
    },
    'powers-btn': {
        name: 'Свойства степеней',
        screen: 'powers-screen',
        trainer: 'powers'
    },
    'polynomial-simplification-btn': {
        name: 'Приведение подобных',
        screen: 'polynomial-simplification-screen',
        trainer: 'polynomialSimplification'
    },
    'polynomial-expand-btn': {
        name: 'Раскрытие скобок',
        screen: 'polynomial-expand-screen',
        trainer: 'polynomialExpand'
    },
    'algebraic-identities-btn': {
        name: 'Формулы сокращённого умножения',
        screen: 'algebraic-identities-screen',
        trainer: 'algebraicIdentities'
    },
    'factoring-out-btn': {
        name: 'Вынесение множителя за скобки',
        screen: 'factoring-out-screen',
        trainer: 'factoringOut'
    },
    'definitions-btn': {
        name: 'Определения',
        screen: 'definitions-screen',
        trainer: 'definitions'
    },
    'functions-btn': {
        name: 'Графики функций',
        screen: 'functions-screen',
        trainer: 'functions'
    },
    'coordinates-btn': {
        name: 'Координаты',
        screen: 'coordinates-screen',
        trainer: 'coordinates'
    },
    'areas-btn': {
        name: 'Площади фигур',
        screen: 'areas-screen',
        trainer: 'areas'
    }
};

// Telegram WebApp API
let tg = null;

// Управление индикатором загрузки
const LoadingIndicator = {
    overlay: null,

    init() {
        this.overlay = document.getElementById('loading-overlay');
    },

    show() {
        if (this.overlay) {
            this.overlay.classList.add('visible');
        }
    },

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('visible');
        }
    }
};

// Функция для динамической загрузки скриптов
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// Функция для динамической загрузки CSS
function loadCSS(href) {
    // Если CSS уже загружен, просто возвращаем resolved promise
    if (loadedStyles.has(href)) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        // Добавляем версию для предотвращения кеширования
        link.href = href + '?v=' + Date.now();
        link.onload = () => {
            loadedStyles.add(href);
            resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

// Функция для динамической загрузки тренажёра
async function loadTrainer(trainerName, showLoader = true) {
    // Если тренажёр уже загружен, просто возвращаем true
    if (loadedTrainers.has(trainerName)) {
        return true;
    }

    // Показываем индикатор загрузки при ленивой загрузке
    if (showLoader && LAZY_LOADING) {
        LoadingIndicator.show();
    }

    // Маппинг CSS файлов для тренажеров
    const trainerStyles = {
        'multiplicationTable': 'src/styles/trainers/multiplication-table.css',
        'squareRoots': null, // использует только общие стили
        'fractions': null, // использует только общие стили
        'fractionVisual': 'src/styles/trainers/fraction-visual.css',
        'fractionSense': 'src/styles/trainers/fraction-sense.css',
        'decimals': 'src/styles/trainers/decimals.css',
        'negatives': 'src/styles/trainers/negatives.css',
        'divisibility': 'src/styles/trainers/divisibility.css',
        'linearEquations': 'src/styles/trainers/linear-equations.css',
        'linearInequalities': 'src/styles/trainers/linear-inequalities.css',
        'quadraticEquations': 'src/styles/trainers/quadratic-equations.css',
        'quadraticInequalities': 'src/styles/trainers/quadratic-inequalities.css',
        'trigonometry': 'src/styles/trainers/trigonometry.css',
        'trigEquations': 'src/styles/trainers/trig-equations.css',
        'percentages': null, // использует только общие стили
        'systemOfEquations': 'src/styles/trainers/system-of-equations.css',
        'systemOfInequalities': 'src/styles/trainers/system-of-inequalities.css',
        'powers': null, // использует только общие стили
        'polynomialSimplification': 'src/styles/trainers/polynomial-simplification.css',
        'polynomialExpand': 'src/styles/trainers/polynomial-expand.css',
        'algebraicIdentities': 'src/styles/trainers/algebraic-identities.css',
        'factoringOut': 'src/styles/trainers/factoring-out.css',
        'definitions': 'src/styles/trainers/definitions.css',
        'functions': 'src/styles/trainers/functions.css',
        'coordinates': 'src/styles/trainers/coordinates.css',
        'areas': 'src/styles/trainers/areas.css'
    };

    const trainerScripts = {
        'multiplicationTable': [
            'src/utils/generators/MultiplicationTableGenerator.js',
            'src/trainers/MultiplicationTableTrainer.js',
            'src/components/MultiplicationTableComponent.js'
        ],
        'squareRoots': [
            'src/utils/generators/SquareRootsGenerator.js',
            'src/trainers/SquareRootsTrainer.js',
            'src/components/SquareRootsComponent.js'
        ],
        'fractions': [
            'src/utils/generators/FractionsGenerator.js',
            'src/trainers/FractionsTrainer.js',
            'src/components/FractionsComponent.js'
        ],
        'fractionVisual': [
            'src/utils/generators/FractionVisualGenerator.js',
            'src/trainers/FractionVisualTrainer.js',
            'src/components/FractionVisualComponent.js'
        ],
        'fractionSense': [
            'src/utils/generators/FractionSenseGenerator.js',
            'src/trainers/FractionSenseTrainer.js',
            'src/components/FractionSenseComponent.js'
        ],
        'decimals': [
            'src/utils/generators/DecimalsGenerator.js',
            'src/trainers/DecimalsTrainer.js',
            'src/components/DecimalsComponent.js'
        ],
        'negatives': [
            'src/utils/generators/NegativesGenerator.js',
            'src/trainers/NegativesTrainer.js',
            'src/components/NegativesComponent.js'
        ],
        'divisibility': [
            'src/utils/generators/DivisibilityGenerator.js',
            'src/trainers/DivisibilityTrainer.js',
            'src/components/DivisibilityComponent.js'
        ],
        'linearEquations': [
            'src/utils/generators/LinearEquationsGenerator.js',
            'src/trainers/LinearEquationsTrainer.js',
            'src/components/LinearEquationsComponent.js'
        ],
        'linearInequalities': [
            'src/utils/generators/LinearInequalitiesGenerator.js',
            'src/trainers/LinearInequalitiesTrainer.js',
            'src/components/LinearInequalitiesComponent.js'
        ],
        'quadraticEquations': [
            'src/utils/generators/QuadraticEquationsGenerator.js',
            'src/trainers/QuadraticEquationsTrainer.js',
            'src/components/QuadraticEquationsComponent.js'
        ],
        'quadraticInequalities': [
            'src/utils/generators/QuadraticInequalitiesGenerator.js',
            'src/trainers/QuadraticInequalitiesTrainer.js',
            'src/components/QuadraticInequalitiesComponent.js'
        ],
        'trigonometry': [
            'src/utils/generators/TrigonometryGenerator.js',
            'src/trainers/TrigonometryTrainer.js',
            'src/components/TrigonometryComponent.js'
        ],
        'trigEquations': [
            'src/utils/generators/TrigEquationsGenerator.js',
            'src/trainers/TrigEquationsTrainer.js',
            'src/components/TrigEquationsComponent.js'
        ],
        'percentages': [
            'src/utils/generators/PercentagesGenerator.js',
            'src/trainers/PercentagesTrainer.js',
            'src/components/PercentagesComponent.js'
        ],
        'systemOfEquations': [
            'src/utils/generators/SystemOfEquationsGenerator.js',
            'src/trainers/SystemOfEquationsTrainer.js',
            'src/components/SystemOfEquationsComponent.js'
        ],
        'systemOfInequalities': [
            'src/utils/generators/LinearInequalitiesGenerator.js',
            'src/utils/generators/QuadraticInequalitiesGenerator.js',
            'src/utils/generators/SystemOfInequalitiesGenerator.js',
            'src/trainers/SystemOfInequalitiesTrainer.js',
            'src/components/SystemOfInequalitiesComponent.js'
        ],
        'powers': [
            'src/utils/generators/PowersGenerator.js',
            'src/trainers/PowersTrainer.js',
            'src/components/PowersComponent.js'
        ],
        'polynomialSimplification': [
            'src/utils/generators/PolynomialSimplificationGenerator.js',
            'src/trainers/PolynomialSimplificationTrainer.js',
            'src/components/PolynomialSimplificationComponent.js'
        ],
        'polynomialExpand': [
            'src/components/MonomialInput.js',
            'src/utils/generators/PolynomialExpandGenerator.js',
            'src/trainers/PolynomialExpandTrainer.js',
            'src/components/PolynomialExpandComponent.js'
        ],
        'algebraicIdentities': [
            'src/components/MonomialInput.js',
            'src/components/FactorInput.js',
            'src/utils/generators/AlgebraicIdentitiesGenerator.js',
            'src/trainers/AlgebraicIdentitiesTrainer.js',
            'src/components/AlgebraicIdentitiesComponent.js'
        ],
        'factoringOut': [
            'src/components/MonomialInputFactoringOut.js',
            'src/utils/generators/FactoringOutGenerator.js',
            'src/trainers/FactoringOutTrainer.js',
            'src/components/FactoringOutComponent.js'
        ],
        'definitions': [
            'src/utils/data/definitionsData.js',
            'src/utils/generators/DefinitionsGenerator.js',
            'src/trainers/DefinitionsTrainer.js',
            'src/components/DefinitionsComponent.js'
        ],
        'functions': [
            'src/utils/generators/FunctionsGenerator.js',
            'src/trainers/FunctionsTrainer.js',
            'src/components/FunctionsComponent.js'
        ],
        'coordinates': [
            'src/utils/generators/CoordinatesGenerator.js',
            'src/trainers/CoordinatesTrainer.js',
            'src/components/CoordinatesComponent.js'
        ],
        'areas': [
            'src/utils/generators/AreasGenerator.js',
            'src/trainers/AreasTrainer.js',
            'src/components/AreasComponent.js'
        ]
    };

    const scripts = trainerScripts[trainerName];
    if (!scripts) {
        console.error(`Unknown trainer: ${trainerName}`);
        return false;
    }

    try {
        // Загружаем CSS стили для тренажера (если есть)
        const styleFile = trainerStyles[trainerName];
        if (styleFile) {
            await loadCSS(styleFile);
        }

        // Загружаем скрипты последовательно
        for (const scriptPath of scripts) {
            await loadScript(scriptPath);
        }

        // Отмечаем тренажёр как загруженный
        loadedTrainers.add(trainerName);

        return true;
    } catch (error) {
        console.error(`Failed to load trainer ${trainerName}:`, error);
        return false;
    } finally {
        // Скрываем индикатор загрузки при ленивой загрузке
        if (showLoader && LAZY_LOADING) {
            LoadingIndicator.hide();
        }
    }
}

// Функция для загрузки всех тренажёров при запуске
async function loadAllTrainers() {
    LoadingIndicator.show();

    try {
        // Получаем список всех уникальных тренажёров
        const allTrainers = [...new Set(Object.values(trainerConfig).map(config => config.trainer))];

        // Загружаем все тренажёры последовательно
        for (const trainerName of allTrainers) {
            await loadTrainer(trainerName, false);
        }

        console.log('All trainers loaded successfully');
    } catch (error) {
        console.error('Failed to load all trainers:', error);
    } finally {
        LoadingIndicator.hide();
    }
}

// Инициализация Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Инициализация индикатора загрузки
    LoadingIndicator.init();

    // Если отключена ленивая загрузка, загружаем все тренажёры сразу
    if (!LAZY_LOADING) {
        await loadAllTrainers();
    }

    // Инициализация главного меню
    initMainMenu();

    // Инициализация сворачиваемых разделов
    initCollapsibleSections();

    // Инициализация раздела "Недавнее"
    initRecentTrainers();

    // Инициализация кнопки доната
    initDonateButton();

    // Инициализация Telegram BackButton
    initTelegramBackButton();

    // Инициализация обработки кнопки "Назад" браузера/Android
    initHistoryNavigation();

    // Показываем главное меню
    showScreen('main-menu');
}

// Показ экрана (делаем глобальной для использования в тренажёрах)
window.showScreen = function showScreen(screenId, addToHistory = true) {
    // Убираем класс active у всех экранов (включая те, что внутри компонентов)
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Скрываем все компоненты тренажеров
    document.querySelectorAll('multiplication-table-trainer, square-roots-trainer, powers-trainer, fractions-trainer, fraction-visual-trainer, fraction-sense-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, trig-equations-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer, polynomial-simplification-trainer, polynomial-expand-trainer, algebraic-identities-trainer, definitions-trainer, functions-trainer, coordinates-trainer, areas-trainer').forEach(trainer => {
        trainer.classList.remove('active');
    });

    // Ищем экран по ID (может быть как на верхнем уровне, так и внутри компонента)
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Если экран находится внутри компонента тренажера, показываем этот компонент
        const trainerComponent = targetScreen.closest('multiplication-table-trainer, square-roots-trainer, powers-trainer, fractions-trainer, fraction-visual-trainer, fraction-sense-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, trig-equations-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer, polynomial-simplification-trainer, polynomial-expand-trainer, algebraic-identities-trainer, definitions-trainer, functions-trainer, coordinates-trainer, areas-trainer');
        if (trainerComponent) {
            trainerComponent.classList.add('active');
        }
    }

    // Добавляем в историю браузера для поддержки кнопки "Назад"
    if (addToHistory) {
        history.pushState({ screen: screenId }, '', `#${screenId}`);
    }

    // Управление Telegram BackButton
    updateTelegramBackButton(screenId);
}

// Инициализация главного меню
function initMainMenu() {
    // Используем конфигурацию для инициализации кнопок
    Object.entries(trainerConfig).forEach(([id, config]) => {
        const button = document.getElementById(id);
        if (!button) return;

        button.addEventListener('click', async () => {
            // Добавляем тренажёр в список недавних
            addToRecentTrainers(id);

            // Загружаем тренажёр динамически
            const loaded = await loadTrainer(config.trainer);
            if (!loaded) {
                console.error('Failed to load trainer');
                return;
            }

            // После загрузки скриптов нужно создать custom element
            const componentTag = config.screen.replace('-screen', '-trainer');
            let trainerElement = document.querySelector(componentTag);

            // Если элемент не существует, создаём его
            if (!trainerElement) {
                trainerElement = document.createElement(componentTag);
                document.getElementById('app').appendChild(trainerElement);
            }

            showScreen(config.screen);
            // Получаем trainer из компонента, если ещё не получили
            if (!trainers[config.trainer]) {
                trainers[config.trainer] = document.querySelector(componentTag)?.trainer;
            }
            trainers[config.trainer]?.startTest();
        });
    });
}

// Инициализация Telegram BackButton
function initTelegramBackButton() {
    if (!tg || !tg.BackButton) return;

    // Обработчик нажатия на кнопку "Назад"
    tg.BackButton.onClick(() => {
        handleBackButton();
    });
}

// Обработка нажатия кнопки "Назад"
function handleBackButton() {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    const screenId = activeScreen.id;

    // Логика навигации назад в зависимости от текущего экрана
    switch (screenId) {
        case 'multiplication-table-screen':
        case 'square-roots-screen':
        case 'powers-screen':
        case 'fractions-screen':
        case 'fraction-visual-screen':
        case 'fraction-sense-screen':
        case 'decimals-screen':
        case 'negatives-screen':
        case 'divisibility-screen':
        case 'linear-equations-screen':
        case 'linear-inequalities-screen':
        case 'quadratic-equations-screen':
        case 'quadratic-inequalities-screen':
        case 'trigonometry-screen':
        case 'trig-equations-screen':
        case 'percentages-screen':
        case 'system-of-equations-screen':
        case 'system-of-inequalities-screen':
        case 'polynomial-simplification-screen':
        case 'polynomial-expand-screen':
        case 'algebraic-identities-screen':
        case 'definitions-screen':
        case 'functions-screen':
        case 'factoring-out-screen':
        case 'coordinates-screen':
            // Из экрана тренажёра возвращаемся в главное меню
            showScreen('main-menu');
            break;

        case 'multiplication-table-settings-screen':
            // Из настроек таблицы умножения возвращаемся к тренажёру таблицы умножения
            showScreen('multiplication-table-screen');
            trainers.multiplicationTable.generateNewProblem();
            break;

        case 'square-roots-settings-screen':
            // Из настроек корней возвращаемся к тренажёру корней
            showScreen('square-roots-screen');
            trainers.squareRoots.generateNewProblem();
            break;

        case 'powers-settings-screen':
            // Из настроек степеней возвращаемся к тренажёру степеней
            showScreen('powers-screen');
            trainers.powers.generateNewProblem();
            break;

        case 'settings-screen':
            // Из настроек дробей возвращаемся к тренажёру дробей
            showScreen('fractions-screen');
            trainers.fractions.generateNewProblem();
            break;

        case 'fraction-visual-settings-screen':
            // Из настроек визуализации дробей возвращаемся к тренажёру визуализации дробей
            showScreen('fraction-visual-screen');
            trainers.fractionVisual.generateNewProblem();
            break;

        case 'fraction-sense-settings-screen':
            // Из настроек чувства дроби возвращаемся к тренажёру чувства дроби
            showScreen('fraction-sense-screen');
            trainers.fractionSense.generateNewProblem();
            break;

        case 'decimals-settings-screen':
            // Из настроек десятичных дробей возвращаемся к тренажёру десятичных дробей
            showScreen('decimals-screen');
            trainers.decimals.generateNewProblem();
            break;

        case 'negatives-settings-screen':
            // Из настроек отрицательных чисел возвращаемся к тренажёру отрицательных чисел
            showScreen('negatives-screen');
            trainers.negatives.generateNewProblem();
            break;

        case 'divisibility-settings-screen':
            // Из настроек делимости возвращаемся к тренажёру делимости
            showScreen('divisibility-screen');
            trainers.divisibility.generateNewProblem();
            break;

        case 'linear-equations-settings-screen':
            // Из настроек линейных уравнений возвращаемся к тренажёру линейных уравнений
            showScreen('linear-equations-screen');
            trainers.linearEquations.generateNewProblem();
            break;

        case 'linear-inequalities-settings-screen':
            // Из настроек линейных неравенств возвращаемся к тренажёру линейных неравенств
            showScreen('linear-inequalities-screen');
            trainers.linearInequalities.generateNewProblem();
            break;

        case 'quadratic-equations-settings-screen':
            // Из настроек квадратных уравнений возвращаемся к тренажёру квадратных уравнений
            showScreen('quadratic-equations-screen');
            trainers.quadraticEquations.generateNewProblem();
            break;

        case 'quadratic-inequalities-settings-screen':
            // Из настроек квадратных неравенств возвращаемся к тренажёру квадратных неравенств
            showScreen('quadratic-inequalities-screen');
            trainers.quadraticInequalities.generateNewProblem();
            break;

        case 'trigonometry-settings-screen':
            // Из настроек тригонометрии возвращаемся к тренажёру тригонометрии
            showScreen('trigonometry-screen');
            trainers.trigonometry.generateNewProblem();
            break;

        case 'trig-equations-settings-screen':
            // Из настроек простейших тригонометрических уравнений возвращаемся к тренажёру
            showScreen('trig-equations-screen');
            trainers.trigEquations.generateNewProblem();
            break;

        case 'percentages-settings-screen':
            // Из настроек процентов возвращаемся к тренажёру процентов
            showScreen('percentages-screen');
            trainers.percentages.generateNewProblem();
            break;

        case 'system-of-equations-settings-screen':
            // Из настроек систем уравнений возвращаемся к тренажёру систем уравнений
            showScreen('system-of-equations-screen');
            trainers.systemOfEquations.generateNewProblem();
            break;

        case 'polynomial-simplification-settings-screen':
            // Из настроек приведения подобных возвращаемся к тренажёру приведения подобных
            showScreen('polynomial-simplification-screen');
            trainers.polynomialSimplification.generateNewProblem();
            break;

        case 'polynomial-expand-settings-screen':
            // Из настроек раскрытия скобок возвращаемся к тренажёру раскрытия скобок
            showScreen('polynomial-expand-screen');
            trainers.polynomialExpand.generateNewProblem();
            break;

        case 'algebraic-identities-settings-screen':
            // Из настроек ФСУ возвращаемся к тренажёру ФСУ
            showScreen('algebraic-identities-screen');
            trainers.algebraicIdentities.generateNewProblem();
            break;

        case 'definitions-settings-screen':
            // Из настроек определений возвращаемся к тренажёру определений
            showScreen('definitions-screen');
            trainers.definitions.generateNewProblem();
            break;

        case 'functions-settings-screen':
            // Из настроек функций возвращаемся к тренажёру
            showScreen('functions-screen');
            trainers.functions.generateNewProblem();
            break;

        case 'coordinates-settings-screen':
            // Из настроек координат возвращаемся к тренажёру координат
            showScreen('coordinates-screen');
            trainers.coordinates.generateNewProblem();
            break;

        case 'main-menu':
            // Из главного меню закрываем приложение
            if (tg) {
                tg.close();
            }
            break;
    }
}

// Обновление видимости Telegram BackButton
function updateTelegramBackButton(screenId) {
    if (!tg || !tg.BackButton) return;

    // Показываем кнопку "Назад" на всех экранах кроме главного меню
    if (screenId === 'main-menu') {
        tg.BackButton.hide();
    } else {
        tg.BackButton.show();
    }
}

// Инициализация навигации через историю браузера (для кнопки "Назад" Android)
function initHistoryNavigation() {
    // Добавляем начальное состояние в историю
    history.replaceState({ screen: 'main-menu' }, '', '#main-menu');

    // Обработка события popstate (кнопка "Назад" браузера/Android)
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.screen) {
            // Переходим на экран из истории без добавления в историю
            const screenId = event.state.screen;
            showScreen(screenId, false);

            // Если это экран настроек, генерируем новый пример при возврате
            if (screenId === 'multiplication-table-screen') {
                trainers.multiplicationTable.generateNewProblem();
            } else if (screenId === 'square-roots-screen') {
                trainers.squareRoots.generateNewProblem();
            } else if (screenId === 'fractions-screen') {
                trainers.fractions.generateNewProblem();
            } else if (screenId === 'fraction-sense-screen') {
                trainers.fractionSense.generateNewProblem();
            } else if (screenId === 'decimals-screen') {
                trainers.decimals.generateNewProblem();
            } else if (screenId === 'negatives-screen') {
                trainers.negatives.generateNewProblem();
            } else if (screenId === 'divisibility-screen') {
                trainers.divisibility.generateNewProblem();
            } else if (screenId === 'linear-equations-screen') {
                trainers.linearEquations.generateNewProblem();
            } else if (screenId === 'linear-inequalities-screen') {
                trainers.linearInequalities.generateNewProblem();
            } else if (screenId === 'quadratic-equations-screen') {
                trainers.quadraticEquations.generateNewProblem();
            } else if (screenId === 'quadratic-inequalities-screen') {
                trainers.quadraticInequalities.generateNewProblem();
            } else if (screenId === 'trigonometry-screen') {
                trainers.trigonometry.generateNewProblem();
            } else if (screenId === 'trig-equations-screen') {
                trainers.trigEquations.generateNewProblem();
            } else if (screenId === 'percentages-screen') {
                trainers.percentages.generateNewProblem();
            } else if (screenId === 'system-of-equations-screen') {
                trainers.systemOfEquations.generateNewProblem();
            } else if (screenId === 'system-of-inequalities-screen') {
                trainers.systemOfInequalities.generateNewProblem();
            } else if (screenId === 'polynomial-simplification-screen') {
                trainers.polynomialSimplification?.generateNewProblem();
            } else if (screenId === 'polynomial-expand-screen') {
                trainers.polynomialExpand.generateNewProblem();
            } else if (screenId === 'algebraic-identities-screen') {
                trainers.algebraicIdentities.generateNewProblem();
            } else if (screenId === 'definitions-screen') {
                trainers.definitions.generateNewProblem();
            } else if (screenId === 'functions-screen') {
                trainers.functions.generateNewProblem();
            } else if (screenId === 'coordinates-screen') {
                trainers.coordinates.generateNewProblem();
            }
        } else {
            // Если нет состояния, возвращаемся в главное меню
            showScreen('main-menu', false);
        }
    });

    // Предотвращаем закрытие приложения при нажатии "Назад" на главном экране
    // Вместо этого добавляем пустую запись в историю
    window.addEventListener('load', () => {
        // Добавляем дополнительную запись в историю
        // Это предотвратит закрытие приложения при первом нажатии "Назад"
        history.pushState({ screen: 'main-menu' }, '', '#main-menu');
    });
}

// Инициализация сворачиваемых разделов
function initCollapsibleSections() {
    // Получаем все заголовки разделов с атрибутом data-section
    const sectionHeaders = document.querySelectorAll('.section-header[data-section]');

    sectionHeaders.forEach(header => {
        const sectionName = header.getAttribute('data-section');
        const content = document.querySelector(`.section-content[data-section="${sectionName}"]`);

        if (!content) return;

        // Загружаем сохранённое состояние раздела
        const savedState = localStorage.getItem(`menu-section-${sectionName}`);
        const isCollapsed = savedState === 'collapsed';

        if (isCollapsed) {
            header.classList.add('collapsed');
            content.classList.add('collapsed');
        }

        // Обработчик клика на заголовок
        header.addEventListener('click', () => {
            const isCurrentlyCollapsed = header.classList.contains('collapsed');

            if (isCurrentlyCollapsed) {
                // Разворачиваем
                header.classList.remove('collapsed');
                content.classList.remove('collapsed');
                localStorage.setItem(`menu-section-${sectionName}`, 'expanded');
            } else {
                // Сворачиваем
                header.classList.add('collapsed');
                content.classList.add('collapsed');
                localStorage.setItem(`menu-section-${sectionName}`, 'collapsed');
            }
        });
    });
}

// Инициализация раздела "Недавнее"
function initRecentTrainers() {
    updateRecentTrainers();
}

// Обновление раздела "Недавнее"
function updateRecentTrainers() {
    const recentSection = document.getElementById('recent-section');
    const recentContainer = document.getElementById('recent-trainers');

    if (!recentContainer) return;

    // Загружаем список недавних тренажёров из localStorage
    const recentData = localStorage.getItem('recent-trainers');
    const recentTrainers = recentData ? JSON.parse(recentData) : [];

    if (recentTrainers.length === 0) {
        // Скрываем раздел, если нет недавних тренажёров
        recentSection.style.display = 'none';
        return;
    }

    // Показываем раздел
    recentSection.style.display = 'block';

    // Очищаем контейнер
    recentContainer.innerHTML = '';

    // Берём только последние 3 тренажёра
    const displayTrainers = recentTrainers.slice(0, 3);

    displayTrainers.forEach(trainerId => {
        // Используем конфигурацию для получения названия
        const config = trainerConfig[trainerId];
        const name = config ? config.name : trainerId;

        const button = document.createElement('button');
        button.id = trainerId;
        button.className = 'menu-button';
        button.textContent = name;

        // Добавляем обработчик клика
        const originalButton = document.getElementById(trainerId);
        if (originalButton) {
            button.addEventListener('click', () => {
                originalButton.click();
            });
        }

        recentContainer.appendChild(button);
    });
}

// Добавление тренажёра в список недавних
function addToRecentTrainers(trainerId) {
    const recentData = localStorage.getItem('recent-trainers');
    let recentTrainers = recentData ? JSON.parse(recentData) : [];

    // Удаляем тренажёр из списка, если он уже есть
    recentTrainers = recentTrainers.filter(id => id !== trainerId);

    // Добавляем тренажёр в начало списка
    recentTrainers.unshift(trainerId);

    // Ограничиваем список 3 элементами
    recentTrainers = recentTrainers.slice(0, 3);

    // Сохраняем обновлённый список
    localStorage.setItem('recent-trainers', JSON.stringify(recentTrainers));

    // Обновляем отображение
    updateRecentTrainers();
}

// Инициализация кнопки доната
function initDonateButton() {
    const donateBtn = document.getElementById('donate-btn');

    if (!donateBtn) {
        if (tg) tg.showAlert('Ошибка: кнопка donate-btn не найдена!');
        return;
    }

    donateBtn.addEventListener('click', () => {
        // Проверяем доступность Telegram WebApp API
        if (!tg) {
            alert('Telegram WebApp API недоступен');
            return;
        }

        const botUsername = 'rat_math_trainer_bot';
        const link = `https://t.me/${botUsername}?start=donate`;
        tg.openTelegramLink(link);
        tg.close();
    });
}
