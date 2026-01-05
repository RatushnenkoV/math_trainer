class AlgebraicIdentitiesGenerator {
    constructor(settings = {}) {
        this.settings = {
            // Режимы
            expansion: settings.expansion ?? true,
            factorization: settings.factorization ?? false,

            // Формулы
            squareOfSum: settings.squareOfSum ?? true,
            squareOfDifference: settings.squareOfDifference ?? true,
            differenceOfSquares: settings.differenceOfSquares ?? true,
            cubeOfSum: settings.cubeOfSum ?? false,
            cubeOfDifference: settings.cubeOfDifference ?? false,
            sumOfCubes: settings.sumOfCubes ?? false,
            differenceOfCubes: settings.differenceOfCubes ?? false,

            // Сложность
            complexity: settings.complexity ?? 'simple', // 'simple', 'medium', 'complex'

            ...settings
        };
    }

    generate() {
        const availableFormulas = this.getAvailableFormulas();

        if (availableFormulas.length === 0) {
            return null;
        }

        const formula = availableFormulas[Math.floor(Math.random() * availableFormulas.length)];

        return this.generateProblem(formula);
    }

    getAvailableFormulas() {
        const formulas = [];

        if (this.settings.squareOfSum) formulas.push('squareOfSum');
        if (this.settings.squareOfDifference) formulas.push('squareOfDifference');
        if (this.settings.differenceOfSquares) formulas.push('differenceOfSquares');
        if (this.settings.cubeOfSum) formulas.push('cubeOfSum');
        if (this.settings.cubeOfDifference) formulas.push('cubeOfDifference');
        if (this.settings.sumOfCubes) formulas.push('sumOfCubes');
        if (this.settings.differenceOfCubes) formulas.push('differenceOfCubes');

        return formulas;
    }

    generateProblem(formulaType) {
        const availableModes = [];
        if (this.settings.expansion) availableModes.push('expansion');
        if (this.settings.factorization) availableModes.push('factorization');

        if (availableModes.length === 0) return null;

        const mode = availableModes[Math.floor(Math.random() * availableModes.length)];

        // Для сумм/разностей кубов - только один режим
        if (formulaType === 'sumOfCubes' || formulaType === 'differenceOfCubes') {
            // Эти формулы обычно используются для разложения
            return this[formulaType](mode === 'expansion' ? 'expansion' : 'factorization');
        }

        return this[formulaType](mode);
    }

    // Генерируем термы в зависимости от сложности
    generateTerm() {
        const variables = ['a', 'b', 'c', 'x', 'y', 'z'];

        switch (this.settings.complexity) {
            case 'simple':
                // Простые переменные: a, b, c, x
                const simpleVar = variables[Math.floor(Math.random() * 4)];
                return new Monomial(1, [new Power(simpleVar, 1)]);

            case 'medium':
                // Средние: 2a, 3b², 5x
                const mediumVar = variables[Math.floor(Math.random() * 6)];
                const coefficient = 1 + Math.floor(Math.random() * 4); // 1-4
                const power = Math.random() > 0.7 ? 2 : 1;
                return new Monomial(coefficient, [new Power(mediumVar, power)]);

            case 'complex':
                // Сложные: 2a², 3xy, ab²
                const numVars = Math.random() > 0.5 ? 1 : 2;
                const coefficient2 = 1 + Math.floor(Math.random() * 3);
                const powers = [];

                const selectedVars = [...variables].sort(() => Math.random() - 0.5).slice(0, numVars);
                for (const varName of selectedVars) {
                    const pow = Math.random() > 0.6 ? 2 : 1;
                    powers.push(new Power(varName, pow));
                }

                return new Monomial(coefficient2, powers);

            default:
                return new Monomial(1, [new Power('a', 1)]);
        }
    }

    // Генерируем два различных терма
    generateTwoDistinctTerms() {
        const maxAttempts = 20;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const a = this.generateTerm();
            const b = this.generateTerm();

            // Проверяем, что термы различаются
            if (!this.areMonomialsEqual(a, b)) {
                return { a, b };
            }
        }

        // Если не удалось сгенерировать различные термы, используем стандартные
        return {
            a: new Monomial(1, [new Power('a', 1)]),
            b: new Monomial(1, [new Power('b', 1)])
        };
    }

    // Проверка равенства мономов
    areMonomialsEqual(m1, m2) {
        if (m1.coefficient !== m2.coefficient) return false;
        if (m1.powers.length !== m2.powers.length) return false;

        const powers1 = {};
        const powers2 = {};

        m1.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = p.exponent.tex ? p.exponent.tex() : p.exponent;
            powers1[base] = exp;
        });

        m2.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = p.exponent.tex ? p.exponent.tex() : p.exponent;
            powers2[base] = exp;
        });

        for (const base in powers1) {
            if (powers1[base] !== powers2[base]) return false;
        }

        for (const base in powers2) {
            if (powers1[base] !== powers2[base]) return false;
        }

        return true;
    }

    // (a + b)² = a² + 2ab + b²
    squareOfSum(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        if (mode === 'expansion') {
            // Задание: (a + b)² = ?
            const factored = new Polynomial([a, b]);
            const expanded = this.expandSquareOfSum(a, b);

            return {
                type: 'squareOfSum',
                mode: 'expansion',
                expression: `(${factored.tex()})^2`,
                question: `(${factored.tex()})^2`,
                answer: expanded,
                factored: [{ polynomial: factored, power: 2 }]
            };
        } else {
            // Задание: a² + 2ab + b² = ?
            const expanded = this.expandSquareOfSum(a, b);
            const factored = new Polynomial([a, b]);

            return {
                type: 'squareOfSum',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [{ polynomial: factored, power: 2 }],
                expanded: expanded
            };
        }
    }

    expandSquareOfSum(a, b) {
        // a² + 2ab + b²
        const aSquared = a.multiply(a);
        const twoAB = a.multiply(b).multiply(new Monomial(2, []));
        const bSquared = b.multiply(b);

        return new Polynomial([aSquared, twoAB, bSquared]).simplify();
    }

    // (a - b)² = a² - 2ab + b²
    squareOfDifference(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        if (mode === 'expansion') {
            const factored = new Polynomial([a, b.multiply(new Monomial(-1, []))]);
            const expanded = this.expandSquareOfDifference(a, b);

            return {
                type: 'squareOfDifference',
                mode: 'expansion',
                expression: `(${factored.tex()})^2`,
                question: `(${factored.tex()})^2`,
                answer: expanded,
                factored: [{ polynomial: factored, power: 2 }]
            };
        } else {
            const expanded = this.expandSquareOfDifference(a, b);
            const factored = new Polynomial([a, b.multiply(new Monomial(-1, []))]);

            return {
                type: 'squareOfDifference',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [{ polynomial: factored, power: 2 }],
                expanded: expanded
            };
        }
    }

    expandSquareOfDifference(a, b) {
        // a² - 2ab + b²
        const aSquared = a.multiply(a);
        const minusTwoAB = a.multiply(b).multiply(new Monomial(-2, []));
        const bSquared = b.multiply(b);

        return new Polynomial([aSquared, minusTwoAB, bSquared]).simplify();
    }

    // (a - b)(a + b) = a² - b²
    differenceOfSquares(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        if (mode === 'expansion') {
            const factor1 = new Polynomial([a, b.multiply(new Monomial(-1, []))]);
            const factor2 = new Polynomial([a, b]);
            const expanded = this.expandDifferenceOfSquares(a, b);

            return {
                type: 'differenceOfSquares',
                mode: 'expansion',
                expression: `(${factor1.tex()})(${factor2.tex()})`,
                question: `(${factor1.tex()})(${factor2.tex()})`,
                answer: expanded,
                factored: [
                    { polynomial: factor1, power: 1 },
                    { polynomial: factor2, power: 1 }
                ]
            };
        } else {
            const expanded = this.expandDifferenceOfSquares(a, b);
            const factor1 = new Polynomial([a, b.multiply(new Monomial(-1, []))]);
            const factor2 = new Polynomial([a, b]);

            return {
                type: 'differenceOfSquares',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [
                    { polynomial: factor1, power: 1 },
                    { polynomial: factor2, power: 1 }
                ],
                expanded: expanded
            };
        }
    }

    expandDifferenceOfSquares(a, b) {
        // a² - b²
        const aSquared = a.multiply(a);
        const minusBSquared = b.multiply(b).multiply(new Monomial(-1, []));

        return new Polynomial([aSquared, minusBSquared]).simplify();
    }

    // (a + b)³ = a³ + 3a²b + 3ab² + b³
    cubeOfSum(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        if (mode === 'expansion') {
            const factored = new Polynomial([a, b]);
            const expanded = this.expandCubeOfSum(a, b);

            return {
                type: 'cubeOfSum',
                mode: 'expansion',
                expression: `(${factored.tex()})^3`,
                question: `(${factored.tex()})^3`,
                answer: expanded,
                factored: [{ polynomial: factored, power: 3 }]
            };
        } else {
            const expanded = this.expandCubeOfSum(a, b);
            const factored = new Polynomial([a, b]);

            return {
                type: 'cubeOfSum',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [{ polynomial: factored, power: 3 }],
                expanded: expanded
            };
        }
    }

    expandCubeOfSum(a, b) {
        // a³ + 3a²b + 3ab² + b³
        const aCubed = a.multiply(a).multiply(a);
        const threeASquaredB = a.multiply(a).multiply(b).multiply(new Monomial(3, []));
        const threeABSquared = a.multiply(b).multiply(b).multiply(new Monomial(3, []));
        const bCubed = b.multiply(b).multiply(b);

        return new Polynomial([aCubed, threeASquaredB, threeABSquared, bCubed]).simplify();
    }

    // (a - b)³ = a³ - 3a²b + 3ab² - b³
    cubeOfDifference(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        if (mode === 'expansion') {
            const factored = new Polynomial([a, b.multiply(new Monomial(-1, []))]);
            const expanded = this.expandCubeOfDifference(a, b);

            return {
                type: 'cubeOfDifference',
                mode: 'expansion',
                expression: `(${factored.tex()})^3`,
                question: `(${factored.tex()})^3`,
                answer: expanded,
                factored: [{ polynomial: factored, power: 3 }]
            };
        } else {
            const expanded = this.expandCubeOfDifference(a, b);
            const factored = new Polynomial([a, b.multiply(new Monomial(-1, []))]);

            return {
                type: 'cubeOfDifference',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [{ polynomial: factored, power: 3 }],
                expanded: expanded
            };
        }
    }

    expandCubeOfDifference(a, b) {
        // a³ - 3a²b + 3ab² - b³
        const aCubed = a.multiply(a).multiply(a);
        const minusThreeASquaredB = a.multiply(a).multiply(b).multiply(new Monomial(-3, []));
        const threeABSquared = a.multiply(b).multiply(b).multiply(new Monomial(3, []));
        const minusBCubed = b.multiply(b).multiply(b).multiply(new Monomial(-1, []));

        return new Polynomial([aCubed, minusThreeASquaredB, threeABSquared, minusBCubed]).simplify();
    }

    // a³ + b³ = (a + b)(a² - ab + b²)
    sumOfCubes(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        // Обычно используется для разложения
        const aCubed = a.multiply(a).multiply(a);
        const bCubed = b.multiply(b).multiply(b);
        const expanded = new Polynomial([aCubed, bCubed]).simplify();

        const factor1 = new Polynomial([a, b]);
        const aSquared = a.multiply(a);
        const minusAB = a.multiply(b).multiply(new Monomial(-1, []));
        const bSquared = b.multiply(b);
        const factor2 = new Polynomial([aSquared, minusAB, bSquared]).simplify();

        if (mode === 'expansion') {
            return {
                type: 'sumOfCubes',
                mode: 'expansion',
                expression: `(${factor1.tex()})(${factor2.tex()})`,
                question: `(${factor1.tex()})(${factor2.tex()})`,
                answer: expanded,
                factored: [
                    { polynomial: factor1, power: 1 },
                    { polynomial: factor2, power: 1 }
                ]
            };
        } else {
            return {
                type: 'sumOfCubes',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [
                    { polynomial: factor1, power: 1 },
                    { polynomial: factor2, power: 1 }
                ],
                expanded: expanded
            };
        }
    }

    // a³ - b³ = (a - b)(a² + ab + b²)
    differenceOfCubes(mode) {
        const { a, b } = this.generateTwoDistinctTerms();

        const aCubed = a.multiply(a).multiply(a);
        const minusBCubed = b.multiply(b).multiply(b).multiply(new Monomial(-1, []));
        const expanded = new Polynomial([aCubed, minusBCubed]).simplify();

        const factor1 = new Polynomial([a, b.multiply(new Monomial(-1, []))]);
        const aSquared = a.multiply(a);
        const ab = a.multiply(b);
        const bSquared = b.multiply(b);
        const factor2 = new Polynomial([aSquared, ab, bSquared]).simplify();

        if (mode === 'expansion') {
            return {
                type: 'differenceOfCubes',
                mode: 'expansion',
                expression: `(${factor1.tex()})(${factor2.tex()})`,
                question: `(${factor1.tex()})(${factor2.tex()})`,
                answer: expanded,
                factored: [
                    { polynomial: factor1, power: 1 },
                    { polynomial: factor2, power: 1 }
                ]
            };
        } else {
            return {
                type: 'differenceOfCubes',
                mode: 'factorization',
                expression: expanded.tex(),
                question: expanded.tex(),
                answer: [
                    { polynomial: factor1, power: 1 },
                    { polynomial: factor2, power: 1 }
                ],
                expanded: expanded
            };
        }
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
