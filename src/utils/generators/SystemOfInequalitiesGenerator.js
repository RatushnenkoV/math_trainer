// Генератор систем неравенств (2 неравенства: линейные или квадратные)

class SystemOfInequalitiesProblemGenerator {
    constructor(settings) {
        this.settings = settings || {};
        this.linearGenerator = new LinearInequalitiesProblemGenerator({ basic: true, easy: true, medium: true, hard: false });
        this.quadraticGenerator = new QuadraticInequalitiesProblemGenerator({ nonStandardForm: false, aEqualsOne: false, allowIncomplete: true });
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

    // Получение случайного знака неравенства
    getRandomSign() {
        const signs = ['<', '\\leq', '>', '\\geq'];
        return signs[this.randomInt(0, signs.length - 1)];
    }

    // Форматирование коэффициента для LaTeX
    formatCoefficient(coef, withVariable, isFirst = false) {
        if (coef === 0) return null;

        let result = '';

        // Добавляем знак
        if (!isFirst) {
            result += coef > 0 ? '+' : '';
        }

        // Добавляем число
        if (withVariable) {
            if (coef === 1) {
                result += isFirst ? '' : '';
            } else if (coef === -1) {
                result += '-';
            } else {
                result += coef.toString();
            }
        } else {
            result += coef.toString();
        }

        return result;
    }

    // Преобразование решения линейного неравенства в множество RealSet
    linearSolutionToSet(criticalPoint, solutionLeft, solutionRight, pointIncluded) {
        const INF = 1e9;  // Большое число для представления бесконечности

        if (solutionLeft && solutionRight) {
            // Решение - вся прямая (не должно быть для нестрогих неравенств)
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

    // Преобразование решения квадратного неравенства в множество RealSet
    quadraticSolutionToSet(roots, solutionBetween, pointsIncluded) {
        const INF = 1e9;

        if (roots.length !== 2) {
            return new EmptySet();
        }

        const [x1, x2] = roots;

        if (solutionBetween) {
            // Решение между корнями: [x1, x2] или (x1, x2)
            return new Interval(x1, x2, pointsIncluded, pointsIncluded);
        } else {
            // Решение вне корней: (-∞, x1] ∪ [x2, +∞) или (-∞, x1) ∪ (x2, +∞)
            const left = new Interval(-INF, x1, true, pointsIncluded);
            const right = new Interval(x2, INF, pointsIncluded, true);
            return UnionSet.normalize([left, right]);
        }
    }

    // Генерация линейного неравенства ax + b <sign> 0 с заданным решением
    generateLinearWithSolution(criticalPoint, solutionLeft, solutionRight, pointIncluded) {
        // Выбираем знак неравенства на основе требуемого решения
        let sign;
        const k = this.randomNonZero(-10, 10);

        if (k > 0) {
            // Если k > 0, то знак не меняется
            if (solutionLeft && pointIncluded) {
                sign = '\\leq';
            } else if (solutionLeft && !pointIncluded) {
                sign = '<';
            } else if (solutionRight && pointIncluded) {
                sign = '\\geq';
            } else {
                sign = '>';
            }
        } else {
            // Если k < 0, то знак меняется
            if (solutionLeft && pointIncluded) {
                sign = '\\geq';
            } else if (solutionLeft && !pointIncluded) {
                sign = '>';
            } else if (solutionRight && pointIncluded) {
                sign = '\\leq';
            } else {
                sign = '<';
            }
        }

        const b = -k * criticalPoint;

        let inequality = '';
        const kCoef = this.formatCoefficient(k, true, true);
        inequality += kCoef + 'x';

        if (b !== 0) {
            const bCoef = this.formatCoefficient(b, false, false);
            inequality += bCoef;
        }

        inequality += sign + '0';

        // Проверяем соответствие решения сгенерированному неравенству
        // kx + b <sign> 0  =>  x <sign> -b/k
        // При k > 0: знак сохраняется
        // При k < 0: знак меняется
        let actualSolutionLeft, actualSolutionRight;
        if (k > 0) {
            if (sign === '<' || sign === '\\leq') {
                actualSolutionLeft = true;
                actualSolutionRight = false;
            } else {
                actualSolutionLeft = false;
                actualSolutionRight = true;
            }
        } else {
            if (sign === '<' || sign === '\\leq') {
                actualSolutionLeft = false;
                actualSolutionRight = true;
            } else {
                actualSolutionLeft = true;
                actualSolutionRight = false;
            }
        }

        return {
            inequality: inequality,
            criticalPoint: criticalPoint,
            solutionLeft: actualSolutionLeft,
            solutionRight: actualSolutionRight,
            pointIncluded: pointIncluded,
            type: 'linear',
            isLatex: true
        };
    }

    // Генерация квадратного неравенства с двумя корнями
    generateQuadraticWithTwoRoots(x1, x2, solutionBetween, pointsIncluded) {
        // Выбираем знак неравенства на основе требуемого решения
        const a = this.randomNonZero(-5, 5);
        let sign;

        if (a > 0) {
            // Парабола ветвями вверх
            if (solutionBetween) {
                sign = pointsIncluded ? '\\leq' : '<';
            } else {
                sign = pointsIncluded ? '\\geq' : '>';
            }
        } else {
            // Парабола ветвями вниз
            if (solutionBetween) {
                sign = pointsIncluded ? '\\geq' : '>';
            } else {
                sign = pointsIncluded ? '\\leq' : '<';
            }
        }

        // Вычисляем коэффициенты по формуле: a(x - x1)(x - x2) = 0
        const b = -a * (x1 + x2);
        const c = a * x1 * x2;

        let inequality = '';

        // ax^2
        const aCoef = this.formatCoefficient(a, true, true);
        inequality += aCoef + 'x^2';

        // bx
        if (b !== 0) {
            const bCoef = this.formatCoefficient(b, true, false);
            inequality += bCoef + 'x';
        }

        // c
        if (c !== 0) {
            const cCoef = this.formatCoefficient(c, false, false);
            inequality += cCoef;
        }

        inequality += sign + '0';

        // Определяем решение
        const [leftRoot, rightRoot] = x1 < x2 ? [x1, x2] : [x2, x1];

        return {
            inequality: inequality,
            roots: [leftRoot, rightRoot],
            pointsIncluded: pointsIncluded,
            solutionBetween: solutionBetween,
            type: 'quadratic',
            isLatex: true,
            solution: {
                type: solutionBetween ? 'between' : 'outside',
                points: [
                    { value: leftRoot, included: pointsIncluded },
                    { value: rightRoot, included: pointsIncluded }
                ]
            }
        };
    }

    // Универсальный метод решения системы неравенств с использованием RealSet
    solveSystem(ineq1, ineq2) {
        // Получаем множества-решения для каждого неравенства
        let set1, set2;

        if (ineq1.type === 'linear') {
            set1 = this.linearSolutionToSet(ineq1.criticalPoint, ineq1.solutionLeft, ineq1.solutionRight, ineq1.pointIncluded);
        } else if (ineq1.type === 'quadratic') {
            set1 = this.quadraticSolutionToSet(ineq1.roots, ineq1.solutionBetween, ineq1.pointsIncluded);
        }

        if (ineq2.type === 'linear') {
            set2 = this.linearSolutionToSet(ineq2.criticalPoint, ineq2.solutionLeft, ineq2.solutionRight, ineq2.pointIncluded);
        } else if (ineq2.type === 'quadratic') {
            set2 = this.quadraticSolutionToSet(ineq2.roots, ineq2.solutionBetween, ineq2.pointsIncluded);
        }

        // Находим пересечение множеств
        const solution = set1.intersection(set2);

        return {
            type: 'realset',
            solution: solution  // Это объект RealSet (EmptySet, Point, Interval или UnionSet)
        };
    }

    // Генерация системы неравенств
    generate() {
        // Случайно выбираем типы неравенств
        const type1 = Math.random() < 0.5 ? 'linear' : 'quadratic';
        const type2 = Math.random() < 0.5 ? 'linear' : 'quadratic';

        let ineq1, ineq2;

        if (type1 === 'linear' && type2 === 'linear') {
            // Две линейных
            const x1 = this.randomInt(-15, 10);
            const x2 = this.randomInt(x1 + 2, 15);

            // Генерируем так, чтобы решение было между точками
            ineq1 = this.generateLinearWithSolution(x1, false, true, Math.random() < 0.5);
            ineq2 = this.generateLinearWithSolution(x2, true, false, Math.random() < 0.5);
        } else if (type1 === 'linear' && type2 === 'quadratic') {
            // Линейное и квадратное
            const q1 = this.randomInt(-15, 5);
            const q2 = this.randomInt(q1 + 3, 15);
            const linearPoint = this.randomInt(q1 - 5, q2 + 5);

            ineq1 = this.generateLinearWithSolution(linearPoint, Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5);
            ineq2 = this.generateQuadraticWithTwoRoots(q1, q2, Math.random() < 0.5, Math.random() < 0.5);
        } else if (type1 === 'quadratic' && type2 === 'linear') {
            // Квадратное и линейное
            const q1 = this.randomInt(-15, 5);
            const q2 = this.randomInt(q1 + 3, 15);
            const linearPoint = this.randomInt(q1 - 5, q2 + 5);

            ineq1 = this.generateQuadraticWithTwoRoots(q1, q2, Math.random() < 0.5, Math.random() < 0.5);
            ineq2 = this.generateLinearWithSolution(linearPoint, Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5);
        } else {
            // Две квадратных
            const q1_1 = this.randomInt(-15, 0);
            const q1_2 = this.randomInt(q1_1 + 3, 10);
            const q2_1 = this.randomInt(-10, 5);
            const q2_2 = this.randomInt(q2_1 + 3, 15);

            ineq1 = this.generateQuadraticWithTwoRoots(q1_1, q1_2, Math.random() < 0.5, Math.random() < 0.5);
            ineq2 = this.generateQuadraticWithTwoRoots(q2_1, q2_2, Math.random() < 0.5, Math.random() < 0.5);
        }

        // Находим решение системы через универсальный метод
        const solution = this.solveSystem(ineq1, ineq2);

        return {
            inequality1: ineq1,
            inequality2: ineq2,
            solution: solution,
            isLatex: true
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
