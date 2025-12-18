// Генератор задач по тригонометрии

class TrigonometryProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();

        // Таблица значений тригонометрических функций
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
            maxQuadrant: 4,  // От 1 до 4
            useRadians: false  // true - радианы, false - градусы
        };
    }

    // Инициализация таблицы значений
    initTrigValues() {
        // Значения для основных углов в первой четверти (в градусах)
        const baseAngles = [0, 30, 45, 60, 90];

        // Возможные значения тригонометрических функций
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
            '-sqrt3/3': { value: -Math.sqrt(3) / 3, latex: '-\\frac{\\sqrt{3}}{3}' },
            'undefined': { value: null, latex: '\\text{∅}' }
        };

        // Таблица значений sin, cos, tg, ctg для базовых углов
        const table = {
            0: {
                sin: values['0'],
                cos: values['1'],
                tg: values['0'],
                ctg: values['undefined']
            },
            30: {
                sin: values['1/2'],
                cos: values['sqrt3/2'],
                tg: values['sqrt3/3'],
                ctg: values['sqrt3']
            },
            45: {
                sin: values['sqrt2/2'],
                cos: values['sqrt2/2'],
                tg: values['1'],
                ctg: values['1']
            },
            60: {
                sin: values['sqrt3/2'],
                cos: values['1/2'],
                tg: values['sqrt3'],
                ctg: values['sqrt3/3']
            },
            90: {
                sin: values['1'],
                cos: values['0'],
                tg: values['undefined'],
                ctg: values['0']
            }
        };

        return { baseAngles, values, table };
    }

    // Получить значение тригонометрической функции для угла
    getTrigValue(func, angleDegrees) {
        // Нормализуем угол к диапазону [0, 360)
        angleDegrees = ((angleDegrees % 360) + 360) % 360;

        // Определяем четверть
        let quadrant;
        if (angleDegrees >= 0 && angleDegrees < 90) quadrant = 1;
        else if (angleDegrees >= 90 && angleDegrees < 180) quadrant = 2;
        else if (angleDegrees >= 180 && angleDegrees < 270) quadrant = 3;
        else quadrant = 4;

        // Приводим угол к первой четверти
        let refAngle;
        if (quadrant === 1) refAngle = angleDegrees;
        else if (quadrant === 2) refAngle = 180 - angleDegrees;
        else if (quadrant === 3) refAngle = angleDegrees - 180;
        else refAngle = 360 - angleDegrees;

        // Получаем базовое значение из таблицы
        const baseValue = this.trigValues.table[refAngle]?.[func];
        if (!baseValue) return null;

        // Применяем знаки в зависимости от четверти
        const signs = this.getSignsByQuadrant(func, quadrant);

        if (baseValue.value === null) {
            return baseValue; // undefined остаётся undefined
        }

        if (baseValue.value === 0) {
            return baseValue; // 0 остаётся 0
        }

        // Применяем знак
        const signedValue = signs * baseValue.value;
        const signedLatex = signs < 0 ? '-' + baseValue.latex.replace('-', '') : baseValue.latex;

        return {
            value: signedValue,
            latex: signedLatex
        };
    }

    // Получить знаки функций по четвертям
    getSignsByQuadrant(func, quadrant) {
        const signs = {
            sin: [1, 1, -1, -1],
            cos: [1, -1, -1, 1],
            tg: [1, -1, 1, -1],
            ctg: [1, -1, 1, -1]
        };
        return signs[func][quadrant - 1];
    }

    // Генерация случайного угла
    generateAngle() {
        const maxQuadrant = this.settings.maxQuadrant;

        // Выбираем случайный базовый угол
        const baseAngles = this.trigValues.baseAngles;
        const baseAngle = baseAngles[Math.floor(Math.random() * baseAngles.length)];

        // Выбираем случайную четверть (от 1 до maxQuadrant)
        const quadrant = Math.floor(Math.random() * maxQuadrant) + 1;

        // Вычисляем угол в градусах
        let angleDegrees;
        if (quadrant === 1) angleDegrees = baseAngle;
        else if (quadrant === 2) angleDegrees = 180 - baseAngle;
        else if (quadrant === 3) angleDegrees = 180 + baseAngle;
        else angleDegrees = 360 - baseAngle;

        return angleDegrees;
    }

    // Конвертация градусов в радианы (LaTeX)
    degreesToRadiansLatex(degrees) {
        if (degrees === 0) return '0';

        // Упрощаем дробь degrees/180
        const gcd = this.gcd(degrees, 180);
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

    // Форматирование угла для отображения
    formatAngle(angleDegrees) {
        if (this.settings.useRadians) {
            return this.degreesToRadiansLatex(angleDegrees);
        } else {
            return angleDegrees + '^\\circ';
        }
    }

    // Получить все возможные варианты ответов
    getAllPossibleAnswers() {
        return [
            { key: 'undefined', ...this.trigValues.values['undefined'] },
            { key: '0', ...this.trigValues.values['0'] },
            { key: '1', ...this.trigValues.values['1'] },
            { key: '-1', ...this.trigValues.values['-1'] },
            { key: '1/2', ...this.trigValues.values['1/2'] },
            { key: '-1/2', ...this.trigValues.values['-1/2'] },
            { key: 'sqrt2/2', ...this.trigValues.values['sqrt2/2'] },
            { key: '-sqrt2/2', ...this.trigValues.values['-sqrt2/2'] },
            { key: 'sqrt3/2', ...this.trigValues.values['sqrt3/2'] },
            { key: '-sqrt3/2', ...this.trigValues.values['-sqrt3/2'] },
            { key: 'sqrt3', ...this.trigValues.values['sqrt3'] },
            { key: '-sqrt3', ...this.trigValues.values['-sqrt3'] },
            { key: 'sqrt3/3', ...this.trigValues.values['sqrt3/3'] },
            { key: '-sqrt3/3', ...this.trigValues.values['-sqrt3/3'] }
        ];
    }

    // Генерация задачи
    generate() {
        // Выбираем случайную функцию из включённых
        const enabledFunctions = Object.keys(this.settings.functions)
            .filter(func => this.settings.functions[func]);

        if (enabledFunctions.length === 0) {
            // Если ни одна функция не выбрана, используем все
            enabledFunctions.push('sin', 'cos', 'tg', 'ctg');
        }

        const func = enabledFunctions[Math.floor(Math.random() * enabledFunctions.length)];

        // Генерируем угол
        const angleDegrees = this.generateAngle();

        // Получаем значение функции
        const correctAnswer = this.getTrigValue(func, angleDegrees);

        // Форматируем угол
        const angleLatex = this.formatAngle(angleDegrees);

        // Формируем вопрос
        const functionNames = {
            sin: '\\sin',
            cos: '\\cos',
            tg: '\\mathrm{tg}',
            ctg: '\\mathrm{ctg}'
        };

        const question = `${functionNames[func]} ${angleLatex}`;

        // Получаем все возможные варианты ответов
        const allAnswers = this.getAllPossibleAnswers();

        return {
            question: question,
            function: func,
            angleDegrees: angleDegrees,
            angleLatex: angleLatex,
            correctAnswer: correctAnswer,
            allAnswers: allAnswers,
            isLatex: true
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
