// Компонент тренажёра таблицы умножения
class MultiplicationTableComponent extends BaseTrainerComponent {
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
            <div id="multiplication-table-screen" class="screen">
                <div class="header">
                    <button id="multiplication-table-back-btn" class="icon-button">←</button>
                    <div id="multiplication-table-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="multiplication-table-level-text">Уровень 1</span>
                            <span id="multiplication-table-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="multiplication-table-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="multiplication-table-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="multiplication-table-problem-display" class="problem-display">
                        <span class="number-display" id="multiplication-table-num1"></span>
                        <span class="operator" id="multiplication-table-operator"></span>
                        <span class="number-display" id="multiplication-table-num2"></span>
                        <span class="equals">=</span>
                        <span class="question">?</span>
                    </div>

                    <div class="answer-input">
                        <div class="input-group">
                            <input type="number" id="multiplication-table-answer-input" placeholder="0" inputmode="numeric">
                        </div>
                    </div>

                    <button id="multiplication-table-check-btn" class="check-button">Проверить</button>
                    <div id="multiplication-table-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="multiplication-table-settings-screen" class="screen">
                <div class="header">
                    <button id="multiplication-table-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Таблицы умножения</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-2" checked>
                            <span>Таблица на 2</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-3" checked>
                            <span>Таблица на 3</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-4" checked>
                            <span>Таблица на 4</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-5" checked>
                            <span>Таблица на 5</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-6" checked>
                            <span>Таблица на 6</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-7" checked>
                            <span>Таблица на 7</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-8" checked>
                            <span>Таблица на 8</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-9" checked>
                            <span>Таблица на 9</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Дополнительно</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication-table-reverse" checked>
                            <span>Обратный порядок (3×5 и 5×3)</span>
                        </label>
                        <div class="slider-container">
                            <label class="slider-label">
                                <span>Максимальный множитель: <strong id="multiplication-table-max-value">10</strong></span>
                            </label>
                            <input type="range"
                                   id="multiplication-table-max-multiplier"
                                   class="custom-slider"
                                   min="5"
                                   max="20"
                                   value="10"
                                   step="1">
                            <div class="slider-markers">
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new MultiplicationTableTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('multiplication-table-trainer', MultiplicationTableComponent);
