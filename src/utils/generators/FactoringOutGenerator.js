// Генератор задач для вынесения множителя за скобки
class FactoringOutGenerator {
    constructor(settings = {}) {
        // Настроек нет, согласно требованию
        this.settings = settings;
    }

    generate() {
        return this.generateFactoringProblem();
    }

    // Генерируем задачу на вынесение за скобки
    generateFactoringProblem() {
        // Генерируем общий множитель (НОД)
        const commonFactor = this.generateCommonFactor();

        // Генерируем количество слагаемых в скобках (2-4)
        const numTerms = 2 + Math.floor(Math.random() * 3); // 2, 3 или 4

        // Генерируем слагаемые внутри скобок, избегая подобных после умножения
        const termsInBrackets = this.generateUniqueTerms(commonFactor, numTerms);

        // Создаём полином в скобках (без simplify, так как мономы уже упрощены)
        const bracketPolynomial = new Polynomial(termsInBrackets);

        // Создаём развёрнутое выражение (умножаем commonFactor на каждое слагаемое)
        const expandedMonomials = termsInBrackets.map(term =>
            this.multiplyMonomials(commonFactor, term)
        );

        const expandedPolynomial = new Polynomial(expandedMonomials);

        // Формируем ответ: commonFactor * (bracketPolynomial)
        const answer = {
            factor: commonFactor,           // Одночлен за скобками
            polynomial: bracketPolynomial   // Полином в скобках
        };

        return {
            type: 'factoringOut',
            question: expandedPolynomial.tex(),  // Показываем развёрнутое выражение
            answer: answer,                       // Ответ в виде factor * (polynomial)
            expanded: expandedPolynomial          // Для проверки
        };
    }

    // Генерируем уникальные слагаемые (без подобных после умножения на commonFactor)
    generateUniqueTerms(commonFactor, numTerms) {
        const terms = [];
        const usedSignatures = new Set();

        let attempts = 0;
        const maxAttempts = 100;

        while (terms.length < numTerms && attempts < maxAttempts) {
            attempts++;

            const term = this.generateTermInBrackets(terms.length);
            const expandedTerm = this.multiplyMonomials(commonFactor, term);
            const signature = this.getMonomialSignature(expandedTerm);

            // Проверяем, что такая сигнатура ещё не использовалась
            if (!usedSignatures.has(signature)) {
                terms.push(term);
                usedSignatures.add(signature);
            }
        }

        // Если не удалось сгенерировать нужное количество, возвращаем что есть
        // (на практике это крайне маловероятно)
        return terms.length > 0 ? terms : [new Monomial(1, [])];
    }

    // Получить сигнатуру монома (строка вида "x^2y^1" для сравнения)
    getMonomialSignature(monomial) {
        if (!monomial.powers || monomial.powers.length === 0) {
            return 'const'; // Константа
        }

        // Сортируем переменные по алфавиту и создаём строку
        const sortedPowers = [...monomial.powers].sort((a, b) => {
            const baseA = a.base.tex ? a.base.tex() : a.base;
            const baseB = b.base.tex ? b.base.tex() : b.base;
            return baseA.localeCompare(baseB);
        });

        return sortedPowers.map(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? p.exponent.tex()
                : p.exponent;
            return `${base}^${exp}`;
        }).join('');
    }

    // Генерируем общий множитель (может быть числом или одночленом)
    generateCommonFactor() {
        const choice = Math.random();

        if (choice < 0.3) {
            // Только число (2-9)
            const coeff = 2 + Math.floor(Math.random() * 8);
            return new Monomial(coeff, []);
        } else if (choice < 0.6) {
            // Одна переменная в первой степени
            const variable = this.getRandomVariable();
            return new Monomial(1, [new Power(variable, 1)]);
        } else if (choice < 0.85) {
            // Число и одна переменная
            const coeff = 2 + Math.floor(Math.random() * 5); // 2-6
            const variable = this.getRandomVariable();
            return new Monomial(coeff, [new Power(variable, 1)]);
        } else {
            // Одна переменная в степени 2
            const variable = this.getRandomVariable();
            return new Monomial(1, [new Power(variable, 2)]);
        }
    }

    // Генерируем слагаемое внутри скобок
    generateTermInBrackets(index) {
        const choice = Math.random();

        if (choice < 0.4) {
            // Просто число
            const coeff = (index === 0 ? 1 : (Math.random() < 0.7 ? 1 : -1)) * (1 + Math.floor(Math.random() * 9)); // ±1 до ±9
            return new Monomial(coeff, []);
        } else if (choice < 0.7) {
            // Одна переменная
            const coeff = (Math.random() < 0.7 ? 1 : -1) * (1 + Math.floor(Math.random() * 5));
            const variable = this.getRandomVariable();
            const power = Math.random() < 0.7 ? 1 : 2; // Чаще степень 1
            return new Monomial(coeff, [new Power(variable, power)]);
        } else {
            // Две переменные
            const coeff = (Math.random() < 0.7 ? 1 : -1) * (1 + Math.floor(Math.random() * 4));
            const vars = this.getTwoRandomVariables();
            return new Monomial(coeff, [
                new Power(vars[0], 1),
                new Power(vars[1], 1)
            ]);
        }
    }

    // Получить случайную переменную
    getRandomVariable() {
        const variables = ['a', 'b', 'c', 'x', 'y', 'z'];
        return variables[Math.floor(Math.random() * variables.length)];
    }

    // Получить две разные случайные переменные
    getTwoRandomVariables() {
        const variables = ['a', 'b', 'c', 'x', 'y', 'z'];
        const shuffled = [...variables].sort(() => Math.random() - 0.5);
        return [shuffled[0], shuffled[1]];
    }

    // Умножение двух мономов
    multiplyMonomials(m1, m2) {
        // Коэффициент - произведение коэффициентов
        const newCoeff = m1.coefficient * m2.coefficient;

        // Степени - объединяем и складываем показатели одинаковых оснований
        const powerMap = {};

        // Добавляем степени из первого монома
        m1.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? parseInt(p.exponent.tex())
                : parseInt(p.exponent);
            powerMap[base] = (powerMap[base] || 0) + exp;
        });

        // Добавляем степени из второго монома
        m2.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? parseInt(p.exponent.tex())
                : parseInt(p.exponent);
            powerMap[base] = (powerMap[base] || 0) + exp;
        });

        // Создаём массив степеней для нового монома
        const newPowers = [];
        for (const base in powerMap) {
            if (powerMap[base] > 0) {
                newPowers.push(new Power(base, powerMap[base]));
            }
        }

        return new Monomial(newCoeff, newPowers);
    }
}
