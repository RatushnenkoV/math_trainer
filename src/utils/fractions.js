// Утилиты для работы с дробями

// Наибольший общий делитель
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Наименьшее общее кратное
function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// Класс для работы с дробями
class Fraction {
    constructor(numerator, denominator = 1, whole = 0) {
        this.whole = whole || 0;
        this.numerator = numerator || 0;
        this.denominator = denominator || 1;

        if (this.denominator === 0) {
            throw new Error("Знаменатель не может быть нулем");
        }

        // Преобразуем смешанную дробь в неправильную для вычислений
        if (this.whole !== 0) {
            this.numerator = this.whole * this.denominator + this.numerator;
            this.whole = 0;
        }

        // Нормализация знака
        if (this.denominator < 0) {
            this.numerator = -this.numerator;
            this.denominator = -this.denominator;
        }
    }

    // Сокращение дроби
    simplify() {
        const divisor = gcd(this.numerator, this.denominator);
        this.numerator /= divisor;
        this.denominator /= divisor;
        return this;
    }

    // Преобразование в смешанную дробь
    toMixed() {
        const sign = this.numerator < 0 ? -1 : 1;
        const absNum = Math.abs(this.numerator);
        const absDen = Math.abs(this.denominator);

        this.whole = Math.floor(absNum / absDen) * sign;
        this.numerator = (absNum % absDen) * sign;

        // Если числитель отрицательный, а целая часть положительная
        if (this.whole > 0 && this.numerator < 0) {
            this.numerator = absDen + this.numerator;
            this.whole--;
        } else if (this.whole < 0 && this.numerator > 0) {
            this.numerator = this.numerator - absDen;
            this.whole++;
        }

        return this;
    }

    // Сложение
    add(other) {
        const commonDenom = lcm(this.denominator, other.denominator);
        const num1 = this.numerator * (commonDenom / this.denominator);
        const num2 = other.numerator * (commonDenom / other.denominator);

        return new Fraction(num1 + num2, commonDenom);
    }

    // Вычитание
    subtract(other) {
        const commonDenom = lcm(this.denominator, other.denominator);
        const num1 = this.numerator * (commonDenom / this.denominator);
        const num2 = other.numerator * (commonDenom / other.denominator);

        return new Fraction(num1 - num2, commonDenom);
    }

    // Умножение
    multiply(other) {
        return new Fraction(
            this.numerator * other.numerator,
            this.denominator * other.denominator
        );
    }

    // Деление
    divide(other) {
        if (other.numerator === 0) {
            throw new Error("Деление на ноль");
        }
        return new Fraction(
            this.numerator * other.denominator,
            this.denominator * other.numerator
        );
    }

    // Проверка на равенство
    equals(other) {
        // Клонируем дроби и преобразуем в неправильные для сравнения
        const f1 = this.clone();
        const f2 = other.clone();

        // Преобразуем смешанные дроби в неправильные
        if (f1.whole !== 0) {
            f1.numerator = f1.whole * f1.denominator + f1.numerator;
            f1.whole = 0;
        }
        if (f2.whole !== 0) {
            f2.numerator = f2.whole * f2.denominator + f2.numerator;
            f2.whole = 0;
        }

        // Сокращаем и сравниваем
        f1.simplify();
        f2.simplify();

        return (f1.numerator === f2.numerator) && (f1.denominator === f2.denominator || f1.numerator === 0) ;
    }

    // Проверка, является ли дробь сокращенной
    isSimplified() {
        return gcd(Math.abs(this.numerator), Math.abs(this.denominator)) === 1;
    }

    // Клонирование
    clone() {
        // Создаем новую дробь и копируем текущие значения напрямую
        const cloned = new Fraction(0, 1, 0);
        cloned.numerator = this.numerator;
        cloned.denominator = this.denominator;
        cloned.whole = this.whole;
        return cloned;
    }

    // Преобразование в десятичную дробь
    toDecimal() {
        return this.numerator / this.denominator;
    }

    // Создание из десятичной дроби
    static fromDecimal(decimal, maxDenominator = 10000) {
        const sign = decimal < 0 ? -1 : 1;
        decimal = Math.abs(decimal);

        let bestNumerator = 0;
        let bestDenominator = 1;
        let bestError = decimal;

        for (let denominator = 1; denominator <= maxDenominator; denominator++) {
            const numerator = Math.round(decimal * denominator);
            const error = Math.abs(decimal - numerator / denominator);

            if (error < bestError) {
                bestNumerator = numerator;
                bestDenominator = denominator;
                bestError = error;

                if (error < 0.000001) break;
            }
        }

        return new Fraction(bestNumerator * sign, bestDenominator).simplify();
    }

    // Форматирование для отображения
    toString() {
        if (this.numerator === 0) return "0";
        if (this.denominator === 1) return this.numerator.toString();

        const frac = this.clone().toMixed();

        if (frac.whole !== 0 && frac.numerator !== 0) {
            return `${frac.whole} ${Math.abs(frac.numerator)}/${frac.denominator}`;
        } else if (frac.whole !== 0) {
            return frac.whole.toString();
        } else {
            return `${frac.numerator}/${frac.denominator}`;
        }
    }
}
