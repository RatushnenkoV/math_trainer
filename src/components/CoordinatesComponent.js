// Компонент тренажёра на координаты
class CoordinatesComponent extends BaseTrainerComponent {
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
            <div id="coordinates-screen" class="screen">
                <div class="header">
                    <button id="coordinates-back-btn" class="icon-button">←</button>
                    <div id="coordinates-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="coordinates-level-text">Уровень 1</span>
                            <span id="coordinates-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="coordinates-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <div></div>
                </div>

                <div class="content">
                    <div id="coordinates-problem-display" class="problem-display"></div>

                    <h3 id="coordinates-mode-title" class="mode-title">Определите координаты точки</h3>
                    <div id="coordinates-grid-container" class="grid-container">
                        <!-- Координатная сетка будет вставлена сюда -->
                    </div>

                    <div id="coordinates-inputs-container" class="coordinates-inputs">
                        <span class="input-label">x =</span>
                        <input type="number" id="coordinates-x-input" placeholder="0">
                        <span class="input-label">y =</span>
                        <input type="number" id="coordinates-y-input" placeholder="0">
                    </div>

                    <button id="coordinates-check-btn" class="check-button">Проверить</button>
                    <div id="coordinates-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return '';
    }

    initTrainer() {
        this.trainer = new CoordinatesTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('coordinates-trainer', CoordinatesComponent);
