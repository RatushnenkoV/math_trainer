// Тренажёр на нахождение площадей
class AreasTrainer extends BaseTrainer {
    constructor() {
        super({
            name: 'areas',
            generator: new AreasGenerator(),
            progressTracker: new ProgressTracker('mathTrainerAreasProgress'),
            settings: {
                parallelogram: true,
                rhombus: true,
                rectangle: true,
                square: true,
                triangle: true,
                trapezoid: true,
                circle: true,
                useTrigonometry: true,
                useDiagonals: true
            },
            storageKey: 'mathTrainerAreasSettings'
        });

        this.shapeDrawer = new ShapeDrawer();
        this.triangleDrawer = new TriangleDrawer();
        this.parallelogramDrawer = new ParallelogramDrawer();

        // Базовый масштаб и параметры SVG
        this.SVG_WIDTH = 650;
        this.SVG_HEIGHT = 500;
        this.PADDING = 80; // отступы от краёв
        this.TARGET_SIZE = 300; // желаемый размер фигуры (примерно)
    }

    /**
     * Вычисляет оптимальный масштаб для фигуры
     * @param {number} maxDimension - максимальный размер фигуры (ширина или высота)
     * @returns {number} - коэффициент масштабирования
     */
    calculateScale(maxDimension) {
        // Доступное пространство
        const availableWidth = this.SVG_WIDTH - 2 * this.PADDING;
        const availableHeight = this.SVG_HEIGHT - 2 * this.PADDING;
        const availableSpace = Math.min(availableWidth, availableHeight);

        // Если фигура уже большая (больше целевого размера), используем меньший масштаб
        if (maxDimension >= this.TARGET_SIZE / 10) {
            // Масштабируем чтобы поместилась в доступное пространство
            return Math.min(availableSpace / maxDimension, 10);
        }

        // Если фигура маленькая, масштабируем до целевого размера
        const scaleToTarget = this.TARGET_SIZE / maxDimension;

        // Ограничиваем максимальный масштаб, чтобы не было слишком большим
        const maxScale = availableSpace / maxDimension;

        return Math.min(scaleToTarget, maxScale, 20); // максимум 20x
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('areas-screen'),
            backBtn: document.getElementById('areas-back-btn'),
            settingsBtn: document.getElementById('areas-settings-btn'),
            checkBtn: document.getElementById('areas-check-btn'),

            levelText: document.getElementById('areas-level-text'),
            progressText: document.getElementById('areas-progress-text'),
            progressFill: document.getElementById('areas-progress-fill'),
            resultMessage: document.getElementById('areas-result-message'),
            problemDisplay: document.getElementById('areas-problem-display'),

            shapeContainer: document.getElementById('areas-shape-container'),
            questionText: document.getElementById('areas-question-text'),
            answerInput: document.getElementById('areas-answer-input'),
            inputLabel: document.getElementById('areas-input-label'),

            settingsScreen: document.getElementById('areas-settings'),
            settingsBackBtn: document.getElementById('areas-settings-back-btn'),

            // Чекбоксы настроек
            parallelogramCheck: document.getElementById('areas-parallelogram'),
            rhombusCheck: document.getElementById('areas-rhombus'),
            rectangleCheck: document.getElementById('areas-rectangle'),
            squareCheck: document.getElementById('areas-square'),
            triangleCheck: document.getElementById('areas-triangle'),
            trapezoidCheck: document.getElementById('areas-trapezoid'),
            circleCheck: document.getElementById('areas-circle'),
            useTrigonometryCheck: document.getElementById('areas-use-trigonometry'),
            useDiagonalsCheck: document.getElementById('areas-use-diagonals')
        };

        this.loadSettings();
        this.updateSettingsUI();
        this.initEventHandlers();
    }

    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Кнопка настроек
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsScreen();
        });

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });

        // Enter в поле ввода
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        // Кнопка назад из настроек
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
            this.saveSettingsFromUI();
            this.generateNewProblem();
        });

        // Обработчики изменения чекбоксов
        const checkboxes = [
            'parallelogramCheck', 'rhombusCheck', 'rectangleCheck', 'squareCheck',
            'triangleCheck', 'trapezoidCheck', 'circleCheck',
            'useTrigonometryCheck', 'useDiagonalsCheck'
        ];

        checkboxes.forEach(checkboxId => {
            this.elements[checkboxId].addEventListener('change', () => {
                this.saveSettingsFromUI();
            });
        });
    }

    hasOperationsSelected() {
        return this.settings.parallelogram || this.settings.rhombus ||
               this.settings.rectangle || this.settings.square ||
               this.settings.triangle || this.settings.trapezoid ||
               this.settings.circle;
    }

    updateSettingsUI() {
        this.elements.parallelogramCheck.checked = this.settings.parallelogram;
        this.elements.rhombusCheck.checked = this.settings.rhombus;
        this.elements.rectangleCheck.checked = this.settings.rectangle;
        this.elements.squareCheck.checked = this.settings.square;
        this.elements.triangleCheck.checked = this.settings.triangle;
        this.elements.trapezoidCheck.checked = this.settings.trapezoid;
        this.elements.circleCheck.checked = this.settings.circle;
        this.elements.useTrigonometryCheck.checked = this.settings.useTrigonometry;
        this.elements.useDiagonalsCheck.checked = this.settings.useDiagonals;
    }

    saveSettingsFromUI() {
        this.settings.parallelogram = this.elements.parallelogramCheck.checked;
        this.settings.rhombus = this.elements.rhombusCheck.checked;
        this.settings.rectangle = this.elements.rectangleCheck.checked;
        this.settings.square = this.elements.squareCheck.checked;
        this.settings.triangle = this.elements.triangleCheck.checked;
        this.settings.trapezoid = this.elements.trapezoidCheck.checked;
        this.settings.circle = this.elements.circleCheck.checked;
        this.settings.useTrigonometry = this.elements.useTrigonometryCheck.checked;
        this.settings.useDiagonals = this.elements.useDiagonalsCheck.checked;
        this.saveSettings();
    }

    displayProblem(problem) {
        // Обновляем текст вопроса и подпись инпута в зависимости от типа задачи
        if (problem.questionType === 'divideByPi') {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}, делённую на π`;
            this.elements.inputLabel.textContent = 'S/π =';
        } else if (problem.questionType === 'divideBySqrt2') {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}, делённую на √2`;
            this.elements.inputLabel.textContent = 'S/√2 =';
        } else if (problem.questionType === 'divideBySqrt3') {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}, делённую на √3`;
            this.elements.inputLabel.textContent = 'S/√3 =';
        } else {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}`;
            this.elements.inputLabel.textContent = 'S =';
        }

        // Очищаем контейнер
        this.elements.shapeContainer.innerHTML = '';

        // Создаём SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '650');
        svg.setAttribute('height', '500');
        svg.setAttribute('viewBox', '0 0 650 500');

        // Рисуем фигуру в зависимости от типа
        let shape;
        switch (problem.shapeType) {
            case 'parallelogram':
                shape = this.drawParallelogram(problem);
                break;
            case 'rhombus':
                shape = this.drawRhombus(problem);
                break;
            case 'rectangle':
                shape = this.drawRectangle(problem);
                break;
            case 'square':
                shape = this.drawSquare(problem);
                break;
            case 'triangle':
                shape = this.drawTriangle(problem);
                break;
            case 'trapezoid':
                shape = this.drawTrapezoid(problem);
                break;
            case 'circle':
                shape = this.drawCircle(problem);
                break;
        }

        if (shape) {
            svg.appendChild(shape);
        }

        this.elements.shapeContainer.appendChild(svg);
    }

    drawParallelogram(problem) {
        if (problem.formula === 'baseHeight') {
            const scale = this.calculateScale(Math.max(problem.base, problem.height));
            return this.parallelogramDrawer.drawBySideAndHeight({
                baseX: 150,
                baseY: 350,
                sideA: problem.base * scale,
                height: problem.height * scale,
                labels: problem.labels
            });
        } else if (problem.formula === 'sidesAngle') {
            const scale = this.calculateScale(Math.max(problem.sideA, problem.sideB));
            return this.parallelogramDrawer.drawBySidesAndAngle({
                baseX: 150,
                baseY: 350,
                sideA: problem.sideA * scale,
                sideB: problem.sideB * scale,
                angle: problem.angle,
                labels: problem.labels
            });
        } else { // diagonals
            const scale = this.calculateScale(Math.max(problem.diagonal1, problem.diagonal2));
            return this.shapeDrawer.drawParallelogramByDiagonals({
                centerX: 300,
                centerY: 250,
                diagonal1: problem.diagonal1 * scale,
                diagonal2: problem.diagonal2 * scale,
                angle: problem.angle,
                labels: problem.labels
            });
        }
    }

    drawRhombus(problem) {
        if (problem.formula === 'sideHeight') {
            const scale = this.calculateScale(Math.max(problem.side, problem.height));
            return this.parallelogramDrawer.drawRhombusBySideAndHeight({
                baseX: 150,
                baseY: 350,
                side: problem.side * scale,
                height: problem.height * scale,
                labels: problem.labels
            });
        } else if (problem.formula === 'sideAngle') {
            const scale = this.calculateScale(problem.side);
            return this.parallelogramDrawer.drawRhombusBySideAndAngle({
                baseX: 150,
                baseY: 350,
                side: problem.side * scale,
                angle: problem.angle,
                labels: problem.labels
            });
        } else { // diagonals
            const scale = this.calculateScale(Math.max(problem.diagonal1, problem.diagonal2));
            return this.shapeDrawer.drawRhombusByDiagonals({
                centerX: 300,
                centerY: 250,
                diagonal1: problem.diagonal1 * scale,
                diagonal2: problem.diagonal2 * scale,
                labels: problem.labels
            });
        }
    }

    drawRectangle(problem) {
        if (problem.formula === 'sides') {
            const scale = this.calculateScale(Math.max(problem.width, problem.height));
            return this.parallelogramDrawer.drawRectangle({
                baseX: 200,
                baseY: 350,
                width: problem.width * scale,
                height: problem.height * scale,
                labels: problem.labels
            });
        } else { // diagonal
            const scale = this.calculateScale(problem.diagonal);
            return this.shapeDrawer.drawRectangleByDiagonal({
                centerX: 300,
                centerY: 250,
                diagonal: problem.diagonal * scale,
                angle: problem.angle,
                labels: problem.labels
            });
        }
    }

    drawSquare(problem) {
        if (problem.formula === 'side') {
            const scale = this.calculateScale(problem.side);
            return this.parallelogramDrawer.drawSquare({
                baseX: 200,
                baseY: 350,
                side: problem.side * scale,
                labels: problem.labels
            });
        } else { // diagonal
            const scale = this.calculateScale(problem.diagonal);
            return this.shapeDrawer.drawSquareByDiagonal({
                centerX: 300,
                centerY: 250,
                diagonal: problem.diagonal * scale,
                labels: problem.labels
            });
        }
    }

    drawTriangle(problem) {
        if (problem.formula === 'baseHeight') {
            const scale = this.calculateScale(Math.max(problem.base, problem.height));
            return this.triangleDrawer.drawByBaseAndHeight({
                baseX: 150,
                baseY: 350,
                base: problem.base * scale,
                height: problem.height * scale,
                labels: problem.labels
            });
        } else if (problem.formula === 'sidesAngle') {
            const scale = this.calculateScale(Math.max(problem.sideA, problem.sideB));
            return this.triangleDrawer.drawBySidesAndAngle({
                baseX: 150,
                baseY: 350,
                sideA: problem.sideA * scale,
                sideB: problem.sideB * scale,
                angle: problem.angle,
                labels: problem.labels
            });
        } else { // heron
            const scale = this.calculateScale(Math.max(problem.sideA, problem.sideB, problem.sideC));
            return this.triangleDrawer.drawByThreeSides({
                baseX: 150,
                baseY: 350,
                sideA: problem.sideA * scale,
                sideB: problem.sideB * scale,
                sideC: problem.sideC * scale,
                labels: problem.labels
            });
        }
    }

    drawTrapezoid(problem) {
        if (problem.formula === 'basesHeight') {
            const scale = this.calculateScale(Math.max(problem.base1, problem.base2, problem.height));
            return this.shapeDrawer.drawTrapezoid({
                baseX: 150,
                baseY: 350,
                base1: problem.base1 * scale,
                base2: problem.base2 * scale,
                height: problem.height * scale,
                labels: problem.labels
            });
        } else { // midlineHeight
            const scale = this.calculateScale(Math.max(problem.midline, problem.height));
            return this.shapeDrawer.drawTrapezoidByMidline({
                baseX: 150,
                baseY: 350,
                midline: problem.midline * scale,
                height: problem.height * scale,
                labels: problem.labels
            });
        }
    }

    drawCircle(problem) {
        const scale = this.calculateScale(problem.radius * 2); // диаметр
        return this.shapeDrawer.drawCircle({
            centerX: 300,
            centerY: 250,
            radius: problem.radius * scale,
            labels: problem.labels
        });
    }

    clearInputs() {
        this.elements.answerInput.value = '';
        this.elements.resultMessage.className = 'result-message';
    }

    checkAnswer() {
        const userAnswer = parseFloat(this.elements.answerInput.value);

        if (isNaN(userAnswer)) {
            this.elements.resultMessage.textContent = 'Введите число';
            this.elements.resultMessage.className = 'result-message wrong show';
            setTimeout(() => {
                this.elements.resultMessage.classList.remove('show');
            }, 1000);
            return;
        }

        const isCorrect = Math.abs(userAnswer - this.currentProblem.area) < 0.01;

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '';
    }

    disableInputs() {
        super.disableInputs();
        this.elements.answerInput.disabled = true;
    }

    enableInputs() {
        super.enableInputs();
        this.elements.answerInput.disabled = false;
    }

    showSettingsScreen() {
        this.elements.settingsScreen.classList.add('active');
    }

    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
    }

    showScreen(screenId) {
        window.showScreen(screenId);
    }
}
