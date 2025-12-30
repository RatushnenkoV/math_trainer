// Генератор примеров со степенями

class PowersGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
        this.allowedBases = [2, 4, 5, 8, 10]; // Разрешённые основания степеней
    }

    getDefaultSettings() {
        return {
            negativeExponents: false, // Отрицательные показатели степени
            maxRecursionDepth: 2      // Максимальная глубина рекурсии (0, 1, 2 = 3 уровня)
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Выбор случайного элемента из массива
    randomChoice(array) {
        return array[this.randomInt(0, array.length - 1)];
    }

    // Получение нормы для показателей степени
    getExponentRange(base = null) {
        if (this.settings.negativeExponents) {
            // Для основания 8 ограничиваем минимальный показатель -1
            if (base === 8) {
                return { min: -1, max: 4 };
            }
            return { min: -4, max: 4 };
        }
        return { min: 0, max: 4 };
    }

    // Вычисление итогового показателя степени в выражении
    calculateTotalExponent(expr, base) {
        if (typeof expr === 'number') {
            return expr === base ? 1 : 0;
        }

        if (expr instanceof Power) {
            if (typeof expr.base === 'number' && expr.base === base) {
                // Простая степень: base^exp
                if (typeof expr.exponent === 'number') {
                    return expr.exponent;
                }
                // Если показатель - выражение, вычисляем рекурсивно
                return this.evaluateExponentExpression(expr.exponent);
            }
            // Вложенная степень (base^n)^m
            const innerExp = this.calculateTotalExponent(expr.base, base);
            const outerExp = this.evaluateExponentExpression(expr.exponent);
            return innerExp * outerExp;
        }

        if (expr instanceof Multiplication) {
            // При умножении показатели складываются
            return this.calculateTotalExponent(expr.left, base) +
                   this.calculateTotalExponent(expr.right, base);
        }

        if (expr instanceof Division) {
            // При делении показатели вычитаются
            return this.calculateTotalExponent(expr.left, base) -
                   this.calculateTotalExponent(expr.right, base);
        }

        return 0;
    }

    // Вычисление числового значения выражения в показателе
    evaluateExponentExpression(expr) {
        if (typeof expr === 'number') {
            return expr;
        }
        if (expr instanceof Addition) {
            return this.evaluateExponentExpression(expr.left) +
                   this.evaluateExponentExpression(expr.right);
        }
        if (expr instanceof Subtraction) {
            return this.evaluateExponentExpression(expr.left) -
                   this.evaluateExponentExpression(expr.right);
        }
        if (expr instanceof Multiplication) {
            return this.evaluateExponentExpression(expr.left) *
                   this.evaluateExponentExpression(expr.right);
        }
        return 1;
    }

    // Генерация простой степени с заданным основанием
    generateSimplePower(base, exponentRange) {
        let exponent;
        do {
            exponent = this.randomInt(exponentRange.min, exponentRange.max);
        } while (exponent === 1); // Не генерируем показатель = 1
        return new Power(base, exponent);
    }

    // Рекурсивная генерация подвыражения
    // depth - текущая глубина рекурсии
    // numberProbability - вероятность выбора числа (увеличивается с глубиной)
    generateSubExpression(base, depth = 0, numberProbability = 0.3) {
        // Увеличиваем вероятность числа с каждым уровнем
        const adjustedProbability = Math.min(0.9, numberProbability + depth * 0.2);

        // Если достигли максимальной глубины или выпало число
        if (depth >= this.settings.maxRecursionDepth || Math.random() < adjustedProbability) {
            // Возвращаем простую степень (показатель != 1)
            let exponent;
            do {
                exponent = this.randomInt(2, 3);
            } while (exponent === 1);
            return new Power(base, exponent);
        }

        // Выбираем операцию: умножение или возведение в степень
        const operations = ['multiply', 'power'];
        const operation = this.randomChoice(operations);

        if (operation === 'multiply') {
            // Генерируем два подвыражения и умножаем
            const left = this.generateSubExpression(base, depth + 1, numberProbability);
            const right = this.generateSubExpression(base, depth + 1, numberProbability);
            return new Multiplication(left, right);
        } else {
            // Возведение в степень: (выражение)^число (показатель != 1)
            const baseExpr = this.generateSubExpression(base, depth + 1, numberProbability);
            const exponent = this.randomInt(2, 3);
            return new Power(baseExpr, exponent);
        }
    }

    // Генерация главного выражения с выбранной операцией
    generateMainExpression(base) {
        // Выбираем главную операцию
        const mainOperations = ['multiply', 'divide', 'power'];
        const mainOperation = this.randomChoice(mainOperations);

        if (mainOperation === 'multiply') {
            const left = this.generateSubExpression(base, 0);
            const right = this.generateSubExpression(base, 0);
            return new Multiplication(left, right);
        } else if (mainOperation === 'divide') {
            const left = this.generateSubExpression(base, 0);
            const right = this.generateSubExpression(base, 0);
            return new Division(left, right);
        } else {
            // Возведение в степень
            const baseExpr = this.generateSubExpression(base, 0);
            const exponent = this.randomInt(2, 3);
            return new Power(baseExpr, exponent);
        }
    }

    // Балансировка выражения для попадания в норму
    balanceExpression(expr, base, currentExponent, targetRange) {
        if (currentExponent >= targetRange.min && currentExponent <= targetRange.max) {
            return expr; // Уже в норме
        }

        // Выбираем случайный целевой показатель в допустимом диапазоне
        let targetExponent;
        do {
            targetExponent = this.randomInt(targetRange.min, targetRange.max);
        } while (targetExponent === 1); // Не используем показатель 1

        // Вычисляем необходимую корректировку
        const adjustment = currentExponent - targetExponent;

        if (adjustment > 0) {
            // Если показатель слишком большой, умножаем на 1/(base^adjustment)
            // Создаём дробь: 1 в числителе, base^adjustment в знаменателе
            const adjustPower = new Power(base, adjustment);
            const fraction = new Division(1, adjustPower);
            return new Multiplication(expr, fraction);
        } else if (adjustment < 0) {
            // Если показатель слишком маленький, умножаем на степень
            const adjustPower = new Power(base, Math.abs(adjustment));
            return new Multiplication(expr, adjustPower);
        }

        return expr;
    }

    // Генерация примера
    generate() {
        let attempt = 0;
        const maxAttempts = 50;

        while (attempt < maxAttempts) {
            attempt++;

            try {
                // Выбираем случайное основание
                const base = this.randomChoice(this.allowedBases);

                // Генерируем выражение
                let expression = this.generateMainExpression(base);

                // Вычисляем итоговый показатель степени
                const totalExponent = this.calculateTotalExponent(expression, base);

                // Получаем допустимый диапазон (с учётом основания)
                const exponentRange = this.getExponentRange(base);

                // Балансируем выражение, если нужно
                expression = this.balanceExpression(expression, base, totalExponent, exponentRange);

                // Пересчитываем показатель после балансировки
                const finalExponent = this.calculateTotalExponent(expression, base);

                // Проверяем, что результат в норме
                if (finalExponent < exponentRange.min || finalExponent > exponentRange.max) {
                    continue;
                }

                // Вычисляем упрощённый результат
                const result = expression.simplify();

                return {
                    expression: expression,
                    result: result,
                    base: base
                };
            } catch (e) {
                // Если произошла ошибка, повторяем попытку
                continue;
            }
        }

        // Если не удалось сгенерировать, возвращаем простой пример
        const base = 2;
        const expr = new Multiplication(
            new Power(base, 2),
            new Power(base, 3)
        );
        return {
            expression: expr,
            result: expr.simplify(),
            base: base
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
