// Компонент тренажёра тригонометрических функций
class TrigonometryComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('trigonometry')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="trigonometry-screen" class="screen">
                <div class="header">
                    <button id="trigonometry-back-btn" class="icon-button">←</button>
                    <div id="trigonometry-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="trigonometry-level-text">Уровень 1</span>
                            <span id="trigonometry-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="trigonometry-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="trigonometry-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="trigonometry-problem-display" class="problem-display">
                        <div class="trigonometry-question-container">
                            <div id="trigonometry-question" class="trigonometry-question"></div>
                        </div>
                    </div>

                    <div id="trigonometry-answers-container" class="trigonometry-answers-container">
                        <!-- Кнопки с вариантами ответов будут добавлены динамически -->
                    </div>

                    <div id="trigonometry-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="trigonometry-settings-screen" class="screen">
                <div class="header">
                    <button id="trigonometry-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Функции</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="trigonometry-sin" checked>
                            <span>sin</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="trigonometry-cos" checked>
                            <span>cos</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="trigonometry-tg" checked>
                            <span>tg</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="trigonometry-ctg" checked>
                            <span>ctg</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Максимальная четверть: <span id="trigonometry-quadrant-value">4</span></h3>
                        <input type="range" id="trigonometry-max-quadrant" class="slider" min="1" max="4" step="1" value="4">
                        <div class="slider-labels">
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                            <span>4</span>
                        </div>
                    </div>

                    <div class="settings-group">
                        <h3>Единицы измерения углов</h3>
                        <label class="radio-label">
                            <input type="radio" name="angle-units" id="trigonometry-degrees" checked>
                            <span>Градусы</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="angle-units" id="trigonometry-radians">
                            <span>Радианы</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="trigonometry-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        // Создаём экземпляр тренажёра
        this.trainer = new TrigonometryTrainer();
        this.trainer.initDOM();
    }
}

// Регистрация компонента
customElements.define('trigonometry-trainer', TrigonometryComponent);
