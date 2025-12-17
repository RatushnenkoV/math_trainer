// Генератор примеров с дробями

class ProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            mixedFractions: true,
            decimalFractions: false,
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
            negativeNumbers: false,
            requireSimplification: true
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация случайной дроби
    generateFraction(allowNegative = false) {
        let whole = 0;
        let numerator = 0;
        let denominator = 1;

        // Если включены смешанные дроби
        if (this.settings.mixedFractions && Math.random() > 0.5) {
            whole = this.randomInt(0, 5);
        }

        // Генерация числителя и знаменателя
        denominator = this.randomInt(2, 12);
        numerator = this.randomInt(1, denominator - 1);

        // Создаем дробь и сокращаем ее
        const fraction = new Fraction(numerator, denominator, whole);
        fraction.simplify();

        // Если разрешены отрицательные числа
        if (allowNegative && this.settings.negativeNumbers && Math.random() > 0.7) {
            if (fraction.whole !== 0) {
                fraction.whole = -fraction.whole;
            } else {
                fraction.numerator = -fraction.numerator;
            }
        }

        return fraction;
    }

    // Генерация операции
    generateOperation() {
        const operations = [];

        if (this.settings.addition) operations.push('+');
        if (this.settings.subtraction) operations.push('-');
        if (this.settings.multiplication) operations.push('×');
        if (this.settings.division) operations.push('÷');

        if (operations.length === 0) {
            operations.push('+'); // Дефолтная операция
        }

        return operations[this.randomInt(0, operations.length - 1)];
    }

    // Вычисление результата
    calculateResult(fraction1, fraction2, operation) {
        let result;

        switch (operation) {
            case '+':
                result = fraction1.add(fraction2);
                break;
            case '-':
                result = fraction1.subtract(fraction2);
                break;
            case '×':
                result = fraction1.multiply(fraction2);
                break;
            case '÷':
                result = fraction1.divide(fraction2);
                break;
            default:
                result = fraction1.add(fraction2);
        }

        return result;
    }

    // Генерация примера
    generate() {
        let attempt = 0;
        const maxAttempts = 100;

        while (attempt < maxAttempts) {
            attempt++;

            const operation = this.generateOperation();
            const fraction1 = this.generateFraction(true);
            const fraction2 = this.generateFraction(operation === '-');

            let result;
            try {
                result = this.calculateResult(
                    fraction1.clone(),
                    fraction2.clone(),
                    operation
                );
            } catch (e) {
                continue;
            }

            // Если не разрешены отрицательные числа, проверяем результат
            if (!this.settings.negativeNumbers && result.numerator < 0) {
                continue;
            }

            // Сокращаем результат
            result.simplify();

            // Проверка на ноль в результате
            if (result.numerator === 0) {
                result.numerator = 1; // Заменяем ноль на единицу
            }

            // Если включены смешанные дроби, преобразуем в смешанную
            if (this.settings.mixedFractions) {
                result.toMixed();
            }

            return {
                fraction1: fraction1,
                fraction2: fraction2,
                operation: operation,
                result: result
            };
        }

        // Если не удалось сгенерировать, возвращаем простой пример
        const f1 = new Fraction(1, 2);
        const f2 = new Fraction(1, 3);
        return {
            fraction1: f1,
            fraction2: f2,
            operation: '+',
            result: f1.add(f2).simplify()
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
