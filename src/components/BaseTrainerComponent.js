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
}
