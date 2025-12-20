// Главный файл приложения

// Реестр тренажёров
const trainers = {};

// Telegram WebApp API
let tg = null;

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
    // Все тренажёры теперь используют компоненты и инициализируются автоматически
    trainers.multiplicationTable = document.querySelector('multiplication-table-trainer')?.trainer;
    trainers.squareRoots = document.querySelector('square-roots-trainer')?.trainer;
    trainers.fractions = document.querySelector('fractions-trainer')?.trainer;
    trainers.decimals = document.querySelector('decimals-trainer')?.trainer;
    trainers.negatives = document.querySelector('negatives-trainer')?.trainer;
    trainers.divisibility = document.querySelector('divisibility-trainer')?.trainer;
    trainers.linearEquations = document.querySelector('linear-equations-trainer')?.trainer;
    trainers.linearInequalities = document.querySelector('linear-inequalities-trainer')?.trainer;
    trainers.quadraticEquations = document.querySelector('quadratic-equations-trainer')?.trainer;
    trainers.quadraticInequalities = document.querySelector('quadratic-inequalities-trainer')?.trainer;
    trainers.trigonometry = document.querySelector('trigonometry-trainer')?.trainer;
    trainers.percentages = document.querySelector('percentages-trainer')?.trainer;
    trainers.systemOfEquations = document.querySelector('system-of-equations-trainer')?.trainer;
    trainers.systemOfInequalities = document.querySelector('system-of-inequalities-trainer')?.trainer;

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
    document.querySelectorAll('multiplication-table-trainer, square-roots-trainer, fractions-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer').forEach(trainer => {
        trainer.classList.remove('active');
    });

    // Ищем экран по ID (может быть как на верхнем уровне, так и внутри компонента)
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');

        // Если экран находится внутри компонента тренажера, показываем этот компонент
        const trainerComponent = targetScreen.closest('multiplication-table-trainer, square-roots-trainer, fractions-trainer, decimals-trainer, negatives-trainer, divisibility-trainer, linear-equations-trainer, linear-inequalities-trainer, quadratic-equations-trainer, quadratic-inequalities-trainer, trigonometry-trainer, percentages-trainer, system-of-equations-trainer, system-of-inequalities-trainer');
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
    const trainerButtons = [
        { id: 'multiplication-table-btn', screen: 'multiplication-table-screen', trainer: 'multiplicationTable' },
        { id: 'square-roots-btn', screen: 'square-roots-screen', trainer: 'squareRoots' },
        { id: 'fractions-btn', screen: 'fractions-screen', trainer: 'fractions' },
        { id: 'decimals-btn', screen: 'decimals-screen', trainer: 'decimals' },
        { id: 'negatives-btn', screen: 'negatives-screen', trainer: 'negatives' },
        { id: 'divisibility-btn', screen: 'divisibility-screen', trainer: 'divisibility' },
        { id: 'linear-equations-btn', screen: 'linear-equations-screen', trainer: 'linearEquations' },
        { id: 'linear-inequalities-btn', screen: 'linear-inequalities-screen', trainer: 'linearInequalities' },
        { id: 'quadratic-equations-btn', screen: 'quadratic-equations-screen', trainer: 'quadraticEquations' },
        { id: 'quadratic-inequalities-btn', screen: 'quadratic-inequalities-screen', trainer: 'quadraticInequalities' },
        { id: 'trigonometry-btn', screen: 'trigonometry-screen', trainer: 'trigonometry' },
        { id: 'percentages-btn', screen: 'percentages-screen', trainer: 'percentages' },
        { id: 'system-of-equations-btn', screen: 'system-of-equations-screen', trainer: 'systemOfEquations' },
        { id: 'system-of-inequalities-btn', screen: 'system-of-inequalities-screen', trainer: 'systemOfInequalities' }
    ];

    trainerButtons.forEach(({ id, screen, trainer }) => {
        const button = document.getElementById(id);
        button.addEventListener('click', () => {
            // Добавляем тренажёр в список недавних
            addToRecentTrainers(id);

            showScreen(screen);
            // Получаем trainer из компонента, если ещё не получили
            if (!trainers[trainer]) {
                const componentTag = screen.replace('-screen', '-trainer');
                trainers[trainer] = document.querySelector(componentTag)?.trainer;
            }
            trainers[trainer]?.startTest();
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

    // Словарь названий тренажёров
    const trainerNames = {
        'multiplication-table-btn': 'Таблица умножения',
        'divisibility-btn': 'Делимость',
        'fractions-btn': 'Обыкновенные дроби',
        'decimals-btn': 'Десятичные дроби',
        'percentages-btn': 'Проценты',
        'negatives-btn': 'Отрицательные числа',
        'square-roots-btn': 'Квадратные корни',
        'linear-equations-btn': 'Линейные уравнения',
        'linear-inequalities-btn': 'Линейные неравенства',
        'system-of-equations-btn': 'Системы линейных уравнений',
        'quadratic-equations-btn': 'Квадратные уравнения',
        'quadratic-inequalities-btn': 'Квадратные неравенства',
        'system-of-inequalities-btn': 'Системы неравенств',
        'trigonometry-btn': 'Тригонометрия'
    };

    // Берём только последние 3 тренажёра
    const displayTrainers = recentTrainers.slice(0, 3);

    displayTrainers.forEach(trainerId => {
        const name = trainerNames[trainerId] || trainerId;
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

    if (!donateBtn) return;

    donateBtn.addEventListener('click', () => {
        // Проверяем доступность Telegram WebApp API
        if (!tg) {
            alert('Telegram WebApp API недоступен');
            return;
        }

        // Отправляем запрос на донат 100 звёзд
        const botUsername = 'rat_math_trainer_bot';
        const link = `https://t.me/${botUsername}?start=donate_100`;
        tg.openTelegramLink(link);
    });
}
