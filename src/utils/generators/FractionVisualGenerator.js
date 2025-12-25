// Генератор задач для визуализации дробей

class FractionVisualGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            taskTypeDraw: true,
            taskTypeInput: false,
            improperFractions: false,
            requireSimplification: false,
            unsimplifiedFractions: false
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация дроби
    generateFraction() {
        let denominator, numerator;

        // Если разрешены неправильные дроби
        if (this.settings.improperFractions) {
            // Знаменатель от 2 до 12
            denominator = this.randomInt(2, 12);

            // Целая часть не больше 3
            const wholePart = this.randomInt(0, 3);

            // Если есть целая часть
            if (wholePart > 0) {
                // Дробная часть может быть 0
                const fractionalNumerator = this.randomInt(0, denominator - 1);
                numerator = wholePart * denominator + fractionalNumerator;
            } else {
                // Просто правильная дробь
                numerator = this.randomInt(1, denominator - 1);
            }
        } else {
            // Только правильные дроби, знаменатель от 2 до 12
            denominator = this.randomInt(2, 12);
            numerator = this.randomInt(1, denominator - 1);

            // Если включены несокращенные дроби
            if (this.settings.unsimplifiedFractions && Math.random() > 0.5) {
                // Умножаем числитель и знаменатель на случайное число от 2 до 3
                const multiplier = this.randomInt(2, 3);
                numerator *= multiplier;
                denominator *= multiplier;

                // Но знаменатель не должен быть больше 12
                if (denominator > 12) {
                    denominator = Math.floor(denominator / multiplier);
                    numerator = Math.floor(numerator / multiplier);
                }
            }
        }

        return { numerator, denominator };
    }

    // Всегда используем круг
    getShapeType(denominator) {
        return 'circle';
    }

    // Вычисляем количество фигур, которые нужно нарисовать
    calculateShapesCount(numerator, denominator) {
        return Math.ceil(numerator / denominator);
    }

    // Генерация задачи
    generate() {
        const fraction = this.generateFraction();
        const shapeType = this.getShapeType(fraction.denominator);
        const shapesCount = this.calculateShapesCount(fraction.numerator, fraction.denominator);

        // Определяем тип задачи случайным образом из включенных
        const availableTypes = [];
        if (this.settings.taskTypeDraw) availableTypes.push('drawByFraction');
        if (this.settings.taskTypeInput) availableTypes.push('fractionByDrawing');

        // Выбираем случайный тип из доступных
        const taskType = availableTypes.length > 0
            ? availableTypes[this.randomInt(0, availableTypes.length - 1)]
            : 'drawByFraction';

        return {
            taskType: taskType,
            fraction: fraction,
            shapeType: shapeType,
            shapesCount: shapesCount,
            denominator: fraction.denominator,
            numerator: fraction.numerator
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
