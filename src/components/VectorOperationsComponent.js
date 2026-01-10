// Компонент тренажёра на действия над векторами
class VectorOperationsComponent extends BaseTrainerComponent {
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
            <div id="vector-operations-screen" class="screen">
                <div class="header">
                    <button id="vector-operations-back-btn" class="icon-button">←</button>
                    <div id="vector-operations-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="vector-operations-level-text">Уровень 1</span>
                            <span id="vector-operations-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="vector-operations-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="vector-operations-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="vector-operations-problem-display" class="problem-display"></div>

                    <div id="vector-operations-task-text" class="task-text"></div>
                    <h3 id="vector-operations-question-text" class="mode-title"></h3>

                    <div id="vector-operations-grid-container" class="grid-container">
                        <!-- Координатная сетка будет вставлена сюда -->
                    </div>

                    <div id="vector-operations-inputs-container" class="vectors-inputs">
                        <span class="input-label">x =</span>
                        <input type="number" id="vector-operations-x-input" placeholder="0">
                        <span class="input-label">y =</span>
                        <input type="number" id="vector-operations-y-input" placeholder="0">
                    </div>

                    <button id="vector-operations-check-btn" class="check-button">Проверить</button>
                    <div id="vector-operations-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="vector-operations-settings-screen" class="screen">
                <div class="header">
                    <button id="vector-operations-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Тип задач</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="by-coordinates" checked>
                            <span>По координатам</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="by-drawing" checked>
                            <span>По рисунку</span>
                        </label>
                    </div>

                    <div class="settings-group">
                        <h3>Операции</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="vo-addition" checked>
                            <span>Сложение векторов</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="vo-subtraction" checked>
                            <span>Вычитание векторов</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="vo-multiplication" checked>
                            <span>Умножение вектора на число</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new VectorOperationsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('vector-operations-trainer', VectorOperationsComponent);
