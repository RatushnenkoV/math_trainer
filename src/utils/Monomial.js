class Monomial extends Expression {
    constructor(coefficient = 1, powers = []) {
        super();
        this.coefficient = coefficient;
        // powers - массив экземпляров Power
        this.powers = Array.isArray(powers) ? powers : [powers];
    }

    tex() {
        if (this.coefficient === 0) return "0";
        let parts = [];
        if (this.coefficient !== 1 || this.powers.length === 0) {
            parts.push(this.coefficient);
        }
        this.powers.forEach(p => parts.push(p.tex()));
        return parts.join(' \\cdot ');
    }

    simplify() {
        // 1. Упрощаем все внутренние степени и собираем общий коэффициент
        let currentCoeff = this.coefficient;
        let simplifiedPowers = [];

        this.powers.forEach(p => {
            let s = p.simplify();
            if (typeof s === 'number') {
                currentCoeff *= s;
            } else if (s instanceof Power) {
                simplifiedPowers.push(s);
            }
        });

        if (currentCoeff === 0) return 0;

        // 2. Группируем одинаковые основания и складываем их показатели
        // Используем Map для группировки по tex-представлению основания
        let grouped = new Map();

        simplifiedPowers.forEach(p => {
            let baseKey = p.base.tex ? p.base.tex() : String(p.base);
            if (grouped.has(baseKey)) {
                let existing = grouped.get(baseKey);
                // Складываем показатели: n^a * n^b = n^(a+b)
                existing.exponent = new Addition(existing.exponent, p.exponent).simplify();
                currentCoeff *= p.coefficient; // Учитываем коэффициент внутри Power
            } else {
                grouped.set(baseKey, new Power(p.base, p.exponent, 1));
                currentCoeff *= p.coefficient;
            }
        });

        let finalPowers = Array.from(grouped.values()).filter(p => p.exponent !== 0);
        
        // Если после упрощения степеней нет, возвращаем просто число
        if (finalPowers.length === 0) return currentCoeff;

        return new Monomial(currentCoeff, finalPowers);
    }

    add(other) {
        // Если это другой одночлен, создаем многочлен
        if (other instanceof Monomial || other instanceof Polynomial) {
            return new Polynomial([this, other]).simplify();
        }
        // Если это просто число
        return new Polynomial([this, new Monomial(other, [])]).simplify();
    }

    multiply(other) {
        if (typeof other === 'number') {
            return new Monomial(this.coefficient * other, this.powers).simplify();
        }
        
        if (other instanceof Monomial) {
            // Правило: коэффициенты перемножаются, массивы степеней объединяются
            return new Monomial(
                this.coefficient * other.coefficient,
                [...this.powers, ...other.powers]
            ).simplify();
        }

        if (other instanceof Polynomial) {
            // Дистрибутивность: a * (b + c) = ab + ac
            const newMonos = other.monomials.map(m => this.multiply(m));
            return new Polynomial(newMonos).simplify();
        }
    }
}