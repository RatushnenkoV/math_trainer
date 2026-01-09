// Генератор задач для графиков функций
class FunctionsGenerator {
    constructor(settings = {}) {
        this.settings = {
            linear: settings.linear !== undefined ? settings.linear : true,
            hyperbola: settings.hyperbola !== undefined ? settings.hyperbola : true,
            parabola: settings.parabola !== undefined ? settings.parabola : true
        };
    }

    updateSettings(newSettings) {
        this.settings = {
            linear: newSettings.linear !== undefined ? newSettings.linear : this.settings.linear,
            hyperbola: newSettings.hyperbola !== undefined ? newSettings.hyperbola : this.settings.hyperbola,
            parabola: newSettings.parabola !== undefined ? newSettings.parabola : this.settings.parabola
        };
    }

    generate() {
        // Собираем доступные типы функций
        const availableTypes = [];
        if (this.settings.linear) availableTypes.push('linear');
        if (this.settings.hyperbola) availableTypes.push('hyperbola');
        if (this.settings.parabola) availableTypes.push('parabola');

        // Если ничего не выбрано, возвращаем null
        if (availableTypes.length === 0) {
            return null;
        }

        // Выбираем случайный тип
        const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        switch (type) {
            case 'linear':
                return this.generateLinear();
            case 'hyperbola':
                return this.generateHyperbola();
            case 'parabola':
                return this.generateParabola();
        }
    }

    generateLinear() {
        const k = (Math.floor(Math.random() * 5) - 2) || 1;
        const b = Math.floor(Math.random() * 6) - 3;

        // Формируем красивую формулу
        let tex = 'y = ';
        if (k === 1) tex += 'x';
        else if (k === -1) tex += '-x';
        else tex += k + 'x';

        if (b !== 0) {
            tex += (b > 0 ? ' + ' : ' ') + b;
        }

        return {
            type: 'linear',
            tex: tex,
            fn: `${k}*x + ${b}`,
            params: { k, b },
            questions: [
                {
                    id: 'type',
                    question: 'Определи тип графика',
                    correctAnswer: 'linear'
                },
                {
                    id: 'behavior',
                    question: 'Как ведет себя функция?',
                    correctAnswer: k > 0 ? 'up' : 'down'
                }
            ],
            validatePoints: (pts) => pts.every(p => Math.abs(p.y - (k * p.x + b)) < 0.01)
        };
    }

    generateHyperbola() {
        const m = Math.floor(Math.random() * 5) - 2; // смещение x
        const n = Math.floor(Math.random() * 5) - 2; // смещение y
        const k = [-4, -2, 2, 4][Math.floor(Math.random() * 4)];

        // Формируем красивую формулу
        let tex = 'y = \\frac{' + k + '}{x';
        if (m !== 0) {
            tex += (m > 0 ? ' - ' : ' + ') + Math.abs(m);
        }
        tex += '}';
        if (n !== 0) {
            tex += (n > 0 ? ' + ' : ' ') + n;
        }

        return {
            type: 'hyperbola',
            tex: tex,
            fn: `${k}/(x - ${m}) + ${n}`,
            params: { k, m, n },
            questions: [
                {
                    id: 'type',
                    question: 'Определи тип графика',
                    correctAnswer: 'hyperbola'
                },
                {
                    id: 'quarters',
                    question: 'В каких четвертях (относительно асимптот) лежат ветви?',
                    correctAnswer: k > 0 ? '1-3' : '2-4'
                },
                {
                    id: 'asymptotes',
                    question: 'Укажи асимптоты',
                    correctAnswer: { x: m, y: n }
                }
            ],
            validatePoints: (pts) => pts.every(p => Math.abs(p.y - (k / (p.x - m) + n)) < 0.01)
        };
    }

    generateParabola() {
        const a = Math.random() > 0.5 ? 1 : -1;
        const rootType = Math.floor(Math.random() * 3); // 0, 1, или 2 корня
        let xv, yv, b, c, realRoots = [];

        if (rootType === 2) {
            const x1 = Math.floor(Math.random() * 7) - 3;
            const dist = (Math.floor(Math.random() * 3) + 1) * 2;
            const x2 = x1 + dist;

            realRoots = [x1, x2];
            xv = (x1 + x2) / 2;
            yv = a * (xv - x1) * (xv - x2);

            b = -a * (x1 + x2);
            c = a * (x1 * x2);
        }
        else if (rootType === 1) {
            xv = Math.floor(Math.random() * 7) - 3;
            yv = 0;
            realRoots = [xv];

            b = -2 * a * xv;
            c = a * xv * xv;
        }
        else {
            xv = Math.floor(Math.random() * 7) - 3;
            yv = a * (Math.floor(Math.random() * 2) + 1);
            realRoots = [];

            b = -2 * a * xv;
            c = a * xv * xv + yv;
        }

        // Формируем красивую формулу
        let tex = 'y = ';
        if (a === 1) tex += 'x^2';
        else tex += '-x^2';

        if (b !== 0) {
            if (b === 1) tex += ' + x';
            else if (b === -1) tex += ' - x';
            else tex += (b > 0 ? ' + ' : ' ') + b + 'x';
        }

        if (c !== 0) {
            tex += (c > 0 ? ' + ' : ' ') + c;
        }

        return {
            type: 'parabola',
            tex: tex,
            fn: `${a}*x^2 + ${b}*x + ${c}`,
            params: { a, b, c, xv, yv, realRoots: realRoots.sort((a, b) => a - b) },
            questions: [
                {
                    id: 'type',
                    question: 'Определи тип графика',
                    correctAnswer: 'parabola'
                },
                {
                    id: 'direction',
                    question: 'Куда направлены ветви?',
                    correctAnswer: a > 0 ? 'up' : 'down'
                }
            ],
            validateVertex: (xUser, yUser) => xUser === xv && yUser === yv,
            validateYIntercept: (yUser) => yUser === c,
            validateXIntercepts: (userRoots) => {
                const sorted = [...userRoots].sort((a, b) => a - b);
                return JSON.stringify(sorted) === JSON.stringify(realRoots);
            }
        };
    }
}
