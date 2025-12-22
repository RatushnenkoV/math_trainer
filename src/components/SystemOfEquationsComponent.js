// Компонент тренажёра систем линейных уравнений
class SystemOfEquationsComponent extends BaseTrainerComponent {
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
            <div id="system-of-equations-screen" class="screen">
                <div class="header">
                    <button id="system-of-equations-back-btn" class="icon-button">←</button>
                    <div id="system-of-equations-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="system-of-equations-level-text">Уровень 1</span>
                            <span id="system-of-equations-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="system-of-equations-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="system-of-equations-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="system-of-equations-problem-display" class="problem-display">
                        <div class="system-of-equations-container">
                            <div class="system-bracket">{</div>
                            <div class="system-equations">
                                <div id="system-of-equations-eq1" class="system-equation"></div>
                                <div id="system-of-equations-eq2" class="system-equation"></div>
                            </div>
                        </div>
                    </div>

                    <div class="answer-input">
                        <div class="input-group">
                            <label for="system-of-equations-answer-x">x =</label>
                            <input type="number" id="system-of-equations-answer-x" placeholder="0" >
                        </div>
                        <div class="input-group">
                            <label for="system-of-equations-answer-y">y =</label>
                            <input type="number" id="system-of-equations-answer-y" placeholder="0" >
                        </div>
                    </div>

                    <button id="system-of-equations-check-btn" class="check-button">Проверить</button>
                    <div id="system-of-equations-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="system-of-equations-settings-screen" class="screen">
                <div class="header">
                    <button id="system-of-equations-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Форма записи</h3>
                        <label class="switch-label">
                            <input type="checkbox" id="system-of-equations-standard-form" checked>
                            <span>Стандартный вид (ax+by=c)</span>
                        </label>
                        <label class="switch-label">
                            <input type="checkbox" id="system-of-equations-non-standard-form">
                            <span>С переносами слагаемых</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new SystemOfEquationsTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('system-of-equations-trainer', SystemOfEquationsComponent);
