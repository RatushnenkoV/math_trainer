// Компонент тренажёра перевода градусов в радианы
class AngleConversionComponent extends BaseTrainerComponent {
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
            <div id="angle-conversion-screen" class="screen">
                <div class="header">
                    <button id="angle-conversion-back-btn" class="icon-button">←</button>
                    <div id="angle-conversion-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="angle-conversion-level-text">Уровень 1</span>
                            <span id="angle-conversion-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="angle-conversion-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="angle-conversion-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="angle-conversion-problem-display" class="problem-display">
                        <div class="angle-conversion-question-container">
                            <div id="angle-conversion-question" class="angle-conversion-question"></div>
                        </div>
                    </div>

                    <div class="answer-input" id="angle-conversion-answer-input">
                        <!-- Поля ввода будут добавлены динамически в зависимости от типа задачи -->
                    </div>

                    <button id="angle-conversion-check-btn" class="check-button">Проверить</button>
                    <div id="angle-conversion-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="angle-conversion-settings-screen" class="screen">
                <div class="header">
                    <button id="angle-conversion-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Типы конверсии</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="angle-conversion-degreesToRadians" checked>
                            <span>Градусы → Радианы</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="angle-conversion-radiansToDegrees" checked>
                            <span>Радианы → Градусы</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Дополнительно</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="angle-conversion-include-non-tabular">
                            <span>Нетабличные значения</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        // Создаём экземпляр тренажёра
        this.trainer = new AngleConversionTrainer();
        this.trainer.initDOM();
    }

    connectedCallback() {
        this.render();
        this.initTrainer();
    }
}

// Регистрация компонента
customElements.define('angle-conversion-trainer', AngleConversionComponent);
