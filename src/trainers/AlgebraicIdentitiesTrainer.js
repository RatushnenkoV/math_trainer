class AlgebraicIdentitiesTrainer extends BaseTrainer {
    constructor() {
        const savedSettings = localStorage.getItem('algebraicIdentitiesSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            // Режимы
            expansion: true,
            factorization: true,

            // Формулы
            squareOfSum: true,
            squareOfDifference: true,
            differenceOfSquares: true,
            cubeOfSum: false,
            cubeOfDifference: false,
            sumOfCubes: false,
            differenceOfCubes: false,

            // Сложность
            complexity: 'simple'
        };

        super({
            name: 'algebraicIdentities',
            generator: new AlgebraicIdentitiesGenerator(settings),
            progressTracker: new ProgressTracker('algebraicIdentitiesProgress'),
            settings: settings,
            storageKey: 'algebraicIdentitiesSettings'
        });

        // Для expansion mode (раскрытие скобок)
        this.monomialInputs = [];

        // Для factorization mode (разложение на множители)
        this.factorInputs = [];

        this.draggedVariable = null;

        // Для touch events
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchElement = null;
        this.clone = null;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('algebraic-identities-screen'),
            backBtn: document.getElementById('algebraic-identities-back-btn'),
            settingsBtn: document.getElementById('algebraic-identities-settings-btn'),
            checkBtn: document.getElementById('algebraic-identities-check-btn'),
            settingsScreen: document.getElementById('algebraic-identities-settings-screen'),
            settingsBackBtn: document.getElementById('algebraic-identities-settings-back-btn'),

            levelText: document.getElementById('algebraic-identities-level-text'),
            progressText: document.getElementById('algebraic-identities-progress-text'),
            progressFill: document.getElementById('algebraic-identities-progress-fill'),
            resultMessage: document.getElementById('algebraic-identities-result-message'),
            problemDisplay: document.getElementById('algebraic-identities-problem-display'),

            // Контейнеры для разных режимов
            expansionContainer: document.getElementById('algebraic-identities-expansion-container'),
            factorizationContainer: document.getElementById('algebraic-identities-factorization-container'),

            addMonomialBtn: document.getElementById('add-monomial-btn-ai'),
            addFactorBtn: document.getElementById('add-factor-btn'),
            variablesPanel: document.getElementById('variables-panel-ai')
        };

        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initVariablesPanel();
    }

    initEventHandlers() {
        super.initEventHandlers();

        if (this.elements.addMonomialBtn) {
            this.elements.addMonomialBtn.addEventListener('click', () => {
                this.addMonomialInput();
            });
        }

        if (this.elements.addFactorBtn) {
            this.elements.addFactorBtn.addEventListener('click', () => {
                this.addFactorInput();
            });
        }
    }

    initSettingsHandlers() {
        // Режимы
        const expansionCheckbox = document.getElementById('ai-mode-expansion');
        const factorizationCheckbox = document.getElementById('ai-mode-factorization');

        if (expansionCheckbox) {
            expansionCheckbox.checked = this.settings.expansion;
            expansionCheckbox.addEventListener('change', (e) => {
                this.settings.expansion = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        if (factorizationCheckbox) {
            factorizationCheckbox.checked = this.settings.factorization;
            factorizationCheckbox.addEventListener('change', (e) => {
                this.settings.factorization = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }

        // Формулы
        const formulas = [
            'squareOfSum',
            'squareOfDifference',
            'differenceOfSquares',
            'cubeOfSum',
            'cubeOfDifference',
            'sumOfCubes',
            'differenceOfCubes'
        ];

        formulas.forEach(formula => {
            const checkbox = document.getElementById(`ai-formula-${formula}`);
            if (checkbox) {
                checkbox.checked = this.settings[formula];
                checkbox.addEventListener('change', (e) => {
                    this.settings[formula] = e.target.checked;
                    this.saveSettings();
                    this.updateGeneratorSettings();
                });
            }
        });

        // Сложность
        const complexitySlider = document.getElementById('ai-complexity-slider');
        if (complexitySlider) {
            // Устанавливаем начальное значение слайдера на основе текущей сложности
            const complexityMap = { 'simple': 1, 'medium': 2, 'complex': 3 };
            const reverseMap = { 1: 'simple', 2: 'medium', 3: 'complex' };
            complexitySlider.value = complexityMap[this.settings.complexity] || 1;

            complexitySlider.addEventListener('input', (e) => {
                const sliderValue = parseInt(e.target.value);
                this.settings.complexity = reverseMap[sliderValue];
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        }
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
                document.querySelectorAll('.monomial-input, .factor-input').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });

            varElement.addEventListener('click', () => {
                if (this.currentProblem && this.currentProblem.mode === 'expansion') {
                    if (this.monomialInputs.length > 0) {
                        const lastMonomial = this.monomialInputs[this.monomialInputs.length - 1];
                        lastMonomial.addVariable(variable);
                    }
                } else if (this.currentProblem && this.currentProblem.mode === 'factorization') {
                    if (this.factorInputs.length > 0) {
                        const lastFactor = this.factorInputs[this.factorInputs.length - 1];
                        lastFactor.addVariable(variable);
                    }
                }
            });

            // Touch events для мобильных устройств
            varElement.addEventListener('touchstart', (e) => this.handleVariableTouchStart(e, variable), { passive: false });
            varElement.addEventListener('touchmove', (e) => this.handleVariableTouchMove(e), { passive: false });
            varElement.addEventListener('touchend', (e) => this.handleVariableTouchEnd(e, variable), { passive: false });

            this.elements.variablesPanel.appendChild(varElement);
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

        // Показываем нужный контейнер в зависимости от режима
        if (problem.mode === 'expansion') {
            this.setupExpansionMode();
        } else if (problem.mode === 'factorization') {
            this.setupFactorizationMode();
        }
    }

    setupExpansionMode() {
        // Показываем контейнер для раскрытия скобок
        this.elements.expansionContainer.style.display = 'flex';
        this.elements.factorizationContainer.style.display = 'none';

        // Очищаем и инициализируем
        this.monomialInputs = [];
        this.factorInputs = [];

        // Очищаем только мономы, сохраняя кнопку
        const monomialsToRemove = this.elements.expansionContainer.querySelectorAll('.monomial-input');
        monomialsToRemove.forEach(monomial => monomial.remove());

        // Добавляем один моном по умолчанию
        this.addMonomialInput();
    }

    setupFactorizationMode() {
        // Показываем контейнер для разложения на множители
        this.elements.expansionContainer.style.display = 'none';
        this.elements.factorizationContainer.style.display = 'flex';

        // Очищаем и инициализируем
        this.monomialInputs = [];
        this.factorInputs = [];

        // Очищаем только факторы, сохраняя кнопку
        const factorsToRemove = this.elements.factorizationContainer.querySelectorAll('.factor-input');
        factorsToRemove.forEach(factor => factor.remove());

        // Добавляем один множитель по умолчанию
        this.addFactorInput();
    }

    addMonomialInput() {
        const index = this.monomialInputs.length;

        const monomialInput = new MonomialInput(
            index,
            () => this.handleMonomialUpdate(),
            (idx) => this.removeMonomialInput(idx)
        );

        this.monomialInputs.push(monomialInput);
        this.elements.expansionContainer.insertBefore(monomialInput.element, this.elements.addMonomialBtn);
    }

    removeMonomialInput(index) {
        if (index < 0 || index >= this.monomialInputs.length) return;

        this.monomialInputs[index].remove();
        this.monomialInputs.splice(index, 1);

        this.monomialInputs.forEach((input, newIndex) => {
            input.updateIndex(newIndex);
        });

        this.handleMonomialUpdate();
    }

    handleMonomialUpdate() {
        // Placeholder для обновлений
    }

    addFactorInput() {
        const index = this.factorInputs.length;

        const factorInput = new FactorInput(
            index,
            () => this.handleFactorUpdate(),
            (idx) => this.removeFactorInput(idx)
        );

        this.factorInputs.push(factorInput);
        this.elements.factorizationContainer.insertBefore(factorInput.element, this.elements.addFactorBtn);
    }

    removeFactorInput(index) {
        if (index < 0 || index >= this.factorInputs.length) return;

        this.factorInputs[index].remove();
        this.factorInputs.splice(index, 1);

        this.factorInputs.forEach((input, newIndex) => {
            input.updateIndex(newIndex);
        });

        this.handleFactorUpdate();
    }

    handleFactorUpdate() {
        // Placeholder для обновлений
    }

    clearInputs() {
        this.monomialInputs.forEach(input => input.remove());
        this.monomialInputs = [];

        this.factorInputs.forEach(input => input.remove());
        this.factorInputs = [];

        // Кнопки уже в контейнерах, ничего не нужно добавлять
    }

    checkAnswer() {
        if (!this.currentProblem) return;

        let isCorrect = false;

        if (this.currentProblem.mode === 'expansion') {
            isCorrect = this.checkExpansionAnswer();
        } else if (this.currentProblem.mode === 'factorization') {
            isCorrect = this.checkFactorizationAnswer();
        }

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    checkExpansionAnswer() {
        const userMonomials = this.monomialInputs
            .map(input => input.toMonomial())
            .filter(m => m !== null);

        if (userMonomials.length === 0) {
            return false;
        }

        const userPolynomial = new Polynomial(userMonomials).simplify();
        const correctAnswer = this.currentProblem.answer;

        return this.comparePolynomials(userPolynomial, correctAnswer);
    }

    checkFactorizationAnswer() {
        const userFactors = this.factorInputs
            .map(input => input.toFactorData())
            .filter(f => f !== null);

        if (userFactors.length === 0) {
            return false;
        }

        const correctFactors = this.currentProblem.answer;

        // Проверяем, что количество множителей совпадает
        if (userFactors.length !== correctFactors.length) {
            return false;
        }

        // Проверяем каждый множитель (порядок может быть разным)
        const usedIndices = new Set();

        for (const userFactor of userFactors) {
            let foundMatch = false;

            for (let i = 0; i < correctFactors.length; i++) {
                if (usedIndices.has(i)) continue;

                const correctFactor = correctFactors[i];

                // Проверяем степень
                if (userFactor.power !== correctFactor.power) continue;

                // Проверяем многочлен
                if (this.comparePolynomials(userFactor.polynomial, correctFactor.polynomial)) {
                    usedIndices.add(i);
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                return false;
            }
        }

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

    hasOperationsSelected() {
        const hasMode = this.settings.expansion || this.settings.factorization;
        const hasFormula = this.settings.squareOfSum ||
                          this.settings.squareOfDifference ||
                          this.settings.differenceOfSquares ||
                          this.settings.cubeOfSum ||
                          this.settings.cubeOfDifference ||
                          this.settings.sumOfCubes ||
                          this.settings.differenceOfCubes;

        return hasMode && hasFormula;
    }

    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Выберите режим и формулы в настройках</span>';
        this.elements.expansionContainer.style.display = 'none';
        this.elements.factorizationContainer.style.display = 'none';
    }

    hideNoOperationsMessage() {
        // Контейнеры будут показаны в displayProblem
    }

    disableInputs() {
        super.disableInputs();
        this.elements.expansionContainer.classList.add('disabled');
        this.elements.factorizationContainer.classList.add('disabled');
        this.elements.addMonomialBtn.disabled = true;
        this.elements.addFactorBtn.disabled = true;

        // Очищаем touch состояние
        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }
        if (this.touchElement) {
            this.touchElement.style.opacity = '1';
            this.touchElement = null;
        }
    }

    enableInputs() {
        super.enableInputs();
        this.elements.expansionContainer.classList.remove('disabled');
        this.elements.factorizationContainer.classList.remove('disabled');
        this.elements.addMonomialBtn.disabled = false;
        this.elements.addFactorBtn.disabled = false;
    }

    // Touch events (копируем из PolynomialExpandTrainer)
    handleVariableTouchStart(e, variable) {
        e.preventDefault();

        this.touchElement = e.target;
        if (!this.touchElement) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;

        this.clone = this.touchElement.cloneNode(true);
        this.clone.classList.add('variable-chip-dragging-clone');
        this.clone.style.position = 'fixed';
        this.clone.style.zIndex = '1000';
        this.clone.style.pointerEvents = 'none';
        this.clone.style.left = touch.clientX + 'px';
        this.clone.style.top = touch.clientY + 'px';
        this.clone.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(this.clone);

        this.touchElement.style.opacity = '0.5';
    }

    handleVariableTouchMove(e) {
        if (!this.touchElement || !this.clone) return;
        e.preventDefault();

        const touch = e.touches[0];

        this.clone.style.left = touch.clientX + 'px';
        this.clone.style.top = touch.clientY + 'px';

        this.clone.style.display = 'none';
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        this.clone.style.display = '';

        document.querySelectorAll('.monomial-input, .factor-input').forEach(el => {
            el.classList.remove('drag-over');
        });

        const targetElement = elementBelow?.closest('.monomial-input, .factor-input');
        if (targetElement) {
            targetElement.classList.add('drag-over');
        }
    }

    handleVariableTouchEnd(e, variable) {
        if (!this.touchElement) return;
        e.preventDefault();

        const touch = e.changedTouches[0];

        if (this.clone) {
            this.clone.style.display = 'none';
        }
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }

        this.touchElement.style.opacity = '1';

        document.querySelectorAll('.monomial-input, .factor-input').forEach(el => {
            el.classList.remove('drag-over');
        });

        if (!elementBelow) {
            this.touchElement = null;
            return;
        }

        // Сначала пытаемся найти моном внутри фактора (для factorization mode)
        const targetMonomialInFactor = elementBelow.closest('.factor-input .monomial-input');
        if (targetMonomialInFactor) {
            const factorElement = targetMonomialInFactor.closest('.factor-input');
            if (factorElement) {
                const factorIndex = parseInt(factorElement.dataset.index);
                const monomialIndex = parseInt(targetMonomialInFactor.dataset.index);

                if (!isNaN(factorIndex) && !isNaN(monomialIndex) &&
                    this.factorInputs[factorIndex] &&
                    this.factorInputs[factorIndex].monomials[monomialIndex]) {
                    this.factorInputs[factorIndex].monomials[monomialIndex].addVariable(variable);
                    this.touchElement = null;
                    return;
                }
            }
        }

        // Обрабатываем drop для expansion mode
        const targetMonomial = elementBelow.closest('.monomial-input');
        if (targetMonomial && !targetMonomial.closest('.factor-input')) {
            const index = parseInt(targetMonomial.dataset.index);
            if (!isNaN(index) && this.monomialInputs[index]) {
                this.monomialInputs[index].addVariable(variable);
                this.touchElement = null;
                return;
            }
        }

        // Если не попали в конкретный моном, но попали в фактор - используем метод addVariable фактора
        const targetFactor = elementBelow.closest('.factor-input');
        if (targetFactor) {
            const index = parseInt(targetFactor.dataset.index);
            if (!isNaN(index) && this.factorInputs[index]) {
                this.factorInputs[index].addVariable(variable);
            }
        }

        this.touchElement = null;
    }

    showSettingsScreen() {
        this.elements.screen.classList.remove('active');
        this.elements.settingsScreen.classList.add('active');
    }

    hideSettingsScreen() {
        this.elements.settingsScreen.classList.remove('active');
        this.elements.screen.classList.add('active');
    }
}
