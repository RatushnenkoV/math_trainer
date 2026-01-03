class PolynomialExpandGenerator {
    constructor(settings = {}) {
        this.settings = {
            monomialByPolynomial: settings.monomialByPolynomial ?? true,
            polynomialByPolynomial: settings.polynomialByPolynomial ?? false,
            ...settings
        };
    }

    generate() {
        const availableTypes = [];

        if (this.settings.monomialByPolynomial) {
            availableTypes.push('monomialByPolynomial');
        }

        if (this.settings.polynomialByPolynomial) {
            availableTypes.push('polynomialByPolynomial');
        }

        if (availableTypes.length === 0) {
            return null;
        }

        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        if (type === 'monomialByPolynomial') {
            return this.generateMonomialByPolynomial();
        } else {
            return this.generatePolynomialByPolynomial();
        }
    }

    generateMonomialByPolynomial() {
        const variables = ['a', 'b', 'c', 'x', 'y', 'z'];
        const selectedVars = this.selectRandomVariables(variables, 1, 2);

        const monomial = this.generateRandomMonomial(selectedVars, 1, 3);

        const polynomialLength = 2 + Math.floor(Math.random() * 2);
        const polynomial = this.generateRandomPolynomial(selectedVars, polynomialLength, 1, 3);

        const result = monomial.multiply(polynomial).simplify();

        return {
            type: 'monomialByPolynomial',
            expression: `${monomial.tex()} \\cdot (${polynomial.tex()})`,
            monomial: monomial,
            polynomial: polynomial,
            result: result
        };
    }

    generatePolynomialByPolynomial() {
        const variables = ['a', 'b', 'c', 'x', 'y', 'z'];
        const selectedVars = this.selectRandomVariables(variables, 1, 2);

        const poly1Length = 2 + Math.floor(Math.random() * 2);
        const poly2Length = 2;

        const poly1 = this.generateRandomPolynomial(selectedVars, poly1Length, 1, 2);
        const poly2 = this.generateRandomPolynomial(selectedVars, poly2Length, 1, 2);

        const result = poly1.multiply(poly2).simplify();

        return {
            type: 'polynomialByPolynomial',
            expression: `(${poly1.tex()}) \\cdot (${poly2.tex()})`,
            polynomial1: poly1,
            polynomial2: poly2,
            result: result
        };
    }

    selectRandomVariables(allVars, min, max) {
        const count = min + Math.floor(Math.random() * (max - min + 1));
        const shuffled = [...allVars].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    generateRandomMonomial(variables, minCoeff, maxCoeff) {
        const coefficient = minCoeff + Math.floor(Math.random() * (maxCoeff - minCoeff + 1));

        const powers = [];
        const selectedVar = variables[Math.floor(Math.random() * variables.length)];
        const power = 1 + Math.floor(Math.random() * 2);

        powers.push(new Power(selectedVar, power));

        return new Monomial(coefficient, powers);
    }

    generateRandomPolynomial(variables, length, minCoeff, maxCoeff) {
        const monomials = [];
        const usedCombinations = new Set();

        while (monomials.length < length) {
            const powers = [];
            let combination = '';

            if (Math.random() > 0.3 && variables.length > 0) {
                const numVars = 1 + Math.floor(Math.random() * Math.min(2, variables.length));
                const selectedVars = [...variables].sort(() => Math.random() - 0.5).slice(0, numVars);

                for (const varName of selectedVars) {
                    const power = 1 + Math.floor(Math.random() * 2);
                    powers.push(new Power(varName, power));
                    combination += `${varName}^${power}_`;
                }
            } else {
                combination = 'const';
            }

            if (usedCombinations.has(combination)) {
                continue;
            }

            usedCombinations.add(combination);

            let coefficient = minCoeff + Math.floor(Math.random() * (maxCoeff - minCoeff + 1));
            if (Math.random() > 0.5) {
                coefficient *= -1;
            }

            monomials.push(new Monomial(coefficient, powers));
        }

        return new Polynomial(monomials);
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
