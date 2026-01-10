// Тренажёр на векторы
class VectorsTrainer extends BaseTrainer {
    constructor() {
        super({
            name: 'vectors',
            generator: new VectorsGenerator(),
            progressTracker: new ProgressTracker('mathTrainerVectorsProgress'),
            settings: {},
            storageKey: 'mathTrainerVectorsSettings'
        });

        this.selectedStart = null;
        this.selectedEnd = null;
        this.isDragging = false;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('vectors-screen'),
            backBtn: document.getElementById('vectors-back-btn'),
            checkBtn: document.getElementById('vectors-check-btn'),

            levelText: document.getElementById('vectors-level-text'),
            progressText: document.getElementById('vectors-progress-text'),
            progressFill: document.getElementById('vectors-progress-fill'),
            resultMessage: document.getElementById('vectors-result-message'),
            problemDisplay: document.getElementById('vectors-problem-display'),

            modeTitle: document.getElementById('vectors-mode-title'),
            gridContainer: document.getElementById('vectors-grid-container'),
            xInput: document.getElementById('vectors-x-input'),
            yInput: document.getElementById('vectors-y-input'),
            inputsContainer: document.getElementById('vectors-inputs-container')
        };

        this.initEventHandlers();
    }

    // Переопределяем initEventHandlers, убираем кнопку настроек
    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });
    }

    // Переопределяем проверку операций, т.к. у нас нет операций
    hasOperationsSelected() {
        return true;
    }

    displayProblem(problem) {
        this.selectedStart = null;
        this.selectedEnd = null;
        this.isDragging = false;

        if (problem.mode === 'findCoords') {
            // Режим: показать вектор, определить координаты
            this.elements.modeTitle.textContent = 'Определите координаты вектора';
            this.elements.inputsContainer.style.display = 'flex';
            this.drawGrid(problem, true);
        } else {
            // Режим: показать координаты, нарисовать вектор
            this.elements.modeTitle.textContent = `Нарисуйте вектор с координатами (${problem.vectorX}; ${problem.vectorY})`;
            this.elements.inputsContainer.style.display = 'none';
            this.drawGrid(problem, false);
        }
    }

    drawGrid(problem, showVector) {
        const { minCoord, maxCoord, startX, startY, endX, endY } = problem;

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

        // Если нужно показать вектор
        if (showVector) {
            this.drawVector(svg, startX, startY, endX, endY, minCoord, cellWidth, cellHeight, width, height, padding, '#4CAF50');
        } else {
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
                                  minCoord, cellWidth, cellHeight, width, height, padding, '#2196F3', true);
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
                                  minCoord, cellWidth, cellHeight, width, height, padding, '#2196F3', true);
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
        }

        container.appendChild(svg);
    }

    drawVector(svg, startX, startY, endX, endY, minCoord, cellWidth, cellHeight, width, height, padding, color, isUser = false) {
        const x1 = padding + (startX - minCoord) * cellWidth;
        const y1 = height - padding - (startY - minCoord) * cellHeight;
        const x2 = padding + (endX - minCoord) * cellWidth;
        const y2 = height - padding - (endY - minCoord) * cellHeight;

        // Группа для вектора
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        if (isUser) group.setAttribute('class', 'user-vector');

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
            line.setAttribute('marker-end', `url(#arrowhead-${isUser ? 'user' : 'correct'})`);
            group.appendChild(line);
        }

        // Начальная точка (кружок) - для нулевого вектора делаем её чуть больше
        const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        startCircle.setAttribute('cx', x1);
        startCircle.setAttribute('cy', y1);
        startCircle.setAttribute('r', isZeroVector ? '7' : '5');
        startCircle.setAttribute('fill', color);
        group.appendChild(startCircle);

        // Создаём marker для стрелки, если его ещё нет
        const markerId = `arrowhead-${isUser ? 'user' : 'correct'}`;
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

        if (problem.mode === 'findCoords') {
            // Проверяем введённые координаты вектора
            const userX = parseInt(this.elements.xInput.value);
            const userY = parseInt(this.elements.yInput.value);

            isCorrect = userX === problem.vectorX && userY === problem.vectorY;
        } else {
            // Проверяем нарисованный вектор
            if (this.selectedStart && this.selectedEnd) {
                const userVectorX = this.selectedEnd.x - this.selectedStart.x;
                const userVectorY = this.selectedEnd.y - this.selectedStart.y;

                isCorrect = userVectorX === problem.vectorX && userVectorY === problem.vectorY;
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

    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '';
    }

    showScreen(screenId) {
        window.showScreen(screenId);
    }
}
