// Компонент тренажёра на нахождение площадей
class AreasComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('areas')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="areas-screen" class="screen">
                <div class="header">
                    <button id="areas-back-btn" class="icon-button">←</button>
                    <div id="areas-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="areas-level-text">Уровень 1</span>
                            <span id="areas-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="areas-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="areas-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="areas-problem-display" class="problem-display"></div>

                    <h3 id="areas-question-text" class="mode-title">Найдите площадь фигуры</h3>
                    <div id="areas-shape-container" class="shape-container">
                        <!-- SVG с фигурой будет вставлен сюда -->
                    </div>

                    <div class="areas-input-container">
                        <div id="areas-input-label" class="input-label"></div>
                        <input type="number" id="areas-answer-input" placeholder="0" step="any">
                    </div>

                    <button id="areas-check-btn" class="check-button">Проверить</button>
                    <div id="areas-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="areas-settings-screen" class="screen">
                <div class="header">
                    <button id="areas-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Типы фигур</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-parallelogram" checked>
                            <span>Параллелограмм</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-rhombus" checked>
                            <span>Ромб</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-rectangle" checked>
                            <span>Прямоугольник</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-square" checked>
                            <span>Квадрат</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-triangle" checked>
                            <span>Треугольник</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-trapezoid" checked>
                            <span>Трапеция</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-circle" checked>
                            <span>Круг</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Типы формул</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-use-trigonometry" checked>
                            <span>Формулы с тригонометрией</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="areas-use-diagonals" checked>
                            <span>Формулы с диагоналями</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="areas-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new AreasTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('areas-trainer', AreasComponent);
