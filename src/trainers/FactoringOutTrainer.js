// Тренажёр вынесения множителя за скобки
class FactoringOutTrainer extends BaseTrainer {
    constructor() {
        super({
            name: 'factoring-out',
            generator: new FactoringOutGenerator(),
            progressTracker: new ProgressTracker('factoringOutProgress'),
            settings: {},
            storageKey: null  // Настроек нет
        });

        // Одночлен за скобками (фиксированный)
        this.factorInput = null;

        // Скобки с мономами внутри (фиксированные)
        this.bracketMonomials = [];

        this.draggedVariable = null;

        // Для touch events
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchElement = null;
        this.clone = null;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('factoring-out-screen'),
            backBtn: document.getElementById('factoring-out-back-btn'),
            settingsBtn: document.getElementById('factoring-out-settings-btn'),
            settingsScreen: document.getElementById('factoring-out-settings-screen'),
            settingsBackBtn: document.getElementById('factoring-out-settings-back-btn'),
            checkBtn: document.getElementById('factoring-out-check-btn'),

            levelText: document.getElementById('factoring-out-level-text'),
            progressText: document.getElementById('factoring-out-progress-text'),
            progressFill: document.getElementById('factoring-out-progress-fill'),
            resultMessage: document.getElementById('factoring-out-result-message'),
            problemDisplay: document.getElementById('factoring-out-problem-display'),

            factorizationContainer: document.getElementById('factoring-out-factorization-container'),
            variablesPanel: document.getElementById('variables-panel-fo'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('factoring-out-share-btn')
        };

        this.initEventHandlers();
        this.initVariablesPanel();
        this.initShareModalHandlers();
    }

    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.handleBackButtonClick();
        });

        // Кнопка настроек
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsScreen();
        });

        // Кнопка назад в настройках
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
        });

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });
    }

    // Показать экран настроек
    showSettingsScreen() {
        this.elements.screen.classList.remove('active');
        this.elements.settingsScreen.classList.add('active');
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
        this.elements.screen.classList.add('active');
    }

    initVariablesPanel() {
        const variables = ['1', 'a', 'b', 'c', 'x', 'y', 'z'];

        this.elements.variablesPanel.innerHTML = '';

        variables.forEach(variable => {
            const varElement = document.createElement('div');
            varElement.className = 'variable-chip';
            varElement.textContent = variable;
            varElement.draggable = true;
            varElement.dataset.variable = variable;

            varElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', variable);
                e.dataTransfer.effectAllowed = 'copy';
                this.draggedVariable = variable;
            });

            varElement.addEventListener('dragend', () => {
                this.draggedVariable = null;
                document.querySelectorAll('.monomial-input-fo').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });

            varElement.addEventListener('click', () => {
                // Добавляем в последний моном в скобках
                if (this.bracketMonomials.length > 0) {
                    const lastMonomial = this.bracketMonomials[this.bracketMonomials.length - 1];
                    lastMonomial.addVariable(variable);
                }
            });

            // Touch events для мобильных устройств
            varElement.addEventListener('touchstart', (e) => this.handleVariableTouchStart(e, variable), { passive: false });
            varElement.addEventListener('touchmove', (e) => this.handleVariableTouchMove(e), { passive: false });
            varElement.addEventListener('touchend', (e) => this.handleVariableTouchEnd(e, variable), { passive: false });

            this.elements.variablesPanel.appendChild(varElement);
        });
    }

    // Touch events для перетаскивания переменных
    handleVariableTouchStart(e, variable) {
        e.preventDefault();

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchElement = e.currentTarget;

        // Создаём клон элемента для визуального перетаскивания
        this.clone = this.touchElement.cloneNode(true);
        this.clone.className = 'variable-chip dragging-clone';
        this.clone.style.position = 'fixed';
        this.clone.style.left = touch.clientX - 20 + 'px';
        this.clone.style.top = touch.clientY - 20 + 'px';
        this.clone.style.pointerEvents = 'none';
        this.clone.style.zIndex = '10000';
        document.body.appendChild(this.clone);

        this.touchElement.style.opacity = '0.5';
        this.draggedVariable = variable;
    }

    handleVariableTouchMove(e) {
        if (!this.clone) return;

        e.preventDefault();

        const touch = e.touches[0];
        this.clone.style.left = touch.clientX - 20 + 'px';
        this.clone.style.top = touch.clientY - 20 + 'px';

        // Находим элемент под пальцем
        this.clone.style.display = 'none';
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        this.clone.style.display = '';

        // Подсвечиваем целевой моном
        document.querySelectorAll('.monomial-input-fo').forEach(el => {
            el.classList.remove('drag-over');
        });

        if (elementBelow) {
            const monomialInput = elementBelow.closest('.monomial-input-fo');
            if (monomialInput) {
                monomialInput.classList.add('drag-over');
            }
        }
    }

    handleVariableTouchEnd(e, variable) {
        e.preventDefault();

        if (this.clone) {
            const touch = e.changedTouches[0];

            // Находим элемент под пальцем
            this.clone.style.display = 'none';
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

            if (elementBelow) {
                const monomialInput = elementBelow.closest('.monomial-input-fo');

                if (monomialInput) {
                    // Определяем, это factorInput или bracketMonomial
                    if (monomialInput.dataset.type === 'factor') {
                        this.factorInput.addVariable(variable);
                    } else {
                        const index = parseInt(monomialInput.dataset.index);
                        if (!isNaN(index) && this.bracketMonomials[index]) {
                            this.bracketMonomials[index].addVariable(variable);
                        }
                    }
                }
            }

            // Убираем клон
            this.clone.remove();
            this.clone = null;
        }

        if (this.touchElement) {
            this.touchElement.style.opacity = '1';
            this.touchElement = null;
        }

        this.draggedVariable = null;

        document.querySelectorAll('.monomial-input-fo').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    displayProblem(problem) {
        if (!problem) {
            console.error('Problem is null or undefined');
            return;
        }

        this.elements.problemDisplay.innerHTML = '';

        const expressionElem = document.createElement('div');
        expressionElem.className = 'problem-expression';

        if (typeof katex !== 'undefined') {
            katex.render(problem.question, expressionElem, {
                throwOnError: false,
                displayMode: true
            });
        } else {
            expressionElem.textContent = problem.question;
        }

        this.elements.problemDisplay.appendChild(expressionElem);

        this.setupFactoringMode();
    }

    setupFactoringMode() {
        console.log('setupFactoringMode called');

        // Очищаем контейнер
        console.log('Clearing container...');
        this.elements.factorizationContainer.innerHTML = '';
        console.log('Container cleared');

        // Создаём структуру: grid 2x2
        // Верхний ряд: [множитель × ] [скобки]
        // Нижний ряд: [пусто] [кнопка +]

        // 1. Левая верхняя ячейка: множитель и знак умножения
        const factorAndMultiplyContainer = document.createElement('div');
        factorAndMultiplyContainer.className = 'factor-and-multiply-container';

        this.factorInput = new MonomialInputFactoringOut(
            'factor',
            () => this.handleUpdate(),
            null,  // Удалять нельзя
            true   // Это множитель за скобками
        );

        console.log('factorInput:', this.factorInput);
        console.log('factorInput.element:', this.factorInput.element);

        if (this.factorInput && this.factorInput.element) {
            factorAndMultiplyContainer.appendChild(this.factorInput.element);

            // Добавляем знак умножения
            const multiplySign = document.createElement('div');
            multiplySign.className = 'multiply-sign';
            multiplySign.textContent = '·';
            factorAndMultiplyContainer.appendChild(multiplySign);

            this.elements.factorizationContainer.appendChild(factorAndMultiplyContainer);
            console.log('factorInput added to container');
        } else {
            console.error('factorInput.element is null or undefined!');
        }

        // 2. Правая верхняя ячейка: скобки
        const bracketsContainer = document.createElement('div');
        bracketsContainer.className = 'brackets-container';

        // Левая скобка
        const leftBracket = document.createElement('div');
        leftBracket.className = 'bracket';
        leftBracket.textContent = '(';
        bracketsContainer.appendChild(leftBracket);

        // Контейнер для мономов внутри скобок
        const monomialsContainer = document.createElement('div');
        monomialsContainer.className = 'monomials-in-brackets-container';

        // Не создаём мономы автоматически - пользователь добавит их сам
        this.bracketMonomials = [];
        this.monomialsContainer = monomialsContainer;

        bracketsContainer.appendChild(monomialsContainer);

        // Правая скобка
        const rightBracket = document.createElement('div');
        rightBracket.className = 'bracket';
        rightBracket.textContent = ')';
        bracketsContainer.appendChild(rightBracket);

        this.elements.factorizationContainer.appendChild(bracketsContainer);

        // 3. Правая нижняя ячейка: кнопка добавления монома
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        const addBracketMonomialBtn = document.createElement('button');
        addBracketMonomialBtn.className = 'add-monomial-button';
        addBracketMonomialBtn.innerHTML = '<span class="plus-icon">+</span>';
        addBracketMonomialBtn.addEventListener('click', () => {
            this.addBracketMonomial();
        });

        buttonContainer.appendChild(addBracketMonomialBtn);
        this.elements.factorizationContainer.appendChild(buttonContainer);

        console.log('setupFactoringMode finished');
        console.log('Final container children:', this.elements.factorizationContainer.children.length);
        console.log('Container HTML:', this.elements.factorizationContainer.innerHTML.substring(0, 200));
    }

    addBracketMonomial() {
        const index = this.bracketMonomials.length;

        const monomialInput = new MonomialInputFactoringOut(
            index,
            () => this.handleUpdate(),
            (idx) => this.removeBracketMonomial(idx),
            false  // Это моном внутри скобок
        );

        this.bracketMonomials.push(monomialInput);
        this.monomialsContainer.appendChild(monomialInput.element);
    }

    removeBracketMonomial(index) {
        if (index < 0 || index >= this.bracketMonomials.length) return;

        this.bracketMonomials[index].remove();
        this.bracketMonomials.splice(index, 1);

        // Обновляем индексы оставшихся мономов
        this.bracketMonomials.forEach((input, newIndex) => {
            input.updateIndex(newIndex);
        });
    }

    handleUpdate() {
        // Placeholder для обновлений
    }

    clearInputs() {
        // Очистка происходит в setupFactoringMode() через innerHTML = ''
        // НЕ обнуляем ссылки здесь, так как они нужны для проверки ответа
    }

    checkAnswer() {
        if (!this.currentProblem) return;

        const isCorrect = this.checkFactoringAnswer();

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    checkFactoringAnswer() {
        // Получаем моном пользователя за скобками
        console.log('factorInput:', this.factorInput);
        console.log('factorInput.coefficient:', this.factorInput?.coefficient);
        console.log('factorInput.variables:', this.factorInput?.variables);
        console.log('factorInput.sign:', this.factorInput?.sign);

        const userFactor = this.factorInput ? this.factorInput.toMonomial() : null;
        console.log('User factor:', userFactor);
        if (!userFactor) {
            console.log('No user factor');
            return false;
        }

        // Получаем мономы пользователя в скобках
        const userBracketMonomials = this.bracketMonomials
            .map(input => input.toMonomial())
            .filter(m => m !== null);

        console.log('User bracket monomials:', userBracketMonomials);
        if (userBracketMonomials.length === 0) {
            console.log('No bracket monomials');
            return false;
        }

        const userBracketPolynomial = new Polynomial(userBracketMonomials);
        console.log('User bracket polynomial:', userBracketPolynomial);

        // Проверяем правильность, раскрывая скобки обратно
        // Умножаем каждый моном в скобках на множитель за скобками
        const expandedMonomials = userBracketMonomials.map(m =>
            this.multiplyMonomials(userFactor, m)
        );
        const expandedPolynomial = new Polynomial(expandedMonomials);

        console.log('User expanded polynomial:', expandedPolynomial);
        console.log('Original polynomial:', this.currentProblem.expanded);

        // Сравниваем с исходным выражением
        const expandedMatch = this.comparePolynomials(expandedPolynomial, this.currentProblem.expanded);
        console.log('Expanded match:', expandedMatch);
        if (!expandedMatch) {
            console.log('Раскрытие не совпадает с исходным выражением');
            return false;
        }

        // Дополнительная проверка: убедимся, что вынесено максимально возможное
        // Проверим, что НОД мономов в скобках равен 1
        const gcdOfBracket = this.gcdOfPolynomial(userBracketPolynomial);
        console.log('GCD of bracket:', gcdOfBracket);
        const gcdIsOne = this.isGcdOne(gcdOfBracket);
        console.log('GCD is one:', gcdIsOne);
        if (!gcdIsOne) {
            return false;
        }

        return true;
    }

    // Находим НОД всех мономов в полиноме
    gcdOfPolynomial(polynomial) {
        if (!polynomial || !polynomial.monomials || polynomial.monomials.length === 0) {
            return new Monomial(1, []);
        }

        let gcd = polynomial.monomials[0];

        for (let i = 1; i < polynomial.monomials.length; i++) {
            gcd = this.gcdOfTwoMonomials(gcd, polynomial.monomials[i]);
        }

        return gcd;
    }

    // НОД двух мономов
    gcdOfTwoMonomials(m1, m2) {
        // НОД коэффициентов
        const coeffGcd = this.gcdOfNumbers(Math.abs(m1.coefficient), Math.abs(m2.coefficient));

        // НОД переменных - минимальные степени
        const powers1 = {};
        const powers2 = {};

        m1.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? parseInt(p.exponent.tex())
                : parseInt(p.exponent);
            powers1[base] = exp;
        });

        m2.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? parseInt(p.exponent.tex())
                : parseInt(p.exponent);
            powers2[base] = exp;
        });

        const gcdPowers = [];
        for (const base in powers1) {
            if (base in powers2) {
                const minPower = Math.min(powers1[base], powers2[base]);
                if (minPower > 0) {
                    gcdPowers.push(new Power(base, minPower));
                }
            }
        }

        return new Monomial(coeffGcd, gcdPowers);
    }

    // НОД двух чисел
    gcdOfNumbers(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);

        if (a === 0) return b;
        if (b === 0) return a;

        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // Проверка, что НОД равен 1 (т.е. нельзя вынести ещё что-то)
    isGcdOne(monomial) {
        if (!monomial) return true;

        // Коэффициент должен быть 1
        if (Math.abs(monomial.coefficient) !== 1) return false;

        // Степени должны быть пустые
        if (monomial.powers.length > 0) return false;

        return true;
    }

    comparePolynomials(p1, p2) {
        // Если один из них - Monomial
        if (p1 instanceof Monomial && p2 instanceof Monomial) {
            return this.compareMonomials(p1, p2);
        }

        if (p1 instanceof Monomial && p2 instanceof Polynomial) {
            if (p2.monomials.length === 1) {
                return this.compareMonomials(p1, p2.monomials[0]);
            }
            return false;
        }

        if (p1 instanceof Polynomial && p2 instanceof Monomial) {
            if (p1.monomials.length === 1) {
                return this.compareMonomials(p1.monomials[0], p2);
            }
            return false;
        }

        // Оба - Polynomial
        if (!(p1 instanceof Polynomial) || !(p2 instanceof Polynomial)) {
            return false;
        }

        if (p1.monomials.length !== p2.monomials.length) {
            return false;
        }

        const monos1 = [...p1.monomials];
        const monos2 = [...p2.monomials];

        const used = new Set();

        for (const m1 of monos1) {
            let found = false;

            for (let i = 0; i < monos2.length; i++) {
                if (used.has(i)) continue;

                if (this.compareMonomials(m1, monos2[i])) {
                    used.add(i);
                    found = true;
                    break;
                }
            }

            if (!found) return false;
        }

        return true;
    }

    compareMonomials(m1, m2) {
        if (m1.coefficient !== m2.coefficient) return false;

        if (m1.powers.length !== m2.powers.length) return false;

        const powers1 = {};
        const powers2 = {};

        m1.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = p.exponent.tex ? p.exponent.tex() : p.exponent;
            powers1[base] = exp;
        });

        m2.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = p.exponent.tex ? p.exponent.tex() : p.exponent;
            powers2[base] = exp;
        });

        for (const base in powers1) {
            if (powers1[base] !== powers2[base]) return false;
        }

        for (const base in powers2) {
            if (powers1[base] !== powers2[base]) return false;
        }

        return true;
    }

    // Умножение двух мономов
    multiplyMonomials(m1, m2) {
        // Коэффициент - произведение коэффициентов
        const newCoeff = m1.coefficient * m2.coefficient;

        // Степени - объединяем и складываем показатели одинаковых оснований
        const powerMap = {};

        // Добавляем степени из первого монома
        m1.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? parseInt(p.exponent.tex())
                : parseInt(p.exponent);
            powerMap[base] = (powerMap[base] || 0) + exp;
        });

        // Добавляем степени из второго монома
        m2.powers.forEach(p => {
            const base = p.base.tex ? p.base.tex() : p.base;
            const exp = typeof p.exponent === 'object' && p.exponent.tex
                ? parseInt(p.exponent.tex())
                : parseInt(p.exponent);
            powerMap[base] = (powerMap[base] || 0) + exp;
        });

        // Создаём массив степеней для нового монома
        const newPowers = [];
        for (const base in powerMap) {
            if (powerMap[base] > 0) {
                newPowers.push(new Power(base, powerMap[base]));
            }
        }

        return new Monomial(newCoeff, newPowers);
    }

    hasOperationsSelected() {
        return true;  // Всегда доступен
    }

    updateGeneratorSettings() {
        // Настроек нет
    }

    saveSettings() {
        // Настроек нет
    }

    hideNoOperationsMessage() {
        // У нас всегда есть операции, так что просто очищаем
        if (this.elements.problemDisplay) {
            this.elements.problemDisplay.innerHTML = '';
        }
    }

    showSettingsScreen() {
        // Настроек нет
    }

    hideSettingsScreen() {
        // Настроек нет
    }
}
