// Компонент тренажёра делимости
class DivisibilityComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('divisibility')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="divisibility-screen" class="screen">
                <div class="header">
                    <button id="divisibility-back-btn" class="icon-button">←</button>
                    <div id="divisibility-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="divisibility-level-text">Уровень 1</span>
                            <span id="divisibility-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="divisibility-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="divisibility-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="divisibility-problem-display" class="problem-display">
                        <div class="divisibility-question">
                            Делится ли число <span id="divisibility-number" class="divisibility-number"></span> на <span id="divisibility-divisor" class="divisibility-divisor"></span>?
                        </div>
                    </div>

                    <div class="divisibility-buttons">
                        <button id="divisibility-yes-btn" class="divisibility-btn yes-btn">Да</button>
                        <button id="divisibility-no-btn" class="divisibility-btn no-btn">Нет</button>
                    </div>

                    <div id="divisibility-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="divisibility-settings-screen" class="screen">
                <div class="header">
                    <button id="divisibility-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Делимость на</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div2" checked>
                            <span>2</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div3" checked>
                            <span>3</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div4" checked>
                            <span>4</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div5" checked>
                            <span>5</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div6" checked>
                            <span>6</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div8" checked>
                            <span>8</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div9" checked>
                            <span>9</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="divisibility-div10" checked>
                            <span>10</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="divisibility-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new DivisibilityTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('divisibility-trainer', DivisibilityComponent);
