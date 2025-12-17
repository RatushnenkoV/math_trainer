// Главный файл приложения

// Реестр тренажёров
const trainers = {};

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
    // Создание экземпляров тренажёров
    trainers.fractions = new FractionsTrainer();
    trainers.decimals = new DecimalsTrainer();

    // Инициализация DOM для каждого тренажёра
    trainers.fractions.initDOM();
    trainers.decimals.initDOM();

    // Инициализация главного меню
    initMainMenu();

    // Показываем главное меню
    showScreen('main-menu');
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
        trainers.fractions.startTest();
    });

    const decimalsBtn = document.getElementById('decimals-btn');
    decimalsBtn.addEventListener('click', () => {
        showScreen('decimals-screen');
        trainers.decimals.startTest();
    });
}
