// Генератор задач по переводу градусов в радианы

class AngleConversionProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            conversionTypes: {
                degreesToRadians: true,
                radiansToDegrees: true
            },
            includeNonTabular: false  // Включать нетабличные значения
        };
    }

    // НОД для упрощения дробей
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

    // Конвертация градусов в радианы (возвращает числитель и знаменатель)
    degreesToRadiansFraction(degrees) {
        if (degrees === 0) return { numerator: 0, denominator: 1 };

        // Упрощаем дробь degrees/180
        const gcd = this.gcd(degrees, 180);
        const num = degrees / gcd;
        const den = 180 / gcd;

        return { numerator: num, denominator: den };
    }

    // Конвертация градусов в радианы (LaTeX для отображения)
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

    // Генерация случайного угла
    generateAngle() {
        if (this.settings.includeNonTabular) {
            // Любой угол от 0 до 360 с шагом 5 градусов
            const step = 5;
            const maxAngle = 360;
            const numberOfSteps = maxAngle / step;
            return Math.floor(Math.random() * (numberOfSteps + 1)) * step;
        } else {
            // Только табличные значения
            const tabularAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
            return tabularAngles[Math.floor(Math.random() * tabularAngles.length)];
        }
    }

    // Генерация задачи
    generate() {
        // Выбираем тип конверсии
        const enabledTypes = Object.keys(this.settings.conversionTypes)
            .filter(type => this.settings.conversionTypes[type]);

        if (enabledTypes.length === 0) {
            // Если ни один тип не выбран, используем оба
            enabledTypes.push('degreesToRadians', 'radiansToDegrees');
        }

        const conversionType = enabledTypes[Math.floor(Math.random() * enabledTypes.length)];

        // Генерируем угол
        const angleDegrees = this.generateAngle();

        let question, correctAnswer;

        if (conversionType === 'degreesToRadians') {
            // Градусы → Радианы
            question = `${angleDegrees}^\\circ`;
            const fraction = this.degreesToRadiansFraction(angleDegrees);
            correctAnswer = {
                numerator: fraction.numerator,
                denominator: fraction.denominator,
                degrees: angleDegrees
            };
        } else {
            // Радианы → Градусы
            const fraction = this.degreesToRadiansFraction(angleDegrees);
            question = this.degreesToRadiansLatex(angleDegrees);
            correctAnswer = {
                degrees: angleDegrees
            };
        }

        return {
            question: question,
            conversionType: conversionType,
            angleDegrees: angleDegrees,
            correctAnswer: correctAnswer,
            isLatex: true
        };
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
