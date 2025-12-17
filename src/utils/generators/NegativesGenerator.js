// Генератор примеров с отрицательными числами

class NegativeProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            addition: true,
            subtraction: true,
            multiplication: false,
            division: false
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация целого числа (положительного или отрицательного)
    generateInteger() {
        // Генерируем число от -20 до 20, исключая 0
        let num = this.randomInt(-20, 20);
        if (num === 0) {
            num = this.randomInt(1, 5) * (Math.random() > 0.5 ? 1 : -1);
        }
        return num;
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

        return result;
    }

    // Генерация примера
    generate() {
        let attempt = 0;
        const maxAttempts = 100;

        while (attempt < maxAttempts) {
            attempt++;

            const operation = this.generateOperation();
            let num1 = this.generateInteger();
            let num2 = this.generateInteger();

            // Гарантируем, что хотя бы одно число отрицательное
            if (num1 > 0 && num2 > 0) {
                // Оба положительные, делаем одно отрицательным
                if (Math.random() > 0.5) {
                    num1 = -num1;
                } else {
                    num2 = -num2;
                }
            }

            let result;
            try {
                // Специальная обработка для деления
                if (operation === '÷') {
                    // Для деления генерируем так, чтобы результат был целым
                    // num1 должно делиться на num2 без остатка
                    num2 = this.randomInt(2, 10) * (Math.random() > 0.5 ? 1 : -1);
                    const quotient = this.randomInt(1, 10) * (Math.random() > 0.5 ? 1 : -1);
                    num1 = num2 * quotient;

                    // Гарантируем, что хотя бы одно число отрицательное
                    if (num1 > 0 && num2 > 0) {
                        if (Math.random() > 0.5) {
                            num1 = -num1;
                        } else {
                            num2 = -num2;
                        }
                    }
                }

                result = this.calculateResult(num1, num2, operation);
            } catch (e) {
                continue;
            }

            // Для деления проверяем, что результат целый
            if (operation === '÷' && !Number.isInteger(result)) {
                continue;
            }

            // Проверяем, что результат не слишком большой
            if (Math.abs(result) > 200) {
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
            num1: -5,
            num2: 3,
            operation: '+',
            result: -2
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
