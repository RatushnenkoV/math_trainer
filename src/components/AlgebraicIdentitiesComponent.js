class AlgebraicIdentitiesComponent extends BaseTrainerComponent {
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
            <div id="algebraic-identities-screen" class="screen">
                <div class="header">
                    <button id="algebraic-identities-back-btn" class="icon-button">←</button>
                    <div id="algebraic-identities-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="algebraic-identities-level-text">Уровень 1</span>
                            <span id="algebraic-identities-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="algebraic-identities-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="algebraic-identities-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="algebraic-identities-problem-display" class="algebraic-identities-problem-display">
                    </div>

                    <!-- Контейнер для раскрытия скобок (expansion) -->
                    <div id="algebraic-identities-expansion-container" class="algebraic-identities-expansion-container">
                        <button id="add-monomial-btn-ai" class="add-monomial-button">
                            <span class="plus-icon">+</span>
                        </button>
                    </div>

                    <!-- Контейнер для разложения на множители (factorization) -->
                    <div id="algebraic-identities-factorization-container" class="algebraic-identities-factorization-container">
                        <button id="add-factor-btn" class="add-factor-button">
                            <span class="factor-button-text">( ) +</span>
                        </button>
                    </div>

                    <div id="variables-panel-ai" class="variables-panel">
                    </div>

                    <button id="algebraic-identities-check-btn" class="check-button">Проверить</button>
                    <div id="algebraic-identities-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="algebraic-identities-settings-screen" class="screen">
                <div class="header">
                    <button id="algebraic-identities-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки ФСУ</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Режим</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-mode-expansion" checked>
                            <span>Раскрытие скобок</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-mode-factorization">
                            <span>Разложение на множители</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Формулы</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-squareOfSum" checked>
                            <span>Квадрат суммы (a+b)²</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-squareOfDifference" checked>
                            <span>Квадрат разности (a-b)²</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-differenceOfSquares" checked>
                            <span>Разность квадратов a²-b²</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-cubeOfSum">
                            <span>Куб суммы (a+b)³</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-cubeOfDifference">
                            <span>Куб разности (a-b)³</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-sumOfCubes">
                            <span>Сумма кубов a³+b³</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="ai-formula-differenceOfCubes">
                            <span>Разность кубов a³-b³</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Сложность</h3>
                        <div class="difficulty-slider-container">
                            <input type="range" id="ai-complexity-slider" min="1" max="3" step="1" value="1">
                            <div class="difficulty-labels">
                                <span>Простая<br>(a, b, x)</span>
                                <span>Средняя<br>(2a, 3b²)</span>
                                <span>Сложная<br>(2a²+3xy)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new AlgebraicIdentitiesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('algebraic-identities-trainer', AlgebraicIdentitiesComponent);
