// Тренажёр для решения линейных неравенств
class LinearInequalitiesTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerLinearInequalitiesSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            basic: true,
            easy: true,
            medium: true,
            hard: false
        };

        super({
            name: 'linear-inequalities',
            generator: new LinearInequalitiesProblemGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerLinearInequalitiesProgress'),
            settings: settings,
            storageKey: 'mathTrainerLinearInequalitiesSettings'
        });

        // Состояние интерактивной числовой прямой
        this.userAnswer = {
            pointValue: 0,
            pointIncluded: false,
            leftRegionSelected: false,
            rightRegionSelected: false
        };
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('linear-inequalities-screen'),
            backBtn: document.getElementById('linear-inequalities-back-btn'),
            settingsBtn: document.getElementById('linear-inequalities-settings-btn'),
            settingsScreen: document.getElementById('linear-inequalities-settings-screen'),
            settingsBackBtn: document.getElementById('linear-inequalities-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('linear-inequalities-level-text'),
            progressText: document.getElementById('linear-inequalities-progress-text'),
            progressFill: document.getElementById('linear-inequalities-progress-fill'),
            resultMessage: document.getElementById('linear-inequalities-result-message'),
            problemDisplay: document.getElementById('linear-inequalities-problem-display'),

            // Элементы числовой прямой
            criticalPoint: document.getElementById('critical-point'),
            leftRegion: document.getElementById('left-region'),
            rightRegion: document.getElementById('right-region'),
            pointValueInput: document.getElementById('point-value-input'),

            // Кнопка проверки
            checkBtn: document.getElementById('linear-inequalities-check-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initNumberLineHandlers();
    }

    // Инициализация обработчиков числовой прямой
    initNumberLineHandlers() {
        // Клик по точке - переключение полая/закрашенная
        this.elements.criticalPoint.addEventListener('click', () => {
            this.togglePointFill();
        });

        // Клик по левой области
        this.elements.leftRegion.addEventListener('click', () => {
            this.toggleLeftRegion();
        });

        // Клик по правой области
        this.elements.rightRegion.addEventListener('click', () => {
            this.toggleRightRegion();
        });

        // Ввод координаты точки
        this.elements.pointValueInput.addEventListener('input', (e) => {
            this.updatePointValue(e.target.value);
        });

        // Обработка Enter в поле ввода
        this.elements.pointValueInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
    }

    // Переключение заполнения точки (полая/закрашенная)
    togglePointFill() {
        this.userAnswer.pointIncluded = !this.userAnswer.pointIncluded;

        if (this.userAnswer.pointIncluded) {
            // Закрашенная точка
            this.elements.criticalPoint.setAttribute('fill', '#007bff');
        } else {
            // Полая точка
            this.elements.criticalPoint.setAttribute('fill', 'white');
        }
    }

    // Переключение левой области
    toggleLeftRegion() {
        this.userAnswer.leftRegionSelected = !this.userAnswer.leftRegionSelected;

        if (this.userAnswer.leftRegionSelected) {
            this.elements.leftRegion.setAttribute('fill', 'rgba(0, 123, 255, 0.3)');
        } else {
            this.elements.leftRegion.setAttribute('fill', 'transparent');
        }
    }

    // Переключение правой области
    toggleRightRegion() {
        this.userAnswer.rightRegionSelected = !this.userAnswer.rightRegionSelected;

        if (this.userAnswer.rightRegionSelected) {
            this.elements.rightRegion.setAttribute('fill', 'rgba(0, 123, 255, 0.3)');
        } else {
            this.elements.rightRegion.setAttribute('fill', 'transparent');
        }
    }

    // Обновление значения точки
    updatePointValue(value) {
        const parsedValue = parseFloat(value);
        if (!isNaN(parsedValue)) {
            this.userAnswer.pointValue = parsedValue;
        }
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = [
            'linear-inequalities-basic',
            'linear-inequalities-easy',
            'linear-inequalities-medium',
            'linear-inequalities-hard'
        ];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('linear-inequalities-', '');

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

    // Проверка, выбран ли хотя бы один уровень сложности
    hasOperationsSelected() {
        return this.settings.basic || this.settings.easy ||
               this.settings.medium || this.settings.hard;
    }

    // Отображение неравенства
    displayProblem(problem) {
        const inequalityElem = document.getElementById('linear-inequalities-inequality');

        if (problem.isLatex) {
            // Используем KaTeX для рендеринга
            inequalityElem.innerHTML = '';
            try {
                katex.render(problem.inequality, inequalityElem, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (e) {
                inequalityElem.textContent = problem.inequality;
            }
        } else {
            inequalityElem.textContent = problem.inequality;
        }

        // Автофокус на поле ввода
        this.elements.pointValueInput.focus();
    }

    // Очистка полей ввода и состояния числовой прямой
    clearInputs() {
        // Сброс состояния ответа
        this.userAnswer = {
            pointValue: 0,
            pointIncluded: false,
            leftRegionSelected: false,
            rightRegionSelected: false
        };

        // Сброс визуального состояния
        this.elements.pointValueInput.value = '';
        this.elements.criticalPoint.setAttribute('fill', 'white');
        this.elements.leftRegion.setAttribute('fill', 'transparent');
        this.elements.rightRegion.setAttribute('fill', 'transparent');

        // Очистка сообщения об ошибке
        this.elements.resultMessage.classList.remove('show');
    }

    // Проверка ответа
    checkAnswer() {
        // Проверяем, что координата точки введена
        const pointValue = parseFloat(this.elements.pointValueInput.value);
        if (isNaN(pointValue)) {
            this.showInvalidFormatMessage();
            return;
        }

        // Обновляем значение точки
        this.userAnswer.pointValue = pointValue;

        const correctAnswer = this.currentProblem;

        // Отладочный вывод
        console.log('Пользовательский ответ:', this.userAnswer);
        console.log('Правильный ответ:', {
            criticalPoint: correctAnswer.criticalPoint,
            pointIncluded: correctAnswer.pointIncluded,
            solutionLeft: correctAnswer.solutionLeft,
            solutionRight: correctAnswer.solutionRight
        });

        // Проверяем координату точки (с небольшой погрешностью)
        const pointCorrect = Math.abs(this.userAnswer.pointValue - correctAnswer.criticalPoint) < 0.01;

        // Проверяем, включена ли точка
        const inclusionCorrect = this.userAnswer.pointIncluded === correctAnswer.pointIncluded;

        // Проверяем выбранные области
        const leftRegionCorrect = this.userAnswer.leftRegionSelected === correctAnswer.solutionLeft;
        const rightRegionCorrect = this.userAnswer.rightRegionSelected === correctAnswer.solutionRight;

        // Проверяем, что хотя бы одна область выбрана
        const hasRegionSelected = this.userAnswer.leftRegionSelected || this.userAnswer.rightRegionSelected;

        const isCorrect = pointCorrect && inclusionCorrect && leftRegionCorrect && rightRegionCorrect && hasRegionSelected;

        console.log('Результаты проверки:', {
            pointCorrect,
            inclusionCorrect,
            leftRegionCorrect,
            rightRegionCorrect,
            hasRegionSelected,
            isCorrect
        });

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Показать сообщение о неверном формате
    showInvalidFormatMessage() {
        const messageElement = this.elements.resultMessage;
        messageElement.textContent = 'Введите координату точки';
        messageElement.className = 'result-message wrong show';

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 1000);
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        const inequalityElem = document.getElementById('linear-inequalities-inequality');
        inequalityElem.innerHTML = '';
    }

    // Отключить поля ввода
    disableInputs() {
        this.elements.checkBtn.disabled = true;
        this.elements.pointValueInput.disabled = true;
        this.elements.criticalPoint.style.pointerEvents = 'none';
        this.elements.leftRegion.style.pointerEvents = 'none';
        this.elements.rightRegion.style.pointerEvents = 'none';
    }

    // Включить поля ввода
    enableInputs() {
        this.elements.checkBtn.disabled = false;
        this.elements.pointValueInput.disabled = false;
        this.elements.criticalPoint.style.pointerEvents = 'auto';
        this.elements.leftRegion.style.pointerEvents = 'auto';
        this.elements.rightRegion.style.pointerEvents = 'auto';
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.elements.screen.classList.remove('active');
        this.elements.settingsScreen.classList.add('active');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
        this.elements.screen.classList.add('active');
    }
}
