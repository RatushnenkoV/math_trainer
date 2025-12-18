// Генератор примеров для тренажёра корней

class SquareRootsGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            maxRoot: 10 // Максимальный корень (до 100, с шагом 10)
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация примера
    generate() {
        // Генерируем случайный корень от 2 до maxRoot
        const root = this.randomInt(2, this.settings.maxRoot || 10);

        // Число под корнем = корень в квадрате
        const number = root * root;

        return {
            number: number,        // Число под корнем
            operation: '√',        // Символ операции
            result: root           // Правильный ответ
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
