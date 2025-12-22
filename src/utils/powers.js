class Expression {
    isEqual(other) { return false; }
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

        // 1. Вычисление, если всё — числа
        if (typeof sBase === 'number' && typeof sExp === 'number') {
            return this.coefficient * Math.pow(sBase, sExp);
        }

        // 2. Правило (a^n)^m: коэффициент внешнего Power остается, 
        // а коэффициент внутреннего Power возводится в степень (если это число)
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

            return new Power(sBase.base, newExp, newCoeff);
        }

        return new Power(sBase, sExp, this.coefficient);
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
        return new Multiplication(L, R);
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
}

// Классы Subtraction и Division реализуются по аналогии