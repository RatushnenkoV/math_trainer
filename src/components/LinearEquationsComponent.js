// Компонент тренажёра линейных уравнений
class LinearEquationsComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('linear-equations')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="linear-equations-screen" class="screen">
                <div class="header">
                    <button id="linear-equations-back-btn" class="icon-button">←</button>
                    <div id="linear-equations-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="linear-equations-level-text">Уровень 1</span>
                            <span id="linear-equations-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="linear-equations-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="linear-equations-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="linear-equations-problem-display" class="problem-display">
                        <div class="linear-equations-equation-container">
                            <div id="linear-equations-equation" class="linear-equations-equation"></div>
                        </div>
                    </div>

                    <div class="answer-input">
                        <div class="input-group linear-equations-input">
                            <label for="linear-equations-answer-input">x =</label>
                            <input type="number" id="linear-equations-answer-input" placeholder="">
                        </div>
                    </div>

                    <button id="linear-equations-check-btn" class="check-button">Проверить</button>
                    <div id="linear-equations-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="linear-equations-settings-screen" class="screen">
                <div class="header">
                    <button id="linear-equations-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Уровень сложности</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-equations-basic" checked>
                            <span>Базовая (kx+b=c)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-equations-easy" checked>
                            <span>Лёгкая (ax+b=cx+d)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-equations-medium" checked>
                            <span>Средняя (со скобками)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="linear-equations-hard">
                            <span>Сложная (с дробями)</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="linear-equations-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new LinearEquationsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('linear-equations-trainer', LinearEquationsComponent);
