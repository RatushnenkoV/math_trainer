// Компонент тренажёра "Чувство дроби"
class FractionSenseComponent extends BaseTrainerComponent {
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
            <div id="fraction-sense-screen" class="screen">
                <div class="header">
                    <button id="fraction-sense-back-btn" class="icon-button">←</button>
                    <div id="fraction-sense-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="fraction-sense-level-text">Уровень 1</span>
                            <span id="fraction-sense-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="fraction-sense-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="fraction-sense-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="fraction-sense-problem-display" class="fraction-sense-problem-display">
                        <!-- Здесь будет отображаться дробь -->
                    </div>

                    <div id="fraction-sense-slider" class="fraction-sense-slider">
                        <div class="slider-labels">
                            <span>0</span>
                            <span>1</span>
                        </div>
                        <div id="fraction-sense-slider-track" class="slider-track">
                            <div id="fraction-sense-slider-fill" class="slider-fill"></div>
                            <div id="fraction-sense-slider-thumb" class="slider-thumb"></div>
                        </div>
                    </div>

                    <button id="fraction-sense-check-btn" class="check-button">Проверить</button>
                    <div id="fraction-sense-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="fraction-sense-settings-screen" class="screen">
                <div class="header">
                    <button id="fraction-sense-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Типы чисел</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="fraction-sense-percentages">
                            <span>Проценты</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="fraction-sense-decimals">
                            <span>Десятичные дроби</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Точность угадывания</h3>
                        <div class="difficulty-slider-container">
                            <input type="range" id="difficulty-slider" min="1" max="3" step="1" value="2">
                            <div class="difficulty-labels">
                                <span>Легко<br>±15%</span>
                                <span>Средне<br>±10%</span>
                                <span>Сложно<br>±5%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new FractionSenseTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('fraction-sense-trainer', FractionSenseComponent);
