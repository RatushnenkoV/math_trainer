// Генератор задач на нахождение площадей фигур
class AreasGenerator {
    constructor() {
        // Табличные углы в градусах
        this.tableAngles = [30, 45, 60, 90, 120, 135, 150];

        // Диапазоны для параметров фигур
        this.minSide = 2;
        this.maxSide = 20;
        this.minRadius = 2;
        this.maxRadius = 10;
    }

    /**
     * Генерирует задачу на основе настроек
     * @param {Object} settings - настройки генератора
     * @returns {Object} - объект с данными задачи
     */
    generate(settings = {}) {
        const enabledShapes = this.getEnabledShapes(settings);

        if (enabledShapes.length === 0) {
            throw new Error('Нет включенных типов фигур');
        }

        // Выбираем случайный тип фигуры
        const shapeType = enabledShapes[Math.floor(Math.random() * enabledShapes.length)];

        // Генерируем задачу для выбранного типа
        return this[`generate${shapeType}`](settings);
    }

    /**
     * Получает список включенных типов фигур из настроек
     */
    getEnabledShapes(settings) {
        const shapes = [];

        if (settings.parallelogram) shapes.push('Parallelogram');
        if (settings.rhombus) shapes.push('Rhombus');
        if (settings.rectangle) shapes.push('Rectangle');
        if (settings.square) shapes.push('Square');
        if (settings.triangle) shapes.push('Triangle');
        if (settings.trapezoid) shapes.push('Trapezoid');
        if (settings.circle) shapes.push('Circle');

        return shapes;
    }

    /**
     * Генерирует случайное целое число в диапазоне
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Генерирует случайное чётное число в диапазоне
     */
    randomEven(min, max) {
        const minEven = min % 2 === 0 ? min : min + 1;
        const maxEven = max % 2 === 0 ? max : max - 1;
        const count = (maxEven - minEven) / 2 + 1;
        return minEven + this.randomInt(0, count - 1) * 2;
    }

    /**
     * Генерирует случайное число, кратное n
     */
    randomMultiple(n, min, max) {
        const minMult = Math.ceil(min / n) * n;
        const maxMult = Math.floor(max / n) * n;
        const count = (maxMult - minMult) / n + 1;
        return minMult + this.randomInt(0, count - 1) * n;
    }

    /**
     * Выбирает случайный табличный угол
     */
    randomAngle() {
        return this.tableAngles[this.randomInt(0, this.tableAngles.length - 1)];
    }

    /**
     * Возвращает значение синуса для табличных углов
     */
    getSin(angle) {
        const sins = {
            30: 0.5,
            45: Math.sqrt(2) / 2,
            60: Math.sqrt(3) / 2,
            90: 1,
            120: Math.sqrt(3) / 2,
            135: Math.sqrt(2) / 2,
            150: 0.5
        };
        return sins[angle];
    }

    /**
     * Форматирует число для отображения (с корнями)
     */
    formatNumber(value, hasRoot = false, rootValue = 1) {
        if (!hasRoot) {
            return value.toString();
        }

        if (rootValue === 2) {
            if (value === 1) return '\\sqrt{2}';
            return `${value}\\sqrt{2}`;
        }

        if (rootValue === 3) {
            if (value === 1) return '\\sqrt{3}';
            return `${value}\\sqrt{3}`;
        }

        return value.toString();
    }

    /**
     * Форматирует подпись с префиксом (например, "a = 10")
     */
    formatLabel(prefix, value) {
        return `${prefix} = ${value}`;
    }

    // ============================================
    // ПАРАЛЛЕЛОГРАММ
    // ============================================

    generateParallelogram(settings = {}) {
        const formulas = ['baseHeight'];
        if (settings.useTrigonometry !== false) formulas.push('sidesAngle');
        if (settings.useDiagonals !== false) formulas.push('diagonals');

        const formula = formulas[this.randomInt(0, formulas.length - 1)];

        if (formula === 'baseHeight') {
            return this.generateParallelogramBaseHeight();
        } else if (formula === 'sidesAngle') {
            return this.generateParallelogramSidesAngle();
        } else {
            return this.generateParallelogramDiagonals();
        }
    }

    generateParallelogramBaseHeight() {
        const base = this.randomInt(this.minSide, this.maxSide);
        const height = this.randomInt(this.minSide, this.maxSide);
        const area = base * height;

        return {
            shapeType: 'parallelogram',
            formula: 'baseHeight',
            shapeName: 'параллелограмма',
            base,
            height,
            area,
            labels: {
                a: this.formatLabel('a', base),
                h: this.formatLabel('h', height)
            }
        };
    }

    generateParallelogramSidesAngle() {
        const angle = this.randomAngle();
        let sideA, sideB, area, questionType;

        if (angle === 30 || angle === 150) {
            // sin = 1/2, нужна одна чётная сторона
            sideA = this.randomEven(this.minSide, this.maxSide);
            sideB = this.randomInt(this.minSide, this.maxSide);
            area = Math.round(sideA * sideB * this.getSin(angle));
        } else if (angle === 45 || angle === 135) {
            // sin = √2/2, S = a*b*√2/2, поэтому S/√2 = a*b/2
            sideA = this.randomInt(this.minSide, this.maxSide);
            sideB = this.randomEven(this.minSide, this.maxSide); // чётная для деления на 2
            area = (sideA * sideB) / 2; // это S/√2
            questionType = 'divideBySqrt2';
        } else if (angle === 60 || angle === 120) {
            // sin = √3/2, S = a*b*√3/2, поэтому S/√3 = a*b/2
            sideA = this.randomInt(this.minSide, this.maxSide);
            sideB = this.randomEven(this.minSide, this.maxSide); // чётная для деления на 2
            area = (sideA * sideB) / 2; // это S/√3
            questionType = 'divideBySqrt3';
        } else { // angle === 90
            sideA = this.randomInt(this.minSide, this.maxSide);
            sideB = this.randomInt(this.minSide, this.maxSide);
            area = Math.round(sideA * sideB * this.getSin(angle));
        }

        const labels = {
            a: this.formatLabel('a', sideA),
            b: this.formatLabel('b', sideB),
            showAngle: true
        };

        return {
            shapeType: 'parallelogram',
            formula: 'sidesAngle',
            shapeName: 'параллелограмма',
            questionType,
            sideA,
            sideB,
            angle,
            area,
            labels
        };
    }

    generateParallelogramDiagonals() {
        const angle = this.randomAngle();
        let d1, d2, area, questionType;

        if (angle === 30 || angle === 150) {
            // sin = 1/2, S = d1*d2/4, нужна одна диагональ кратная 4
            d1 = this.randomMultiple(4, this.minSide * 2, this.maxSide * 2);
            d2 = this.randomInt(this.minSide, this.maxSide * 2);
            area = Math.round(d1 * d2 * this.getSin(angle) / 2);
        } else if (angle === 45 || angle === 135) {
            // sin = √2/2, S = d1*d2*√2/4, поэтому S/√2 = d1*d2/4
            d1 = this.randomMultiple(4, this.minSide * 2, this.maxSide * 2); // кратна 4 для деления на 4
            d2 = this.randomInt(this.minSide, this.maxSide * 2);
            area = (d1 * d2) / 4; // это S/√2
            questionType = 'divideBySqrt2';
        } else if (angle === 60 || angle === 120) {
            // sin = √3/2, S = d1*d2*√3/4, поэтому S/√3 = d1*d2/4
            d1 = this.randomMultiple(4, this.minSide * 2, this.maxSide * 2); // кратна 4 для деления на 4
            d2 = this.randomInt(this.minSide, this.maxSide * 2);
            area = (d1 * d2) / 4; // это S/√3
            questionType = 'divideBySqrt3';
        } else { // angle === 90
            d1 = this.randomInt(this.minSide, this.maxSide * 2);
            d2 = this.randomInt(this.minSide, this.maxSide * 2);
            area = Math.round(d1 * d2 * this.getSin(angle) / 2);
        }

        const labels = {
            d1: this.formatLabel('d_1', d1),
            d2: this.formatLabel('d_2', d2),
            showAngle: true
        };

        return {
            shapeType: 'parallelogram',
            formula: 'diagonals',
            shapeName: 'параллелограмма',
            questionType,
            diagonal1: d1,
            diagonal2: d2,
            angle,
            area,
            labels
        };
    }

    // ============================================
    // РОМБ
    // ============================================

    generateRhombus(settings = {}) {
        const formulas = ['sideHeight'];
        if (settings.useTrigonometry !== false) formulas.push('sideAngle');
        if (settings.useDiagonals !== false) formulas.push('diagonals');

        const formula = formulas[this.randomInt(0, formulas.length - 1)];

        if (formula === 'sideHeight') {
            return this.generateRhombusSideHeight();
        } else if (formula === 'sideAngle') {
            return this.generateRhombusSideAngle();
        } else {
            return this.generateRhombusDiagonals();
        }
    }

    generateRhombusSideHeight() {
        const side = this.randomInt(this.minSide, this.maxSide);
        const height = this.randomInt(this.minSide, Math.min(side, this.maxSide));
        const area = side * height;

        return {
            shapeType: 'rhombus',
            formula: 'sideHeight',
            shapeName: 'ромба',
            side,
            height,
            area,
            labels: {
                a: this.formatLabel('a', side),
                h: this.formatLabel('h', height)
            }
        };
    }

    generateRhombusSideAngle() {
        const angle = this.randomAngle();
        let side, area, questionType;

        if (angle === 30 || angle === 150) {
            side = this.randomEven(this.minSide, this.maxSide);
            area = Math.round(side * side * this.getSin(angle));
        } else if (angle === 45 || angle === 135) {
            // sin = √2/2, S = a²*√2/2, поэтому S/√2 = a²/2
            side = this.randomEven(this.minSide, this.maxSide); // чётная для деления на 2
            area = (side * side) / 2; // это S/√2
            questionType = 'divideBySqrt2';
        } else if (angle === 60 || angle === 120) {
            // sin = √3/2, S = a²*√3/2, поэтому S/√3 = a²/2
            side = this.randomEven(this.minSide, this.maxSide); // чётная для деления на 2
            area = (side * side) / 2; // это S/√3
            questionType = 'divideBySqrt3';
        } else {
            side = this.randomInt(this.minSide, this.maxSide);
            area = Math.round(side * side * this.getSin(angle));
        }

        const labels = {
            a: this.formatLabel('a', side),
            showAngle: true
        };

        return {
            shapeType: 'rhombus',
            formula: 'sideAngle',
            shapeName: 'ромба',
            questionType,
            side,
            angle,
            area,
            labels
        };
    }

    generateRhombusDiagonals() {
        const d1 = this.randomEven(this.minSide * 2, this.maxSide * 2);
        const d2 = this.randomEven(this.minSide * 2, this.maxSide * 2);
        const area = (d1 * d2) / 2;

        return {
            shapeType: 'rhombus',
            formula: 'diagonals',
            shapeName: 'ромба',
            diagonal1: d1,
            diagonal2: d2,
            area,
            labels: {
                d1: this.formatLabel('d_1', d1),
                d2: this.formatLabel('d_2', d2)
            }
        };
    }

    // ============================================
    // ПРЯМОУГОЛЬНИК
    // ============================================

    generateRectangle(settings = {}) {
        const formulas = ['sides'];
        if (settings.useDiagonals !== false) formulas.push('diagonal');

        const formula = formulas[this.randomInt(0, formulas.length - 1)];

        if (formula === 'sides') {
            return this.generateRectangleSides();
        } else {
            return this.generateRectangleDiagonal();
        }
    }

    generateRectangleSides() {
        const width = this.randomInt(this.minSide, this.maxSide);
        const height = this.randomInt(this.minSide, this.maxSide);
        const area = width * height;

        return {
            shapeType: 'rectangle',
            formula: 'sides',
            shapeName: 'прямоугольника',
            width,
            height,
            area,
            labels: {
                a: this.formatLabel('a', width),
                b: this.formatLabel('b', height)
            }
        };
    }

    generateRectangleDiagonal() {
        const angle = this.randomAngle();
        let diagonal, area, questionType;

        if (angle === 30 || angle === 150) {
            diagonal = this.randomMultiple(4, this.minSide * 2, this.maxSide * 2);
            area = Math.round(diagonal * diagonal * this.getSin(angle) / 2);
        } else if (angle === 45 || angle === 135) {
            // sin = √2/2, S = d²*√2/4, поэтому S/√2 = d²/4
            diagonal = this.randomMultiple(4, this.minSide * 2, this.maxSide * 2); // кратна 4 для деления на 4
            area = (diagonal * diagonal) / 4; // это S/√2
            questionType = 'divideBySqrt2';
        } else if (angle === 60 || angle === 120) {
            // sin = √3/2, S = d²*√3/4, поэтому S/√3 = d²/4
            diagonal = this.randomMultiple(4, this.minSide * 2, this.maxSide * 2); // кратна 4 для деления на 4
            area = (diagonal * diagonal) / 4; // это S/√3
            questionType = 'divideBySqrt3';
        } else {
            diagonal = this.randomEven(this.minSide * 2, this.maxSide * 2);
            area = Math.round(diagonal * diagonal * this.getSin(angle) / 2);
        }

        const labels = {
            d: this.formatLabel('d', diagonal),
            showAngle: true
        };

        return {
            shapeType: 'rectangle',
            formula: 'diagonal',
            shapeName: 'прямоугольника',
            questionType,
            diagonal,
            angle,
            area,
            labels
        };
    }

    // ============================================
    // КВАДРАТ
    // ============================================

    generateSquare(settings = {}) {
        const formulas = ['side'];
        if (settings.useDiagonals !== false) formulas.push('diagonal');

        const formula = formulas[this.randomInt(0, formulas.length - 1)];

        if (formula === 'side') {
            return this.generateSquareSide();
        } else {
            return this.generateSquareDiagonal();
        }
    }

    generateSquareSide() {
        const side = this.randomInt(this.minSide, this.maxSide);
        const area = side * side;

        return {
            shapeType: 'square',
            formula: 'side',
            shapeName: 'квадрата',
            side,
            area,
            labels: {
                a: this.formatLabel('a', side)
            }
        };
    }

    generateSquareDiagonal() {
        // Для квадрата S = d²/2
        // Если d - целое чётное, то S = d²/2 - целое
        const diagonal = this.randomEven(this.minSide * 2, this.maxSide * 2);
        const area = (diagonal * diagonal) / 2;

        return {
            shapeType: 'square',
            formula: 'diagonal',
            shapeName: 'квадрата',
            diagonal,
            area,
            labels: {
                d: this.formatLabel('d', diagonal)
            }
        };
    }

    // ============================================
    // ТРЕУГОЛЬНИК
    // ============================================

    generateTriangle(settings = {}) {
        const formulas = ['baseHeight', 'heron'];
        if (settings.useTrigonometry !== false) formulas.push('sidesAngle');

        const formula = formulas[this.randomInt(0, formulas.length - 1)];

        if (formula === 'baseHeight') {
            return this.generateTriangleBaseHeight();
        } else if (formula === 'sidesAngle') {
            return this.generateTriangleSidesAngle();
        } else {
            return this.generateTriangleHeron();
        }
    }

    generateTriangleBaseHeight() {
        const base = this.randomEven(this.minSide, this.maxSide);
        const height = this.randomInt(this.minSide, this.maxSide);
        const area = (base * height) / 2;

        return {
            shapeType: 'triangle',
            formula: 'baseHeight',
            shapeName: 'треугольника',
            base,
            height,
            area,
            labels: {
                a: this.formatLabel('a', base),
                h: this.formatLabel('h', height)
            }
        };
    }

    generateTriangleSidesAngle() {
        const angle = this.randomAngle();
        let sideA, sideB, area, questionType;

        if (angle === 30 || angle === 150) {
            // sin = 1/2, обе стороны чётные для ½ × ½
            sideA = this.randomMultiple(4, this.minSide, this.maxSide);
            sideB = this.randomInt(this.minSide, this.maxSide);
            area = Math.round(sideA * sideB * this.getSin(angle) / 2);
        } else if (angle === 45 || angle === 135) {
            // sin = √2/2, S = a*b*√2/4, поэтому S/√2 = a*b/4
            sideA = this.randomInt(this.minSide, this.maxSide);
            sideB = this.randomMultiple(4, this.minSide, this.maxSide); // кратна 4 для деления на 4
            area = (sideA * sideB) / 4; // это S/√2
            questionType = 'divideBySqrt2';
        } else if (angle === 60 || angle === 120) {
            // sin = √3/2, S = a*b*√3/4, поэтому S/√3 = a*b/4
            sideA = this.randomInt(this.minSide, this.maxSide);
            sideB = this.randomMultiple(4, this.minSide, this.maxSide); // кратна 4 для деления на 4
            area = (sideA * sideB) / 4; // это S/√3
            questionType = 'divideBySqrt3';
        } else { // angle === 90
            sideA = this.randomEven(this.minSide, this.maxSide);
            sideB = this.randomInt(this.minSide, this.maxSide);
            area = Math.round(sideA * sideB * this.getSin(angle) / 2);
        }

        const labels = {
            a: this.formatLabel('a', sideA),
            b: this.formatLabel('b', sideB),
            showAngle: true
        };

        // Определяем тип треугольника для названия
        let triangleType = '';
        if (angle === 90) {
            triangleType = 'прямоугольного ';
        } else if (angle === 60) {
            triangleType = 'остроугольного ';
        } else if (angle > 90) {
            triangleType = 'тупоугольного ';
        }

        return {
            shapeType: 'triangle',
            formula: 'sidesAngle',
            shapeName: `${triangleType}треугольника`,
            questionType,
            sideA,
            sideB,
            angle,
            area,
            labels
        };
    }

    generateTriangleHeron() {
        // Генерируем треугольник с целой площадью по формуле Герона
        // Используем известные тройки (например, египетские треугольники или их масштабированные версии)
        const heronTriangles = [
            [3, 4, 5],   // площадь = 6
            [5, 12, 13], // площадь = 30
            [8, 15, 17], // площадь = 60
            [7, 24, 25], // площадь = 84
            [6, 8, 10],  // площадь = 24
            [9, 12, 15], // площадь = 54
            [5, 5, 6],   // площадь = 12
            [5, 5, 8],   // площадь = 12
            [13, 14, 15] // площадь = 84
        ];

        const triangle = heronTriangles[this.randomInt(0, heronTriangles.length - 1)];
        const [a, b, c] = triangle;

        // Вычисляем площадь по формуле Герона
        const p = (a + b + c) / 2;
        const area = Math.sqrt(p * (p - a) * (p - b) * (p - c));

        return {
            shapeType: 'triangle',
            formula: 'heron',
            shapeName: 'треугольника',
            sideA: a,
            sideB: b,
            sideC: c,
            area: Math.round(area),
            labels: {
                a: this.formatLabel('a', a),
                b: this.formatLabel('b', b),
                c: this.formatLabel('c', c)
            }
        };
    }

    // ============================================
    // ТРАПЕЦИЯ
    // ============================================

    generateTrapezoid(settings = {}) {
        const formulas = ['basesHeight', 'midlineHeight'];
        const formula = formulas[this.randomInt(0, formulas.length - 1)];

        if (formula === 'basesHeight') {
            return this.generateTrapezoidBasesHeight();
        } else {
            return this.generateTrapezoidMidlineHeight();
        }
    }

    generateTrapezoidBasesHeight() {
        const base1 = this.randomInt(this.minSide + 2, this.maxSide);
        const base2 = this.randomInt(this.minSide, base1 - 2);
        const height = this.randomEven(this.minSide, this.maxSide);
        const area = ((base1 + base2) * height) / 2;

        return {
            shapeType: 'trapezoid',
            formula: 'basesHeight',
            shapeName: 'трапеции',
            base1,
            base2,
            height,
            area,
            labels: {
                a: this.formatLabel('a', base1),
                b: this.formatLabel('b', base2),
                h: this.formatLabel('h', height)
            }
        };
    }

    generateTrapezoidMidlineHeight() {
        const midline = this.randomInt(this.minSide, this.maxSide);
        const height = this.randomInt(this.minSide, this.maxSide);
        const area = midline * height;

        return {
            shapeType: 'trapezoid',
            formula: 'midlineHeight',
            shapeName: 'трапеции',
            midline,
            height,
            area,
            labels: {
                m: this.formatLabel('m', midline),
                h: this.formatLabel('h', height)
            }
        };
    }

    // ============================================
    // КРУГ
    // ============================================

    generateCircle(settings = {}) {
        // Генерируем целый радиус
        // S = π * r², поэтому S/π = r²
        const radius = this.randomInt(this.minRadius, this.maxRadius);
        const answer = radius * radius; // S/π = r²

        return {
            shapeType: 'circle',
            formula: 'radius',
            shapeName: 'круга',
            questionType: 'divideByPi', // специальный маркер для изменения вопроса
            radius,
            area: answer, // это будет S/π
            labels: {
                r: this.formatLabel('r', radius)
            }
        };
    }
}
