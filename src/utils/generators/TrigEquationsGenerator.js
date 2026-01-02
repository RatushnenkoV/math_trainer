// Генератор простейших тригонометрических уравнений типа sin(x) = a

class TrigEquationsProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
        // Инициализируем таблицу табличных значений
        this.trigValues = this.initTrigValues();
    }

    getDefaultSettings() {
        return {
            functions: {
                sin: true,
                cos: true,
                tg: true,
                ctg: true
            },
            useRadians: false  // true - радианы, false - градусы
        };
    }

    // Инициализация таблицы табличных значений
    initTrigValues() {
        const values = {
            0: { value: 0, latex: '0' },
            1: { value: 1, latex: '1' },
            '-1': { value: -1, latex: '-1' },
            '1/2': { value: 0.5, latex: '\\frac{1}{2}' },
            '-1/2': { value: -0.5, latex: '-\\frac{1}{2}' },
            'sqrt2/2': { value: Math.sqrt(2) / 2, latex: '\\frac{\\sqrt{2}}{2}' },
            '-sqrt2/2': { value: -Math.sqrt(2) / 2, latex: '-\\frac{\\sqrt{2}}{2}' },
            'sqrt3/2': { value: Math.sqrt(3) / 2, latex: '\\frac{\\sqrt{3}}{2}' },
            '-sqrt3/2': { value: -Math.sqrt(3) / 2, latex: '-\\frac{\\sqrt{3}}{2}' },
            'sqrt3': { value: Math.sqrt(3), latex: '\\sqrt{3}' },
            '-sqrt3': { value: -Math.sqrt(3), latex: '-\\sqrt{3}' },
            'sqrt3/3': { value: Math.sqrt(3) / 3, latex: '\\frac{\\sqrt{3}}{3}' },
            '-sqrt3/3': { value: -Math.sqrt(3) / 3, latex: '-\\frac{\\sqrt{3}}{3}' }
        };

        // Табличные значения для каждой функции
        // Только те значения, которые действительно достигаются
        const functionValues = {
            sin: [
                values['0'],
                values['1/2'],
                values['-1/2'],
                values['sqrt2/2'],
                values['-sqrt2/2'],
                values['sqrt3/2'],
                values['-sqrt3/2'],
                values['1'],
                values['-1']
            ],
            cos: [
                values['0'],
                values['1/2'],
                values['-1/2'],
                values['sqrt2/2'],
                values['-sqrt2/2'],
                values['sqrt3/2'],
                values['-sqrt3/2'],
                values['1'],
                values['-1']
            ],
            tg: [
                values['0'],
                values['1'],
                values['-1'],
                values['sqrt3'],
                values['-sqrt3'],
                values['sqrt3/3'],
                values['-sqrt3/3']
            ],
            ctg: [
                values['0'],
                values['1'],
                values['-1'],
                values['sqrt3'],
                values['-sqrt3'],
                values['sqrt3/3'],
                values['-sqrt3/3']
            ]
        };

        return { values, functionValues };
    }

    // Генерация задачи
    generate() {
        // Выбираем случайную функцию из включённых
        const enabledFunctions = Object.keys(this.settings.functions)
            .filter(func => this.settings.functions[func]);

        if (enabledFunctions.length === 0) {
            enabledFunctions.push('sin', 'cos', 'tg', 'ctg');
        }

        const func = enabledFunctions[Math.floor(Math.random() * enabledFunctions.length)];

        // Генерируем уравнение в зависимости от функции
        return this.generateEquation(func);
    }

    // Генерация уравнения для конкретной функции
    generateEquation(func) {
        // Получаем табличные значения для данной функции
        const validValues = this.trigValues.functionValues[func];

        // Выбираем случайное значение
        const rightSide = validValues[Math.floor(Math.random() * validValues.length)];

        // Формируем уравнение
        const functionNames = {
            sin: '\\sin',
            cos: '\\cos',
            tg: '\\mathrm{tg}',
            ctg: '\\mathrm{ctg}'
        };

        const equation = `${functionNames[func]} x = ${rightSide.latex}`;

        // Вычисляем решение
        const solution = this.getSolution(func, rightSide.value);

        return {
            equation: equation,
            function: func,
            rightSideValue: rightSide.value,
            rightSideLatex: rightSide.latex,
            solution: solution,
            isLatex: true
        };
    }

    // Получение решения уравнения
    getSolution(func, value) {
        // Базовый угол в градусах
        let baseDegrees;

        // Специальные случаи - определяем базовый угол для каждой функции
        if (Math.abs(value) < 0.0001) {
            // Значение = 0
            if (func === 'cos') baseDegrees = 90; // cos(x) = 0 => x = π/2 + πn
            else baseDegrees = 0;
        } else if (Math.abs(value - 1) < 0.0001) {
            // Значение = 1
            if (func === 'sin') baseDegrees = 90;
            else if (func === 'cos') baseDegrees = 0;
            else if (func === 'tg') baseDegrees = 45;
            else if (func === 'ctg') baseDegrees = 45;
            else baseDegrees = 0;
        } else if (Math.abs(value + 1) < 0.0001) {
            // Значение = -1
            if (func === 'sin') baseDegrees = -90;
            else if (func === 'cos') baseDegrees = 180;
            else if (func === 'tg') baseDegrees = -45;
            else if (func === 'ctg') baseDegrees = -45;
            else baseDegrees = 180;
        } else if (Math.abs(value - 0.5) < 0.0001) {
            // Значение = 1/2
            baseDegrees = (func === 'sin') ? 30 : 60;
        } else if (Math.abs(value + 0.5) < 0.0001) {
            // Значение = -1/2
            baseDegrees = (func === 'sin') ? -30 : 120;
        } else if (Math.abs(value - Math.sqrt(2) / 2) < 0.0001) {
            // Значение = √2/2
            baseDegrees = 45;
        } else if (Math.abs(value + Math.sqrt(2) / 2) < 0.0001) {
            // Значение = -√2/2
            baseDegrees = (func === 'sin') ? -45 : 135;
        } else if (Math.abs(value - Math.sqrt(3) / 2) < 0.0001) {
            // Значение = √3/2
            baseDegrees = (func === 'sin') ? 60 : 30;
        } else if (Math.abs(value + Math.sqrt(3) / 2) < 0.0001) {
            // Значение = -√3/2
            baseDegrees = (func === 'sin') ? -60 : 150;
        } else if (Math.abs(value - Math.sqrt(3)) < 0.0001) {
            // Значение = √3
            baseDegrees = (func === 'tg') ? 60 : 30; // tg(60°) = √3, ctg(30°) = √3
        } else if (Math.abs(value + Math.sqrt(3)) < 0.0001) {
            // Значение = -√3
            baseDegrees = (func === 'tg') ? -60 : 150; // tg(-60°) = -√3, ctg(150°) = -√3
        } else if (Math.abs(value - Math.sqrt(3) / 3) < 0.0001) {
            // Значение = √3/3
            baseDegrees = (func === 'tg') ? 30 : 60; // tg(30°) = √3/3, ctg(60°) = √3/3
        } else if (Math.abs(value + Math.sqrt(3) / 3) < 0.0001) {
            // Значение = -√3/3
            baseDegrees = (func === 'tg') ? -30 : 120; // tg(-30°) = -√3/3, ctg(120°) = -√3/3
        } else {
            baseDegrees = 0;
        }

        // Формула решения зависит от функции
        let coefficient, baseAngle, period;

        if (func === 'sin') {
            // Особый случай для sin(x) = 0
            if (Math.abs(value) < 0.0001) {
                // sin(x) = 0: x = πn
                coefficient = [1]; // нет коэффициента
                baseAngle = baseDegrees;
                period = 180; // πn или 180°n
            } else if (Math.abs(Math.abs(value) - 1) < 0.0001) {
                // sin(x) = 1: x = π/2 + 2πn
                // sin(x) = -1: x = -π/2 + 2πn
                coefficient = [1]; // нет коэффициента
                baseAngle = baseDegrees;
                period = 360; // 2πn или 360°n
            } else {
                // Общий случай: x = (-1)^n · arcsin(a) + πn
                coefficient = [-1, 1]; // (-1)^n
                baseAngle = baseDegrees;
                period = 180; // πn или 180°n
            }
        } else if (func === 'cos') {
            // Особый случай для cos(x) = 0
            if (Math.abs(value) < 0.0001) {
                // cos(x) = 0: x = π/2 + πn
                coefficient = [1]; // нет коэффициента
                baseAngle = baseDegrees;
                period = 180; // πn или 180°n
            } else if (Math.abs(Math.abs(value) - 1) < 0.0001) {
                // cos(x) = 1: x = 2πn
                // cos(x) = -1: x = π + 2πn
                coefficient = [1]; // нет коэффициента
                baseAngle = baseDegrees;
                period = 360; // 2πn или 360°n
            } else {
                // Общий случай: x = ± arccos(a) + 2πn
                coefficient = [1, -1]; // ±
                baseAngle = baseDegrees;
                period = 360; // 2πn или 360°n
            }
        } else if (func === 'tg' || func === 'ctg') {
            coefficient = [1]; // нет коэффициента
            baseAngle = baseDegrees;
            period = 180; // πn или 180°n
        }

        return {
            coefficient: coefficient,
            baseAngleDegrees: baseAngle,
            periodDegrees: period,
            function: func
        };
    }

    // Форматирование угла (градусы или радианы)
    formatAngle(degrees) {
        if (this.settings.useRadians) {
            return this.degreesToRadiansLatex(degrees);
        } else {
            return degrees + '^\\circ';
        }
    }

    // Форматирование периода (градусы или радианы)
    formatPeriod(degrees) {
        if (this.settings.useRadians) {
            return this.degreesToRadiansLatex(degrees);
        } else {
            return degrees + '^\\circ';
        }
    }

    // Конвертация градусов в радианы (LaTeX)
    degreesToRadiansLatex(degrees) {
        if (degrees === 0) return '0';

        // Упрощаем дробь degrees/180
        const gcd = this.gcd(Math.abs(degrees), 180);
        const num = degrees / gcd;
        const den = 180 / gcd;

        if (den === 1) {
            if (num === 1) return '\\pi';
            if (num === -1) return '-\\pi';
            return num + '\\pi';
        }

        if (num === 1) return `\\frac{\\pi}{${den}}`;
        if (num === -1) return `-\\frac{\\pi}{${den}}`;

        return `\\frac{${num}\\pi}{${den}}`;
    }

    // НОД
    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a;
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
