// Компонент тренажёра степеней
class PowersComponent extends BaseTrainerComponent {
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
            <div id="powers-screen" class="screen">
                <div class="header">
                    <button id="powers-back-btn" class="icon-button">←</button>
                    <div id="powers-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="powers-level-text">Уровень 1</span>
                            <span id="powers-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="powers-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="powers-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="powers-problem-display" class="problem-display">
                        <span class="expression-display" id="powers-expression"></span>
                    </div>

                    <div class="answer-input">
                        <div class="input-group">
                            <input type="text" id="powers-answer-input">
                        </div>
                    </div>

                    <button id="powers-check-btn" class="check-button">Проверить</button>
                    <div id="powers-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="powers-settings-screen" class="screen">
                <div class="header">
                    <button id="powers-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">

                    <div class="settings-group">
                        <h3>Дополнительные настройки</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="powers-negative-exponents">
                            <span>Отрицательные показатели</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new PowersTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('powers-trainer', PowersComponent);
