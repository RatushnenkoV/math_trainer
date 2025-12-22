class Polynomial extends Expression {
    constructor(monomials = []) {
        super();
        this.monomials = monomials;
    }

    tex() {
        if (this.monomials.length === 0) return "0";
        return this.monomials.map((m, i) => {
            let t = m.tex();
            return (i > 0 && !t.startsWith('-')) ? `+ ${t}` : t;
        }).join(' ');
    }

    simplify() {
        // 1. Упрощаем каждый одночлен
        let simplifiedMonos = this.monomials
            .map(m => m.simplify())
            .filter(m => m !== 0); // Убираем нулевые слагаемые

        // 2. Приводим подобные слагаемые
        // Подобные — это те, у которых буквенная часть (массив степеней) совпадает
        let groups = new Map();

        simplifiedMonos.forEach(m => {
            // Создаем ключ из буквенной части
            let literalPart = (m instanceof Monomial) 
                ? m.powers.map(p => p.tex()).sort().join('*')
                : "constant";
            
            let coeff = (m instanceof Monomial) ? m.coefficient : m;
            let powers = (m instanceof Monomial) ? m.powers : [];

            if (groups.has(literalPart)) {
                groups.get(literalPart).coefficient += coeff;
            } else {
                groups.set(literalPart, { coefficient: coeff, powers: powers });
            }
        });

        // 3. Собираем обратно в массив, исключая те, где коэффициент стал 0
        let resultMonos = Array.from(groups.values())
            .filter(g => g.coefficient !== 0)
            .map(g => g.powers.length > 0 ? new Monomial(g.coefficient, g.powers) : g.coefficient);

        if (resultMonos.length === 0) return 0;
        if (resultMonos.length === 1) return resultMonos[0];

        return new Polynomial(resultMonos);
    }

    add(other) {
        if (other instanceof Polynomial) {
            return new Polynomial([...this.monomials, ...other.monomials]).simplify();
        }
        if (other instanceof Monomial) {
            return new Polynomial([...this.monomials, other]).simplify();
        }
        // Если пришло число
        return new Polynomial([...this.monomials, new Monomial(other, [])]).simplify();
    }

    multiply(other) {
        if (typeof other === 'number' || other instanceof Monomial) {
            // Умножаем каждый одночлен внутри на "other"
            return new Polynomial(this.monomials.map(m => m.multiply(other))).simplify();
        }

        if (other instanceof Polynomial) {
            // Умножение многочлена на многочлен: (a+b)(c+d) = ac + ad + bc + bd
            let newMonos = [];
            for (let m1 of this.monomials) {
                for (let m2 of other.monomials) {
                    newMonos.push(m1.multiply(m2));
                }
            }
            return new Polynomial(newMonos).simplify();
        }
    }
}