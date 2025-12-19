// Генератор линейных неравенств

class LinearInequalitiesProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            basic: true,      // kx+b<0
            easy: true,       // ax+b<cx+d
            medium: true,     // a(bx+c)+d<e(fx+g)+h
            hard: false       // Неравенства с дробями
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

    // НОД (наибольший общий делитель)
    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // Форматирование коэффициента (убираем единицу, показываем знак)
    formatCoefficient(coef, isFirst = false) {
        if (coef === 1) {
            return isFirst ? '' : '+';
        }
        if (coef === -1) {
            return '-';
        }
        if (coef > 0 && !isFirst) {
            return '+' + coef;
        }
        return coef.toString();
    }

    // Форматирование константы
    formatConstant(value, isFirst = false) {
        if (value === 0) return '';
        if (value > 0 && !isFirst) {
            return '+' + value;
        }
        return value.toString();
    }

    // Получение случайного знака неравенства
    getRandomSign() {
        const signs = ['<', '\\leq', '>', '\\geq'];
        return signs[this.randomInt(0, signs.length - 1)];
    }

    // Преобразование решения линейного неравенства в множество RealSet
    solutionToSet(criticalPoint, solutionLeft, solutionRight, pointIncluded) {
        const INF = 1e9;

        if (solutionLeft && solutionRight) {
            // Решение - вся прямая (не должно быть)
            return new Interval(-INF, INF, true, true);
        } else if (solutionLeft) {
            // x <= criticalPoint или x < criticalPoint
            return new Interval(-INF, criticalPoint, true, pointIncluded);
        } else if (solutionRight) {
            // x >= criticalPoint или x > criticalPoint
            return new Interval(criticalPoint, INF, pointIncluded, true);
        } else {
            // Нет решения
            return new EmptySet();
        }
    }

    // Определение решения неравенства
    determineSolution(leftCoef, rightValue, sign) {
        // После приведения к виду: leftCoef * x <sign> rightValue
        // Если leftCoef > 0: x <sign> rightValue/leftCoef
        // Если leftCoef < 0: x <opposite_sign> rightValue/leftCoef

        const criticalPoint = rightValue / leftCoef;
        let solutionLeft = false;
        let solutionRight = false;
        let pointIncluded = false;

        if (leftCoef > 0) {
            // Знак сохраняется
            if (sign === '<') {
                solutionLeft = true;
                pointIncluded = false;
            } else if (sign === '\\leq') {
                solutionLeft = true;
                pointIncluded = true;
            } else if (sign === '>') {
                solutionRight = true;
                pointIncluded = false;
            } else if (sign === '\\geq') {
                solutionRight = true;
                pointIncluded = true;
            }
        } else {
            // Знак меняется
            if (sign === '<') {
                solutionRight = true;
                pointIncluded = false;
            } else if (sign === '\\leq') {
                solutionRight = true;
                pointIncluded = true;
            } else if (sign === '>') {
                solutionLeft = true;
                pointIncluded = false;
            } else if (sign === '\\geq') {
                solutionLeft = true;
                pointIncluded = true;
            }
        }

        const roundedPoint = Math.round(criticalPoint);

        return {
            criticalPoint: roundedPoint,
            solutionLeft,
            solutionRight,
            pointIncluded,
            solutionSet: this.solutionToSet(roundedPoint, solutionLeft, solutionRight, pointIncluded)
        };
    }

    // Генерация базового неравенства: kx+b<0
    generateBasic() {
        const sign = this.getRandomSign();
        const criticalPoint = this.randomInt(-20, 20);
        const k = this.randomNonZero(-10, 10);
        const b = -k * criticalPoint;

        const leftSide = `${this.formatCoefficient(k, true)}x${this.formatConstant(b)}`;
        const inequality = `${leftSide}${sign}0`;

        const solution = this.determineSolution(k, -b, sign);

        return {
            inequality: inequality,
            criticalPoint: solution.criticalPoint,
            solutionLeft: solution.solutionLeft,
            solutionRight: solution.solutionRight,
            pointIncluded: solution.pointIncluded,
            isLatex: true
        };
    }

    // Генерация лёгкого неравенства: ax+b<cx+d
    generateEasy() {
        const sign = this.getRandomSign();
        const criticalPoint = this.randomInt(-20, 20);

        let a = this.randomNonZero(-10, 10);
        let c = this.randomNonZero(-10, 10);

        // Убеждаемся, что a !== c
        while (a === c) {
            c = this.randomNonZero(-10, 10);
        }

        const b = this.randomInt(-20, 20);
        // ax + b < cx + d
        // (a-c)x < d - b
        // x < (d-b)/(a-c) если a-c > 0
        const leftCoef = a - c;
        const d = leftCoef * criticalPoint + b;

        const leftSide = `${this.formatCoefficient(a, true)}x${this.formatConstant(b)}`;
        const rightSide = `${this.formatCoefficient(c, true)}x${this.formatConstant(d)}`;
        const inequality = `${leftSide}${sign}${rightSide}`;

        const solution = this.determineSolution(leftCoef, d - b, sign);

        return {
            inequality: inequality,
            criticalPoint: solution.criticalPoint,
            solutionLeft: solution.solutionLeft,
            solutionRight: solution.solutionRight,
            pointIncluded: solution.pointIncluded,
            isLatex: true
        };
    }

    // Генерация среднего неравенства: a(bx+c)+d<e(fx+g)+h
    generateMedium() {
        const sign = this.getRandomSign();
        const criticalPoint = this.randomInt(-15, 15);

        // Левая часть: a(bx+c)+d
        let a = this.randomInt(-5, 5);
        const b = this.randomNonZero(-5, 5);
        const c = this.randomInt(-10, 10);
        const d = this.randomInt(-10, 10);

        // Правая часть: e(fx+g)+h
        let e = this.randomInt(-5, 5);
        const f = this.randomNonZero(-5, 5);
        const g = this.randomInt(-10, 10);

        // a(bx+c)+d < e(fx+g)+h
        // abx + ac + d < efx + eg + h
        // (ab - ef)x < eg + h - ac - d
        const leftCoef = a * b - e * f;

        // Убеждаемся, что leftCoef !== 0
        let attempts = 0;
        while (leftCoef === 0 && attempts < 10) {
            e = this.randomInt(-5, 5);
            attempts++;
        }

        // h = (ab - ef) * criticalPoint + eg - ac - d
        const h = leftCoef * criticalPoint + e * g - a * c - d;

        // Форматируем левую часть
        let leftSide = '';
        if (a === 0) {
            leftSide = d.toString();
        } else if (a === 1) {
            leftSide = `${this.formatCoefficient(b, true)}x${this.formatConstant(c)}${this.formatConstant(d)}`;
        } else if (a === -1) {
            leftSide = `-(${this.formatCoefficient(b, true)}x${this.formatConstant(c)})${this.formatConstant(d)}`;
        } else {
            leftSide = `${a}(${this.formatCoefficient(b, true)}x${this.formatConstant(c)})${this.formatConstant(d)}`;
        }

        // Форматируем правую часть
        let rightSide = '';
        if (e === 0) {
            rightSide = h.toString();
        } else if (e === 1) {
            rightSide = `${this.formatCoefficient(f, true)}x${this.formatConstant(g)}${this.formatConstant(h)}`;
        } else if (e === -1) {
            rightSide = `-(${this.formatCoefficient(f, true)}x${this.formatConstant(g)})${this.formatConstant(h)}`;
        } else {
            rightSide = `${e}(${this.formatCoefficient(f, true)}x${this.formatConstant(g)})${this.formatConstant(h)}`;
        }

        const inequality = `${leftSide}${sign}${rightSide}`;

        const rightValue = e * g + h - a * c - d;
        const solution = this.determineSolution(leftCoef, rightValue, sign);

        return {
            inequality: inequality,
            criticalPoint: solution.criticalPoint,
            solutionLeft: solution.solutionLeft,
            solutionRight: solution.solutionRight,
            pointIncluded: solution.pointIncluded,
            isLatex: true
        };
    }

    // Генерация сложного неравенства с дробями
    generateHard() {
        const sign = this.getRandomSign();
        const criticalPoint = this.randomNonZero(-10, 10);

        // Коэффициенты для дробей
        const a = this.randomNonZero(-5, 5);
        const b = this.randomInt(-10, 10);
        const c = this.randomInt(1, 6);
        const first_sign = this.randomInt(0, 4) ? 1 : -1;

        const d = this.randomNonZero(-5, 5);
        const e = this.randomInt(-10, 10);
        const f = this.randomInt(1, 6);
        const second_sign = this.randomInt(0, 4) ? 1 : -1;

        const g = this.randomNonZero(-5, 5);
        const h = this.randomInt(-10, 10);
        const i = this.randomInt(1, 6);
        const right_sign = this.randomInt(0, 4) ? 1 : -1;

        // Вычисляем коэффициент при x после приведения к общему знаменателю
        // first_sign*(ax+b)/c + second_sign*(dx+e)/f < right_sign*(gx+h)/i + j
        // Общий знаменатель: c*f*i
        // [first_sign*(ax+b)*f*i + second_sign*(dx+e)*c*i] < [right_sign*(gx+h)*c*f + j*c*f*i]
        const leftCoef = first_sign * a * f * i + second_sign * d * c * i - right_sign * g * c * f;

        // Вычисляем свободный член
        const leftConst = first_sign * b * f * i + second_sign * e * c * i;
        const rightConstWithoutJ = right_sign * h * c * f;

        // j = (leftCoef * criticalPoint + leftConst - rightConstWithoutJ) / (c*f*i)
        const jNumerator = leftCoef * criticalPoint + leftConst - rightConstWithoutJ;
        const jDenominator = c * f * i;

        const jGcd = this.gcd(jNumerator, jDenominator);
        const jNum = jNumerator / jGcd;
        const jDen = jDenominator / jGcd;

        // Форматирование неравенства
        const formatPolynomial = (coefX, constTerm) => {
            let result = '';
            if (coefX === 1) {
                result = 'x';
            } else if (coefX === -1) {
                result = '-x';
            } else {
                result = coefX + 'x';
            }
            if (constTerm !== 0) {
                if (constTerm > 0) {
                    result += '+' + constTerm;
                } else {
                    result += constTerm;
                }
            }
            return result;
        };

        const formatTerm = (coefX, constTerm, denom, isFirst = false, s = 1) => {
            const poly = formatPolynomial(coefX, constTerm);
            let sign_char = s < 0 ? '-' : isFirst ? '' : "+";
            if (denom === 1) {
                if (s < 0) {
                    return '-(' + poly + ")";
                }
                if (coefX < 0) {
                    sign_char = "";
                }
                return sign_char + poly;
            } else {
                return sign_char + '\\frac{' + poly + '}{' + denom + '}';
            }
        };

        let inequality = '';
        inequality += formatTerm(a, b, c, true, first_sign);
        inequality += formatTerm(d, e, f, false, second_sign);
        inequality += sign;
        inequality += formatTerm(g, h, i, true, right_sign);

        if (jNum !== 0) {
            if (jDen === 1) {
                inequality += (jNum > 0 ? '+' : '') + jNum;
            } else {
                if (jNum > 0) {
                    inequality += '+\\frac{' + jNum + '}{' + jDen + '}';
                } else {
                    inequality += '-\\frac{' + Math.abs(jNum) + '}{' + jDen + '}';
                }
            }
        }

        const solution = this.determineSolution(leftCoef, jNumerator, sign);

        return {
            inequality: inequality,
            criticalPoint: solution.criticalPoint,
            solutionLeft: solution.solutionLeft,
            solutionRight: solution.solutionRight,
            pointIncluded: solution.pointIncluded,
            isLatex: true
        };
    }

    // Получение списка доступных сложностей
    getAvailableDifficulties() {
        const difficulties = [];
        if (this.settings.basic) difficulties.push('basic');
        if (this.settings.easy) difficulties.push('easy');
        if (this.settings.medium) difficulties.push('medium');
        if (this.settings.hard) difficulties.push('hard');
        return difficulties;
    }

    // Генерация примера
    generate() {
        const difficulties = this.getAvailableDifficulties();

        if (difficulties.length === 0) {
            return null;
        }

        const difficulty = difficulties[this.randomInt(0, difficulties.length - 1)];

        switch (difficulty) {
            case 'basic':
                return this.generateBasic();
            case 'easy':
                return this.generateEasy();
            case 'medium':
                return this.generateMedium();
            case 'hard':
                return this.generateHard();
            default:
                return this.generateBasic();
        }
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
