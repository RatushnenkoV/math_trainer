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

        // Параметры для перемещения и масштабирования
        this.viewBox = { x: 0, y: 0, width: 650, height: 500 };
        this.isPanning = false;
        this.startPoint = { x: 0, y: 0 };
        this.minScale = 0.5;
        this.maxScale = 3;
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

            settingsScreen: document.getElementById('areas-settings-screen'),
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

        // Исправление проблемы с прокруткой при открытии клавиатуры
        this.elements.answerInput.addEventListener('focus', () => {
            // Запоминаем текущую позицию прокрутки
            this.scrollPosition = window.scrollY || window.pageYOffset;
        });

        this.elements.answerInput.addEventListener('blur', () => {
            // Возвращаем страницу в исходную позицию после закрытия клавиатуры
            setTimeout(() => {
                window.scrollTo(0, 0);
                // Убеждаемся, что экран тренажера также прокручен наверх
                if (this.elements.screen) {
                    this.elements.screen.scrollTop = 0;
                }
            }, 100);
        });

        // Дополнительная защита: при изменении размера окна (когда закрывается клавиатура)
        // прокручиваем обратно наверх
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Проверяем, что input не в фокусе (клавиатура закрыта)
                if (document.activeElement !== this.elements.answerInput) {
                    window.scrollTo(0, 0);
                    if (this.elements.screen) {
                        this.elements.screen.scrollTop = 0;
                    }
                }
            }, 300);
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
        let inputLatex;

        if (problem.questionType === 'divideByPi') {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}, делённую на `;
            // Добавляем π через KaTeX
            const piSpan = document.createElement('span');
            try {
                katex.render('\\pi', piSpan, { throwOnError: false });
            } catch (e) {
                piSpan.textContent = 'π';
            }
            this.elements.questionText.appendChild(piSpan);
            inputLatex = '\\frac{S}{\\pi} =';
        } else if (problem.questionType === 'divideBySqrt2') {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}, делённую на `;
            // Добавляем √2 через KaTeX
            const sqrtSpan = document.createElement('span');
            try {
                katex.render('\\sqrt{2}', sqrtSpan, { throwOnError: false });
            } catch (e) {
                sqrtSpan.textContent = '√2';
            }
            this.elements.questionText.appendChild(sqrtSpan);
            inputLatex = '\\frac{S}{\\sqrt{2}} =';
        } else if (problem.questionType === 'divideBySqrt3') {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}, делённую на `;
            // Добавляем √3 через KaTeX
            const sqrtSpan = document.createElement('span');
            try {
                katex.render('\\sqrt{3}', sqrtSpan, { throwOnError: false });
            } catch (e) {
                sqrtSpan.textContent = '√3';
            }
            this.elements.questionText.appendChild(sqrtSpan);
            inputLatex = '\\frac{S}{\\sqrt{3}} =';
        } else {
            this.elements.questionText.textContent = `Найдите площадь ${problem.shapeName}`;
            inputLatex = 'S =';
        }

        // Рендерим подпись инпута через KaTeX
        try {
            katex.render(inputLatex, this.elements.inputLabel, { throwOnError: false });
        } catch (e) {
            this.elements.inputLabel.textContent = inputLatex;
        }

        // Очищаем контейнер
        this.elements.shapeContainer.innerHTML = '';

        // Сброс viewBox для новой задачи
        this.viewBox = { x: 0, y: 0, width: 650, height: 500 };

        // Создаём SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '650');
        svg.setAttribute('height', '500');
        this.updateViewBox(svg);

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

        // Добавляем обработчики для перемещения и масштабирования
        this.setupInteractions(svg);

        this.elements.shapeContainer.appendChild(svg);
    }

    /**
     * Обновляет viewBox SVG элемента
     */
    updateViewBox(svg) {
        const vb = this.viewBox;
        svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.width} ${vb.height}`);
    }

    /**
     * Настраивает интерактивность для SVG (перемещение и масштабирование)
     */
    setupInteractions(svg) {
        // Перемещение мышью
        svg.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Левая кнопка мыши
                this.isPanning = true;
                this.startPoint = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        });

        svg.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = (e.clientX - this.startPoint.x) * (this.viewBox.width / this.SVG_WIDTH);
                const dy = (e.clientY - this.startPoint.y) * (this.viewBox.height / this.SVG_HEIGHT);

                this.viewBox.x -= dx;
                this.viewBox.y -= dy;

                this.startPoint = { x: e.clientX, y: e.clientY };
                this.updateViewBox(svg);
            }
        });

        svg.addEventListener('mouseup', () => {
            this.isPanning = false;
        });

        svg.addEventListener('mouseleave', () => {
            this.isPanning = false;
        });

        // Масштабирование колесом мыши
        svg.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = svg.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Точка в координатах viewBox
            const svgX = this.viewBox.x + mouseX * (this.viewBox.width / this.SVG_WIDTH);
            const svgY = this.viewBox.y + mouseY * (this.viewBox.height / this.SVG_HEIGHT);

            // Коэффициент масштабирования
            const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;

            const newWidth = this.viewBox.width * scaleFactor;
            const newHeight = this.viewBox.height * scaleFactor;

            // Проверяем границы масштабирования
            const newScale = this.SVG_WIDTH / newWidth;

            if (newScale >= this.minScale && newScale <= this.maxScale) {
                // Пересчитываем положение так, чтобы точка под курсором осталась на месте
                this.viewBox.x = svgX - (mouseX * (newWidth / this.SVG_WIDTH));
                this.viewBox.y = svgY - (mouseY * (newHeight / this.SVG_HEIGHT));
                this.viewBox.width = newWidth;
                this.viewBox.height = newHeight;

                this.updateViewBox(svg);
            }
        }, { passive: false });

        // Перемещение касанием (touch)
        let lastTouchX = 0;
        let lastTouchY = 0;
        let lastTouchDistance = 0;

        svg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isPanning = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                this.isPanning = false;
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
            e.preventDefault();
        }, { passive: false });

        svg.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isPanning) {
                const dx = (e.touches[0].clientX - lastTouchX) * (this.viewBox.width / this.SVG_WIDTH);
                const dy = (e.touches[0].clientY - lastTouchY) * (this.viewBox.height / this.SVG_HEIGHT);

                this.viewBox.x -= dx;
                this.viewBox.y -= dy;

                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;

                this.updateViewBox(svg);
            } else if (e.touches.length === 2) {
                // Пинч для масштабирования
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastTouchDistance > 0) {
                    const scaleFactor = lastTouchDistance / distance;

                    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                    const rect = svg.getBoundingClientRect();
                    const svgCenterX = this.viewBox.x + (centerX - rect.left) * (this.viewBox.width / this.SVG_WIDTH);
                    const svgCenterY = this.viewBox.y + (centerY - rect.top) * (this.viewBox.height / this.SVG_HEIGHT);

                    const newWidth = this.viewBox.width * scaleFactor;
                    const newHeight = this.viewBox.height * scaleFactor;

                    const newScale = this.SVG_WIDTH / newWidth;

                    if (newScale >= this.minScale && newScale <= this.maxScale) {
                        this.viewBox.x = svgCenterX - ((centerX - rect.left) * (newWidth / this.SVG_WIDTH));
                        this.viewBox.y = svgCenterY - ((centerY - rect.top) * (newHeight / this.SVG_HEIGHT));
                        this.viewBox.width = newWidth;
                        this.viewBox.height = newHeight;

                        this.updateViewBox(svg);
                    }
                }

                lastTouchDistance = distance;
            }
            e.preventDefault();
        }, { passive: false });

        svg.addEventListener('touchend', () => {
            this.isPanning = false;
            lastTouchDistance = 0;
        });
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
        // Убираем фокус с input, чтобы закрыть клавиатуру
        this.elements.answerInput.blur();

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
        this.elements.screen.classList.remove('active');
        this.elements.settingsScreen.classList.add('active');
    }

    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
        this.elements.screen.classList.add('active');
    }

    showScreen(screenId) {
        window.showScreen(screenId);
    }
}
