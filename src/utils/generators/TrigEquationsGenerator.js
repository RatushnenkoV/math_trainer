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

    // Вычисление значения тригонометрической функции
    evaluateTrigFunction(func, degrees) {
        const radians = degrees * Math.PI / 180;
        switch(func) {
            case 'sin':
                return Math.sin(radians);
            case 'cos':
                return Math.cos(radians);
            case 'tg':
                return Math.tan(radians);
            case 'ctg':
                return 1 / Math.tan(radians);
            default:
                return 0;
        }
    }

    // Поиск базового угла в диапазоне [0, 360), который удовлетворяет уравнению
    findBaseAngle(func, value) {
        // Табличные углы для проверки
        const testAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

        for (let angle of testAngles) {
            const funcValue = this.evaluateTrigFunction(func, angle);
            if (Math.abs(funcValue - value) < 0.0001) {
                return angle;
            }
        }

        // Если не нашли в табличных углах, возвращаем 0
        return 0;
    }

    // Получение решения уравнения
    getSolution(func, value) {
        // Находим один угол, который удовлетворяет уравнению
        const baseAngle = this.findBaseAngle(func, value);

        // Определяем тип коэффициента и период на основе функции
        let coefficient, period;

        if (func === 'sin') {
            if (Math.abs(value) < 0.0001) {
                // sin(x) = 0: x = πn
                coefficient = [1];
                period = 180;
            } else if (Math.abs(Math.abs(value) - 1) < 0.0001) {
                // sin(x) = ±1: x = baseAngle + 2πn
                coefficient = [1];
                period = 360;
            } else {
                // Общий случай: x = (-1)^n · arcsin(a) + πn
                coefficient = [-1, 1];
                period = 180;
            }
        } else if (func === 'cos') {
            if (Math.abs(value) < 0.0001) {
                // cos(x) = 0: x = π/2 + πn
                coefficient = [1];
                period = 180;
            } else if (Math.abs(Math.abs(value) - 1) < 0.0001) {
                // cos(x) = ±1: x = baseAngle + 2πn
                coefficient = [1];
                period = 360;
            } else {
                // Общий случай: x = ± arccos(a) + 2πn
                coefficient = [1, -1];
                period = 360;
            }
        } else {
            // tg и ctg: x = baseAngle + πn
            coefficient = [1];
            period = 180;
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
