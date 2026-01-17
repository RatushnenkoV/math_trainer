// Компонент тренажёра корней
class SquareRootsComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('square-roots')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="square-roots-screen" class="screen">
                <div class="header">
                    <button id="square-roots-back-btn" class="icon-button">←</button>
                    <div id="square-roots-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="square-roots-level-text">Уровень 1</span>
                            <span id="square-roots-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="square-roots-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="square-roots-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="square-roots-problem-display" class="problem-display">
                        <span class="number-display" id="square-roots-number"></span>
                        <span class="equals">=</span>
                        <span class="question">?</span>
                    </div>

                    <div class="answer-input">
                        <div class="input-group">
                            <input type="number" id="square-roots-answer-input" placeholder="0">
                        </div>
                    </div>

                    <button id="square-roots-check-btn" class="check-button">Проверить</button>
                    <div id="square-roots-result-message" class="result-message"></div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="square-roots-settings-screen" class="screen">
                <div class="header">
                    <button id="square-roots-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Диапазон корней</h3>
                        <div class="slider-container">
                            <label class="slider-label">
                                <span>Максимальный корень: <strong id="square-roots-max-value">10</strong></span>
                                <span class="slider-hint">Числа до <strong id="square-roots-max-number">100</strong></span>
                            </label>
                            <input type="range"
                                   id="square-roots-max-root"
                                   class="custom-slider"
                                   min="10"
                                   max="100"
                                   value="10"
                                   step="10">
                        </div>
                    </div>

                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="square-roots-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new SquareRootsTrainer();
        this.trainer.initDOM();

        // Дополнительная инициализация для обновления подсказки с максимальным числом
        this.initMaxNumberHint();
    }

    initMaxNumberHint() {
        const maxRootSlider = document.getElementById('square-roots-max-root');
        const maxNumberDisplay = document.getElementById('square-roots-max-number');

        if (maxRootSlider && maxNumberDisplay) {
            const updateMaxNumber = (value) => {
                const maxNumber = value * value;
                maxNumberDisplay.textContent = maxNumber.toLocaleString('ru-RU');
            };

            // Инициализация
            updateMaxNumber(maxRootSlider.value);

            // Обновление при изменении
            maxRootSlider.addEventListener('input', (e) => {
                updateMaxNumber(e.target.value);
            });
        }
    }
}

customElements.define('square-roots-trainer', SquareRootsComponent);
