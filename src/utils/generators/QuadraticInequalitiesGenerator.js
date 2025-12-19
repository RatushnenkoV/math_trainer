// Генератор квадратных неравенств

class QuadraticInequalitiesProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            nonStandardForm: false,  // Перемешанный вид неравенства
            aEqualsOne: false,       // Генерировать только неравенства с a = 1
            allowIncomplete: true    // Разрешить неполные неравенства (b=0 или c=0)
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
                result += isFirst ? '' : '';
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

    // Получение случайного знака неравенства
    getRandomSign() {
        const signs = ['<', '\\leq', '>', '\\geq'];
        return signs[this.randomInt(0, signs.length - 1)];
    }

    // Определение решения квадратного неравенства
    // Для неравенства ax^2 + bx + c <sign> 0
    determineSolution(a, b, c, sign) {
        const discriminant = b * b - 4 * a * c;

        // Случай 1: Дискриминант отрицательный (нет корней)
        if (discriminant < 0) {
            // Парабола не пересекает ось X
            // Если a > 0: парабола всегда выше оси (всегда положительна)
            // Если a < 0: парабола всегда ниже оси (всегда отрицательна)

            if (a > 0) {
                // Всегда положительно
                if (sign === '>' || sign === '\\geq') {
                    return {
                        type: 'all',  // Решение: вся числовая прямая
                        points: [],
                        regions: []
                    };
                } else {
                    return {
                        type: 'none',  // Нет решений
                        points: [],
                        regions: []
                    };
                }
            } else {
                // Всегда отрицательно
                if (sign === '<' || sign === '\\leq') {
                    return {
                        type: 'all',
                        points: [],
                        regions: []
                    };
                } else {
                    return {
                        type: 'none',
                        points: [],
                        regions: []
                    };
                }
            }
        }

        // Случай 2: Дискриминант равен нулю (один корень)
        if (discriminant === 0) {
            const x = -b / (2 * a);

            // Для строгих неравенств точка не входит в решение
            if (sign === '<' || sign === '>') {
                if (a > 0 && sign === '>') {
                    return {
                        type: 'all_except_point',
                        points: [{ value: x, included: false }],
                        regions: []
                    };
                } else if (a < 0 && sign === '<') {
                    return {
                        type: 'all_except_point',
                        points: [{ value: x, included: false }],
                        regions: []
                    };
                } else {
                    return {
                        type: 'none',
                        points: [],
                        regions: []
                    };
                }
            } else {
                // Для нестрогих неравенств точка входит в решение
                if (sign === '\\geq') {
                    if (a > 0) {
                        return {
                            type: 'all',
                            points: [{ value: x, included: true }],
                            regions: []
                        };
                    } else {
                        return {
                            type: 'point',
                            points: [{ value: x, included: true }],
                            regions: []
                        };
                    }
                } else { // sign === '\\leq'
                    if (a < 0) {
                        return {
                            type: 'all',
                            points: [{ value: x, included: true }],
                            regions: []
                        };
                    } else {
                        return {
                            type: 'point',
                            points: [{ value: x, included: true }],
                            regions: []
                        };
                    }
                }
            }
        }

        // Случай 3: Дискриминант положительный (два корня)
        const sqrtD = Math.sqrt(discriminant);
        const x1 = (-b - sqrtD) / (2 * a);
        const x2 = (-b + sqrtD) / (2 * a);

        // Упорядочиваем корни
        const [leftRoot, rightRoot] = x1 < x2 ? [x1, x2] : [x2, x1];

        // Определяем включение точек
        const pointsIncluded = (sign === '\\leq' || sign === '\\geq');

        // Определяем области решения
        if (a > 0) {
            // Парабола ветвями вверх
            if (sign === '<' || sign === '\\leq') {
                // Решение между корнями
                return {
                    type: 'between',
                    points: [
                        { value: Math.round(leftRoot), included: pointsIncluded },
                        { value: Math.round(rightRoot), included: pointsIncluded }
                    ],
                    regions: [{ left: Math.round(leftRoot), right: Math.round(rightRoot) }]
                };
            } else {
                // Решение вне корней
                return {
                    type: 'outside',
                    points: [
                        { value: Math.round(leftRoot), included: pointsIncluded },
                        { value: Math.round(rightRoot), included: pointsIncluded }
                    ],
                    regions: [
                        { left: -Infinity, right: Math.round(leftRoot) },
                        { left: Math.round(rightRoot), right: Infinity }
                    ]
                };
            }
        } else {
            // Парабола ветвями вниз
            if (sign === '<' || sign === '\\leq') {
                // Решение вне корней
                return {
                    type: 'outside',
                    points: [
                        { value: Math.round(leftRoot), included: pointsIncluded },
                        { value: Math.round(rightRoot), included: pointsIncluded }
                    ],
                    regions: [
                        { left: -Infinity, right: Math.round(leftRoot) },
                        { left: Math.round(rightRoot), right: Infinity }
                    ]
                };
            } else {
                // Решение между корнями
                return {
                    type: 'between',
                    points: [
                        { value: Math.round(leftRoot), included: pointsIncluded },
                        { value: Math.round(rightRoot), included: pointsIncluded }
                    ],
                    regions: [{ left: Math.round(leftRoot), right: Math.round(rightRoot) }]
                };
            }
        }
    }

    // Генерация стандартного квадратного неравенства: ax^2 + bx + c <sign> 0
    // Неравенство генерируется от целых корней x1 и x2
    generateStandard() {
        let x1, x2, a, b, c, sign;
        let solution;

        // Генерируем знак неравенства
        sign = this.getRandomSign();

        // Повторяем генерацию, пока не получим подходящее неравенство
        do {
            // Генерируем целые корни
            x1 = this.randomInt(-10, 10);
            x2 = this.randomInt(-10, 10);

            // Генерируем коэффициент a (может быть любым ненулевым числом)
            // Если включена настройка aEqualsOne, то a = 1
            const leadingCoef = this.settings.aEqualsOne ? 1 : this.randomNonZero(-5, 5);

            // Вычисляем коэффициенты по формуле: a(x - x1)(x - x2) = 0
            // Раскрываем: a(x^2 - x1*x - x2*x + x1*x2) = 0
            // Получаем: a*x^2 - a*(x1+x2)*x + a*x1*x2 = 0
            a = leadingCoef;
            b = -leadingCoef * (x1 + x2);
            c = leadingCoef * x1 * x2;

            // Если неполные неравенства запрещены, повторяем пока b и c не будут ненулевыми
        } while (!this.settings.allowIncomplete && (b === 0 || c === 0));

        let inequality = '';

        // ax^2
        const aCoef = this.formatCoefficient(a, true, true);
        inequality += aCoef + 'x^2';

        // bx
        if (b !== 0) {
            const bCoef = this.formatCoefficient(b, true, false);
            inequality += bCoef + 'x';
        }

        // c
        if (c !== 0) {
            const cCoef = this.formatCoefficient(c, false, false);
            inequality += cCoef;
        }

        inequality += sign + '0';

        // Определяем решение
        solution = this.determineSolution(a, b, c, sign);

        return {
            inequality: inequality,
            solution: solution,
            coefficients: { a, b, c },
            sign: sign,
            isLatex: true
        };
    }

    // Генерация неравенства с многочленом без корней (D < 0)
    generateNoRoots() {
        const sign = this.getRandomSign();

        // Генерируем коэффициенты так, чтобы D < 0
        let a, b, c, discriminant;

        do {
            a = this.settings.aEqualsOne ? 1 : this.randomNonZero(-5, 5);
            b = this.randomInt(-10, 10);
            c = this.randomInt(-10, 10);

            discriminant = b * b - 4 * a * c;
        } while (discriminant >= 0);  // Повторяем, пока дискриминант не станет отрицательным

        let inequality = '';

        // ax^2
        const aCoef = this.formatCoefficient(a, true, true);
        inequality += aCoef + 'x^2';

        // bx
        if (b !== 0) {
            const bCoef = this.formatCoefficient(b, true, false);
            inequality += bCoef + 'x';
        }

        // c
        if (c !== 0) {
            const cCoef = this.formatCoefficient(c, false, false);
            inequality += cCoef;
        }

        inequality += sign + '0';

        // Определяем решение
        const solution = this.determineSolution(a, b, c, sign);

        return {
            inequality: inequality,
            solution: solution,
            coefficients: { a, b, c },
            sign: sign,
            isLatex: true
        };
    }

    // Генерация неравенства в нестандартном виде (члены перемешаны)
    generateNonStandard() {
        let x1, x2, a, b, c, sign;

        // Генерируем знак неравенства
        sign = this.getRandomSign();

        // Повторяем генерацию, пока не получим подходящее неравенство
        do {
            // Генерируем целые корни
            x1 = this.randomInt(-10, 10);
            x2 = this.randomInt(-10, 10);

            // Генерируем коэффициент a (может быть любым ненулевым числом)
            // Если включена настройка aEqualsOne, то a = 1
            const leadingCoef = this.settings.aEqualsOne ? 1 : this.randomNonZero(-5, 5);

            // Вычисляем коэффициенты по формуле: a(x - x1)(x - x2) = 0
            a = leadingCoef;
            b = -leadingCoef * (x1 + x2);
            c = leadingCoef * x1 * x2;

            // Если неполные неравенства запрещены, повторяем пока b и c не будут ненулевыми
        } while (!this.settings.allowIncomplete && (b === 0 || c === 0));

        // Создаём три члена неравенства с указанием их стороны (left/right)
        const terms = [
            { coef: a, variable: 'x^2', value: a, side: 'left' },
            { coef: b, variable: 'x', value: b, side: 'left' },
            { coef: c, variable: '', value: c, side: 'left' }
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

        // Помечаем, какие члены в какой части
        shuffled.forEach((term, index) => {
            term.side = index < leftCount ? 'left' : 'right';
        });

        const leftTerms = shuffled.filter(t => t.side === 'left');
        const rightTerms = shuffled.filter(t => t.side === 'right');

        // Формируем левую часть
        let leftSide = this.formatSide(leftTerms, true);

        // Формируем правую часть
        let rightSide = this.formatSide(rightTerms, true);

        // Если правая часть пустая, делаем её равной 0
        if (rightSide === '') {
            rightSide = '0';
        }

        const inequality = `${leftSide}${sign}${rightSide}`;

        // Вычисляем реальные коэффициенты с учётом переноса членов
        // Члены в правой части при переносе меняют знак
        let finalA = 0, finalB = 0, finalC = 0;

        shuffled.forEach(term => {
            const signMult = term.side === 'left' ? 1 : -1;
            if (term.variable === 'x^2') {
                finalA += signMult * term.value;
            } else if (term.variable === 'x') {
                finalB += signMult * term.value;
            } else {
                finalC += signMult * term.value;
            }
        });

        // Определяем решение
        const solution = this.determineSolution(finalA, finalB, finalC, sign);

        return {
            inequality: inequality,
            solution: solution,
            coefficients: { a: finalA, b: finalB, c: finalC },
            sign: sign,
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

    // Форматирование стороны неравенства
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
        // С вероятностью 20% генерируем неравенство без корней
        if (Math.random() < 0.2) {
            return this.generateNoRoots();
        }

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

    // Генерация неравенства с заданными корнями (для отладки через консоль)
    // Использование: generator.generateWithRoots(-7, 3, '>=')
    generateWithRoots(x1, x2, sign = null) {
        // Если знак не указан, берём случайный
        if (!sign) {
            sign = this.getRandomSign();
        }

        // Генерируем коэффициент a
        const a = this.settings.aEqualsOne ? 1 : this.randomNonZero(-5, 5);

        // Вычисляем коэффициенты по формуле: a(x - x1)(x - x2) = 0
        const b = -a * (x1 + x2);
        const c = a * x1 * x2;

        let inequality = '';

        // ax^2
        const aCoef = this.formatCoefficient(a, true, true);
        inequality += aCoef + 'x^2';

        // bx
        if (b !== 0) {
            const bCoef = this.formatCoefficient(b, true, false);
            inequality += bCoef + 'x';
        }

        // c
        if (c !== 0) {
            const cCoef = this.formatCoefficient(c, false, false);
            inequality += cCoef;
        }

        inequality += sign + '0';

        // Определяем решение
        const solution = this.determineSolution(a, b, c, sign);

        return {
            inequality: inequality,
            solution: solution,
            coefficients: { a, b, c },
            sign: sign,
            isLatex: true
        };
    }
}
