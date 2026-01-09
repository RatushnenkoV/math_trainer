// Генератор задач на координаты
class CoordinatesGenerator {
    constructor(settings = {}) {
        this.settings = {
            minX: -5,
            maxX: 5,
            minY: -5,
            maxY: 5,
            ...settings
        };
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    // Генерация случайной координаты в заданном диапазоне
    generateRandomCoordinate(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация задачи
    generate() {
        const { minX, maxX, minY, maxY } = this.settings;

        // Случайно выбираем режим: 0 - показать точку, угадать координаты; 1 - показать координаты, угадать точку
        const mode = Math.random() < 0.5 ? 'pointToCoords' : 'coordsToPoint';

        // Генерируем координаты
        const x = this.generateRandomCoordinate(minX, maxX);
        const y = this.generateRandomCoordinate(minY, maxY);

        return {
            mode,
            x,
            y,
            minX,
            maxX,
            minY,
            maxY
        };
    }
}
