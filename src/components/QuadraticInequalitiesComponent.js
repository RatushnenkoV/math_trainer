// Компонент тренажёра квадратных неравенств
class QuadraticInequalitiesComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="quadratic-inequalities-screen" class="screen">
                <div class="header">
                    <button id="quadratic-inequalities-back-btn" class="icon-button">←</button>
                    <div id="quadratic-inequalities-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="quadratic-inequalities-level-text">Уровень 1</span>
                            <span id="quadratic-inequalities-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="quadratic-inequalities-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="quadratic-inequalities-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="quadratic-inequalities-problem-display" class="problem-display">
                        <div class="quadratic-inequalities-inequality-container">
                            <div id="quadratic-inequalities-inequality" class="quadratic-inequalities-inequality"></div>
                        </div>
                    </div>

                    <div class="number-line-container">
                        <div class="number-line-wrapper">
                            <button id="remove-point-btn" class="point-control-btn">−</button>

                            <svg id="number-line-svg" width="100%" height="180" viewBox="0 0 600 180">
                                <!-- Основная линия -->
                                <line x1="50" y1="80" x2="550" y2="80" stroke="#007bff" stroke-width="2"/>

                                <!-- Стрелка справа -->
                                <polygon points="555,80 545,75 545,85" fill="#007bff"/>

                                <!-- Группа для областей (будет заполняться динамически) -->
                                <g id="regions-group"></g>

                                <!-- Группа для точек (будет заполняться динамически) -->
                                <g id="points-group"></g>
                            </svg>

                            <button id="add-point-btn" class="point-control-btn">+</button>
                        </div>

                        <div class="instructions">
                            Добавьте точки на прямой и введите их координаты.
                            Нажмите на точку, чтобы сделать её закрашенной или полой.
                            Нажмите на области, чтобы включить их в ответ.
                        </div>
                    </div>

                    <button id="quadratic-inequalities-check-btn" class="check-button">Проверить</button>
                    <div id="quadratic-inequalities-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="quadratic-inequalities-settings-screen" class="screen">
                <div class="header">
                    <button id="quadratic-inequalities-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Вид неравенства</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="quadratic-inequalities-non-standard-form">
                            <span>Перемешанный вид</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Коэффициент a</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="quadratic-inequalities-a-equals-one">
                            <span>Только a = 1</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Тип неравенств</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="quadratic-inequalities-allow-incomplete" checked>
                            <span>Разрешить неполные неравенства</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new QuadraticInequalitiesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('quadratic-inequalities-trainer', QuadraticInequalitiesComponent);
