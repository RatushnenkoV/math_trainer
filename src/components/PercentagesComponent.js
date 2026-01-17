// Компонент тренажёра процентов
class PercentagesComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('percentages')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="percentages-screen" class="screen">
                <div class="header">
                    <button id="percentages-back-btn" class="icon-button">←</button>
                    <div id="percentages-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="percentages-level-text">Уровень 1</span>
                            <span id="percentages-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="percentages-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="percentages-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="percentages-problem-display" class="problem-display">
                    </div>

                    <div class="answer-input">
                        <div class="input-group">
                            <input type="number" id="percentages-answer-input" placeholder="Введите ответ">
                        </div>
                    </div>

                    <button id="percentages-check-btn" class="check-button">Проверить</button>
                    <div id="percentages-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="percentages-settings-screen" class="screen">
                <div class="header">
                    <button id="percentages-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Типы задач</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="percentages-find-part-of-number" checked>
                            <span>Найти A% от B</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="percentages-find-number-by-part" checked>
                            <span>Найти число по его части</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="percentages-find-percentage" checked>
                            <span>Определить процент</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="percentages-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new PercentagesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('percentages-trainer', PercentagesComponent);
