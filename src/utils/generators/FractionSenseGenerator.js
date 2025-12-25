// Генератор задач для тренажёра "Чувство дроби"

class FractionSenseGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            includePercentages: false,
            includeDecimals: false,
            tolerance: 0.10  // +-10% по умолчанию
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация НОД
    gcd(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // Генерация обыкновенной дроби
    generateProperFraction() {
        const denominator = this.randomInt(2, 100);
        const numerator = this.randomInt(1, denominator - 1);

        // Сокращаем дробь
        const divisor = this.gcd(numerator, denominator);

        return {
            type: 'fraction',
            numerator: numerator / divisor,
            denominator: denominator / divisor,
            value: numerator / denominator,
            display: `${numerator / divisor}/${denominator / divisor}`
        };
    }

    // Генерация процента
    generatePercentage() {
        // Генерируем проценты от 1% до 99%
        const percent = this.randomInt(1, 99);

        return {
            type: 'percentage',
            percent: percent,
            value: percent / 100,
            display: `${percent}%`
        };
    }

    // Генерация десятичной дроби
    generateDecimal() {
        // Генерируем десятичные дроби от 0.01 до 0.99
        // Выбираем количество знаков после запятой (1 или 2)
        const decimals = this.randomInt(1, 2);

        let value;
        if (decimals === 1) {
            // От 0.1 до 0.9
            value = this.randomInt(1, 9) / 10;
        } else {
            // От 0.01 до 0.99
            value = this.randomInt(1, 99) / 100;
        }

        return {
            type: 'decimal',
            value: value,
            display: value.toFixed(decimals).replace('.', ',')
        };
    }

    // Генерация задачи
    generate() {
        const availableTypes = ['fraction'];

        if (this.settings.includePercentages) {
            availableTypes.push('percentage');
        }

        if (this.settings.includeDecimals) {
            availableTypes.push('decimal');
        }

        // Выбираем случайный тип
        const type = availableTypes[this.randomInt(0, availableTypes.length - 1)];

        let problem;

        switch (type) {
            case 'fraction':
                problem = this.generateProperFraction();
                break;
            case 'percentage':
                problem = this.generatePercentage();
                break;
            case 'decimal':
                problem = this.generateDecimal();
                break;
        }

        return problem;
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
