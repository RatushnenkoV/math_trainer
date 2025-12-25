// Главный файл приложения

// Реестр тренажёров
const trainers = {};

// Реестр загруженных тренажёров (для lazy loading)
const loadedTrainers = new Set();

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
    }
};

// Telegram WebApp API
let tg = null;

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

// Функция для динамической загрузки тренажёра
async function loadTrainer(trainerName) {
    // Если тренажёр уже загружен, просто возвращаем true
    if (loadedTrainers.has(trainerName)) {
        return true;
    }

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
            'src/utils/generators/SystemOfInequalitiesGenerator.js',
            'src/trainers/SystemOfInequalitiesTrainer.js',
            'src/components/SystemOfInequalitiesComponent.js'
        ]
    };

    const scripts = trainerScripts[trainerName];
    if (!scripts) {
        console.error(`Unknown trainer: ${trainerName}`);
        return false;
    }

    try {
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

function initApp() {
    // Все тренажёры теперь загружаются динамически при клике на соответствующую кнопку

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
    document.querySelectorAll('multiplication-table-trainer, square-roots-trainer, fractions-trainer, fraction-visual-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer').forEach(trainer => {
        trainer.classList.remove('active');
    });

    // Ищем экран по ID (может быть как на верхнем уровне, так и внутри компонента)
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Если экран находится внутри компонента тренажера, показываем этот компонент
        const trainerComponent = targetScreen.closest('multiplication-table-trainer, square-roots-trainer, fractions-trainer, fraction-visual-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer');
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
        case 'fractions-screen':
        case 'fraction-visual-screen':
        case 'decimals-screen':
        case 'negatives-screen':
        case 'divisibility-screen':
        case 'linear-equations-screen':
        case 'linear-inequalities-screen':
        case 'quadratic-equations-screen':
        case 'quadratic-inequalities-screen':
        case 'trigonometry-screen':
        case 'percentages-screen':
        case 'system-of-equations-screen':
        case 'system-of-inequalities-screen':
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
            } else if (screenId === 'percentages-screen') {
                trainers.percentages.generateNewProblem();
            } else if (screenId === 'system-of-equations-screen') {
                trainers.systemOfEquations.generateNewProblem();
            } else if (screenId === 'system-of-inequalities-screen') {
                trainers.systemOfInequalities.generateNewProblem();
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
