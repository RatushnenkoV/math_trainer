// Тренажёр на координаты
class CoordinatesTrainer extends BaseTrainer {
    constructor() {
        const savedSettings = localStorage.getItem('mathTrainerCoordinatesSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            minX: -5,
            maxX: 5,
            minY: -5,
            maxY: 5
        };

        super({
            name: 'coordinates',
            generator: new CoordinatesGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerCoordinatesProgress'),
            settings: settings,
            storageKey: 'mathTrainerCoordinatesSettings'
        });

        this.selectedPoint = null;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('coordinates-screen'),
            backBtn: document.getElementById('coordinates-back-btn'),
            settingsBtn: document.getElementById('coordinates-settings-btn'),
            settingsScreen: document.getElementById('coordinates-settings-screen'),
            settingsBackBtn: document.getElementById('coordinates-settings-back-btn'),
            checkBtn: document.getElementById('coordinates-check-btn'),

            levelText: document.getElementById('coordinates-level-text'),
            progressText: document.getElementById('coordinates-progress-text'),
            progressFill: document.getElementById('coordinates-progress-fill'),
            resultMessage: document.getElementById('coordinates-result-message'),
            problemDisplay: document.getElementById('coordinates-problem-display'),

            modeTitle: document.getElementById('coordinates-mode-title'),
            gridContainer: document.getElementById('coordinates-grid-container'),
            xInput: document.getElementById('coordinates-x-input'),
            yInput: document.getElementById('coordinates-y-input'),
            inputsContainer: document.getElementById('coordinates-inputs-container'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('coordinates-share-btn')
        };

        this.initEventHandlers();
        this.initShareModalHandlers();
    }

    // Переопределяем initEventHandlers
    initEventHandlers() {
        // Вызываем базовый метод для кнопки "Поделиться"
        super.initEventHandlers();

        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Кнопка настроек
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => {
                this.showSettingsScreen();
            });
        }

        // Кнопка назад в настройках
        if (this.elements.settingsBackBtn) {
            this.elements.settingsBackBtn.addEventListener('click', () => {
                this.hideSettingsScreen();
            });
        }

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.showScreen('coordinates-settings-screen');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('coordinates-screen');
    }

    // Переопределяем проверку операций, т.к. у нас нет операций
    hasOperationsSelected() {
        return true;
    }

    displayProblem(problem) {
        this.selectedPoint = null;

        if (problem.mode === 'pointToCoords') {
            // Режим: показать точку, угадать координаты
            this.elements.modeTitle.textContent = 'Определите координаты точки';
            this.elements.inputsContainer.style.display = 'flex';
            this.drawGrid(problem, true);
        } else {
            // Режим: показать координаты, угадать точку
            this.elements.modeTitle.textContent = `Отметьте точку (${problem.x}; ${problem.y})`;
            this.elements.inputsContainer.style.display = 'none';
            this.drawGrid(problem, false);
        }
    }

    drawGrid(problem, showPoint) {
        const { minX, maxX, minY, maxY, x, y } = problem;

        const container = this.elements.gridContainer;
        container.innerHTML = '';

        const width = 400;
        const height = 400;
        const padding = 40;

        const xRange = maxX - minX;
        const yRange = maxY - minY;
        const cellWidth = (width - 2 * padding) / xRange;
        const cellHeight = (height - 2 * padding) / yRange;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Рисуем вертикальные линии сетки
        for (let i = minX; i <= maxX; i++) {
            const xPos = padding + (i - minX) * cellWidth;
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
        for (let i = minY; i <= maxY; i++) {
            const yPos = height - padding - (i - minY) * cellHeight;
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

        // Если нужно показать точку
        if (showPoint) {
            const pointX = padding + (x - minX) * cellWidth;
            const pointY = height - padding - (y - minY) * cellHeight;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pointX);
            circle.setAttribute('cy', pointY);
            circle.setAttribute('r', '6');
            circle.setAttribute('fill', '#4CAF50');
            svg.appendChild(circle);
        } else {
            // Добавляем обработчик клика для выбора точки
            svg.style.cursor = 'crosshair';
            svg.addEventListener('click', (e) => {
                const rect = svg.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                // Переводим координаты клика в координаты сетки
                const gridX = Math.round((clickX - padding) / cellWidth) + minX;
                const gridY = Math.round((height - padding - clickY) / cellHeight) + minY;

                // Проверяем, что точка в пределах сетки
                if (gridX >= minX && gridX <= maxX && gridY >= minY && gridY <= maxY) {
                    this.selectedPoint = { x: gridX, y: gridY };

                    // Удаляем предыдущие отметки
                    const oldCircles = svg.querySelectorAll('.user-point');
                    oldCircles.forEach(c => c.remove());

                    // Рисуем новую точку
                    const pointX = padding + (gridX - minX) * cellWidth;
                    const pointY = height - padding - (gridY - minY) * cellHeight;

                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', pointX);
                    circle.setAttribute('cy', pointY);
                    circle.setAttribute('r', '6');
                    circle.setAttribute('fill', '#2196F3');
                    circle.setAttribute('class', 'user-point');
                    svg.appendChild(circle);
                }
            });
        }

        container.appendChild(svg);
    }

    clearInputs() {
        if (this.elements.xInput) this.elements.xInput.value = '';
        if (this.elements.yInput) this.elements.yInput.value = '';
        this.selectedPoint = null;
        this.elements.resultMessage.className = 'result-message';
    }

    checkAnswer() {
        const problem = this.currentProblem;
        let isCorrect = false;

        if (problem.mode === 'pointToCoords') {
            // Проверяем введённые координаты
            const userX = parseInt(this.elements.xInput.value);
            const userY = parseInt(this.elements.yInput.value);

            isCorrect = userX === problem.x && userY === problem.y;
        } else {
            // Проверяем выбранную точку
            if (this.selectedPoint) {
                isCorrect = this.selectedPoint.x === problem.x && this.selectedPoint.y === problem.y;
            } else {
                this.elements.resultMessage.textContent = 'Выберите точку на сетке';
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
