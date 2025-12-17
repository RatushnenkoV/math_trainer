// Генератор примеров на делимость

class DivisibilityProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            div2: true,
            div3: true,
            div4: true,
            div5: true,
            div6: true,
            div8: true,
            div9: true,
            div10: true
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Получение списка выбранных делителей
    getSelectedDivisors() {
        const divisors = [];
        if (this.settings.div2) divisors.push(2);
        if (this.settings.div3) divisors.push(3);
        if (this.settings.div4) divisors.push(4);
        if (this.settings.div5) divisors.push(5);
        if (this.settings.div6) divisors.push(6);
        if (this.settings.div8) divisors.push(8);
        if (this.settings.div9) divisors.push(9);
        if (this.settings.div10) divisors.push(10);
        return divisors;
    }

    // Проверка делимости числа на делитель
    isDivisible(number, divisor) {
        return number % divisor === 0;
    }

    // Генерация числа, которое делится или не делится на заданный делитель
    generateNumber(divisor, shouldBeDivisible) {
        if (shouldBeDivisible) {
            // Генерируем число, которое делится на делитель
            const multiplier = this.randomInt(10000, 1000000);
            return divisor * multiplier;
        } else {
            // Генерируем число, которое не делится на делитель
            let number;
            let attempts = 0;
            do {
                number = this.randomInt(100000, 10000000);
                attempts++;
                if (attempts > 100) {
                    // Гарантированно делаем число неделимым
                    number = divisor * this.randomInt(10000, 1000000) + 1;
                    break;
                }
            } while (this.isDivisible(number, divisor));
            return number;
        }
    }

    // Генерация примера
    generate() {
        const selectedDivisors = this.getSelectedDivisors();

        // Если нет выбранных делителей, возвращаем null
        if (selectedDivisors.length === 0) {
            return null;
        }

        // Выбираем случайный делитель из выбранных
        const divisor = selectedDivisors[this.randomInt(0, selectedDivisors.length - 1)];

        // Случайным образом решаем, будет ли число делиться на делитель
        const shouldBeDivisible = Math.random() > 0.5;

        // Генерируем число
        const number = this.generateNumber(divisor, shouldBeDivisible);

        return {
            number: number,
            divisor: divisor,
            isDivisible: this.isDivisible(number, divisor)
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
