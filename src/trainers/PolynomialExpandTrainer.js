class PolynomialExpandTrainer extends BaseTrainer {
    constructor() {
        const savedSettings = localStorage.getItem('polynomialExpandSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            monomialByPolynomial: true,
            polynomialByPolynomial: false
        };

        super({
            name: 'polynomialExpand',
            generator: new PolynomialExpandGenerator(settings),
            progressTracker: new ProgressTracker('polynomialExpandProgress'),
            settings: settings,
            storageKey: 'polynomialExpandSettings'
        });

        this.monomialInputs = [];
        this.draggedVariable = null;

        // Для touch events
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchElement = null;
        this.clone = null;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('polynomial-expand-screen'),
            backBtn: document.getElementById('polynomial-expand-back-btn'),
            settingsBtn: document.getElementById('polynomial-expand-settings-btn'),
            checkBtn: document.getElementById('polynomial-expand-check-btn'),
            settingsScreen: document.getElementById('polynomial-expand-settings-screen'),
            settingsBackBtn: document.getElementById('polynomial-expand-settings-back-btn'),

            levelText: document.getElementById('polynomial-expand-level-text'),
            progressText: document.getElementById('polynomial-expand-progress-text'),
            progressFill: document.getElementById('polynomial-expand-progress-fill'),
            resultMessage: document.getElementById('polynomial-expand-result-message'),
            problemDisplay: document.getElementById('polynomial-expand-problem-display'),

            answerContainer: document.getElementById('polynomial-expand-answer-container'),
            addMonomialBtn: document.getElementById('add-monomial-btn'),
            variablesPanel: document.getElementById('variables-panel')
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
    }

    initSettingsHandlers() {
        const monomialCheckbox = document.getElementById('expand-type-monomial');
        const polynomialCheckbox = document.getElementById('expand-type-polynomial');

        if (monomialCheckbox && polynomialCheckbox) {
            monomialCheckbox.checked = this.settings.monomialByPolynomial;
            polynomialCheckbox.checked = this.settings.polynomialByPolynomial;

            monomialCheckbox.addEventListener('change', (e) => {
                this.settings.monomialByPolynomial = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });

            polynomialCheckbox.addEventListener('change', (e) => {
                this.settings.polynomialByPolynomial = e.target.checked;
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
                // Убираем подсветку со всех одночленов
                document.querySelectorAll('.monomial-input').forEach(el => {
                    el.classList.remove('drag-over');
                });
            });

            varElement.addEventListener('click', () => {
                if (this.monomialInputs.length > 0) {
                    const lastMonomial = this.monomialInputs[this.monomialInputs.length - 1];
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

    displayProblem(problem) {
        if (!problem) {
            console.error('Problem is null or undefined');
            return;
        }

        this.elements.problemDisplay.innerHTML = '';

        const expressionElem = document.createElement('div');
        expressionElem.className = 'problem-expression';

        if (typeof katex !== 'undefined') {
            katex.render(problem.expression, expressionElem, {
                throwOnError: false,
                displayMode: true
            });
        } else {
            expressionElem.textContent = problem.expression;
        }

        this.elements.problemDisplay.appendChild(expressionElem);

        this.monomialInputs = [];
        this.elements.answerContainer.innerHTML = '';
        this.elements.answerContainer.appendChild(this.elements.addMonomialBtn);

        // Добавляем один одночлен по умолчанию
        this.addMonomialInput();
    }

    addMonomialInput() {
        const index = this.monomialInputs.length;

        const monomialInput = new MonomialInput(
            index,
            () => this.handleMonomialUpdate(),
            (idx) => this.removeMonomialInput(idx)
        );

        this.monomialInputs.push(monomialInput);
        this.elements.answerContainer.insertBefore(monomialInput.element, this.elements.addMonomialBtn);
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
    }

    clearInputs() {
        this.monomialInputs.forEach(input => input.remove());
        this.monomialInputs = [];
        this.elements.answerContainer.innerHTML = '';
        this.elements.answerContainer.appendChild(this.elements.addMonomialBtn);
    }

    checkAnswer() {
        if (!this.currentProblem) return;

        const userMonomials = this.monomialInputs
            .map(input => input.toMonomial())
            .filter(m => m !== null);

        if (userMonomials.length === 0) {
            this.handleWrongAnswer();
            return;
        }

        const userPolynomial = new Polynomial(userMonomials).simplify();

        const correctResult = this.currentProblem.result;

        let isCorrect = false;

        if (typeof correctResult === 'number') {
            if (typeof userPolynomial === 'number') {
                isCorrect = userPolynomial === correctResult;
            } else if (userPolynomial instanceof Monomial) {
                isCorrect = userPolynomial.coefficient === correctResult &&
                           userPolynomial.powers.length === 0;
            }
        } else if (correctResult instanceof Monomial) {
            if (userPolynomial instanceof Monomial) {
                isCorrect = this.compareMonomials(userPolynomial, correctResult);
            }
        } else if (correctResult instanceof Polynomial) {
            if (userPolynomial instanceof Polynomial) {
                isCorrect = this.comparePolynomials(userPolynomial, correctResult);
            } else if (userPolynomial instanceof Monomial) {
                if (correctResult.monomials.length === 1) {
                    isCorrect = this.compareMonomials(userPolynomial, correctResult.monomials[0]);
                }
            }
        }

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
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

    comparePolynomials(p1, p2) {
        if (p1.monomials.length !== p2.monomials.length) return false;

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

    hasOperationsSelected() {
        return this.settings.monomialByPolynomial || this.settings.polynomialByPolynomial;
    }

    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Не выбран ни один тип задачи</span>';
        this.elements.answerContainer.style.display = 'none';
    }

    hideNoOperationsMessage() {
        this.elements.answerContainer.style.display = 'flex';
    }

    disableInputs() {
        super.disableInputs();
        this.elements.answerContainer.classList.add('disabled');
        this.elements.addMonomialBtn.disabled = true;

        // Очищаем touch состояние, если оно было активно
        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }
        if (this.touchElement) {
            this.touchElement.style.opacity = '1';
            this.touchElement = null;
        }
        document.querySelectorAll('.monomial-input').forEach(el => {
            el.classList.remove('drag-over');
        });
    }

    enableInputs() {
        super.enableInputs();
        this.elements.answerContainer.classList.remove('disabled');
        this.elements.addMonomialBtn.disabled = false;
    }

    handleCorrectAnswer() {
        this.showResultMessage('Правильно!', 'success');
        this.disableInputs();
        this.showEmoji(true);

        const result = this.progressTracker.correctAnswer();
        this.updateProgressDisplay();

        if (result.levelUp) {
            this.showResultMessage(`Переход на ${result.newLevel} уровень!`, 'success');
        }

        setTimeout(() => {
            this.clearInputs();
            this.generateNewProblem();
            this.enableInputs();
            this.hideResultMessage();
        }, 1500);
    }

    handleWrongAnswer() {
        this.showResultMessage('Неправильно', 'error');
        this.disableInputs();
        this.showEmoji(false);
        this.progressTracker.wrongAnswer();
        this.updateProgressDisplay();

        setTimeout(() => {
            this.enableInputs();
            this.hideResultMessage();
        }, 1500);
    }

    showEmoji(isCorrect) {
        const correctEmojis = ['🎉', '✨', '🌟', '💫', '🎊', '👏', '🎯', '⭐', '💪', '🔥'];
        const wrongEmojis = ['😢', '😞', '😔', '💔', '😓', '😰', '😥', '🤔', '😕', '😖'];

        const emojis = isCorrect ? correctEmojis : wrongEmojis;
        const container = document.getElementById('emoji-container');
        if (!container) return;

        const count = Math.floor(Math.random() * 4) + 5;

        for (let i = 0; i < count; i++) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            const particle = document.createElement('div');
            particle.className = 'emoji-particle';
            particle.textContent = emoji;

            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            container.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    showResultMessage(message, type) {
        this.elements.resultMessage.textContent = message;
        this.elements.resultMessage.className = `result-message ${type}`;
        this.elements.resultMessage.style.display = 'block';
    }

    hideResultMessage() {
        this.elements.resultMessage.style.display = 'none';
    }

    updateProgressDisplay() {
        this.elements.levelText.textContent = this.progressTracker.getLevelName();
        this.elements.progressText.textContent = this.progressTracker.getProgressText();

        const percentage = this.progressTracker.getProgressPercent();
        this.elements.progressFill.style.width = `${percentage}%`;
    }

    showSettingsScreen() {
        this.showScreen('polynomial-expand-settings-screen');
    }

    hideSettingsScreen() {
        this.showScreen('polynomial-expand-screen');
    }

    showScreen(screenId) {
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => screen.style.display = 'none');

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
    }

    // Touch events для мобильных устройств
    handleVariableTouchStart(e, variable) {
        e.preventDefault();

        this.touchElement = e.target;
        if (!this.touchElement) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;

        // Создаём клон элемента для визуального перетаскивания
        this.clone = this.touchElement.cloneNode(true);
        this.clone.classList.add('variable-chip-dragging-clone');
        this.clone.style.position = 'fixed';
        this.clone.style.zIndex = '1000';
        this.clone.style.pointerEvents = 'none';
        this.clone.style.left = touch.clientX + 'px';
        this.clone.style.top = touch.clientY + 'px';
        this.clone.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(this.clone);

        // Добавляем класс к оригинальному элементу
        this.touchElement.style.opacity = '0.5';
    }

    handleVariableTouchMove(e) {
        if (!this.touchElement || !this.clone) return;
        e.preventDefault();

        const touch = e.touches[0];

        // Перемещаем клон
        this.clone.style.left = touch.clientX + 'px';
        this.clone.style.top = touch.clientY + 'px';

        // Находим элемент под пальцем
        this.clone.style.display = 'none';
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        this.clone.style.display = '';

        // Убираем подсветку со всех мономов
        document.querySelectorAll('.monomial-input').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Добавляем подсветку целевому элементу
        const targetElement = elementBelow?.closest('.monomial-input');
        if (targetElement) {
            targetElement.classList.add('drag-over');
        }
    }

    handleVariableTouchEnd(e, variable) {
        if (!this.touchElement) return;
        e.preventDefault();

        const touch = e.changedTouches[0];

        // Находим элемент под пальцем
        if (this.clone) {
            this.clone.style.display = 'none';
        }
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);

        // Удаляем клон
        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }

        // Восстанавливаем оригинальный элемент
        this.touchElement.style.opacity = '1';

        // Убираем подсветку
        document.querySelectorAll('.monomial-input').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Обрабатываем drop
        const targetMonomial = elementBelow?.closest('.monomial-input');
        if (targetMonomial) {
            const index = parseInt(targetMonomial.dataset.index);
            if (!isNaN(index) && this.monomialInputs[index]) {
                this.monomialInputs[index].addVariable(variable);
            }
        }

        this.touchElement = null;
    }
}
