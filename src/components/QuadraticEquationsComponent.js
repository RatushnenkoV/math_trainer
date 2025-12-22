// Компонент тренажёра квадратных уравнений
class QuadraticEquationsComponent extends BaseTrainerComponent {
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
            <div id="quadratic-equations-screen" class="screen">
                <div class="header">
                    <button id="quadratic-equations-back-btn" class="icon-button">←</button>
                    <div id="quadratic-equations-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="quadratic-equations-level-text">Уровень 1</span>
                            <span id="quadratic-equations-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="quadratic-equations-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="quadratic-equations-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="quadratic-equations-problem-display" class="problem-display">
                        <div class="quadratic-equations-equation-container">
                            <div id="quadratic-equations-equation" class="quadratic-equations-equation"></div>
                        </div>
                    </div>

                    <div class="answer-input">
                        <div class="input-group quadratic-equations-input">
                            <label for="quadratic-equations-x1-input">x₁ =</label>
                            <input type="number" id="quadratic-equations-x1-input" placeholder="" >
                        </div>
                        <div class="input-group quadratic-equations-input">
                            <label for="quadratic-equations-x2-input">x₂ =</label>
                            <input type="number" id="quadratic-equations-x2-input" placeholder="" >
                        </div>
                    </div>

                    <button id="quadratic-equations-check-btn" class="check-button">Проверить</button>
                    <div id="quadratic-equations-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="quadratic-equations-settings-screen" class="screen">
                <div class="header">
                    <button id="quadratic-equations-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Вид уравнения</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="quadratic-equations-non-standard">
                            <span>Нестандартный вид</span>
                        </label>
                    </div>
                    <div class="settings-group">
                        <h3>Коэффициенты</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="quadratic-equations-a-equals-one">
                            <span>a = 1</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="quadratic-equations-allow-incomplete" checked>
                            <span>Неполные уравнения</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        // Создаём экземпляр тренажёра
        this.trainer = new QuadraticEquationsTrainer();
        this.trainer.initDOM();
    }
}

// Регистрация компонента
customElements.define('quadratic-equations-trainer', QuadraticEquationsComponent);
