// Генератор примеров для таблицы умножения

class MultiplicationTableGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            tables: [2, 3, 4, 5, 6, 7, 8, 9], // Какие таблицы включены
            maxMultiplier: 10, // До какого числа умножать (обычно до 10)
            reverse: true // Разрешить обратный порядок (например, 5×3 и 3×5)
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Выбор случайной таблицы из включённых
    getRandomTable() {
        if (!this.settings.tables || this.settings.tables.length === 0) {
            return 2; // По умолчанию таблица на 2
        }
        const index = this.randomInt(0, this.settings.tables.length - 1);
        return this.settings.tables[index];
    }

    // Генерация примера
    generate() {
        const table = this.getRandomTable();
        const multiplier = this.randomInt(2, this.settings.maxMultiplier || 10);

        // Если включён режим reverse, случайно меняем порядок множителей
        let num1, num2;
        if (this.settings.reverse && Math.random() > 0.5) {
            num1 = multiplier;
            num2 = table;
        } else {
            num1 = table;
            num2 = multiplier;
        }

        const result = num1 * num2;

        return {
            num1: num1,
            num2: num2,
            operation: '×',
            result: result
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
