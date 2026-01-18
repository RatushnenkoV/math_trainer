// Компонент тренажёра визуализации дробей
class FractionVisualComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('fraction-visual')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="fraction-visual-screen" class="screen">
                <div class="header">
                    <button id="fraction-visual-back-btn" class="icon-button">←</button>
                    <div id="fraction-visual-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="fraction-visual-level-text">Уровень 1</span>
                            <span id="fraction-visual-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="fraction-visual-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="fraction-visual-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="fraction-visual-problem-display" class="fraction-visual-problem-display">
                        <!-- Здесь будет отображаться дробь или пустое место для задачи на ввод -->
                    </div>

                    <div id="shapes-container" class="shapes-container">
                        <!-- Здесь будут отображаться фигуры -->
                    </div>

                    <button id="add-shape-btn" class="add-shape-button" style="display: none;">
                        <span class="plus-icon">+</span>
                    </button>

                    <div id="fraction-input-container" class="fraction-input-container" style="display: none;">
                        <div class="fraction-input-visual">
                            <div class="input-group">
                                <input type="number" id="fraction-visual-numerator-input" placeholder="?" min="0">
                            </div>
                            <div class="fraction-line"></div>
                            <div class="input-group">
                                <input type="number" id="fraction-visual-denominator-input" placeholder="?" min="1">
                            </div>
                        </div>
                    </div>

                    <button id="fraction-visual-check-btn" class="check-button">Проверить</button>
                    <div id="fraction-visual-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="fraction-visual-settings-screen" class="screen">
                <div class="header">
                    <button id="fraction-visual-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Тип задачи</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="task-type-draw" value="drawByFraction" checked>
                            <span>Рисунок по дроби</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="task-type-input" value="fractionByDrawing">
                            <span>Дробь по рисунку</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Дополнительно</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="improper-fractions">
                            <span>Неправильные дроби</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="require-simplification">
                            <span>Требовать сокращения</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="unsimplified-fractions">
                            <span>Сокращенные дроби</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="fraction-visual-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new FractionVisualTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('fraction-visual-trainer', FractionVisualComponent);
