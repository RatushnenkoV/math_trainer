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

// Реестр загруженных внешних библиотек
const loadedLibraries = new Set();

// ============================================================================
// CONVENTION-BASED CONFIGURATION
// ============================================================================
// Все пути генерируются автоматически из имени тренажёра:
//   trainerName: 'linearEquations'
//   → screen: 'linear-equations-screen'
//   → settingsScreen: 'linear-equations-settings-screen'
//   → style: 'src/styles/trainers/linear-equations.css'
//   → scripts: [
//       'src/utils/generators/LinearEquationsGenerator.js',
//       'src/trainers/LinearEquationsTrainer.js',
//       'src/components/LinearEquationsComponent.js'
//     ]
// ============================================================================

// Утилита: camelCase → kebab-case (linearEquations → linear-equations)
function toKebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

// Утилита: kebab-case → camelCase (linear-equations → linearEquations)
function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Утилита: camelCase → PascalCase (linearEquations → LinearEquations)
function toPascalCase(str) {
    return str[0].toUpperCase() + str.slice(1);
}

// Генерация путей по конвенции
function getTrainerPaths(trainerName) {
    const kebab = toKebabCase(trainerName);
    const pascal = toPascalCase(trainerName);

    return {
        screen: `${kebab}-screen`,
        settingsScreen: `${kebab}-settings-screen`,
        style: `src/styles/trainers/${kebab}.css`,
        scripts: [
            `src/utils/generators/${pascal}Generator.js`,
            `src/trainers/${pascal}Trainer.js`,
            `src/components/${pascal}Component.js`
        ]
    };
}

// Только исключения из конвенции
const trainerOverrides = {
    // Тренажёры без своего CSS файла
    squareRoots: { noStyle: true },
    fractions: { noStyle: true },
    percentages: { noStyle: true },
    powers: { noStyle: true },

    // Тренажёры с дополнительными скриптами (добавляются ПЕРЕД стандартными)
    systemOfInequalities: {
        extraScripts: [
            'src/utils/generators/LinearInequalitiesGenerator.js',
            'src/utils/generators/QuadraticInequalitiesGenerator.js'
        ]
    },
    polynomialExpand: {
        extraScripts: ['src/components/MonomialInput.js']
    },
    algebraicIdentities: {
        extraScripts: [
            'src/components/MonomialInput.js',
            'src/components/FactorInput.js'
        ]
    },
    factoringOut: {
        extraScripts: ['src/components/MonomialInputFactoringOut.js']
    },
    definitions: {
        extraScripts: ['src/utils/data/definitionsData.js']
    },
    areas: {
        extraScripts: [
            'src/utils/ShapeDrawer.js',
            'src/utils/TriangleDrawer.js',
            'src/utils/ParallelogramDrawer.js'
        ]
    },

    // Внешние библиотеки (CDN)
    functions: {
        libraries: [
            'https://unpkg.com/d3@3/d3.min.js',
            'https://unpkg.com/function-plot@1/dist/function-plot.js'
        ]
    }
};

// ============================================================================
// АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ТРЕНАЖЁРОВ ИЗ HTML
// ============================================================================
// Все кнопки тренажёров имеют id вида "{kebab-name}-btn"
// Из этого вычисляется:
//   btnId: 'linear-equations-btn'
//   → trainer: 'linearEquations'
//   → name: текст кнопки из HTML
//   → screen: 'linear-equations-screen'
// ============================================================================

// Получить имя тренажёра из id кнопки
function getTrainerFromBtnId(btnId) {
    return toCamelCase(btnId.replace('-btn', ''));
}

// Получить id кнопки из имени тренажёра
function getBtnIdFromTrainer(trainerName) {
    return toKebabCase(trainerName) + '-btn';
}

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
        link.href = href;
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

    // Получаем пути по конвенции
    const paths = getTrainerPaths(trainerName);
    const overrides = trainerOverrides[trainerName] || {};

    // Собираем список скриптов: extraScripts + стандартные
    const scripts = [...(overrides.extraScripts || []), ...paths.scripts];

    // CSS файл (если не отключён)
    const styleFile = overrides.noStyle ? null : paths.style;

    try {
        // Загружаем внешние библиотеки, если нужны
        if (overrides.libraries) {
            for (const libUrl of overrides.libraries) {
                if (!loadedLibraries.has(libUrl)) {
                    await loadScript(libUrl);
                    loadedLibraries.add(libUrl);
                }
            }
        }

        // Загружаем CSS стили параллельно со скриптами
        const cssPromise = styleFile ? loadCSS(styleFile) : Promise.resolve();

        // Оптимизированная загрузка скриптов:
        // - Все скрипты кроме последнего (Component) загружаем параллельно
        // - Component загружаем после них (он зависит от Trainer)
        const dependencyScripts = scripts.slice(0, -1);
        const componentScript = scripts[scripts.length - 1];

        // Загружаем CSS и зависимости параллельно
        await Promise.all([
            cssPromise,
            ...dependencyScripts.map(src => loadScript(src))
        ]);

        // Теперь загружаем Component
        await loadScript(componentScript);

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
        // Получаем список всех тренажёров из кнопок в HTML
        const buttons = document.querySelectorAll('.menu-button[id$="-btn"]');
        const allTrainers = [...buttons].map(btn => getTrainerFromBtnId(btn.id));

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

    // Проверка URL параметров для режима челленджа
    const challengeParams = ShareLinkUtil.decodeFromURL();
    // Проверяем, не был ли челлендж закрыт в этой сессии
    const challengeClosed = sessionStorage.getItem('challengeClosed');

    if (challengeParams && !challengeClosed) {
        await loadChallengeMode(challengeParams);
    } else {
        // Показываем главное меню
        showScreen('main-menu');
    }
}

// Показ экрана (делаем глобальной для использования в тренажёрах)
window.showScreen = function showScreen(screenId, addToHistory = true) {
    // Убираем класс active у всех экранов (включая те, что внутри компонентов)
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Скрываем все компоненты тренажеров
    document.querySelectorAll('multiplication-table-trainer, square-roots-trainer, powers-trainer, fractions-trainer, fraction-visual-trainer, fraction-sense-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, trig-equations-trainer, angle-conversion-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer, polynomial-simplification-trainer, polynomial-expand-trainer, algebraic-identities-trainer, definitions-trainer, functions-trainer, coordinates-trainer, vectors-trainer, vector-operations-trainer, factoring-out-trainer, areas-trainer').forEach(trainer => {
        trainer.classList.remove('active');
    });

    // Ищем экран по ID (может быть как на верхнем уровне, так и внутри компонента)
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Если экран находится внутри компонента тренажера, показываем этот компонент
        const trainerComponent = targetScreen.closest('multiplication-table-trainer, square-roots-trainer, powers-trainer, fractions-trainer, fraction-visual-trainer, fraction-sense-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, trig-equations-trainer, angle-conversion-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer, polynomial-simplification-trainer, polynomial-expand-trainer, algebraic-identities-trainer, definitions-trainer, functions-trainer, coordinates-trainer, vectors-trainer, vector-operations-trainer, factoring-out-trainer, areas-trainer');
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

// Предзагрузка тренажёра (без показа индикатора)
function preloadTrainer(trainerName) {
    // Если уже загружен или загружается - не делаем ничего
    if (loadedTrainers.has(trainerName)) return;
    // Запускаем загрузку в фоне без индикатора
    loadTrainer(trainerName, false);
}

// Инициализация главного меню
function initMainMenu() {
    // Находим все кнопки тренажёров в HTML (id заканчивается на -btn)
    document.querySelectorAll('.menu-button[id$="-btn"]').forEach(button => {
        const btnId = button.id;
        const trainerName = getTrainerFromBtnId(btnId);
        const paths = getTrainerPaths(trainerName);

        // Предзагрузка при касании (мобильные) - начинается до отпускания пальца
        button.addEventListener('touchstart', () => {
            preloadTrainer(trainerName);
        }, { passive: true });

        // Предзагрузка при наведении (десктоп)
        button.addEventListener('mouseenter', () => {
            preloadTrainer(trainerName);
        }, { passive: true });

        button.addEventListener('click', async () => {
            // Добавляем тренажёр в список недавних
            addToRecentTrainers(btnId);

            // Загружаем тренажёр динамически
            const loaded = await loadTrainer(trainerName);
            if (!loaded) {
                console.error('Failed to load trainer');
                return;
            }

            // После загрузки скриптов нужно создать custom element
            const componentTag = paths.screen.replace('-screen', '-trainer');
            let trainerElement = document.querySelector(componentTag);

            // Если элемент не существует, создаём его
            if (!trainerElement) {
                trainerElement = document.createElement(componentTag);
                document.getElementById('app').appendChild(trainerElement);
            }

            showScreen(paths.screen);
            // Получаем trainer из компонента, если ещё не получили
            if (!trainers[trainerName]) {
                trainers[trainerName] = document.querySelector(componentTag)?.trainer;
            }
            trainers[trainerName]?.startTest();
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

// Вспомогательная функция для получения имени тренажёра по ID экрана
function getTrainerNameByScreen(screenId) {
    // Исключаем main-menu и settings-screen
    if (screenId === 'main-menu' || screenId.endsWith('-settings-screen') || screenId === 'settings-screen') {
        return null;
    }
    // Формат экрана: {kebab-name}-screen → trainer: camelCase
    const match = screenId.match(/^(.+)-screen$/);
    if (match) {
        return toCamelCase(match[1]);
    }
    return null;
}

// Получить имя тренажёра по экрану настроек
function getTrainerNameBySettingsScreen(screenId) {
    // settings-screen — исключение для fractions
    if (screenId === 'settings-screen') {
        return 'fractions';
    }
    // Стандартный формат: {kebab-name}-settings-screen → trainer
    const match = screenId.match(/^(.+)-settings-screen$/);
    if (match) {
        return toCamelCase(match[1]);
    }
    return null;
}

// Проверяет, является ли экран основным экраном тренажёра
function isTrainerScreen(screenId) {
    return getTrainerNameByScreen(screenId) !== null;
}

// Проверяет, является ли экран экраном настроек
function isSettingsScreen(screenId) {
    return screenId === 'settings-screen' || screenId.endsWith('-settings-screen');
}

// Обработка нажатия кнопки "Назад"
function handleBackButton() {
    // Проверяем, открыто ли модальное окно "Поделиться"
    const activeModal = document.querySelector('.share-modal-overlay.active');
    if (activeModal) {
        activeModal.classList.remove('active');
        return;
    }

    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    const screenId = activeScreen.id;

    // Из главного меню — закрываем приложение
    if (screenId === 'main-menu') {
        if (tg) tg.close();
        return;
    }

    // Из экрана тренажёра — вызываем handleBackButtonClick (для подтверждения в режиме челленджа)
    if (isTrainerScreen(screenId)) {
        const trainerName = getTrainerNameByScreen(screenId);
        if (trainerName && trainers[trainerName]?.handleBackButtonClick) {
            trainers[trainerName].handleBackButtonClick();
        } else {
            showScreen('main-menu');
        }
        return;
    }

    // Из экрана настроек — возвращаемся к тренажёру и генерируем новый пример
    if (isSettingsScreen(screenId)) {
        const trainerName = getTrainerNameBySettingsScreen(screenId);
        if (trainerName) {
            const paths = getTrainerPaths(trainerName);
            showScreen(paths.screen);
            trainers[trainerName]?.generateNewProblem();
        }
        return;
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
            const screenId = event.state.screen;
            showScreen(screenId, false);

            // Если это экран тренажёра — генерируем новый пример при возврате
            const trainerName = getTrainerNameByScreen(screenId);
            if (trainerName) {
                trainers[trainerName]?.generateNewProblem();
            }
        } else {
            showScreen('main-menu', false);
        }
    });

    // Предотвращаем закрытие приложения при нажатии "Назад" на главном экране
    window.addEventListener('load', () => {
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
        // Берём название из оригинальной кнопки в HTML
        const originalButton = document.getElementById(trainerId);
        if (!originalButton) return;

        const name = originalButton.textContent;

        const button = document.createElement('button');
        button.className = 'menu-button';
        button.textContent = name;

        // Клик по копии вызывает клик по оригиналу
        button.addEventListener('click', () => {
            originalButton.click();
        });

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

// Загрузка режима челленджа из URL параметров
async function loadChallengeMode(params) {
    const { trainerName, settings, taskCount } = params;

    // Конвертируем kebab-case из URL в camelCase (linear-equations → linearEquations)
    const internalTrainerName = toCamelCase(trainerName);
    const paths = getTrainerPaths(internalTrainerName);

    // Проверяем, что тренажёр существует (есть кнопка в HTML)
    const btnId = getBtnIdFromTrainer(internalTrainerName);
    if (!document.getElementById(btnId)) {
        console.error(`Trainer not found: ${trainerName}`);
        showScreen('main-menu');
        return;
    }

    // Загружаем тренажёр
    const loaded = await loadTrainer(internalTrainerName);
    if (!loaded) {
        console.error('Failed to load trainer');
        showScreen('main-menu');
        return;
    }

    // Создаём custom element
    const componentTag = paths.screen.replace('-screen', '-trainer');
    let trainerElement = document.querySelector(componentTag);

    if (!trainerElement) {
        trainerElement = document.createElement(componentTag);
        document.getElementById('app').appendChild(trainerElement);
    }

    // Получаем trainer из компонента
    const trainer = trainerElement.trainer;
    if (!trainer) {
        console.error('Trainer instance not found');
        showScreen('main-menu');
        return;
    }

    trainers[internalTrainerName] = trainer;

    // Применяем настройки из URL
    trainer.settings = settings;
    trainer.saveSettings();
    trainer.updateGeneratorSettings();

    // Активируем режим челленджа
    trainer.activateChallengeMode(taskCount);

    // Показываем экран тренажёра
    showScreen(paths.screen);

    // Запускаем тест
    trainer.startTest();
}
