class Expression {
    isEqual(other) { return false; }
    evaluate() { return 0; }
    texWithAnswer() {
        return this.tex ? `${this.tex()} = \\, ?` : '= \\, ?';
    }
}

class Power extends Expression {
    constructor(base, exponent, coefficient = 1) {
        super();
        this.base = base;
        this.exponent = exponent;
        this.coefficient = coefficient;
    }

    tex() {
        let b = (this.base.tex) ? this.base.tex() : this.base;
        let e = (this.exponent.tex) ? this.exponent.tex() : this.exponent;
        if (typeof this.base === 'object') b = `\\left(${b}\\right)`;
        let res = `${b}^{${e}}`;
        return this.coefficient === 1 ? res : `${this.coefficient} \\cdot ${res}`;
    }

    isEqual(other) {
        if (!(other instanceof Power)) return false;
        const compare = (a, b) => (a?.isEqual ? a.isEqual(b) : a === b);
        return compare(this.base, other.base) && 
               compare(this.exponent, other.exponent) && 
               this.coefficient === other.coefficient;
    }

    simplify() {
        let sBase = (this.base.simplify) ? this.base.simplify() : this.base;
        let sExp = (this.exponent.simplify) ? this.exponent.simplify() : this.exponent;

        // 1. Правило (a^n)^m = a^(n*m): применяем ДО вычисления числового значения
        if (sBase instanceof Power) {
            const newExp = new Multiplication(sBase.exponent, sExp).simplify();

            // Если внутренний коэффициент - число, и показатель - число, возводим
            let newCoeff = this.coefficient;
            if (typeof sBase.coefficient === 'number' && typeof sExp === 'number') {
                newCoeff *= Math.pow(sBase.coefficient, sExp);
            } else if (sBase.coefficient !== 1) {
                // Если не числа, оставляем как есть или можно усложнить логику
                newCoeff *= sBase.coefficient;
            }

            // Рекурсивно упрощаем результат
            const result = new Power(sBase.base, newExp, newCoeff);
            return result.simplify();
        }

        // 2. НЕ вычисляем числовое значение, оставляем как Power
        // Это позволяет применять правила упрощения для степеней
        return new Power(sBase, sExp, this.coefficient);
    }

    evaluate() {
        const baseValue = (typeof this.base === 'number') ? this.base : this.base.evaluate();
        const expValue = (typeof this.exponent === 'number') ? this.exponent : this.exponent.evaluate();
        return this.coefficient * Math.pow(baseValue, expValue);
    }
}

class Operation extends Expression {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    getTex(side) { return (side?.tex) ? side.tex() : side; }
    
    // Глубокое сравнение операндов
    isEqual(other) {
        if (this.constructor !== other.constructor) return false;
        const eq = (a, b) => (a?.isEqual ? a.isEqual(b) : a === b);
        return eq(this.left, other.left) && eq(this.right, other.right);
    }

    tryCompute(opFn) {
        if (typeof this.left === 'number' && typeof this.right === 'number') {
            return opFn(this.left, this.right);
        }
        return null;
    }
}

class Multiplication extends Operation {
    tex() { return `${this.getTex(this.left)} \\cdot ${this.getTex(this.right)}`; }
    simplify() {
        const L = this.left?.simplify ? this.left.simplify() : this.left;
        const R = this.right?.simplify ? this.right.simplify() : this.right;

        const num = this.tryCompute((a, b) => a * b);
        if (num !== null) return num;

        // a^n * a^m = a^(n+m)
        if (L instanceof Power && R instanceof Power) {
            const baseEq = L.base?.isEqual ? L.base.isEqual(R.base) : L.base === R.base;
            if (baseEq) {
                const newExp = new Addition(L.exponent, R.exponent).simplify();
                return new Power(L.base, newExp, L.coefficient * R.coefficient);
            }
        }

        // Если слева Multiplication и справа Power, пытаемся рекурсивно объединить
        if (L instanceof Multiplication && R instanceof Power) {
            // Пытаемся упростить правую часть левого выражения с правым выражением
            const leftSimplified = new Multiplication(L.right, R).simplify();
            if (!(leftSimplified instanceof Multiplication)) {
                // Если упростилось, объединяем с левой левой частью
                return new Multiplication(L.left, leftSimplified).simplify();
            }
        }

        return new Multiplication(L, R);
    }

    evaluate() {
        const leftValue = (typeof this.left === 'number') ? this.left : this.left.evaluate();
        const rightValue = (typeof this.right === 'number') ? this.right : this.right.evaluate();
        return leftValue * rightValue;
    }
}

class Addition extends Operation {
    tex() { return `${this.getTex(this.left)} + ${this.getTex(this.right)}`; }
    simplify() {
        const L = this.left?.simplify ? this.left.simplify() : this.left;
        const R = this.right?.simplify ? this.right.simplify() : this.right;
        const num = this.tryCompute((a, b) => a + b);
        if (num !== null) return num;

        if (L instanceof Power && R instanceof Power && L.isEqual(R)) {
            return new Power(L.base, L.exponent, L.coefficient + R.coefficient);
        }
        return new Addition(L, R);
    }

    evaluate() {
        const leftValue = (typeof this.left === 'number') ? this.left : this.left.evaluate();
        const rightValue = (typeof this.right === 'number') ? this.right : this.right.evaluate();
        return leftValue + rightValue;
    }
}

class Subtraction extends Operation {
    tex() { return `${this.getTex(this.left)} - ${this.getTex(this.right)}`; }
    simplify() {
        const L = this.left?.simplify ? this.left.simplify() : this.left;
        const R = this.right?.simplify ? this.right.simplify() : this.right;
        const num = this.tryCompute((a, b) => a - b);
        if (num !== null) return num;
        return new Subtraction(L, R);
    }

    evaluate() {
        const leftValue = (typeof this.left === 'number') ? this.left : this.left.evaluate();
        const rightValue = (typeof this.right === 'number') ? this.right : this.right.evaluate();
        return leftValue - rightValue;
    }
}

class Division extends Operation {
    tex() {
        const leftTex = this.getTex(this.left);
        const rightTex = this.getTex(this.right);
        return `\\frac{${leftTex}}{${rightTex}}`;
    }
    simplify() {
        const L = this.left?.simplify ? this.left.simplify() : this.left;
        const R = this.right?.simplify ? this.right.simplify() : this.right;

        const num = this.tryCompute((a, b) => a / b);
        if (num !== null) return num;

        // a^n / a^m = a^(n-m)
        if (L instanceof Power && R instanceof Power) {
            const baseEq = L.base?.isEqual ? L.base.isEqual(R.base) : L.base === R.base;
            if (baseEq) {
                const newExp = new Subtraction(L.exponent, R.exponent).simplify();
                const newCoeff = L.coefficient / R.coefficient;
                return new Power(L.base, newExp, newCoeff);
            }
        }

        // (a * b) / c - пытаемся упростить рекурсивно
        if (L instanceof Multiplication && R instanceof Power) {
            // Пытаемся разделить правую часть умножения на делитель
            const rightDivided = new Division(L.right, R).simplify();
            if (!(rightDivided instanceof Division)) {
                // Если упростилось, умножаем левую часть на результат
                return new Multiplication(L.left, rightDivided).simplify();
            }
            // Пытаемся разделить левую часть умножения на делитель
            const leftDivided = new Division(L.left, R).simplify();
            if (!(leftDivided instanceof Division)) {
                // Если упростилось, умножаем на правую часть
                return new Multiplication(leftDivided, L.right).simplify();
            }
        }

        // (a * b) / (c * d) - пытаемся упростить рекурсивно
        if (L instanceof Multiplication && R instanceof Multiplication) {
            // Пробуем сократить правые части
            const rightDivided = new Division(L.right, R.right).simplify();
            if (!(rightDivided instanceof Division)) {
                // Если упростилось, создаём новое деление с упрощённой правой частью
                return new Division(
                    new Multiplication(L.left, rightDivided).simplify(),
                    R.left
                ).simplify();
            }
        }

        return new Division(L, R);
    }

    evaluate() {
        const leftValue = (typeof this.left === 'number') ? this.left : this.left.evaluate();
        const rightValue = (typeof this.right === 'number') ? this.right : this.right.evaluate();
        return leftValue / rightValue;
    }
}