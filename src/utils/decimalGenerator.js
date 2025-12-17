// Генератор примеров с десятичными дробями

class DecimalProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false,
            negativeNumbers: false
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация десятичной дроби (десятые, сотые, тысячные)
    generateDecimal(allowNegative = false) {
        // Выбираем разрядность: 1 (десятые), 2 (сотые), 3 (тысячные)
        const precision = this.randomInt(1, 3);

        // Генерируем целую часть (от 0 до 20)
        const whole = this.randomInt(0, 20);

        // Генерируем дробную часть в зависимости от разрядности
        let fractional;
        if (precision === 1) {
            fractional = this.randomInt(1, 9) / 10; // 0.1 - 0.9
        } else if (precision === 2) {
            fractional = this.randomInt(1, 99) / 100; // 0.01 - 0.99
        } else {
            fractional = this.randomInt(1, 999) / 1000; // 0.001 - 0.999
        }

        let result = whole + fractional;

        // Если разрешены отрицательные числа
        if (allowNegative && this.settings.negativeNumbers && Math.random() > 0.7) {
            result = -result;
        }

        // Округляем до нужной точности
        return parseFloat(result.toFixed(precision));
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

    // Проверка, является ли результат деления периодической дробью
    isPeriodic(num1, num2) {
        // Умножаем на 1000 для работы с целыми числами
        const n1 = Math.round(num1 * 1000);
        const n2 = Math.round(num2 * 1000);

        // Вычисляем результат деления
        const result = n1 / n2;

        // Проверяем, можно ли представить результат конечной десятичной дробью
        // с точностью до 3 знаков после запятой
        const rounded = parseFloat(result.toFixed(3));

        // Если разница больше очень малого значения, это периодическая дробь
        return Math.abs(result - rounded) > 0.0001;
    }

    // Вычисление результата
    calculateResult(num1, num2, operation) {
        let result;

        switch (operation) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '×':
                result = num1 * num2;
                break;
            case '÷':
                if (num2 === 0) {
                    throw new Error('Division by zero');
                }
                result = num1 / num2;
                break;
            default:
                result = num1 + num2;
        }

        // Округляем результат до 3 знаков после запятой
        return parseFloat(result.toFixed(3));
    }

    // Генерация примера
    generate() {
        let attempt = 0;
        const maxAttempts = 100;

        while (attempt < maxAttempts) {
            attempt++;

            const operation = this.generateOperation();
            const num1 = this.generateDecimal(true);
            let num2 = this.generateDecimal(operation === '-');

            let result;
            try {
                // Специальная обработка для деления
                if (operation === '÷') {
                    // Генерируем делитель, чтобы избежать периодических дробей
                    // Используем простые числа: 2, 4, 5, 8, 10, 20, 25, 50
                    const simpleDivisors = [0.2, 0.4, 0.5, 0.8, 1, 2, 4, 5, 8, 10];
                    num2 = simpleDivisors[this.randomInt(0, simpleDivisors.length - 1)];

                    // Проверяем, не будет ли периодической
                    if (this.isPeriodic(num1, num2)) {
                        continue;
                    }
                }

                result = this.calculateResult(num1, num2, operation);
            } catch (e) {
                continue;
            }

            // Если не разрешены отрицательные числа, проверяем результат
            if (!this.settings.negativeNumbers && result < 0) {
                continue;
            }

            // Проверяем, что результат не слишком большой
            if (Math.abs(result) > 1000) {
                continue;
            }

            return {
                num1: num1,
                num2: num2,
                operation: operation,
                result: result
            };
        }

        // Если не удалось сгенерировать, возвращаем простой пример
        return {
            num1: 1.5,
            num2: 2.5,
            operation: '+',
            result: 4.0
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
