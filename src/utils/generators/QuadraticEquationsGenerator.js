// Генератор квадратных уравнений

class QuadraticEquationsProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            nonStandardForm: false  // Перемешанный вид уравнения
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация ненулевого случайного числа
    randomNonZero(min, max) {
        let num;
        do {
            num = this.randomInt(min, max);
        } while (num === 0);
        return num;
    }

    // Генерация случайного числа, которое может быть нулём
    randomWithZero(min, max) {
        return this.randomInt(min, max);
    }

    // Форматирование коэффициента для LaTeX
    formatCoefficient(coef, withVariable, isFirst = false) {
        if (coef === 0) return null;

        let result = '';

        // Добавляем знак
        if (!isFirst) {
            result += coef > 0 ? '+' : '';
        }

        // Добавляем число
        if (withVariable) {
            if (coef === 1) {
                result += isFirst ? '' : '+';
            } else if (coef === -1) {
                result += '-';
            } else {
                result += coef.toString();
            }
        } else {
            result += coef.toString();
        }

        return result;
    }

    // Генерация стандартного квадратного уравнения: ax^2 + bx + c = 0
    // Уравнение генерируется от целых корней x1 и x2
    generateStandard() {
        // Генерируем целые корни
        const x1 = this.randomInt(-10, 10);
        const x2 = this.randomInt(-10, 10);

        // Генерируем коэффициент a (может быть любым ненулевым числом)
        const leadingCoef = this.randomNonZero(-5, 5);

        // Вычисляем коэффициенты по формуле: a(x - x1)(x - x2) = 0
        // Раскрываем: a(x^2 - x1*x - x2*x + x1*x2) = 0
        // Получаем: a*x^2 - a*(x1+x2)*x + a*x1*x2 = 0
        const a = leadingCoef;
        const b = -leadingCoef * (x1 + x2);
        const c = leadingCoef * x1 * x2;

        let equation = '';

        // ax^2
        const aCoef = this.formatCoefficient(a, true, true);
        equation += aCoef + 'x^2';

        // bx
        if (b !== 0) {
            const bCoef = this.formatCoefficient(b, true, false);
            equation += bCoef + 'x';
        }

        // c
        if (c !== 0) {
            const cCoef = this.formatCoefficient(c, false, false);
            equation += cCoef;
        }

        equation += '=0';

        return {
            equation: equation,
            solution: {
                x1: x1,
                x2: x2,
                discriminant: b * b - 4 * a * c
            },
            coefficients: { a, b, c },
            isLatex: true
        };
    }

    // Генерация уравнения в нестандартном виде (члены перемешаны)
    generateNonStandard() {
        // Генерируем целые корни
        const x1 = this.randomInt(-10, 10);
        const x2 = this.randomInt(-10, 10);

        // Генерируем коэффициент a (может быть любым ненулевым числом)
        const leadingCoef = this.randomNonZero(-5, 5);

        // Вычисляем коэффициенты по формуле: a(x - x1)(x - x2) = 0
        const a = leadingCoef;
        const b = -leadingCoef * (x1 + x2);
        const c = leadingCoef * x1 * x2;

        // Создаём три члена уравнения
        const terms = [
            { coef: a, variable: 'x^2', value: a },
            { coef: b, variable: 'x', value: b },
            { coef: c, variable: '', value: c }
        ];

        // Фильтруем ненулевые члены
        const nonZeroTerms = terms.filter(t => t.value !== 0);

        // Если все нулевые (невозможно, т.к. a != 0), возвращаем стандартное
        if (nonZeroTerms.length === 0) {
            return this.generateStandard();
        }

        // Перемешиваем члены
        const shuffled = this.shuffleArray([...nonZeroTerms]);

        // Случайно распределяем члены между левой и правой частью
        // Левая часть должна быть не пустой
        const leftCount = this.randomInt(1, shuffled.length);
        const leftTerms = shuffled.slice(0, leftCount);
        const rightTerms = shuffled.slice(leftCount);

        // Формируем левую часть
        let leftSide = this.formatSide(leftTerms, true);

        // Формируем правую часть
        let rightSide = this.formatSide(rightTerms, true);

        // Если правая часть пустая, делаем её равной 0
        if (rightSide === '') {
            rightSide = '0';
        }

        const equation = `${leftSide}=${rightSide}`;

        return {
            equation: equation,
            solution: {
                x1: x1,
                x2: x2,
                discriminant: b * b - 4 * a * c
            },
            coefficients: { a, b, c },
            isLatex: true
        };
    }

    // Перемешивание массива (Fisher-Yates shuffle)
    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Форматирование стороны уравнения
    formatSide(terms, isLeft = true) {
        if (terms.length === 0) return '';

        let result = '';

        terms.forEach((term, index) => {
            const isFirst = index === 0;
            const coef = term.value;
            const variable = term.variable;

            if (coef === 0) return;

            // Добавляем знак
            if (!isFirst) {
                result += coef > 0 ? '+' : '';
            }

            // Добавляем коэффициент
            if (variable !== '') {
                // Для переменных
                if (coef === 1) {
                    if (!isFirst) result += '+';
                } else if (coef === -1) {
                    result += '-';
                } else {
                    result += coef.toString();
                }
                result += variable;
            } else {
                // Для константы
                result += coef.toString();
            }
        });

        return result;
    }

    // Генерация примера
    generate() {
        if (this.settings.nonStandardForm) {
            return this.generateNonStandard();
        } else {
            return this.generateStandard();
        }
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
