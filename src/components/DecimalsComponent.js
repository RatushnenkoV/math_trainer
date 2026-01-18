// Компонент тренажёра десятичных дробей
class DecimalsComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('decimals')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="decimals-screen" class="screen">
                <div class="header">
                    <button id="decimals-back-btn" class="icon-button">←</button>
                    <div id="decimals-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="decimals-level-text">Уровень 1</span>
                            <span id="decimals-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="decimals-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="decimals-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="decimals-problem-display" class="problem-display">
                        <span class="decimal-display" id="decimal1"></span>
                        <span class="operator" id="decimals-operator"></span>
                        <span class="decimal-display" id="decimal2"></span>
                        <span class="equals">=</span>
                        <span class="question">?</span>
                    </div>

                    <div class="answer-input">
                        <div class="input-group decimal-input">
                            <input type="number" id="decimal-answer-input" placeholder="0.0">
                        </div>
                    </div>

                    <button id="decimals-check-btn" class="check-button">Проверить</button>
                    <div id="decimals-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="decimals-settings-screen" class="screen">
                <div class="header">
                    <button id="decimals-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Операции</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="decimals-addition" checked>
                            <span>Сложение</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="decimals-subtraction" checked>
                            <span>Вычитание</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="decimals-multiplication">
                            <span>Умножение</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="decimals-division">
                            <span>Деление</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Дополнительно</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="decimals-negative-numbers">
                            <span>Отрицательные числа</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="decimals-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new DecimalsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('decimals-trainer', DecimalsComponent);
