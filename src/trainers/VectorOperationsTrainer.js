// Тренажёр на действия над векторами
class VectorOperationsTrainer extends BaseTrainer {
    constructor() {
        super({
            name: 'vector-operations',
            generator: new VectorOperationsGenerator(),
            progressTracker: new ProgressTracker('mathTrainerVectorOperationsProgress'),
            settings: {
                byCoordinates: true,
                byDrawing: true,
                addition: true,
                subtraction: true,
                multiplication: true
            },
            storageKey: 'mathTrainerVectorOperationsSettings'
        });

        this.selectedStart = null;
        this.selectedEnd = null;
        this.isDragging = false;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('vector-operations-screen'),
            backBtn: document.getElementById('vector-operations-back-btn'),
            settingsBtn: document.getElementById('vector-operations-settings-btn'),
            checkBtn: document.getElementById('vector-operations-check-btn'),

            levelText: document.getElementById('vector-operations-level-text'),
            progressText: document.getElementById('vector-operations-progress-text'),
            progressFill: document.getElementById('vector-operations-progress-fill'),
            resultMessage: document.getElementById('vector-operations-result-message'),
            problemDisplay: document.getElementById('vector-operations-problem-display'),

            taskText: document.getElementById('vector-operations-task-text'),
            questionText: document.getElementById('vector-operations-question-text'),
            gridContainer: document.getElementById('vector-operations-grid-container'),
            xInput: document.getElementById('vector-operations-x-input'),
            yInput: document.getElementById('vector-operations-y-input'),
            inputsContainer: document.getElementById('vector-operations-inputs-container'),

            // Настройки
            settingsScreen: document.getElementById('vector-operations-settings-screen'),
            settingsBackBtn: document.getElementById('vector-operations-settings-back-btn'),
            byCoordinatesCheckbox: document.getElementById('by-coordinates'),
            byDrawingCheckbox: document.getElementById('by-drawing'),
            additionCheckbox: document.getElementById('vo-addition'),
            subtractionCheckbox: document.getElementById('vo-subtraction'),
            multiplicationCheckbox: document.getElementById('vo-multiplication'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('vector-operations-share-btn')
        };

        this.initEventHandlers();
        this.loadSettings();
        this.updateGeneratorSettings();
        this.initSettingsHandlers();
        this.initShareModalHandlers();
    }

    initEventHandlers() {
        // Вызываем базовый метод для инициализации кнопки "Поделиться"
        super.initEventHandlers();
    }

    initSettingsHandlers() {
        // Обработчики для настроек
        this.elements.byCoordinatesCheckbox.addEventListener('change', (e) => {
            this.settings.byCoordinates = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        this.elements.byDrawingCheckbox.addEventListener('change', (e) => {
            this.settings.byDrawing = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        this.elements.additionCheckbox.addEventListener('change', (e) => {
            this.settings.addition = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        this.elements.subtractionCheckbox.addEventListener('change', (e) => {
            this.settings.subtraction = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        this.elements.multiplicationCheckbox.addEventListener('change', (e) => {
            this.settings.multiplication = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        // Загружаем текущие настройки в чекбоксы
        this.elements.byCoordinatesCheckbox.checked = this.settings.byCoordinates;
        this.elements.byDrawingCheckbox.checked = this.settings.byDrawing;
        this.elements.additionCheckbox.checked = this.settings.addition;
        this.elements.subtractionCheckbox.checked = this.settings.subtraction;
        this.elements.multiplicationCheckbox.checked = this.settings.multiplication;
    }

    // Переопределяем проверку операций
    hasOperationsSelected() {
        const hasMode = this.settings.byCoordinates || this.settings.byDrawing;
        const hasOperation = this.settings.addition || this.settings.subtraction || this.settings.multiplication;
        return hasMode && hasOperation;
    }

    displayProblem(problem) {
        if (!problem) return;

        this.selectedStart = null;
        this.selectedEnd = null;
        this.isDragging = false;

        if (problem.mode === 'coordinates') {
            // Режим: задача по координатам
            this.elements.taskText.innerHTML = '';
            this.elements.questionText.innerHTML = '';

            // Рендерим LaTeX для координат векторов
            katex.render(problem.taskText, this.elements.taskText, {
                throwOnError: false,
                displayMode: false
            });

            // Рендерим LaTeX для вопроса - разбираем текст с inline math
            const parts = problem.questionText.split(/(\\\(.*?\\\))/g);
            this.elements.questionText.innerHTML = '';

            parts.forEach(part => {
                if (part.startsWith('\\(') && part.endsWith('\\)')) {
                    // Это LaTeX формула
                    const formula = part.substring(2, part.length - 2);
                    const span = document.createElement('span');
                    katex.render(formula, span, { throwOnError: false, displayMode: false });
                    this.elements.questionText.appendChild(span);
                } else if (part) {
                    // Это обычный текст
                    this.elements.questionText.appendChild(document.createTextNode(part));
                }
            });

            this.elements.inputsContainer.style.display = 'flex';
            this.elements.gridContainer.style.display = 'none';
        } else {
            // Режим: задача по рисунку
            this.elements.taskText.innerHTML = '';

            // Рендерим LaTeX для вопроса в режиме рисования
            const parts = problem.questionText.split(/(\\\(.*?\\\))/g);
            this.elements.questionText.innerHTML = '';

            parts.forEach(part => {
                if (part.startsWith('\\(') && part.endsWith('\\)')) {
                    // Это LaTeX формула
                    const formula = part.substring(2, part.length - 2);
                    const span = document.createElement('span');
                    katex.render(formula, span, { throwOnError: false, displayMode: false });
                    this.elements.questionText.appendChild(span);
                } else if (part) {
                    // Это обычный текст
                    this.elements.questionText.appendChild(document.createTextNode(part));
                }
            });

            this.elements.inputsContainer.style.display = 'none';
            this.elements.gridContainer.style.display = 'block';
            this.drawGrid(problem);
        }
    }

    drawGrid(problem) {
        const { minCoord, maxCoord } = problem;

        const container = this.elements.gridContainer;
        container.innerHTML = '';

        const width = 400;
        const height = 400;
        const padding = 40;

        const xRange = maxCoord - minCoord;
        const yRange = maxCoord - minCoord;
        const cellWidth = (width - 2 * padding) / xRange;
        const cellHeight = (height - 2 * padding) / yRange;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Рисуем вертикальные линии сетки
        for (let i = minCoord; i <= maxCoord; i++) {
            const xPos = padding + (i - minCoord) * cellWidth;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', xPos);
            line.setAttribute('y1', padding);
            line.setAttribute('x2', xPos);
            line.setAttribute('y2', height - padding);
            line.setAttribute('stroke', i === 0 ? '#333' : '#ddd');
            line.setAttribute('stroke-width', i === 0 ? '2' : '1');
            svg.appendChild(line);

            // Подписи по X
            if (i % 1 === 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', xPos);
                text.setAttribute('y', height - padding + 20);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '12');
                text.setAttribute('fill', '#666');
                text.textContent = i;
                svg.appendChild(text);
            }
        }

        // Рисуем горизонтальные линии сетки
        for (let i = minCoord; i <= maxCoord; i++) {
            const yPos = height - padding - (i - minCoord) * cellHeight;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding);
            line.setAttribute('y1', yPos);
            line.setAttribute('x2', width - padding);
            line.setAttribute('y2', yPos);
            line.setAttribute('stroke', i === 0 ? '#333' : '#ddd');
            line.setAttribute('stroke-width', i === 0 ? '2' : '1');
            svg.appendChild(line);

            // Подписи по Y
            if (i % 1 === 0 && i !== 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', padding - 10);
                text.setAttribute('y', yPos + 4);
                text.setAttribute('text-anchor', 'end');
                text.setAttribute('font-size', '12');
                text.setAttribute('fill', '#666');
                text.textContent = i;
                svg.appendChild(text);
            }
        }

        // Рисуем векторы из задачи
        const vectorA = problem.vectorA;
        this.drawVector(svg, vectorA.startX, vectorA.startY, vectorA.endX, vectorA.endY,
                       minCoord, cellWidth, cellHeight, width, height, padding, '#4CAF50', 'a');

        if (problem.operation === 'addition' || problem.operation === 'subtraction') {
            const vectorB = problem.vectorB;
            this.drawVector(svg, vectorB.startX, vectorB.startY, vectorB.endX, vectorB.endY,
                           minCoord, cellWidth, cellHeight, width, height, padding, '#FF9800', 'b');
        }

        // Добавляем возможность рисовать вектор
        svg.style.cursor = 'crosshair';

        const getCoordinates = (e) => {
            const rect = svg.getBoundingClientRect();
            let clickX, clickY;

            if (e.type.startsWith('touch')) {
                const touch = e.touches[0] || e.changedTouches[0];
                clickX = touch.clientX - rect.left;
                clickY = touch.clientY - rect.top;
            } else {
                clickX = e.clientX - rect.left;
                clickY = e.clientY - rect.top;
            }

            return { clickX, clickY };
        };

        const handleStart = (e) => {
            e.preventDefault();
            const { clickX, clickY } = getCoordinates(e);

            const gridX = Math.round((clickX - padding) / cellWidth) + minCoord;
            const gridY = Math.round((height - padding - clickY) / cellHeight) + minCoord;

            if (gridX >= minCoord && gridX <= maxCoord && gridY >= minCoord && gridY <= maxCoord) {
                this.isDragging = true;
                this.selectedStart = { x: gridX, y: gridY };
                this.selectedEnd = { x: gridX, y: gridY };

                // Удаляем предыдущий вектор перед рисованием нового
                const oldVectors = svg.querySelectorAll('.user-vector');
                oldVectors.forEach(v => v.remove());

                // Draw initial zero vector immediately
                this.drawVector(svg, this.selectedStart.x, this.selectedStart.y,
                              this.selectedEnd.x, this.selectedEnd.y,
                              minCoord, cellWidth, cellHeight, width, height, padding, '#2196F3', 'user');
            }
        };

        const handleMove = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const { clickX, clickY } = getCoordinates(e);

            const gridX = Math.round((clickX - padding) / cellWidth) + minCoord;
            const gridY = Math.round((height - padding - clickY) / cellHeight) + minCoord;

            if (gridX >= minCoord && gridX <= maxCoord && gridY >= minCoord && gridY <= maxCoord) {
                this.selectedEnd = { x: gridX, y: gridY };

                // Удаляем предыдущий вектор
                const oldVectors = svg.querySelectorAll('.user-vector');
                oldVectors.forEach(v => v.remove());

                // Рисуем новый вектор (включая нулевой)
                this.drawVector(svg, this.selectedStart.x, this.selectedStart.y,
                              this.selectedEnd.x, this.selectedEnd.y,
                              minCoord, cellWidth, cellHeight, width, height, padding, '#2196F3', 'user');
            }
        };

        const handleEnd = (e) => {
            e.preventDefault();
            this.isDragging = false;
        };

        // Поддержка мыши
        svg.addEventListener('mousedown', handleStart);
        svg.addEventListener('mousemove', handleMove);
        svg.addEventListener('mouseup', handleEnd);
        svg.addEventListener('mouseleave', handleEnd);

        // Поддержка касаний
        svg.addEventListener('touchstart', handleStart, { passive: false });
        svg.addEventListener('touchmove', handleMove, { passive: false });
        svg.addEventListener('touchend', handleEnd, { passive: false });
        svg.addEventListener('touchcancel', handleEnd, { passive: false });

        container.appendChild(svg);
    }

    drawVector(svg, startX, startY, endX, endY, minCoord, cellWidth, cellHeight, width, height, padding, color, vectorId) {
        const x1 = padding + (startX - minCoord) * cellWidth;
        const y1 = height - padding - (startY - minCoord) * cellHeight;
        const x2 = padding + (endX - minCoord) * cellWidth;
        const y2 = height - padding - (endY - minCoord) * cellHeight;

        // Группа для вектора
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        if (vectorId === 'user') group.setAttribute('class', 'user-vector');

        const isZeroVector = (startX === endX && startY === endY);

        // Рисуем линию только если вектор не нулевой
        if (!isZeroVector) {
            // Линия вектора
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '3');
            line.setAttribute('marker-end', `url(#arrowhead-${vectorId})`);
            group.appendChild(line);
        }

        // Начальная точка (кружок) - для нулевого вектора делаем её чуть больше
        const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startCircle.setAttribute('cx', x1);
        startCircle.setAttribute('cy', y1);
        startCircle.setAttribute('r', isZeroVector ? '7' : '5');
        startCircle.setAttribute('fill', color);
        group.appendChild(startCircle);

        // Добавляем метку вектора (a или b) с использованием LaTeX
        if (vectorId !== 'user') {
            const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
            foreignObject.setAttribute('x', x2 + 5);
            foreignObject.setAttribute('y', y2 - 25);
            foreignObject.setAttribute('width', '40');
            foreignObject.setAttribute('height', '30');

            const div = document.createElement('div');
            div.style.color = color;
            div.style.fontWeight = 'bold';

            // Рендерим LaTeX для метки вектора
            katex.render(`\\vec{${vectorId}}`, div, {
                throwOnError: false,
                displayMode: false
            });

            foreignObject.appendChild(div);
            group.appendChild(foreignObject);
        }

        // Создаём marker для стрелки, если его ещё нет
        const markerId = `arrowhead-${vectorId}`;
        if (!svg.querySelector(`#${markerId}`)) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', markerId);
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '3');
            marker.setAttribute('orient', 'auto');
            marker.setAttribute('markerUnits', 'strokeWidth');

            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3, 0 6');
            polygon.setAttribute('fill', color);
            marker.appendChild(polygon);

            defs.appendChild(marker);
            svg.insertBefore(defs, svg.firstChild);
        }

        svg.appendChild(group);
    }

    clearInputs() {
        if (this.elements.xInput) this.elements.xInput.value = '';
        if (this.elements.yInput) this.elements.yInput.value = '';
        this.selectedStart = null;
        this.selectedEnd = null;
        this.isDragging = false;
        this.elements.resultMessage.className = 'result-message';
    }

    checkAnswer() {
        const problem = this.currentProblem;
        let isCorrect = false;

        if (problem.mode === 'coordinates') {
            // Проверяем введённые координаты
            const userX = parseInt(this.elements.xInput.value);
            const userY = parseInt(this.elements.yInput.value);

            isCorrect = userX === problem.resultX && userY === problem.resultY;
        } else {
            // Проверяем нарисованный вектор
            if (this.selectedStart && this.selectedEnd) {
                const userVectorX = this.selectedEnd.x - this.selectedStart.x;
                const userVectorY = this.selectedEnd.y - this.selectedStart.y;

                isCorrect = userVectorX === problem.resultX && userVectorY === problem.resultY;
            } else {
                this.elements.resultMessage.textContent = 'Нарисуйте вектор на сетке';
                this.elements.resultMessage.className = 'result-message wrong show';
                setTimeout(() => {
                    this.elements.resultMessage.classList.remove('show');
                }, 1000);
                return;
            }
        }

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<p class="no-operations">Выберите хотя бы один режим и одну операцию в настройках</p>';
        // Скрываем элементы задания
        this.elements.taskText.style.display = 'none';
        this.elements.questionText.style.display = 'none';
        this.elements.gridContainer.style.display = 'none';
        this.elements.inputsContainer.style.display = 'none';
    }

    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '';
        // Показываем элементы задания
        this.elements.taskText.style.display = '';
        this.elements.questionText.style.display = '';
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
