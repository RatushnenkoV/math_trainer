// Компонент тренажёра систем неравенств
class SystemOfInequalitiesComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = this.getMainScreenTemplate();
    }

    getMainScreenTemplate() {
        return `
            <div id="system-of-inequalities-screen" class="screen">
                <div class="header">
                    <button id="system-of-inequalities-back-btn" class="icon-button">←</button>
                    <div id="system-of-inequalities-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="system-of-inequalities-level-text">Уровень 1</span>
                            <span id="system-of-inequalities-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="system-of-inequalities-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <div></div>
                </div>

                <div class="content">
                    <div id="system-of-inequalities-problem-display" class="problem-display"></div>

                    <div class="number-line-container">
                        <div class="number-line-wrapper">
                            <button id="system-remove-point-btn" class="point-control-btn">−</button>

                            <svg id="system-number-line-svg" width="100%" height="240" viewBox="0 0 600 240">
                                <!-- Основная линия -->
                                <line x1="50" y1="50" x2="550" y2="50" stroke="#007bff" stroke-width="2"/>

                                <!-- Стрелка справа -->
                                <polygon points="555,50 545,45 545,55" fill="#007bff"/>

                                <!-- Группа для областей (будет заполняться динамически) -->
                                <g id="system-regions-group"></g>

                                <!-- Группа для точек (будет заполняться динамически) -->
                                <g id="system-points-group"></g>
                            </svg>

                            <button id="system-add-point-btn" class="point-control-btn">+</button>
                        </div>

                        <div class="instructions">
                            Добавьте точки на прямой и введите их координаты.
                            Нажмите на точку, чтобы сделать её закрашенной или полой.
                            Нажмите на области, чтобы включить их в ответ.
                        </div>
                    </div>

                    <button id="system-of-inequalities-check-btn" class="check-button">Проверить</button>
                    <div id="system-of-inequalities-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new SystemOfInequalitiesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('system-of-inequalities-trainer', SystemOfInequalitiesComponent);
