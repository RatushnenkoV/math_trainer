// Компонент тренажёра простейших тригонометрических уравнений
class TrigEquationsComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('trig-equations')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="trig-equations-screen" class="screen">
                <div class="header">
                    <button id="trig-equations-back-btn" class="icon-button">←</button>
                    <div id="trig-equations-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="trig-equations-level-text">Уровень 1</span>
                            <span id="trig-equations-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="trig-equations-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="trig-equations-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div class="trig-equations-equation-container">
                        <div id="trig-equations-equation" class="trig-equations-equation"></div>
                    </div>

                    <div id="trig-equations-answer-constructor" class="answer-constructor">
                        <!-- Конструктор ответа будет добавлен динамически -->
                    </div>

                    <button id="trig-equations-check-btn" class="check-button">Проверить</button>

                    <div id="trig-equations-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="trig-equations-settings-screen" class="screen">
                <div class="header">
                    <button id="trig-equations-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Функции</h3>
                        <label class="switch-label">
                            <span>sin</span>
                            <input type="checkbox" id="trig-equations-sin" checked>
                        </label>
                        <label class="switch-label">
                            <span>cos</span>
                            <input type="checkbox" id="trig-equations-cos" checked>
                        </label>
                        <label class="switch-label">
                            <span>tg</span>
                            <input type="checkbox" id="trig-equations-tg" checked>
                        </label>
                        <label class="switch-label">
                            <span>ctg</span>
                            <input type="checkbox" id="trig-equations-ctg" checked>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Единицы измерения углов</h3>
                        <label class="radio-label">
                            <input type="radio" name="trig-equations-angle-units" id="trig-equations-degrees" checked>
                            <span>Градусы</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="trig-equations-angle-units" id="trig-equations-radians">
                            <span>Радианы</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="trig-equations-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        // Создаём экземпляр тренажёра
        this.trainer = new TrigEquationsTrainer();
        this.trainer.initDOM();
    }
}

// Регистрация компонента
customElements.define('trig-equations-trainer', TrigEquationsComponent);
