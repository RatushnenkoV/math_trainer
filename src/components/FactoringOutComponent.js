class FactoringOutComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('factoring-out')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="factoring-out-screen" class="screen">
                <div class="header">
                    <button id="factoring-out-back-btn" class="icon-button">←</button>
                    <div id="factoring-out-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="factoring-out-level-text">Уровень 1</span>
                            <span id="factoring-out-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="factoring-out-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="factoring-out-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="factoring-out-problem-display" class="factoring-out-problem-display">
                    </div>

                    <!-- Контейнер для вынесения множителя за скобки -->
                    <div id="factoring-out-factorization-container" class="factoring-out-factorization-container">
                    </div>

                    <div id="variables-panel-fo" class="variables-panel">
                    </div>

                    <div class="instructions">
                        Перенесите общий множитель за скобки, а остаток — внутрь скобок.
                    </div>

                    <button id="factoring-out-check-btn" class="check-button">Проверить</button>
                    <div id="factoring-out-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="factoring-out-settings-screen" class="screen">
                <div class="header">
                    <button id="factoring-out-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="factoring-out-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new FactoringOutTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('factoring-out-trainer', FactoringOutComponent);
