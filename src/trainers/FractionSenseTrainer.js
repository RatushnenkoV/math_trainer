// Тренажёр "Чувство дроби"
class FractionSenseTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('fractionSenseSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            includePercentages: false,
            includeDecimals: false,
            tolerance: 0.10  // +-10% по умолчанию
        };

        super({
            name: 'fractionSense',
            generator: new FractionSenseGenerator(settings),
            progressTracker: new ProgressTracker('fractionSenseProgress'),
            settings: settings,
            storageKey: 'fractionSenseSettings'
        });

        // Текущая позиция слайдера
        this.sliderValue = 0.5;
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('fraction-sense-screen'),
            backBtn: document.getElementById('fraction-sense-back-btn'),
            settingsBtn: document.getElementById('fraction-sense-settings-btn'),
            checkBtn: document.getElementById('fraction-sense-check-btn'),
            settingsScreen: document.getElementById('fraction-sense-settings-screen'),
            settingsBackBtn: document.getElementById('fraction-sense-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('fraction-sense-level-text'),
            progressText: document.getElementById('fraction-sense-progress-text'),
            progressFill: document.getElementById('fraction-sense-progress-fill'),
            resultMessage: document.getElementById('fraction-sense-result-message'),
            problemDisplay: document.getElementById('fraction-sense-problem-display'),

            // Слайдер
            slider: document.getElementById('fraction-sense-slider'),
            sliderValue: document.getElementById('fraction-sense-slider-value'),
            sliderTrack: document.getElementById('fraction-sense-slider-track'),
            sliderFill: document.getElementById('fraction-sense-slider-fill'),
            sliderThumb: document.getElementById('fraction-sense-slider-thumb'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('fraction-sense-share-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initSliderHandlers();
        this.initShareModalHandlers();
    }

    // Инициализация обработчиков событий
    initEventHandlers() {
        super.initEventHandlers();
    }

    // Инициализация обработчиков слайдера
    initSliderHandlers() {
        if (!this.elements.slider) return;

        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = this.elements.sliderTrack.getBoundingClientRect();
            const x = clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));

            this.sliderValue = percentage;
            this.updateSliderDisplay();
        };

        const startDrag = (e) => {
            isDragging = true;
            e.preventDefault();

            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        const moveDrag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        const endDrag = () => {
            isDragging = false;
        };

        // Mouse events
        this.elements.sliderTrack.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);

        // Touch events
        this.elements.sliderTrack.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', moveDrag);
        document.addEventListener('touchend', endDrag);
    }

    // Обновление отображения слайдера
    updateSliderDisplay() {
        const percentage = Math.round(this.sliderValue * 100);

        // Обновляем визуальное отображение
        this.elements.sliderFill.style.width = `${percentage}%`;
        this.elements.sliderThumb.style.left = `${percentage}%`;
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        // Обработка чекбоксов
        const percentagesCheckbox = document.getElementById('fraction-sense-percentages');
        const decimalsCheckbox = document.getElementById('fraction-sense-decimals');

        if (percentagesCheckbox) {
            percentagesCheckbox.checked = this.settings.includePercentages;
            percentagesCheckbox.addEventListener('change', (e) => {
                this.settings.includePercentages = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (decimalsCheckbox) {
            decimalsCheckbox.checked = this.settings.includeDecimals;
            decimalsCheckbox.addEventListener('change', (e) => {
                this.settings.includeDecimals = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        // Инициализация слайдера сложности
        this.initDifficultySlider();
    }

    // Инициализация слайдера сложности
    initDifficultySlider() {
        const slider = document.getElementById('difficulty-slider');
        if (!slider) return;

        // Массив значений сложности: 1 = легко (0.15), 2 = средне (0.10), 3 = сложно (0.05)
        const toleranceMap = {
            1: 0.15,
            2: 0.10,
            3: 0.05
        };

        // Находим текущее значение слайдера по настройке
        let currentValue = 2; // По умолчанию средняя
        for (const [key, value] of Object.entries(toleranceMap)) {
            if (value === this.settings.tolerance) {
                currentValue = parseInt(key);
                break;
            }
        }

        // Устанавливаем значение слайдера
        slider.value = currentValue;

        // Обработчик изменения слайдера
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.settings.tolerance = toleranceMap[value];
            this.saveSettings();
            this.updateGeneratorSettings();
        });
    }

    // Отображение примера
    displayProblem(problem) {
        // Отображаем задачу
        this.elements.problemDisplay.textContent = problem.display;

        // Сбрасываем слайдер в среднее положение
        this.sliderValue = 0.5;
        this.updateSliderDisplay();
    }

    // Очистка полей ввода
    clearInputs() {
        // Сбрасываем слайдер
        this.sliderValue = 0.5;
        this.updateSliderDisplay();
    }

    // Проверка ответа
    checkAnswer() {
        const problem = this.currentProblem;
        const userValue = this.sliderValue;
        const correctValue = problem.value;

        // Вычисляем абсолютную разницу
        const difference = Math.abs(userValue - correctValue);

        // Проверяем, попал ли пользователь в допустимый диапазон
        if (difference <= this.settings.tolerance) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Проверка, выбрана ли хотя бы одна операция
    hasOperationsSelected() {
        // Всегда true, так как обыкновенные дроби всегда доступны
        return true;
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.textContent = '';
    }

    // Отключить поля ввода
    disableInputs() {
        super.disableInputs();
        this.elements.slider.classList.add('disabled');
    }

    // Включить поля ввода
    enableInputs() {
        super.enableInputs();
        this.elements.slider.classList.remove('disabled');
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('fraction-sense-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('fraction-sense-screen');
    }
}
