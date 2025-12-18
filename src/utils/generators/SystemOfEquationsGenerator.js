// Генератор систем линейных уравнений с двумя неизвестными

class SystemOfEquationsProblemGenerator {
    constructor(settings) {
        this.settings = settings || this.getDefaultSettings();
    }

    getDefaultSettings() {
        return {
            standardForm: true,      // В стандартном виде: ax+by=c
            nonStandardForm: false   // Не в стандартном виде (с переносами слагаемых)
        };
    }

    // Генерация случайного целого числа в диапазоне
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерация ненулевого случайного числа
    randomNonZero(min, max) {
        let num;
        do {
            num = this.randomInt(min, max);
        } while (num === 0);
        return num;
    }

    // НОД (наибольший общий делитель)
    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // Форматирование коэффициента перед переменной
    formatCoefficient(coef, isFirst = false) {
        if (coef === 0) return '';
        if (coef === 1) {
            return isFirst ? '' : '+';
        }
        if (coef === -1) {
            return '-';
        }
        if (coef > 0 && !isFirst) {
            return '+' + coef;
        }
        return coef.toString();
    }

    // Форматирование константы
    formatConstant(value) {
        if (value === 0) return '';
        if (value > 0) {
            return '+' + value;
        }
        return value.toString();
    }

    // Генерация системы в стандартном виде: ax+by=c, dx+ey=f
    generateStandardForm() {
        // Выбираем решение системы (x, y)
        const x = this.randomInt(-10, 10);
        const y = this.randomInt(-10, 10);

        // Генерируем коэффициенты первого уравнения
        const a1 = this.randomNonZero(-10, 10);
        const b1 = this.randomNonZero(-10, 10);
        const c1 = a1 * x + b1 * y;

        // Генерируем коэффициенты второго уравнения
        let a2 = this.randomNonZero(-10, 10);
        let b2 = this.randomNonZero(-10, 10);

        // Проверяем, что система не вырожденная (определитель != 0)
        // det = a1*b2 - a2*b1
        let attempts = 0;
        while (a1 * b2 - a2 * b1 === 0 && attempts < 20) {
            a2 = this.randomNonZero(-10, 10);
            b2 = this.randomNonZero(-10, 10);
            attempts++;
        }

        const c2 = a2 * x + b2 * y;

        // Форматируем уравнения
        const eq1Left = `${this.formatCoefficient(a1, true)}x${this.formatCoefficient(b1)}y`;
        const eq1 = `${eq1Left}=${c1}`;

        const eq2Left = `${this.formatCoefficient(a2, true)}x${this.formatCoefficient(b2)}y`;
        const eq2 = `${eq2Left}=${c2}`;

        return {
            equation1: eq1,
            equation2: eq2,
            solutionX: x,
            solutionY: y,
            isStandard: true
        };
    }

    // Генерация системы в нестандартном виде (с переносами слагаемых)
    generateNonStandardForm() {
        // Сначала генерируем систему в стандартном виде
        const standard = this.generateStandardForm();

        // Извлекаем коэффициенты из стандартной формы
        // Первое уравнение: a1*x + b1*y = c1
        const eq1Match = standard.equation1.match(/^([+-]?\d*)x([+-]?\d*)y=([+-]?\d+)$/);
        if (!eq1Match) return standard; // Fallback

        let a1 = eq1Match[1] === '' || eq1Match[1] === '+' ? 1 :
                 eq1Match[1] === '-' ? -1 : parseInt(eq1Match[1]);
        let b1 = eq1Match[2] === '' || eq1Match[2] === '+' ? 1 :
                 eq1Match[2] === '-' ? -1 : parseInt(eq1Match[2]);
        let c1 = parseInt(eq1Match[3]);

        // Второе уравнение: a2*x + b2*y = c2
        const eq2Match = standard.equation2.match(/^([+-]?\d*)x([+-]?\d*)y=([+-]?\d+)$/);
        if (!eq2Match) return standard; // Fallback

        let a2 = eq2Match[1] === '' || eq2Match[1] === '+' ? 1 :
                 eq2Match[1] === '-' ? -1 : parseInt(eq2Match[1]);
        let b2 = eq2Match[2] === '' || eq2Match[2] === '+' ? 1 :
                 eq2Match[2] === '-' ? -1 : parseInt(eq2Match[2]);
        let c2 = parseInt(eq2Match[3]);

        // Для каждого уравнения случайным образом переносим слагаемые
        const eq1 = this.rearrangeEquation(a1, b1, c1);
        const eq2 = this.rearrangeEquation(a2, b2, c2);

        return {
            equation1: eq1,
            equation2: eq2,
            solutionX: standard.solutionX,
            solutionY: standard.solutionY,
            isStandard: false
        };
    }

    // Перестановка слагаемых в уравнении ax+by=c
    rearrangeEquation(a, b, c) {
        // Решаем, какие слагаемые переносить
        // Возможные варианты:
        // 1. ax+by=c (стандарт)
        // 2. ax=c-by
        // 3. by=c-ax
        // 4. ax+by-c=0
        // 5. c=ax+by
        // 6. ax-c=-by
        // и т.д.

        const variants = [];

        // Вариант 1: ax+by=c (стандарт)
        variants.push({
            left: `${this.formatCoefficient(a, true)}x${this.formatCoefficient(b)}y`,
            right: `${c}`
        });

        // Вариант 2: ax=c-by (перенос by вправо с изменением знака)
        if (b !== 0) {
            variants.push({
                left: `${this.formatCoefficient(a, true)}x`,
                right: `${c}${this.formatCoefficient(-b)}y`
            });
        }

        // Вариант 3: by=c-ax (перенос ax вправо с изменением знака)
        if (a !== 0) {
            variants.push({
                left: `${this.formatCoefficient(b, true)}y`,
                right: `${c}${this.formatCoefficient(-a)}x`
            });
        }

        // Вариант 4: ax+by-c=0 (перенос c влево с изменением знака)
        variants.push({
            left: `${this.formatCoefficient(a, true)}x${this.formatCoefficient(b)}y${this.formatConstant(-c)}`,
            right: `0`
        });

        // Вариант 5: c=ax+by (переворот уравнения)
        variants.push({
            left: `${c}`,
            right: `${this.formatCoefficient(a, true)}x${this.formatCoefficient(b)}y`
        });

        // Вариант 6: c-ax=by (перенос ax влево к c с изменением знака)
        if (a !== 0) {
            variants.push({
                left: `${c}${this.formatCoefficient(-a)}x`,
                right: `${this.formatCoefficient(b, true)}y`
            });
        }

        // Вариант 7: c-by=ax (перенос by влево к c с изменением знака)
        if (b !== 0) {
            variants.push({
                left: `${c}${this.formatCoefficient(-b)}y`,
                right: `${this.formatCoefficient(a, true)}x`
            });
        }

        // Выбираем случайный вариант
        const variant = variants[this.randomInt(0, variants.length - 1)];
        return `${variant.left}=${variant.right}`;
    }

    // Генерация системы
    generate() {
        const modes = [];
        if (this.settings.standardForm) modes.push('standard');
        if (this.settings.nonStandardForm) modes.push('nonStandard');

        // Если ничего не выбрано, используем стандартную форму
        if (modes.length === 0) {
            modes.push('standard');
        }

        // Выбираем случайный режим
        const mode = modes[this.randomInt(0, modes.length - 1)];

        if (mode === 'standard') {
            return this.generateStandardForm();
        } else {
            return this.generateNonStandardForm();
        }
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
}
