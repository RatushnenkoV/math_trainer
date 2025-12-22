// Компонент тренажёра отрицательных чисел
class NegativesComponent extends BaseTrainerComponent {
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
            <div id="negatives-screen" class="screen">
                <div class="header">
                    <button id="negatives-back-btn" class="icon-button">←</button>
                    <div id="negatives-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="negatives-level-text">Уровень 1</span>
                            <span id="negatives-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="negatives-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="negatives-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="negatives-problem-display" class="problem-display">
                        <span class="negative-display" id="negative1"></span>
                        <span class="operator" id="negatives-operator"></span>
                        <span class="negative-display" id="negative2"></span>
                        <span class="equals">=</span>
                        <span class="question">?</span>
                    </div>

                    <div class="answer-input">
                        <div class="input-group negative-input">
                            <input type="number" id="negative-answer-input" placeholder="0" inputmode="numeric">
                        </div>
                    </div>

                    <button id="negatives-check-btn" class="check-button">Проверить</button>
                    <div id="negatives-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="negatives-settings-screen" class="screen">
                <div class="header">
                    <button id="negatives-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Операции</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="negatives-addition" checked>
                            <span>Сложение</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="negatives-subtraction" checked>
                            <span>Вычитание</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="negatives-multiplication">
                            <span>Умножение</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="negatives-division">
                            <span>Деление</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new NegativesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('negatives-trainer', NegativesComponent);
