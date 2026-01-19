// Компонент тренажёра на векторы
class VectorsComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('vectors')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="vectors-screen" class="screen">
                <div class="header">
                    <button id="vectors-back-btn" class="icon-button">←</button>
                    <div id="vectors-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="vectors-level-text">Уровень 1</span>
                            <span id="vectors-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="vectors-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="vectors-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="vectors-problem-display" class="problem-display"></div>

                    <h3 id="vectors-mode-title" class="mode-title">Определите координаты вектора</h3>
                    <div id="vectors-grid-container" class="grid-container">
                        <!-- Координатная сетка будет вставлена сюда -->
                    </div>

                    <div id="vectors-inputs-container" class="vectors-inputs">
                        <span class="input-label">x =</span>
                        <input type="number" id="vectors-x-input" placeholder="0">
                        <span class="input-label">y =</span>
                        <input type="number" id="vectors-y-input" placeholder="0">
                    </div>

                    <button id="vectors-check-btn" class="check-button">Проверить</button>
                    <div id="vectors-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="vectors-settings-screen" class="screen">
                <div class="header">
                    <button id="vectors-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="vectors-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new VectorsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('vectors-trainer', VectorsComponent);
