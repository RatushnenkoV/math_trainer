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
    generateStandard() {
        const a = this.randomNonZero(-10, 10);
        const b = this.randomWithZero(-20, 20);
        const c = this.randomWithZero(-20, 20);

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

        // Вычисляем корни для проверки
        const discriminant = b * b - 4 * a * c;
        let solution = null;

        if (discriminant >= 0) {
            const sqrtD = Math.sqrt(discriminant);
            const x1 = (-b + sqrtD) / (2 * a);
            const x2 = (-b - sqrtD) / (2 * a);

            // Округляем до 4 знаков после запятой
            solution = {
                x1: Math.round(x1 * 10000) / 10000,
                x2: Math.round(x2 * 10000) / 10000,
                discriminant: discriminant
            };
        } else {
            solution = {
                discriminant: discriminant,
                noRealRoots: true
            };
        }

        return {
            equation: equation,
            solution: solution,
            coefficients: { a, b, c },
            isLatex: true
        };
    }

    // Генерация уравнения в нестандартном виде (члены перемешаны)
    generateNonStandard() {
        const a = this.randomNonZero(-10, 10);
        const b = this.randomWithZero(-20, 20);
        const c = this.randomWithZero(-20, 20);

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

        // Вычисляем корни (используем исходные коэффициенты a, b, c)
        const discriminant = b * b - 4 * a * c;
        let solution = null;

        if (discriminant >= 0) {
            const sqrtD = Math.sqrt(discriminant);
            const x1 = (-b + sqrtD) / (2 * a);
            const x2 = (-b - sqrtD) / (2 * a);

            solution = {
                x1: Math.round(x1 * 10000) / 10000,
                x2: Math.round(x2 * 10000) / 10000,
                discriminant: discriminant
            };
        } else {
            solution = {
                discriminant: discriminant,
                noRealRoots: true
            };
        }

        return {
            equation: equation,
            solution: solution,
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
