// Генератор задач на проценты

class PercentagesProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            findPartOfNumber: true,      // Найти A% от B
            findNumberByPart: true,       // Число A занимает B% от x. Найти x
            findPercentage: true          // Сколько % занимает A от B
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Найти делители числа
    findDivisors(n) {
        const divisors = [];
        for (let i = 1; i <= Math.sqrt(n); i++) {
            if (n % i === 0) {
                divisors.push(i);
                if (i !== n / i) {
                    divisors.push(n / i);
                }
            }
        }
        return divisors.sort((a, b) => a - b);
    }

    // Генерация задачи типа 1: Найти A% от B
    generateFindPartOfNumber() {
        // Генерируем процент (от 1 до 100, кратный 5 или 10 для простоты)
        const percentValues = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100];
        const percent = percentValues[this.randomInt(0, percentValues.length - 1)];

        // Генерируем число B так, чтобы результат был целым
        // B должно быть кратно знаменателю дроби percent/100
        const percentFraction = percent / 100;

        // Находим знаменатель после упрощения дроби percent/100
        let denominator = 100;
        let numerator = percent;
        const gcd = this.gcd(numerator, denominator);
        denominator = denominator / gcd;

        // B должно делиться на denominator
        const multiplier = this.randomInt(1, 20);
        const numberB = denominator * multiplier;

        const result = Math.round(numberB * percentFraction);

        return {
            type: 'findPartOfNumber',
            question: `Найдите ${percent}% от ${numberB}`,
            percent: percent,
            number: numberB,
            result: result
        };
    }

    // Генерация задачи типа 2: Число A занимает B% от x. Найти x
    generateFindNumberByPart() {
        // Генерируем процент
        const percentValues = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80];
        const percent = percentValues[this.randomInt(0, percentValues.length - 1)];

        // Генерируем x так, чтобы результат A был целым
        const percentFraction = percent / 100;

        let denominator = 100;
        let numerator = percent;
        const gcd = this.gcd(numerator, denominator);
        denominator = denominator / gcd;

        const multiplier = this.randomInt(1, 20);
        const x = denominator * multiplier;

        const numberA = Math.round(x * percentFraction);

        return {
            type: 'findNumberByPart',
            question: `Число ${numberA} составляет ${percent}% от x. Найдите x`,
            part: numberA,
            percent: percent,
            result: x
        };
    }

    // Генерация задачи типа 3: Сколько % занимает A от B
    generateFindPercentage() {
        // Генерируем процент, который будет ответом
        const percentValues = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90];
        const percent = percentValues[this.randomInt(0, percentValues.length - 1)];

        const percentFraction = percent / 100;

        // Генерируем B
        let denominator = 100;
        let numerator = percent;
        const gcd = this.gcd(numerator, denominator);
        denominator = denominator / gcd;

        const multiplier = this.randomInt(1, 20);
        const numberB = denominator * multiplier;

        const numberA = Math.round(numberB * percentFraction);

        return {
            type: 'findPercentage',
            question: `Сколько процентов составляет ${numberA} от ${numberB}?`,
            part: numberA,
            whole: numberB,
            result: percent
        };
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

    // Генерация задачи
    generate() {
        const enabledTypes = [];

        if (this.settings.findPartOfNumber) enabledTypes.push('findPartOfNumber');
        if (this.settings.findNumberByPart) enabledTypes.push('findNumberByPart');
        if (this.settings.findPercentage) enabledTypes.push('findPercentage');

        // Если ничего не выбрано, включаем все типы
        if (enabledTypes.length === 0) {
            enabledTypes.push('findPartOfNumber', 'findNumberByPart', 'findPercentage');
        }

        // Выбираем случайный тип задачи
        const type = enabledTypes[this.randomInt(0, enabledTypes.length - 1)];

        switch (type) {
            case 'findPartOfNumber':
                return this.generateFindPartOfNumber();
            case 'findNumberByPart':
                return this.generateFindNumberByPart();
            case 'findPercentage':
                return this.generateFindPercentage();
            default:
                return this.generateFindPartOfNumber();
        }
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
