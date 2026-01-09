// Компонент тренажёра графиков функций
class FunctionsComponent extends BaseTrainerComponent {
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
            <div id="functions-screen" class="screen">
                <div class="header">
                    <button id="functions-back-btn" class="icon-button">←</button>
                    <div id="functions-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="functions-level-text">Уровень 1</span>
                            <span id="functions-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="functions-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="functions-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="functions-problem-display" class="problem-display">
                        <div id="functions-formula" class="formula-display"></div>
                    </div>

                    <span id="no-operations-message" class="no-operations-message">Не выбрано ни одного типа функций в настройках 😢</span>

                    <div id="functions-questions-flow" class="questions-flow">
                        <div id="functions-step-type">
                            <p class="step-question">1. Определи тип графика:</p>
                            <div class="answer-buttons-grid">
                                <button onclick="trainers.functions.checkType('linear')" class="answer-button">Прямая</button>
                                <button onclick="trainers.functions.checkType('hyperbola')" class="answer-button">Гипербола</button>
                                <button onclick="trainers.functions.checkType('parabola')" class="answer-button">Парабола</button>
                            </div>
                        </div>

                        <div id="functions-step-specific" class="hidden"></div>

                        <div id="functions-step-points" class="hidden"></div>
                    </div>

                    <div id="functions-plot-container" class="hidden plot-container">
                        <h3 class="plot-title">График построен верно!</h3>
                        <div id="functions-plot" class="plot"></div>
                        <button onclick="trainers.functions.nextProblem()" class="check-button">Далее</button>
                    </div>

                    <button id="functions-check-btn" class="check-button" style="display: none;">Проверить</button>
                    <div id="functions-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="functions-settings-screen" class="screen">
                <div class="header">
                    <button id="functions-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Типы функций</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="functions-linear" checked>
                            <span>Линейные функции (прямые)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="functions-hyperbola" checked>
                            <span>Гиперболы</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="functions-parabola" checked>
                            <span>Параболы (квадратичные функции)</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new FunctionsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('functions-trainer', FunctionsComponent);
