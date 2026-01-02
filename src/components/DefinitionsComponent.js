// Компонент тренажёра геометрических определений
class DefinitionsComponent extends BaseTrainerComponent {
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
            <div id="definitions-screen" class="screen">
                <div class="header">
                    <button id="definitions-back-btn" class="icon-button">←</button>
                    <div id="definitions-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="definitions-level-text">Уровень 1</span>
                            <span id="definitions-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="definitions-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="definitions-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="definitions-problem-display" class="problem-display">
                        <div class="definitions-definition-container">
                            <div id="definitions-definition" class="definitions-definition"></div>
                        </div>
                    </div>

                    <div id="definitions-answers-container" class="definitions-answers-container">
                        <!-- Кнопки с вариантами ответов будут добавлены динамически -->
                    </div>

                    <div id="definitions-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="definitions-settings-screen" class="screen">
                <div class="header">
                    <button id="definitions-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Выберите разделы для тренировки</h3>
                        <p class="settings-description">Отметьте разделы, термины из которых вы хотите изучать. Число в скобках показывает количество терминов в разделе.</p>
                    </div>
                    <div id="definitions-sections-container">
                        <!-- Разделы будут добавлены динамически -->
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        // Создаём экземпляр тренажёра
        this.trainer = new DefinitionsTrainer();
        this.trainer.initDOM();
    }
}

// Регистрация компонента
customElements.define('definitions-trainer', DefinitionsComponent);
