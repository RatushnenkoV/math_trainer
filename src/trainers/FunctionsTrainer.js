// Тренажёр графиков функций
class FunctionsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerFunctionsSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            linear: true,
            hyperbola: true,
            parabola: true
        };

        super({
            name: 'functions',
            generator: new FunctionsGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerFunctionsProgress'),
            settings: settings,
            storageKey: 'mathTrainerFunctionsSettings'
        });

        this.currentStep = 0; // Текущий шаг в задаче
        this.currentQuestion = null; // Текущий вопрос
        this.xPointsCount = 0; // Счётчик точек для параболы
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('functions-screen'),
            backBtn: document.getElementById('functions-back-btn'),
            settingsBtn: document.getElementById('functions-settings-btn'),
            checkBtn: document.getElementById('functions-check-btn'),
            settingsScreen: document.getElementById('functions-settings-screen'),
            settingsBackBtn: document.getElementById('functions-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('functions-level-text'),
            progressText: document.getElementById('functions-progress-text'),
            progressFill: document.getElementById('functions-progress-fill'),
            resultMessage: document.getElementById('functions-result-message'),
            problemDisplay: document.getElementById('functions-problem-display'),
            formula: document.getElementById('functions-formula'),

            // Контейнеры для шагов
            questionsFlow: document.getElementById('functions-questions-flow'),
            stepType: document.getElementById('functions-step-type'),
            stepSpecific: document.getElementById('functions-step-specific'),
            stepPoints: document.getElementById('functions-step-points'),

            // График
            plotContainer: document.getElementById('functions-plot-container'),
            plot: document.getElementById('functions-plot')
        };

        // Инициализация обработчиков
        this.initEventHandlers();
        this.initSettingsHandlers();
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const linearCheckbox = document.getElementById('functions-linear');
        const hyperbolaCheckbox = document.getElementById('functions-hyperbola');
        const parabolaCheckbox = document.getElementById('functions-parabola');

        if (linearCheckbox) {
            linearCheckbox.checked = this.settings.linear;
            linearCheckbox.addEventListener('change', (e) => {
                this.settings.linear = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (hyperbolaCheckbox) {
            hyperbolaCheckbox.checked = this.settings.hyperbola;
            hyperbolaCheckbox.addEventListener('change', (e) => {
                this.settings.hyperbola = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (parabolaCheckbox) {
            parabolaCheckbox.checked = this.settings.parabola;
            parabolaCheckbox.addEventListener('change', (e) => {
                this.settings.parabola = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
    }

    // Проверка, выбрана ли хотя бы одна операция
    hasOperationsSelected() {
        return this.settings.linear || this.settings.hyperbola || this.settings.parabola;
    }

    // Генерация нового примера
    generateNewProblem() {
        if (!this.hasOperationsSelected()) {
            this.showNoOperationsMessage();
            this.disableInputs();
            return;
        }

        this.hideNoOperationsMessage();
        this.enableInputs();

        this.currentProblem = this.generator.generate();
        if (!this.currentProblem) {
            this.showNoOperationsMessage();
            this.disableInputs();
            return;
        }

        this.currentStep = 0;
        this.xPointsCount = 0;

        // Сброс видимости
        this.elements.plotContainer.classList.add('hidden');
        this.elements.questionsFlow.classList.remove('hidden');
        this.elements.stepType.classList.remove('hidden');
        this.elements.stepType.classList.remove('opacity-50', 'pointer-events-none');
        this.elements.stepSpecific.classList.add('hidden');
        this.elements.stepSpecific.classList.remove('opacity-50', 'pointer-events-none');
        this.elements.stepSpecific.innerHTML = '';
        this.elements.stepPoints.classList.add('hidden');
        this.elements.stepPoints.classList.remove('opacity-50', 'pointer-events-none');
        this.elements.stepPoints.innerHTML = '';

        this.displayProblem(this.currentProblem);
        this.currentQuestion = this.currentProblem.questions[this.currentStep];
        this.elements.checkBtn.style.display = 'none'; // Скрываем кнопку проверить на первом шаге
    }

    // Отображение примера
    displayProblem(problem) {
        if (window.katex) {
            katex.render(problem.tex, this.elements.formula, {
                displayMode: true,
                throwOnError: false
            });
        }
    }

    // Очистка полей ввода
    clearInputs() {
        // Не используется в этом тренажёре
    }

    // Проверка типа графика
    checkType(selected) {
        if (selected === this.currentQuestion.correctAnswer) {
            this.currentStep++;
            // Скрываем предыдущий шаг
            this.elements.stepType.classList.add('hidden');
            this.showNextStep();
        } else {
            this.handleWrongAnswer();
            setTimeout(() => {
                this.generateNewProblem();
            }, 1000);
        }
    }

    // Показ следующего шага
    showNextStep() {
        if (this.currentStep >= this.currentProblem.questions.length) {
            // Все вопросы пройдены, показываем ввод точек
            this.showPointsInput();
        } else {
            // Показываем следующий вопрос
            this.currentQuestion = this.currentProblem.questions[this.currentStep];
            this.showSpecificQuestions();
        }
    }

    // Показ специфических вопросов
    showSpecificQuestions() {
        const container = this.elements.stepSpecific;
        container.classList.remove('hidden');

        if (this.currentQuestion.id === 'behavior') {
            container.innerHTML = `
                <p class="step-question">2. Как ведет себя функция?</p>
                <div class="button-group">
                    <button onclick="trainers.functions.checkBehavior('up')" class="answer-button">Возрастает</button>
                    <button onclick="trainers.functions.checkBehavior('down')" class="answer-button">Убывает</button>
                </div>
            `;
        } else if (this.currentQuestion.id === 'quarters') {
            container.innerHTML = `
                <p class="step-question">2. В каких четвертях (относительно асимптот) лежат ветви?</p>
                <div class="button-group-grid">
                    <button onclick="trainers.functions.checkQuarters('1-3')" class="answer-button">I и III четверти</button>
                    <button onclick="trainers.functions.checkQuarters('2-4')" class="answer-button">II и IV четверти</button>
                </div>
            `;
        } else if (this.currentQuestion.id === 'asymptotes') {
            container.innerHTML = `
                <p class="step-question">3. Укажи асимптоты:</p>
                <div class="asymptotes-inputs">
                    <label>x = <input type="number" id="as-x" class="number-input"></label>
                    <label>y = <input type="number" id="as-y" class="number-input"></label>
                </div>
                <button onclick="trainers.functions.checkAsymptotes()" class="check-button">Проверить</button>
            `;
        } else if (this.currentQuestion.id === 'direction') {
            container.innerHTML = `
                <p class="step-question">2. Куда направлены ветви?</p>
                <div class="button-group">
                    <button onclick="trainers.functions.checkDirection('up')" class="answer-button">Вверх</button>
                    <button onclick="trainers.functions.checkDirection('down')" class="answer-button">Вниз</button>
                </div>
            `;
        }
    }

    // Проверка поведения (возрастание/убывание)
    checkBehavior(answer) {
        if (answer === this.currentQuestion.correctAnswer) {
            this.currentStep++;
            // Скрываем предыдущий шаг
            this.elements.stepSpecific.innerHTML = '';
            this.showNextStep();
        } else {
            this.handleWrongAnswer();
            setTimeout(() => {
                this.generateNewProblem();
            }, 1000);
        }
    }

    // Проверка четвертей для гиперболы
    checkQuarters(choice) {
        if (choice === this.currentQuestion.correctAnswer) {
            this.currentStep++;
            // Скрываем предыдущий шаг
            this.elements.stepSpecific.innerHTML = '';
            this.showNextStep();
        } else {
            this.handleWrongAnswer();
            setTimeout(() => {
                this.generateNewProblem();
            }, 1000);
        }
    }

    // Проверка асимптот
    checkAsymptotes() {
        const ax = parseInt(document.getElementById('as-x').value);
        const ay = parseInt(document.getElementById('as-y').value);

        const nextQuestion = this.currentProblem.questions.find(q => q.id === 'asymptotes');
        if (ax === nextQuestion.correctAnswer.x && ay === nextQuestion.correctAnswer.y) {
            this.currentStep++;
            // Скрываем предыдущий шаг
            this.elements.stepSpecific.innerHTML = '';
            this.showNextStep();
        } else {
            this.showResultMessage(false);
            this.showEmoji(false);
        }
    }

    // Проверка направления ветвей параболы
    checkDirection(answer) {
        if (answer === this.currentQuestion.correctAnswer) {
            this.currentStep++;
            // Скрываем предыдущий шаг
            this.elements.stepSpecific.innerHTML = '';
            this.showNextStep();
        } else {
            this.handleWrongAnswer();
            setTimeout(() => {
                this.generateNewProblem();
            }, 1000);
        }
    }

    // Показ ввода точек
    showPointsInput() {
        const container = this.elements.stepPoints;
        container.classList.remove('hidden');
        // Скрываем и блокируем предыдущий шаг
        this.elements.stepSpecific.classList.add('hidden');
        this.elements.stepSpecific.classList.add('opacity-50', 'pointer-events-none');

        let content = `<p class="step-question final-step">Введи контрольные точки для построения:</p>`;

        if (this.currentProblem.type === 'linear' || this.currentProblem.type === 'hyperbola') {
            content += `
                <div class="points-grid">
                    <div class="parabola-vertex-group">
                        <span>Точка 1:</span>
                        <div class="parabola-coords">
                            <label>x <input type="number" id="x1" class="number-input small"></label>
                            <label>y <input type="number" id="y1" class="number-input small"></label>
                        </div>
                    </div>
                    <div class="parabola-vertex-group">
                        <span>Точка 2:</span>
                        <div class="parabola-coords">
                            <label>x <input type="number" id="x2" class="number-input small"></label>
                            <label>y <input type="number" id="y2" class="number-input small"></label>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content += `
                <div class="parabola-inputs">
                    <div class="input-section">
                        <p class="input-section-title">Вершина и ось Y:</p>
                        <div class="parabola-vertex-group">
                            <span>Вершина:</span>
                            <div class="parabola-coords">
                                <label>x <input type="number" id="xv" class="number-input small"></label>
                                <label>y <input type="number" id="yv" class="number-input small"></label>
                            </div>
                        </div>
                        <div class="point-input-group">
                            <span>Пересечение с Y:</span>
                            <label>(0, <input type="number" id="py" class="number-input small">)</label>
                        </div>
                    </div>

                    <div class="input-section">
                        <p class="input-section-title">Точки пересечения с осью OX (0-2):</p>
                        <div id="x-points-container" class="x-points-container-horizontal"></div>
                        <div class="x-points-buttons">
                            <button onclick="trainers.functions.addXPoint()" class="small-button add">+ Добавить X</button>
                            <button onclick="trainers.functions.removeXPoint()" class="small-button remove">− Удалить</button>
                        </div>
                    </div>
                </div>
            `;
        }
        content += `<button onclick="trainers.functions.finalCheck()" class="check-button primary">Проверить и построить</button>`;
        container.innerHTML = content;
        this.xPointsCount = 0;
    }

    // Добавление точки X
    addXPoint() {
        if (this.xPointsCount < 2) {
            this.xPointsCount++;
            const container = document.getElementById('x-points-container');
            const input = document.createElement('div');
            input.id = `x-point-wrapper-${this.xPointsCount}`;
            input.className = 'x-point-input';
            input.innerHTML = `<label>x${this.xPointsCount} = <input type="number" class="ox-input number-input small" id="ox-${this.xPointsCount}"></label>`;
            container.appendChild(input);
        }
    }

    // Удаление точки X
    removeXPoint() {
        if (this.xPointsCount > 0) {
            const input = document.getElementById(`x-point-wrapper-${this.xPointsCount}`);
            if (input) input.remove();
            this.xPointsCount--;
        }
    }

    // Финальная проверка
    finalCheck() {
        let isOk = false;

        if (this.currentProblem.type === 'parabola') {
            const xvInput = document.getElementById('xv').value;
            const yvInput = document.getElementById('yv').value;
            const pyInput = document.getElementById('py').value;

            if (xvInput === "" || yvInput === "" || pyInput === "") {
                this.showResultMessage(false);
                this.showEmoji(false);
                return;
            }

            const xv = parseInt(xvInput);
            const yv = parseInt(yvInput);
            const py = parseInt(pyInput);

            const userXIntercepts = Array.from(document.querySelectorAll('.ox-input'))
                .map(inp => inp.value)
                .filter(val => val !== "")
                .map(val => parseInt(val));

            const vertexOk = this.currentProblem.validateVertex(xv, yv);
            const yInterceptOk = this.currentProblem.validateYIntercept(py);
            const xInterceptsOk = this.currentProblem.validateXIntercepts(userXIntercepts);

            isOk = vertexOk && yInterceptOk && xInterceptsOk;
        } else {
            const x1 = parseInt(document.getElementById('x1').value);
            const y1 = parseInt(document.getElementById('y1').value);
            const x2 = parseInt(document.getElementById('x2').value);
            const y2 = parseInt(document.getElementById('y2').value);

            if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
                this.showResultMessage(false);
                this.showEmoji(false);
                return;
            }

            isOk = this.currentProblem.validatePoints([{ x: x1, y: y1 }, { x: x2, y: y2 }]) && (x1 !== x2);
        }

        if (isOk) {
            // Показываем эмодзи и сообщение только после финальной проверки
            this.showResultMessage(true);
            this.showEmoji(true);
            setTimeout(() => {
                this.drawGraph();
            }, 500);
        } else {
            this.handleWrongAnswer();
            setTimeout(() => {
                this.generateNewProblem();
            }, 1000);
        }
    }

    // Построение графика
    drawGraph() {
        this.elements.plotContainer.classList.remove('hidden');
        this.elements.questionsFlow.classList.add('hidden');

        if (typeof functionPlot !== 'undefined') {
            try {
                functionPlot({
                    target: "#functions-plot",
                    grid: true,
                    width: 450,
                    height: 400,
                    data: [{
                        fn: this.currentProblem.fn,
                        color: '#2563eb',
                        graphType: 'polyline'
                    }]
                });
            } catch (error) {
                console.error('Ошибка построения графика:', error);
            }
        }
    }

    // Переход к следующей задаче (вызывается кнопкой)
    nextProblem() {
        // Обновляем прогресс только здесь
        this.progressTracker.correctAnswer();
        this.updateProgressDisplay();
        this.generateNewProblem();
    }

    // Проверка ответа (не используется напрямую)
    checkAnswer() {
        // Не используется, т.к. проверка происходит на каждом шаге
    }

    // Показать сообщение об отсутствии операций
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Не выбрано ни одного типа функций в настройках 😢</span>';
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        // Сообщение очищается при отображении примера
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('functions-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('functions-screen');
    }

    // Отключить поля ввода
    disableInputs() {
        super.disableInputs();
    }

    // Включить поля ввода
    enableInputs() {
        super.enableInputs();
    }
}
