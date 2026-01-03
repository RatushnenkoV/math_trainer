class MonomialInput {
    constructor(index, onUpdate, onRemove) {
        this.index = index;
        this.onUpdate = onUpdate;
        this.onRemove = onRemove;

        this.sign = '+';
        this.coefficient = 1;
        this.variables = {};

        this.element = this.createElement();
    }

    createElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'monomial-input';
        wrapper.dataset.index = this.index;

        const signWheel = this.createSignWheel();

        const content = document.createElement('div');
        content.className = 'monomial-content';
        content.addEventListener('dragover', (e) => this.handleDragOver(e));
        content.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        content.addEventListener('drop', (e) => this.handleDrop(e));

        this.updateContent(content);

        wrapper.appendChild(signWheel);
        wrapper.appendChild(content);

        return wrapper;
    }

    updateContent(contentElement) {
        if (!contentElement) {
            contentElement = this.element.querySelector('.monomial-content');
        }

        contentElement.innerHTML = '';

        if (this.coefficient === 0 && Object.keys(this.variables).length === 0) {
            contentElement.innerHTML = '<span class="empty-monomial">перетащите сюда</span>';
            return;
        }

        if (this.coefficient !== 0 && this.coefficient !== 1) {
            const coeffElement = this.createVariableElement('coeff', this.coefficient);
            contentElement.appendChild(coeffElement);
        } else if (this.coefficient === 1 && Object.keys(this.variables).length === 0) {
            const coeffElement = this.createVariableElement('coeff', 1);
            contentElement.appendChild(coeffElement);
        }

        const sortedVars = Object.entries(this.variables).sort((a, b) => a[0].localeCompare(b[0]));
        sortedVars.forEach(([variable, power]) => {
            if (power > 0) {
                const varElement = this.createVariableElement(variable, power);
                contentElement.appendChild(varElement);
            }
        });
    }

    createVariableElement(variable, value) {
        const wrapper = document.createElement('div');
        wrapper.className = 'variable-wrapper';

        const upBtn = document.createElement('button');
        upBtn.className = 'var-button var-up';
        upBtn.innerHTML = '▲';
        upBtn.addEventListener('click', () => this.incrementValue(variable));

        const display = document.createElement('div');
        display.className = 'variable-display';

        if (variable === 'coeff') {
            display.textContent = value;
        } else {
            if (value === 1) {
                display.textContent = variable;
            } else {
                display.innerHTML = `${variable}<sup>${value}</sup>`;
            }
        }

        const downBtn = document.createElement('button');
        downBtn.className = 'var-button var-down';
        downBtn.innerHTML = '▼';
        downBtn.addEventListener('click', () => this.decrementValue(variable));

        wrapper.appendChild(upBtn);
        wrapper.appendChild(display);
        wrapper.appendChild(downBtn);

        return wrapper;
    }

    incrementValue(variable) {
        if (variable === 'coeff') {
            this.coefficient++;
        } else {
            this.variables[variable] = (this.variables[variable] || 0) + 1;
        }
        this.updateContent();
        this.onUpdate();
    }

    decrementValue(variable) {
        if (variable === 'coeff') {
            this.coefficient--;
            if (this.coefficient < 0) this.coefficient = 0;
        } else {
            if (this.variables[variable] > 0) {
                this.variables[variable]--;
                if (this.variables[variable] === 0) {
                    delete this.variables[variable];
                }
            }
        }

        if (this.coefficient === 0 && Object.keys(this.variables).length === 0) {
            this.onRemove(this.index);
            return;
        }

        this.updateContent();
        this.onUpdate();
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        this.element.classList.add('drag-over');
    }

    handleDragLeave(e) {
        if (e.target === this.element.querySelector('.monomial-content')) {
            this.element.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.element.classList.remove('drag-over');

        const variable = e.dataTransfer.getData('text/plain');
        this.addVariable(variable);
    }

    addVariable(variable) {
        if (variable === '1') {
            this.coefficient++;
        } else {
            this.variables[variable] = (this.variables[variable] || 0) + 1;
        }
        this.updateContent();
        this.onUpdate();
    }

    toMonomial() {
        if (this.coefficient === 0 && Object.keys(this.variables).length === 0) {
            return null;
        }

        let coeff = this.coefficient;
        if (Object.keys(this.variables).length > 0 && this.coefficient === 0) {
            coeff = 1;
        }

        if (this.sign === '-') {
            coeff = -coeff;
        }

        const powers = [];
        for (const [variable, power] of Object.entries(this.variables)) {
            if (power > 0) {
                powers.push(new Power(variable, power));
            }
        }

        return new Monomial(coeff, powers);
    }

    createSignWheel() {
        const ITEM_HEIGHT = 36;
        const HEIGHT = 108;
        const signs = [
            { value: '+', display: '+' },
            { value: '-', display: '−' }
        ];

        const container = document.createElement('div');
        container.className = 'picker-container picker-sign';

        const inner = document.createElement('div');
        inner.className = 'picker-inner';

        const column = document.createElement('div');
        column.className = 'picker-column';

        const scroller = document.createElement('div');
        scroller.className = 'picker-scroller';

        let selectedIndex = 0;
        let touchStartY = 0;
        let scrollerStartY = 0;
        let currentScrollY = 0;
        let lastWheelTime = 0;
        const wheelThrottle = 150;

        signs.forEach((sign, index) => {
            const item = document.createElement('div');
            item.className = 'picker-item';
            item.dataset.index = index;
            item.dataset.value = sign.value;
            item.textContent = sign.display;
            scroller.appendChild(item);
        });

        const highlight = document.createElement('div');
        highlight.className = 'picker-highlight';

        const updateSelection = () => {
            const items = scroller.querySelectorAll('.picker-item');
            items.forEach((item, i) => {
                if (i === selectedIndex) {
                    item.classList.add('picker-item-selected');
                } else {
                    item.classList.remove('picker-item-selected');
                }
            });
        };

        const scrollToIndex = (index) => {
            const newIndex = Math.max(0, Math.min(signs.length - 1, index));
            selectedIndex = newIndex;
            const y = HEIGHT / 2 - ITEM_HEIGHT / 2 - selectedIndex * ITEM_HEIGHT;
            currentScrollY = y;
            scroller.style.transform = `translate3d(0, ${y}px, 0)`;
            updateSelection();
            this.sign = signs[selectedIndex].value;
            this.onUpdate();
        };

        const handleTouchStart = (clientY) => {
            touchStartY = clientY;
            scrollerStartY = currentScrollY;
            scroller.style.transition = 'none';
        };

        const handleTouchMove = (clientY) => {
            const deltaY = clientY - touchStartY;
            const y = scrollerStartY + deltaY;
            currentScrollY = y;
            scroller.style.transform = `translate3d(0, ${y}px, 0)`;
        };

        const handleTouchEnd = () => {
            const finalY = currentScrollY;
            const rawIndex = (HEIGHT / 2 - ITEM_HEIGHT / 2 - finalY) / ITEM_HEIGHT;
            const index = Math.round(rawIndex);
            const clampedIndex = Math.max(0, Math.min(signs.length - 1, index));
            scroller.style.transition = '300ms';
            scrollToIndex(clampedIndex);
            touchStartY = 0;
        };

        column.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleTouchStart(e.touches[0].clientY);
        }, { passive: false });

        column.addEventListener('touchmove', (e) => {
            e.preventDefault();
            handleTouchMove(e.touches[0].clientY);
        }, { passive: false });

        column.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleTouchEnd();
        }, { passive: false });

        column.addEventListener('wheel', (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now - lastWheelTime < wheelThrottle) {
                return;
            }
            lastWheelTime = now;
            const delta = e.deltaY > 0 ? 1 : -1;
            scrollToIndex(selectedIndex + delta);
        }, { passive: false });

        scroller.addEventListener('click', (e) => {
            const item = e.target.closest('.picker-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    scrollToIndex(index);
                }
            }
        });

        scrollToIndex(0);

        column.appendChild(scroller);
        column.appendChild(highlight);
        inner.appendChild(column);
        container.appendChild(inner);

        return container;
    }

    remove() {
        this.element.remove();
    }

    updateIndex(newIndex) {
        this.index = newIndex;
        this.element.dataset.index = newIndex;
    }
}
