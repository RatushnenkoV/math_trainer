// Базовый класс для компонентов тренажёров
class BaseTrainerComponent extends HTMLElement {
    constructor() {
        super();
        this.trainer = null;
    }

    connectedCallback() {
        // Вызывается при добавлении элемента в DOM
        this.render();
        this.initTrainer();
    }

    disconnectedCallback() {
        // Вызывается при удалении элемента из DOM
        if (this.trainer) {
            this.trainer.cleanup?.();
        }
    }

    // Абстрактные методы (переопределяются в наследниках)
    render() {
        throw new Error('render() must be implemented');
    }

    initTrainer() {
        throw new Error('initTrainer() must be implemented');
    }

    getTemplate() {
        throw new Error('getTemplate() must be implemented');
    }

    getSettingsTemplate() {
        throw new Error('getSettingsTemplate() must be implemented');
    }

    // Вспомогательные методы
    query(selector) {
        return this.querySelector(selector);
    }

    queryAll(selector) {
        return this.querySelectorAll(selector);
    }

    // Шаблон модального окна "Поделиться"
    getShareModalTemplate() {
        return `
            <div class="share-modal-overlay" id="${this.trainer?.name}-share-modal">
                <div class="share-modal">
                    <div class="share-modal-header">
                        <h3 class="share-modal-title">Поделиться челленджем</h3>
                        <button class="share-modal-close" id="${this.trainer?.name}-share-close">×</button>
                    </div>
                    <div class="share-modal-body">
                        <p class="share-modal-description">
                            Создайте ссылку с текущими настройками тренажёра.
                            Человек, который перейдёт по ссылке, должен будет выполнить указанное количество задач без ошибок.
                        </p>
                        <div class="share-modal-group">
                            <label class="share-modal-label">Количество задач:</label>
                            <div class="share-modal-range-container">
                                <input type="range"
                                       class="share-modal-range"
                                       id="${this.trainer?.name}-share-tasks"
                                       min="5"
                                       max="50"
                                       value="10"
                                       step="5">
                                <span class="share-modal-value" id="${this.trainer?.name}-share-tasks-value">10</span>
                            </div>
                        </div>
                    </div>
                    <div class="share-modal-footer">
                        <button class="share-modal-button secondary" id="${this.trainer?.name}-share-cancel">Отмена</button>
                        <button class="share-modal-button primary" id="${this.trainer?.name}-share-copy">Поделиться</button>
                    </div>
                    <div class="share-modal-success" id="${this.trainer?.name}-share-success">
                        Готово! Отправьте челлендж другу.
                    </div>
                </div>
            </div>
        `;
    }
}
