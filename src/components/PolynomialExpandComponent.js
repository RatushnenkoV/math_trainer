class PolynomialExpandComponent extends BaseTrainerComponent {
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
            <div id="polynomial-expand-screen" class="screen">
                <div class="header">
                    <button id="polynomial-expand-back-btn" class="icon-button">←</button>
                    <div id="polynomial-expand-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="polynomial-expand-level-text">Уровень 1</span>
                            <span id="polynomial-expand-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="polynomial-expand-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="polynomial-expand-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="polynomial-expand-problem-display" class="polynomial-expand-problem-display">
                    </div>

                    <div id="polynomial-expand-answer-container" class="polynomial-expand-answer-container">
                        <button id="add-monomial-btn" class="add-monomial-button">
                            <span class="plus-icon">+</span>
                        </button>
                    </div>

                    <div id="variables-panel" class="variables-panel">
                    </div>

                    <button id="polynomial-expand-check-btn" class="check-button">Проверить</button>
                    <div id="polynomial-expand-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="polynomial-expand-settings-screen" class="screen">
                <div class="header">
                    <button id="polynomial-expand-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Тип задачи</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="expand-type-monomial" value="monomialByPolynomial" checked>
                            <span>Одночлен на многочлен</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="expand-type-polynomial" value="polynomialByPolynomial">
                            <span>Многочлен на многочлен</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new PolynomialExpandTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('polynomial-expand-trainer', PolynomialExpandComponent);
