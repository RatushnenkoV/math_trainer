// Тренажёр для решения линейных неравенств
class LinearInequalitiesTrainer extends NumberLineTrainer {
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
            storageKey: 'mathTrainerLinearInequalitiesSettings',
            // Настройки числовой прямой для линейных неравенств
            minPoints: 1,  // Всегда ровно 1 точка
            maxPoints: 1,
            allowAddRemove: false  // Нельзя добавлять/удалять точки
        });
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
            pointsGroup: document.getElementById('linear-points-group'),
            regionsGroup: document.getElementById('linear-regions-group'),

            // Кнопка проверки
            checkBtn: document.getElementById('linear-inequalities-check-btn')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();

        // Добавляем одну фиксированную точку
        this.addPoint();
    }

    // Инициализация обработчиков событий
    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Кнопка настроек
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsScreen();
        });

        // Кнопка назад из настроек
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
        });

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });
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
        return Object.values(this.settings).some(val => val === true);
    }

    // Отображение неравенства
    displayProblem(problem) {
        const inequalityElem = document.getElementById('linear-inequalities-inequality');

        if (problem.isLatex) {
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
    }

    // Проверка ответа
    checkAnswer() {
        const userSet = this.buildUserSolutionSet();

        // Если null - ошибка ввода (не все поля заполнены)
        if (userSet === null) {
            return;
        }

        const correctSolution = this.currentProblem.solutionSet;  // RealSet объект

        console.log('Правильное решение:', correctSolution.toString());
        console.log('Ответ пользователя:', userSet.toString());

        // Сравниваем множества
        const isCorrect = userSet.equals(correctSolution);

        console.log('Результат проверки:', isCorrect);

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        const inequalityElem = document.getElementById('linear-inequalities-inequality');
        inequalityElem.innerHTML = '';
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.elements.settingsScreen.classList.add('active');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
    }
}
