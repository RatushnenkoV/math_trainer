// Тренажёр для проверки делимости
class DivisibilityTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerDivisibilitySettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            div2: true,
            div3: true,
            div4: true,
            div5: true,
            div6: true,
            div8: true,
            div9: true,
            div10: true
        };

        super({
            name: 'divisibility',
            generator: new DivisibilityProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerDivisibilityProgress'),
            settings: settings,
            storageKey: 'mathTrainerDivisibilitySettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('divisibility-screen'),
            backBtn: document.getElementById('divisibility-back-btn'),
            settingsBtn: document.getElementById('divisibility-settings-btn'),
            settingsScreen: document.getElementById('divisibility-settings-screen'),
            settingsBackBtn: document.getElementById('divisibility-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('divisibility-level-text'),
            progressText: document.getElementById('divisibility-progress-text'),
            progressFill: document.getElementById('divisibility-progress-fill'),
            resultMessage: document.getElementById('divisibility-result-message'),
            problemDisplay: document.getElementById('divisibility-problem-display'),

            // Кнопки ответа
            yesBtn: document.getElementById('divisibility-yes-btn'),
            noBtn: document.getElementById('divisibility-no-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initAnswerHandlers();
        this.initShareModalHandlers();
    }

    // Инициализация обработчиков событий (переопределяем базовый метод)
    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.handleBackButtonClick();
        });

        // Кнопка настроек
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsScreen();
        });

        // Кнопка "Поделиться"
        this.elements.shareBtn = document.getElementById('divisibility-share-btn');
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => {
                this.showShareModal();
            });
        }

        // Кнопка назад из настроек
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
            this.generateNewProblem();
        });
    }

    // Инициализация обработчиков для кнопок ответа
    initAnswerHandlers() {
        this.elements.yesBtn.addEventListener('click', () => {
            this.checkAnswer(true);
        });

        this.elements.noBtn.addEventListener('click', () => {
            this.checkAnswer(false);
        });
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = [
            'divisibility-div2', 'divisibility-div3', 'divisibility-div4',
            'divisibility-div5', 'divisibility-div6', 'divisibility-div8',
            'divisibility-div9', 'divisibility-div10'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('divisibility-', '');

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

    // Проверка, выбран ли хотя бы один делитель
    hasOperationsSelected() {
        return this.settings.div2 || this.settings.div3 || this.settings.div4 ||
               this.settings.div5 || this.settings.div6 || this.settings.div8 ||
               this.settings.div9 || this.settings.div10;
    }

    // Отображение примера
    displayProblem(problem) {
        const numberElem = document.getElementById('divisibility-number');
        const divisorElem = document.getElementById('divisibility-divisor');

        numberElem.textContent = problem.number.toLocaleString('ru-RU');
        divisorElem.textContent = problem.divisor;
    }

    // Проверка ответа
    checkAnswer(userAnswer) {
        const correctAnswer = this.currentProblem.isDivisible;

        // Проверяем совпадение
        const isCorrect = userAnswer === correctAnswer;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Очистка полей ввода (не требуется для этого тренажёра)
    clearInputs() {
        // Ничего не делаем, так как нет полей ввода
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="divisibility-question">
                Делится ли число <span id="divisibility-number" class="divisibility-number"></span> на <span id="divisibility-divisor" class="divisibility-divisor"></span>?
            </div>
        `;
    }

    // Показать сообщение об отсутствии делителей
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<div class="no-operations-message">Не выбрано ни одного делителя 😢</div>';
    }

    // Отключить кнопки
    disableInputs() {
        this.elements.yesBtn.disabled = true;
        this.elements.noBtn.disabled = true;
    }

    // Включить кнопки
    enableInputs() {
        this.elements.yesBtn.disabled = false;
        this.elements.noBtn.disabled = false;
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('divisibility-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('divisibility-screen');
    }
}
