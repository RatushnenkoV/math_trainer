// Компонент тренажёра обыкновенных дробей
class FractionsComponent extends BaseTrainerComponent {
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
            <div id="fractions-screen" class="screen">
                <div class="header">
                    <button id="back-btn" class="icon-button">←</button>
                    <div id="progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="level-text">Уровень 1</span>
                            <span id="progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="problem-display" class="problem-display">
                        <span class="fraction-display" id="fraction1"></span>
                        <span class="operator" id="operator"></span>
                        <span class="fraction-display" id="fraction2"></span>
                        <span class="equals">=</span>
                        <span class="question">?</span>
                    </div>

                    <div class="answer-input">
                        <div class="input-group whole-input">
                            <input type="number" id="whole-input" placeholder="0">
                        </div>
                        <div class="fraction-input">
                            <div class="input-group">
                                <input type="number" id="numerator-input" placeholder="0" required>
                            </div>
                            <div class="fraction-line"></div>
                            <div class="input-group">
                                <input type="number" id="denominator-input" placeholder="1" required>
                            </div>
                        </div>
                    </div>

                    <button id="check-btn" class="check-button">Проверить</button>
                    <div id="result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="settings-screen" class="screen">
                <div class="header">
                    <button id="settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Типы дробей</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="mixed-fractions" checked>
                            <span>Смешанные дроби</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="decimal-fractions">
                            <span>Десятичные дроби</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Операции</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="addition" checked>
                            <span>Сложение</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="subtraction" checked>
                            <span>Вычитание</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="multiplication">
                            <span>Умножение</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="division">
                            <span>Деление</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Дополнительно</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="negative-numbers">
                            <span>Отрицательные числа</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="require-simplification" checked>
                            <span>Требовать сокращение</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new FractionsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('fractions-trainer', FractionsComponent);
