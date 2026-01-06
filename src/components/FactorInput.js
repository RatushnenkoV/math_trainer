// Компонент для ввода одного множителя (скобки) в разложении на множители
// Например: (a + b)² или просто (a - b)
class FactorInput {
    constructor(index, onUpdate, onRemove) {
        this.index = index;
        this.onUpdate = onUpdate;
        this.onRemove = onRemove;

        this.hasBrackets = true; // Есть ли скобки вокруг выражения
        this.power = 1; // Степень скобки
        this.monomials = []; // Мономы внутри скобки (для построения многочлена)

        this.element = this.createElement();
    }

    createElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'factor-input';
        wrapper.dataset.index = this.index;

        // Контейнер для кнопок управления
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'factor-controls';

        // Кнопка: убрать степень ()
        const noPowerBtn = document.createElement('button');
        noPowerBtn.className = 'factor-control-btn';
        noPowerBtn.innerHTML = '( )';
        noPowerBtn.title = 'Без степени';
        noPowerBtn.addEventListener('click', () => this.setPower(1));

        // Кнопка: степень 2 ()²
        const power2Btn = document.createElement('button');
        power2Btn.className = 'factor-control-btn';
        power2Btn.innerHTML = '( )<sup>2</sup>';
        power2Btn.title = 'Квадрат';
        power2Btn.addEventListener('click', () => this.setPower(2));

        // Кнопка: степень 3 ()³
        const power3Btn = document.createElement('button');
        power3Btn.className = 'factor-control-btn';
        power3Btn.innerHTML = '( )<sup>3</sup>';
        power3Btn.title = 'Куб';
        power3Btn.addEventListener('click', () => this.setPower(3));

        controlsContainer.appendChild(noPowerBtn);
        controlsContainer.appendChild(power2Btn);
        controlsContainer.appendChild(power3Btn);

        // Контейнер для отображения с KaTeX
        const displayContainer = document.createElement('div');
        displayContainer.className = 'factor-display';

        // Нижний ряд с кнопками
        const bottomRow = document.createElement('div');
        bottomRow.className = 'factor-bottom-row';

        // Кнопка добавления монома
        const addBtn = document.createElement('button');
        addBtn.className = 'add-monomial-in-factor-btn';
        addBtn.innerHTML = '<span class="plus-icon">+</span>';
        addBtn.title = 'Добавить моном';
        addBtn.addEventListener('click', () => this.addMonomial());

        // Кнопка удаления множителя
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-factor-btn';
        removeBtn.textContent = '×';
        removeBtn.title = 'Удалить множитель';
        removeBtn.addEventListener('click', () => {
            if (this.onRemove) {
                this.onRemove(this.index);
            }
        });

        bottomRow.appendChild(addBtn);
        bottomRow.appendChild(removeBtn);

        wrapper.appendChild(controlsContainer);
        wrapper.appendChild(displayContainer);
        wrapper.appendChild(bottomRow);

        // Устанавливаем this.element перед обновлением отображения
        this.element = wrapper;
        this.updateDisplay();

        return wrapper;
    }

    toggleBrackets() {
        this.hasBrackets = !this.hasBrackets;
        if (!this.hasBrackets) {
            this.power = 1;
        }
        this.updateDisplay();
        if (this.onUpdate) this.onUpdate();
    }

    setPower(power) {
        this.power = power;
        this.hasBrackets = true; // Устанавливаем скобки автоматически
        this.updateDisplay();
        if (this.onUpdate) this.onUpdate();
    }

    updateDisplay() {
        const displayContainer = this.element.querySelector('.factor-display');
        if (!displayContainer) return;

        displayContainer.innerHTML = '';

        // Если нет скобок, просто отображаем MonomialInput'ы
        if (!this.hasBrackets) {
            // Контейнер для содержимого (MonomialInput'ы)
            const content = document.createElement('div');
            content.className = 'factor-content';

            this.monomials.forEach(monomialInput => {
                content.appendChild(monomialInput.element);
            });

            displayContainer.appendChild(content);
            return;
        }

        // Если есть скобки, показываем скобки + MonomialInput'ы
        const wrapper = document.createElement('div');
        wrapper.className = 'factor-with-brackets';

        // Левая скобка
        const leftBracket = document.createElement('span');
        leftBracket.className = 'factor-bracket-left';
        leftBracket.textContent = '(';

        // Контейнер для содержимого (MonomialInput'ы)
        const content = document.createElement('div');
        content.className = 'factor-content';

        this.monomials.forEach(monomialInput => {
            content.appendChild(monomialInput.element);
        });

        // Правая скобка
        const rightBracket = document.createElement('span');
        rightBracket.className = 'factor-bracket-right';
        rightBracket.textContent = ')';

        // Степень
        const powerDisplay = document.createElement('span');
        powerDisplay.className = 'factor-power';
        if (this.power > 1) {
            powerDisplay.innerHTML = `<sup>${this.power}</sup>`;
        }

        wrapper.appendChild(leftBracket);
        wrapper.appendChild(content);
        wrapper.appendChild(rightBracket);
        wrapper.appendChild(powerDisplay);

        displayContainer.appendChild(wrapper);
    }

    getPolynomial() {
        try {
            const monomialObjects = this.monomials
                .map(m => {
                    try {
                        return m.toMonomial();
                    } catch (e) {
                        console.error('Error converting monomial:', e);
                        return null;
                    }
                })
                .filter(m => m !== null);

            if (monomialObjects.length === 0) {
                return null;
            }

            return new Polynomial(monomialObjects).simplify();
        } catch (e) {
            console.error('Error creating polynomial:', e);
            return null;
        }
    }



    addMonomial() {
        const newMonomial = new MonomialInput(
            this.monomials.length,
            () => this.handleMonomialUpdate(),
            (idx) => this.removeMonomialFromFactor(idx)
        );
        this.monomials.push(newMonomial);
        this.updateDisplay();
        if (this.onUpdate) this.onUpdate();
    }

    removeMonomialFromFactor(index) {
        if (index >= 0 && index < this.monomials.length) {
            this.monomials.splice(index, 1);
            // Переиндексируем
            this.monomials.forEach((m, i) => m.updateIndex(i));
            this.updateDisplay();
            if (this.onUpdate) this.onUpdate();
        }
    }

    handleMonomialUpdate() {
        this.updateDisplay();
        if (this.onUpdate) this.onUpdate();
    }

    addVariable(variable) {
        // Добавляем переменную в последний моном, или создаем новый если мономов нет
        if (this.monomials.length === 0) {
            this.addMonomial();
        }

        // Добавляем переменную в последний моном
        const lastMonomial = this.monomials[this.monomials.length - 1];
        if (lastMonomial) {
            lastMonomial.addVariable(variable);
        }
    }

    updateIndex(newIndex) {
        this.index = newIndex;
        this.element.dataset.index = newIndex;
    }

    toFactorData() {
        // Возвращает данные множителя для проверки
        if (this.monomials.length === 0) {
            return null;
        }

        const monomialObjects = this.monomials
            .map(m => m.toMonomial())
            .filter(m => m !== null);

        if (monomialObjects.length === 0) {
            return null;
        }

        const polynomial = new Polynomial(monomialObjects).simplify();

        return {
            polynomial: polynomial,
            power: this.hasBrackets ? this.power : 1,
            hasBrackets: this.hasBrackets
        };
    }

    remove() {
        this.element.remove();
    }
}
