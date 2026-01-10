// Генератор задач на действия над векторами
class VectorOperationsGenerator {
    constructor() {
        this.settings = {
            byCoordinates: true,  // Задачи по координатам
            byDrawing: true,      // Задачи по рисунку
            addition: true,       // Сложение векторов
            subtraction: true,    // Вычитание векторов
            multiplication: true  // Умножение вектора на число
        };

        // Координаты от -5 до 5
        this.minCoord = -5;
        this.maxCoord = 5;
    }

    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    // Генерация случайной координаты в заданном диапазоне
    generateRandomCoordinate(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация случайного множителя для умножения вектора
    generateMultiplier() {
        const multipliers = [-3, -2, -1, 2, 3];
        return multipliers[Math.floor(Math.random() * multipliers.length)];
    }

    // Получить список доступных операций
    getAvailableOperations() {
        const operations = [];
        if (this.settings.addition) operations.push('addition');
        if (this.settings.subtraction) operations.push('subtraction');
        if (this.settings.multiplication) operations.push('multiplication');
        return operations;
    }

    // Получить список доступных режимов
    getAvailableModes() {
        const modes = [];
        if (this.settings.byCoordinates) modes.push('coordinates');
        if (this.settings.byDrawing) modes.push('drawing');
        return modes;
    }

    // Генерация задачи
    generate() {
        const modes = this.getAvailableModes();
        const operations = this.getAvailableOperations();

        if (modes.length === 0 || operations.length === 0) {
            return null;
        }

        // Случайно выбираем режим и операцию
        const mode = modes[Math.floor(Math.random() * modes.length)];
        const operation = operations[Math.floor(Math.random() * operations.length)];

        if (mode === 'coordinates') {
            return this.generateCoordinatesProblem(operation);
        } else {
            return this.generateDrawingProblem(operation);
        }
    }

    // Генерация задачи по координатам
    generateCoordinatesProblem(operation) {
        let vectorAX, vectorAY, vectorBX, vectorBY, multiplier;
        let resultX, resultY;

        // Генерируем первый вектор
        vectorAX = this.generateRandomCoordinate(-4, 4);
        vectorAY = this.generateRandomCoordinate(-4, 4);

        if (operation === 'addition') {
            // Сложение: a + b
            vectorBX = this.generateRandomCoordinate(-4, 4);
            vectorBY = this.generateRandomCoordinate(-4, 4);
            resultX = vectorAX + vectorBX;
            resultY = vectorAY + vectorBY;

            return {
                mode: 'coordinates',
                operation: 'addition',
                vectorAX,
                vectorAY,
                vectorBX,
                vectorBY,
                resultX,
                resultY,
                taskText: `\\vec{a}(${vectorAX}; ${vectorAY}), \\vec{b}(${vectorBX}; ${vectorBY})`,
                questionText: 'Найдите координаты вектора \\(\\vec{a} + \\vec{b}\\)'
            };
        } else if (operation === 'subtraction') {
            // Вычитание: a - b
            vectorBX = this.generateRandomCoordinate(-4, 4);
            vectorBY = this.generateRandomCoordinate(-4, 4);
            resultX = vectorAX - vectorBX;
            resultY = vectorAY - vectorBY;

            return {
                mode: 'coordinates',
                operation: 'subtraction',
                vectorAX,
                vectorAY,
                vectorBX,
                vectorBY,
                resultX,
                resultY,
                taskText: `\\vec{a}(${vectorAX}; ${vectorAY}), \\vec{b}(${vectorBX}; ${vectorBY})`,
                questionText: 'Найдите координаты вектора \\(\\vec{a} - \\vec{b}\\)'
            };
        } else {
            // Умножение: k * a
            multiplier = this.generateMultiplier();
            resultX = multiplier * vectorAX;
            resultY = multiplier * vectorAY;

            return {
                mode: 'coordinates',
                operation: 'multiplication',
                vectorAX,
                vectorAY,
                multiplier,
                resultX,
                resultY,
                taskText: `\\vec{a}(${vectorAX}; ${vectorAY}), k = ${multiplier}`,
                questionText: `Найдите координаты вектора \\(${multiplier}\\vec{a}\\)`
            };
        }
    }

    // Генерация задачи по рисунку
    generateDrawingProblem(operation) {
        let startAX, startAY, endAX, endAY;
        let startBX, startBY, endBX, endBY;
        let vectorAX, vectorAY, vectorBX, vectorBY;
        let resultX, resultY;
        let multiplier;

        // Генерируем первый вектор (небольшой, чтобы поместился на сетке)
        do {
            startAX = this.generateRandomCoordinate(-3, 3);
            startAY = this.generateRandomCoordinate(-3, 3);
            vectorAX = this.generateRandomCoordinate(-3, 3);
            vectorAY = this.generateRandomCoordinate(-3, 3);
            endAX = startAX + vectorAX;
            endAY = startAY + vectorAY;
        } while (
            (vectorAX === 0 && vectorAY === 0) ||
            endAX < this.minCoord || endAX > this.maxCoord ||
            endAY < this.minCoord || endAY > this.maxCoord
        );

        if (operation === 'addition') {
            // Генерируем второй вектор для сложения
            do {
                startBX = this.generateRandomCoordinate(-3, 3);
                startBY = this.generateRandomCoordinate(-3, 3);
                vectorBX = this.generateRandomCoordinate(-3, 3);
                vectorBY = this.generateRandomCoordinate(-3, 3);
                endBX = startBX + vectorBX;
                endBY = startBY + vectorBY;
            } while (
                (vectorBX === 0 && vectorBY === 0) ||
                endBX < this.minCoord || endBX > this.maxCoord ||
                endBY < this.minCoord || endBY > this.maxCoord
            );

            resultX = vectorAX + vectorBX;
            resultY = vectorAY + vectorBY;

            return {
                mode: 'drawing',
                operation: 'addition',
                vectorA: { startX: startAX, startY: startAY, endX: endAX, endY: endAY, x: vectorAX, y: vectorAY },
                vectorB: { startX: startBX, startY: startBY, endX: endBX, endY: endBY, x: vectorBX, y: vectorBY },
                resultX,
                resultY,
                questionText: 'Нарисуйте вектор \\(\\vec{a} + \\vec{b}\\)',
                minCoord: this.minCoord,
                maxCoord: this.maxCoord
            };
        } else if (operation === 'subtraction') {
            // Генерируем второй вектор для вычитания
            do {
                startBX = this.generateRandomCoordinate(-3, 3);
                startBY = this.generateRandomCoordinate(-3, 3);
                vectorBX = this.generateRandomCoordinate(-3, 3);
                vectorBY = this.generateRandomCoordinate(-3, 3);
                endBX = startBX + vectorBX;
                endBY = startBY + vectorBY;
            } while (
                (vectorBX === 0 && vectorBY === 0) ||
                endBX < this.minCoord || endBX > this.maxCoord ||
                endBY < this.minCoord || endBY > this.maxCoord
            );

            resultX = vectorAX - vectorBX;
            resultY = vectorAY - vectorBY;

            return {
                mode: 'drawing',
                operation: 'subtraction',
                vectorA: { startX: startAX, startY: startAY, endX: endAX, endY: endAY, x: vectorAX, y: vectorAY },
                vectorB: { startX: startBX, startY: startBY, endX: endBX, endY: endBY, x: vectorBX, y: vectorBY },
                resultX,
                resultY,
                questionText: 'Нарисуйте вектор \\(\\vec{a} - \\vec{b}\\)',
                minCoord: this.minCoord,
                maxCoord: this.maxCoord
            };
        } else {
            // Умножение на число
            multiplier = this.generateMultiplier();
            resultX = multiplier * vectorAX;
            resultY = multiplier * vectorAY;

            return {
                mode: 'drawing',
                operation: 'multiplication',
                vectorA: { startX: startAX, startY: startAY, endX: endAX, endY: endAY, x: vectorAX, y: vectorAY },
                multiplier,
                resultX,
                resultY,
                questionText: `Нарисуйте вектор \\(${multiplier}\\vec{a}\\)`,
                minCoord: this.minCoord,
                maxCoord: this.maxCoord
            };
        }
    }
}
