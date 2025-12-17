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
    // Создание экземпляров тренажёров
    trainers.fractions = new FractionsTrainer();
    trainers.decimals = new DecimalsTrainer();

    // Инициализация DOM для каждого тренажёра
    trainers.fractions.initDOM();
    trainers.decimals.initDOM();

    // Инициализация главного меню
    initMainMenu();

    // Инициализация Telegram BackButton
    initTelegramBackButton();

    // Показываем главное меню
    showScreen('main-menu');
}

// Показ экрана
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');

    // Управление Telegram BackButton
    updateTelegramBackButton(screenId);
}

// Инициализация главного меню
function initMainMenu() {
    const fractionsBtn = document.getElementById('fractions-btn');
    fractionsBtn.addEventListener('click', () => {
        showScreen('fractions-screen');
        trainers.fractions.startTest();
    });

    const decimalsBtn = document.getElementById('decimals-btn');
    decimalsBtn.addEventListener('click', () => {
        showScreen('decimals-screen');
        trainers.decimals.startTest();
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
        case 'fractions-screen':
        case 'decimals-screen':
            // Из экрана тренажёра возвращаемся в главное меню
            showScreen('main-menu');
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
