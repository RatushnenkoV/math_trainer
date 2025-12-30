// Генератор примеров для приведения подобных членов многочлена

class PolynomialSimplificationGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
        this.variables = ['x', 'y', 'z', 'a', 'b'];
    }

    getDefaultSettings() {
        return {
            minMonomials: 4,      // Минимальное количество одночленов
            maxMonomials: 6,      // Максимальное количество одночленов
            maxCoefficient: 10,   // Максимальный коэффициент
            maxDegree: 3,         // Максимальная степень переменной
            negativeCoefficients: true  // Разрешить отрицательные коэффициенты
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

    // Генерация случайного коэффициента
    generateCoefficient() {
        let coeff;
        do {
            coeff = this.randomInt(
                this.settings.negativeCoefficients ? -this.settings.maxCoefficient : 1,
                this.settings.maxCoefficient
            );
        } while (coeff === 0); // Коэффициент не может быть 0
        return coeff;
    }

    // Генерация степени переменной (объект Power)
    generatePower(variable) {
        const degree = this.randomInt(1, this.settings.maxDegree);
        if (degree === 1) {
            // Для степени 1 возвращаем просто переменную как строку-основание
            return new Power(variable, 1);
        }
        return new Power(variable, degree);
    }

    // Генерация одночлена
    generateMonomial(literalPart = null) {
        const coefficient = this.generateCoefficient();

        if (literalPart === null) {
            // Генерируем новую буквенную часть
            const numVariables = this.randomInt(1, 2); // 1-2 переменные в одночлене
            const powers = [];
            const usedVars = new Set();

            for (let i = 0; i < numVariables; i++) {
                let variable;
                do {
                    variable = this.randomChoice(this.variables);
                } while (usedVars.has(variable));
                usedVars.add(variable);

                powers.push(this.generatePower(variable));
            }

            return new Monomial(coefficient, powers);
        } else {
            // Используем существующую буквенную часть
            return new Monomial(coefficient, literalPart);
        }
    }

    // Получение ключа буквенной части одночлена (для сравнения)
    getLiteralKey(monomial) {
        if (!(monomial instanceof Monomial)) return null;
        return monomial.powers.map(p => p.tex()).sort().join('*');
    }

    // Генерация многочлена с гарантией подобных членов
    generate() {
        const numMonomials = this.randomInt(this.settings.minMonomials, this.settings.maxMonomials);

        // Определяем, сколько уникальных буквенных частей будет
        // Должно быть как минимум на 2 меньше, чем одночленов, чтобы были подобные
        const numUniqueLiterals = Math.max(2, numMonomials - this.randomInt(2, 3));

        // Генерируем уникальные буквенные части
        const literalParts = [];
        for (let i = 0; i < numUniqueLiterals; i++) {
            const monomial = this.generateMonomial();
            literalParts.push(monomial.powers);
        }

        // Генерируем одночлены, используя эти буквенные части
        const monomials = [];
        for (let i = 0; i < numMonomials; i++) {
            const literalPart = this.randomChoice(literalParts);
            monomials.push(this.generateMonomial(literalPart));
        }

        // Перемешиваем одночлены
        for (let i = monomials.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [monomials[i], monomials[j]] = [monomials[j], monomials[i]];
        }

        // Создаём многочлен
        const polynomial = new Polynomial(monomials);

        // Упрощённый многочлен (правильный ответ)
        const simplified = polynomial.simplify();

        return {
            polynomial: polynomial,
            monomials: monomials,  // Исходные одночлены для отображения
            simplified: simplified  // Упрощённый результат
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
