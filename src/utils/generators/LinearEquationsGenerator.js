// Генератор линейных уравнений

class LinearEquationsProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            basic: true,      // kx+b=c
            easy: true,       // ax+b=cx+d
            medium: true,     // a(bx+c)+d=e(fx+g)+h
            hard: false       // Уравнения с дробями
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

    // НОК (наименьшее общее кратное)
    lcm(a, b) {
        return Math.abs(a * b) / this.gcd(a, b);
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

    // Генерация базового уравнения: kx+b=c
    generateBasic() {
        const k = this.randomNonZero(-10, 10);
        const x = this.randomInt(-20, 20); // Корень уравнения
        const b = this.randomInt(-20, 20);
        const c = k * x + b;

        const leftSide = `${this.formatCoefficient(k, true)}x${this.formatConstant(b)}`;
        const equation = `${leftSide}=${c}`;

        return {
            equation: equation,
            solution: x,
            difficulty: 'basic',
            isLatex: true
        };
    }

    // Генерация лёгкого уравнения: ax+b=cx+d
    generateEasy() {
        const x = this.randomInt(-20, 20); // Корень уравнения
        let a = this.randomNonZero(-10, 10);
        let c = this.randomNonZero(-10, 10);

        // Убеждаемся, что a !== c (иначе уравнение может быть вырожденным)
        while (a === c) {
            c = this.randomNonZero(-10, 10);
        }

        const b = this.randomInt(-20, 20);
        const d = a * x + b - c * x;

        const leftSide = `${this.formatCoefficient(a, true)}x${this.formatConstant(b)}`;
        const rightSide = `${this.formatCoefficient(c, true)}x${this.formatConstant(d)}`;
        const equation = `${leftSide}=${rightSide}`;

        return {
            equation: equation,
            solution: x,
            difficulty: 'easy',
            isLatex: true
        };
    }

    // Генерация среднего уравнения: a(bx+c)+d=e(fx+g)+h
    generateMedium() {
        const x = this.randomInt(-15, 15); // Корень уравнения

        // Левая часть: a(bx+c)+d
        let a = this.randomInt(-5, 5);
        const b = this.randomNonZero(-5, 5);
        const c = this.randomInt(-10, 10);
        const d = this.randomInt(-10, 10);

        // Правая часть: e(fx+g)+h
        let e = this.randomInt(-5, 5);
        const f = this.randomNonZero(-5, 5);
        const g = this.randomInt(-10, 10);

        // Вычисляем h так, чтобы уравнение имело решение x
        // a(bx+c)+d = e(fx+g)+h
        // h = a(bx+c)+d - e(fx+g)
        const h = a * (b * x + c) + d - e * (f * x + g);

        // Убеждаемся, что коэффициенты при x не равны (a*b !== e*f)
        let attempts = 0;
        while (a * b === e * f && attempts < 10) {
            e = this.randomInt(-5, 5);
            attempts++;
        }

        // Форматируем левую часть
        let leftSide = '';
        if (a === 0) {
            // Если a=0, просто d
            leftSide = d.toString();
        } else if (a === 1) {
            // Если a=1, без скобок
            leftSide = `${this.formatCoefficient(b, true)}x${this.formatConstant(c)}${this.formatConstant(d)}`;
        } else if (a === -1) {
            // Если a=-1, минус без скобок
            leftSide = `-(${this.formatCoefficient(b, true)}x${this.formatConstant(c)})${this.formatConstant(d)}`;
        } else {
            // Обычный случай со скобками
            leftSide = `${a}(${this.formatCoefficient(b, true)}x${this.formatConstant(c)})${this.formatConstant(d)}`;
        }

        // Форматируем правую часть
        let rightSide = '';
        if (e === 0) {
            // Если e=0, просто h
            rightSide = h.toString();
        } else if (e === 1) {
            // Если e=1, без скобок
            rightSide = `${this.formatCoefficient(f, true)}x${this.formatConstant(g)}${this.formatConstant(h)}`;
        } else if (e === -1) {
            // Если e=-1, минус без скобок
            rightSide = `-(${this.formatCoefficient(f, true)}x${this.formatConstant(g)})${this.formatConstant(h)}`;
        } else {
            // Обычный случай со скобками
            rightSide = `${e}(${this.formatCoefficient(f, true)}x${this.formatConstant(g)})${this.formatConstant(h)}`;
        }

        const equation = `${leftSide}=${rightSide}`;

        return {
            equation: equation,
            solution: x,
            difficulty: 'medium',
            isLatex: true
        };
    }

    // Генерация сложного уравнения с дробями: (ax+b)/c + (dx+e)/f = (gx+h)/i - j
    generateHard() {
        // 1) Выбираем случайный корень от -10 до 10 (кроме нуля)
        let x = this.randomNonZero(-10, 10);


        // 2) Подготавливаем случайные целые коэффициенты
        const a = this.randomNonZero(-5, 5);  // не может быть 0
        const b = this.randomInt(-10, 10);
        const c = this.randomInt(1, 6);       // не может быть 0, начинаем с 1
        const first_sign = this.randomInt(0, 4) ? 1: -1;

        const d = this.randomNonZero(-5, 5);  // не может быть 0
        const e = this.randomInt(-10, 10);
        const f = this.randomInt(1, 6);       // не может быть 0, начинаем с 1
        const second_sign = this.randomInt(0,4) ? 1: -1;



        const g = this.randomNonZero(-5, 5);  // не может быть 0
        const h = this.randomInt(-10, 10);
        const i = this.randomInt(1, 6);       // не может быть 0, начинаем с 1
        const right_sign = this.randomInt(0, 4) ? 1: -1;

        

        // 4) Вычисляем разницу между левой и правой частью при заданном x
        // Работаем с дробями точно, без float

        // Левая часть: (ax+b)/c + (dx+e)/f
        // Приводим к общему знаменателю: [(ax+b)*f + (dx+e)*c] / (c*f)
        const leftNumerator = first_sign * (a * x + b) * f + second_sign * (d * x + e) * c;
        const leftDenominator = c * f;

        // Правая часть: (gx+h)/i
        const rightNumerator = right_sign * (g * x + h);
        const rightDenominator = i;

        // Разница: leftNumerator/leftDenominator - rightNumerator/rightDenominator
        // Приводим к общему знаменателю: (leftNumerator*rightDenominator - rightNumerator*leftDenominator) / (leftDenominator*rightDenominator)
        const jNumerator = leftNumerator * rightDenominator - rightNumerator * leftDenominator;
        const jDenominator = leftDenominator * rightDenominator;

        // Сокращаем дробь j
        const jGcd = this.gcd(jNumerator, jDenominator);
        const jNum = jNumerator / jGcd;
        const jDen = jDenominator / jGcd;

        // 5) Итоговое уравнение: (ax+b)/c + (dx+e)/f = (gx+h)/i + j
        // Форматируем части уравнения
        let equation = '';

        // Функция для форматирования одного члена (ax+b)
        const formatPolynomial = (coefX, constTerm) => {
            let result = '';

            // Форматируем коэффициент при x
            if (coefX === 1) {
                result = 'x';
            } else if (coefX === -1) {
                result = '-x';
            } else {
                result = coefX + 'x';
            }

            // Добавляем константу (если не ноль)
            if (constTerm !== 0) {
                if (constTerm > 0) {
                    result += '+' + constTerm;
                } else {
                    result += constTerm;
                }
            }

            return result;
        };

        // Функция для форматирования дроби или многочлена
        const formatTerm = (coefX, constTerm, denom, isFirst = false, sign = 1) => {
            const poly = formatPolynomial(coefX, constTerm);
            let sign_char = sign < 0 ? '-' : isFirst? '' : "+";
            // Если знаменатель = 1, записываем как многочлен
            if (denom === 1) {
                // Для не первого элемента добавляем знак
                if (sign < 0){
                    return '-(' + poly + ")";
                }
                if (coefX < 0){
                    sign_char = "";
                }
                return sign_char + poly
            } else {
                // Записываем как дробь
                return sign_char + '\\frac{' + poly + '}{' + denom + '}';
            }
        };

        // Левая часть уравнения
        equation += formatTerm(a, b, c, true, first_sign);
        equation += formatTerm(d, e, f, false, second_sign);
        equation += '=';

        // Правая часть уравнения
        equation += formatTerm(g, h, i, true, right_sign);

        // 6) Добавляем j (если не ноль)
        if (jNum !== 0) {
            if (jDen === 1) {
                // Целое число
                equation += (jNum > 0 ? '+' : '') + jNum;
            } else {
                // Обыкновенная дробь
                if (jNum > 0) {
                    equation += '+\\frac{' + jNum + '}{' + jDen + '}';
                } else {
                    equation += '-\\frac{' + Math.abs(jNum) + '}{' + jDen + '}';
                }
            }
        }

        console.log('Сгенерировано уравнение:', equation);
        console.log('Решение:', x);

        return {
            equation: equation,
            solution: x,
            difficulty: 'hard',
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

        // Если нет выбранных сложностей, возвращаем null
        if (difficulties.length === 0) {
            return null;
        }

        // Выбираем случайную сложность
        const difficulty = difficulties[this.randomInt(0, difficulties.length - 1)];

        // Генерируем уравнение соответствующей сложности
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
