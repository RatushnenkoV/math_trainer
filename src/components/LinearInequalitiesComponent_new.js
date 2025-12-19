// Компонент тренажёра линейных неравенств
class LinearInequalitiesComponent extends BaseTrainerComponent {
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
            <div id="linear-inequalities-screen" class="screen">
                <div class="header">
                    <button id="linear-inequalities-back-btn" class="icon-button">←</button>
                    <div id="linear-inequalities-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="linear-inequalities-level-text">Уровень 1</span>
                            <span id="linear-inequalities-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="linear-inequalities-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="linear-inequalities-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="linear-inequalities-problem-display" class="problem-display">
                        <div class="linear-inequalities-inequality-container">
                            <div id="linear-inequalities-inequality" class="linear-inequalities-inequality"></div>
                        </div>
                    </div>

                    <div class="number-line-container">
                        <svg id="linear-number-line-svg" width="100%" height="240" viewBox="0 0 600 240">
                            <!-- Основная линия -->
                            <line x1="50" y1="50" x2="550" y2="50" stroke="#007bff" stroke-width="2"/>

                            <!-- Стрелка справа -->
                            <polygon points="555,50 545,45 545,55" fill="#007bff"/>

                            <!-- Группа для областей (будет заполняться динамически) -->
                            <g id="linear-regions-group"></g>

                            <!-- Группа для точек (будет заполняться динамически) -->
                            <g id="linear-points-group"></g>
                        </svg>

                        <div class="instructions">
                            Введите координату точки.
                            Нажмите на точку, чтобы сделать её закрашенной или полой.
                            Нажмите на области слева или справа, чтобы включить их в ответ.
                        </div>
                    </div>

                    <button id="linear-inequalities-check-btn" class="check-button">Проверить</button>
                    <div id="linear-inequalities-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="linear-inequalities-settings-screen" class="screen">
                <div class="header">
                    <button id="linear-inequalities-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Уровень сложности</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-inequalities-basic" checked>
                            <span>Элементарный (kx+b < 0)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-inequalities-easy" checked>
                            <span>Лёгкий (ax+b < cx+d)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-inequalities-medium" checked>
                            <span>Нормальный (со скобками)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-inequalities-hard">
                            <span>Сложный (с дробями)</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new LinearInequalitiesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('linear-inequalities-trainer', LinearInequalitiesComponent);
