// Генератор задач на векторы
class VectorsGenerator {
    constructor() {
        // Координаты от -5 до 5
        this.minCoord = -5;
        this.maxCoord = 5;
    }

    // Генерация случайной координаты в заданном диапазоне
    generateRandomCoordinate(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация задачи
    generate() {
        // Случайно выбираем режим:
        // 'drawVector' - показать координаты, нарисовать вектор
        // 'findCoords' - показать вектор, определить координаты
        const mode = Math.random() < 0.5 ? 'drawVector' : 'findCoords';

        // Генерируем начальную точку вектора
        const startX = this.generateRandomCoordinate(this.minCoord, this.maxCoord);
        const startY = this.generateRandomCoordinate(this.minCoord, this.maxCoord);

        // Генерируем координаты вектора (не нулевой вектор)
        let vectorX, vectorY;
        do {
            vectorX = this.generateRandomCoordinate(this.minCoord, this.maxCoord);
            vectorY = this.generateRandomCoordinate(this.minCoord, this.maxCoord);
        } while (vectorX === 0 && vectorY === 0);

        // Конечная точка вектора
        const endX = startX + vectorX;
        const endY = startY + vectorY;

        // Проверяем, что конечная точка в пределах сетки
        if (endX < this.minCoord || endX > this.maxCoord ||
            endY < this.minCoord || endY > this.maxCoord) {
            // Если выходит за пределы, генерируем заново
            return this.generate();
        }

        return {
            mode,
            startX,
            startY,
            endX,
            endY,
            vectorX,
            vectorY,
            minCoord: this.minCoord,
            maxCoord: this.maxCoord
        };
    }
}
