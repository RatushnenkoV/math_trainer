// Компонент тренажёра приведения подобных членов многочлена
class PolynomialSimplificationComponent extends BaseTrainerComponent {
    constructor() {
        super();
    }

    render() {
        this.innerHTML = `
            ${this.getMainScreenTemplate()}
            ${this.getSettingsTemplate()}
            ${this.getShareModalTemplate('polynomial-simplification')}
        `;
    }

    getMainScreenTemplate() {
        return `
            <div id="polynomial-simplification-screen" class="screen">
                <div class="header">
                    <button id="polynomial-simplification-back-btn" class="icon-button">←</button>
                    <div id="polynomial-simplification-progress-container" class="progress-container">
                        <div class="progress-info">
                            <span id="polynomial-simplification-level-text">Уровень 1</span>
                            <span id="polynomial-simplification-progress-text">0/10</span>
                        </div>
                        <div class="progress-bar">
                            <div id="polynomial-simplification-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>
                    <button id="polynomial-simplification-settings-btn" class="icon-button">⚙</button>
                </div>

                <div class="content">
                    <div id="polynomial-simplification-problem-display" class="polynomial-problem-display">
                        <!-- Здесь будут отображаться одночлены для перетаскивания -->
                    </div>

                    <div class="instructions">
                        Перетащите одночлен на подобный, чтобы привести подобные.
                    </div>

                    <button id="polynomial-simplification-check-btn" class="check-button">Проверить</button>
                    <div id="polynomial-simplification-result-message" class="result-message"></div>
                </div>

                <!-- Модальное окно для ввода суммы -->
                <div id="polynomial-combine-modal" class="polynomial-modal">
                    <div class="polynomial-modal-content">
                        <h3>Приведение подобных</h3>
                        <div class="polynomial-modal-monomials">
                            <div id="polynomial-modal-monomial1"></div>
                            <div class="polynomial-modal-plus">+</div>
                            <div id="polynomial-modal-monomial2"></div>
                        </div>
                        <div class="polynomial-modal-input-container">
                            <input type="numbergit" id="polynomial-modal-coefficient-input" placeholder="Коэффициент">
                            <span id="polynomial-modal-literal-part"></span>
                        </div>
                        <div class="polynomial-modal-buttons">
                            <button id="polynomial-modal-cancel-btn" class="polynomial-modal-cancel">Отмена</button>
                            <button id="polynomial-modal-ok-btn" class="polynomial-modal-ok">ОК</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsTemplate() {
        return `
            <div id="polynomial-simplification-settings-screen" class="screen">
                <div class="header">
                    <button id="polynomial-simplification-settings-back-btn" class="icon-button">←</button>
                    <h2>Настройки</h2>
                    <div></div>
                </div>

                <div class="settings-content">
                    <div class="settings-group">
                        <h3>Поделиться</h3>
                        <p class="settings-description">Создайте челлендж с текущими настройками</p>
                        <button id="polynomial-simplification-share-btn" class="settings-button">🔗 Создать ссылку</button>
                    </div>
                </div>
            </div>
        `;
    }

    initTrainer() {
        this.trainer = new PolynomialSimplificationTrainer();
        this.trainer.initDOM();
    }
}

customElements.define('polynomial-simplification-trainer', PolynomialSimplificationComponent);
