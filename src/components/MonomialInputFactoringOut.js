// Специальная версия MonomialInput для тренажёра вынесения за скобки
// Отличие: для множителя за скобками нельзя выбрать коэффициент 0
class MonomialInputFactoringOut {
    constructor(index, onUpdate, onRemove, isFactorOutside) {
        this.index = index;
        this.onUpdate = onUpdate;
        this.onRemove = onRemove;
        this.isFactorOutside = isFactorOutside;  // true - множитель за скобками, false - внутри

        this.sign = '+';
        this.coefficient = 1;
        this.variables = {};

        this.element = this.createElement();
    }

    createElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'monomial-input monomial-input-fo';
        wrapper.dataset.index = this.index;
        wrapper.dataset.type = this.isFactorOutside ? 'factor' : 'bracket';

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
            if (!this.element) return;
            contentElement = this.element.querySelector('.monomial-content');
        }

        if (!contentElement) return;

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

        const wheel = this.createValueWheel(variable, value);
        wrapper.appendChild(wheel);

        return wrapper;
    }

    createValueWheel(variable, initialValue) {
        const ITEM_HEIGHT = 36;
        const HEIGHT = 108;

        // Генерируем значения для колеса
        let values;
        if (variable === 'coeff') {
            if (this.isFactorOutside) {
                // Для множителя за скобками: 1 до 20 (без 0)
                values = Array.from({ length: 20 }, (_, i) => i + 1);
            } else {
                // Для мономов внутри скобок: 0 до 20
                values = Array.from({ length: 21 }, (_, i) => i);
            }
        } else {
            values = Array.from({ length: 10 }, (_, i) => i); // 0 до 9
        }

        const container = document.createElement('div');
        container.className = 'polynomial-expand-picker-container polynomial-expand-picker-value';

        const inner = document.createElement('div');
        inner.className = 'polynomial-expand-picker-inner';

        const column = document.createElement('div');
        column.className = 'polynomial-expand-picker-column';

        const scroller = document.createElement('div');
        scroller.className = 'polynomial-expand-picker-scroller';

        let selectedIndex = values.indexOf(initialValue);
        if (selectedIndex === -1) selectedIndex = variable === 'coeff' ? (this.isFactorOutside ? 0 : 1) : 0;

        let touchStartY = 0;
        let scrollerStartY = 0;
        let currentScrollY = 0;
        let lastWheelTime = 0;
        const wheelThrottle = 150;

        values.forEach((val, index) => {
            const item = document.createElement('div');
            item.className = 'polynomial-expand-picker-item';
            item.dataset.index = index;
            item.dataset.value = val;

            if (variable === 'coeff') {
                item.textContent = val;
            } else {
                if (val === 0) {
                    item.textContent = '';
                } else if (val === 1) {
                    if (typeof katex !== 'undefined') {
                        katex.render(variable, item, { throwOnError: false });
                    } else {
                        item.textContent = variable;
                    }
                } else {
                    if (typeof katex !== 'undefined') {
                        katex.render(`${variable}^{${val}}`, item, { throwOnError: false });
                    } else {
                        const span = document.createElement('span');
                        span.innerHTML = `${variable}<sup>${val}</sup>`;
                        item.appendChild(span);
                    }
                }
            }

            scroller.appendChild(item);
        });

        const highlight = document.createElement('div');
        highlight.className = 'polynomial-expand-picker-highlight';

        const updateSelection = () => {
            const items = scroller.querySelectorAll('.polynomial-expand-picker-item');
            items.forEach((item, i) => {
                if (i === selectedIndex) {
                    item.classList.add('polynomial-expand-picker-item-selected');
                } else {
                    item.classList.remove('polynomial-expand-picker-item-selected');
                }
            });
        };

        const scrollToIndex = (index) => {
            const newIndex = Math.max(0, Math.min(values.length - 1, index));
            selectedIndex = newIndex;
            const y = HEIGHT / 2 - ITEM_HEIGHT / 2 - selectedIndex * ITEM_HEIGHT;
            currentScrollY = y;
            scroller.style.transform = `translate3d(0, ${y}px, 0)`;
            updateSelection();

            const oldValue = variable === 'coeff' ? this.coefficient : this.variables[variable];
            const newValue = values[selectedIndex];

            if (variable === 'coeff') {
                this.coefficient = newValue;
            } else {
                if (newValue === 0) {
                    delete this.variables[variable];
                } else {
                    this.variables[variable] = newValue;
                }
            }

            // Проверяем, нужно ли удалить одночлен
            if (this.coefficient === 0 && Object.keys(this.variables).length === 0) {
                if (this.onRemove) {
                    this.onRemove(this.index);
                }
                return;
            }

            // Обновляем отображение только если значение изменилось
            if (oldValue !== newValue) {
                this.smartRefreshDisplay();
            }

            if (this.onUpdate) {
                this.onUpdate();
            }
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
            const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
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
            const item = e.target.closest('.polynomial-expand-picker-item');
            if (item) {
                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    scrollToIndex(index);
                }
            }
        });

        scrollToIndex(selectedIndex);

        column.appendChild(scroller);
        column.appendChild(highlight);
        inner.appendChild(column);
        container.appendChild(inner);

        return container;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';

        // Убираем подсветку со всех одночленов
        document.querySelectorAll('.monomial-input').forEach(el => {
            el.classList.remove('drag-over');
        });

        // Добавляем подсветку текущему элементу
        this.element.classList.add('drag-over');
    }

    handleDragLeave(e) {
        // Этот метод больше не нужен, так как подсветка управляется через dragover
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
        if (this.onUpdate) {
            this.onUpdate();
        }
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
        container.className = 'polynomial-expand-picker-container polynomial-expand-picker-sign';

        const inner = document.createElement('div');
        inner.className = 'polynomial-expand-picker-inner';

        const column = document.createElement('div');
        column.className = 'polynomial-expand-picker-column';

        const scroller = document.createElement('div');
        scroller.className = 'polynomial-expand-picker-scroller';

        let selectedIndex = 0;
        let touchStartY = 0;
        let scrollerStartY = 0;
        let currentScrollY = 0;
        let lastWheelTime = 0;
        const wheelThrottle = 150;

        signs.forEach((sign, index) => {
            const item = document.createElement('div');
            item.className = 'polynomial-expand-picker-item';
            item.dataset.index = index;
            item.dataset.value = sign.value;
            item.textContent = sign.display;
            scroller.appendChild(item);
        });

        const highlight = document.createElement('div');
        highlight.className = 'polynomial-expand-picker-highlight';

        const updateSelection = () => {
            const items = scroller.querySelectorAll('.polynomial-expand-picker-item');
            items.forEach((item, i) => {
                if (i === selectedIndex) {
                    item.classList.add('polynomial-expand-picker-item-selected');
                } else {
                    item.classList.remove('polynomial-expand-picker-item-selected');
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
            const oldSign = this.sign;
            this.sign = signs[selectedIndex].value;
            if (oldSign !== this.sign) {
                this.smartRefreshDisplay();
            }
            if (this.onUpdate) {
                this.onUpdate();
            }
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
            const item = e.target.closest('.polynomial-expand-picker-item');
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

    smartRefreshDisplay() {
        // Проверяем, есть ли переменные
        const hasVars = Object.keys(this.variables).length > 0;

        // Если нет переменных и коэффициент = 1, нужно убедиться что элемент коэффициента существует
        if (!hasVars && this.coefficient === 1) {
            const contentElement = this.element.querySelector('.monomial-content');
            if (!contentElement) return;

            // Проверяем, есть ли уже элемент коэффициента
            const coeffWrapper = Array.from(contentElement.querySelectorAll('.variable-wrapper'))
                .find(w => {
                    const picker = w.querySelector('.polynomial-expand-picker-container');
                    if (!picker) return false;
                    const selectedItem = picker.querySelector('.polynomial-expand-picker-item-selected');
                    if (!selectedItem) return false;
                    const text = selectedItem.textContent.trim();
                    return !isNaN(parseInt(text)) && text.length <= 2;
                });

            // Если элемента коэффициента нет, создаем содержимое заново
            if (!coeffWrapper) {
                this.updateContent();
                return;
            }
        }

        // Иначе используем обычный refresh
        this.refreshDisplay();
    }

    refreshDisplay() {
        // Обновляем только видимость элементов без пересоздания picker-колес
        const contentElement = this.element.querySelector('.monomial-content');
        if (!contentElement) return;

        // Подсчитываем количество видимых переменных (не включая коэффициент)
        let visibleVarsCount = 0;
        const wrappers = contentElement.querySelectorAll('.variable-wrapper');

        wrappers.forEach(wrapper => {
            const picker = wrapper.querySelector('.polynomial-expand-picker-value');
            if (!picker) return;

            const items = picker.querySelectorAll('.polynomial-expand-picker-item-selected');
            if (items.length === 0) return;

            const selectedItem = items[0];
            const value = parseInt(selectedItem.dataset.value);

            // Скрываем wrapper если значение = 0
            if (value === 0 || isNaN(value)) {
                wrapper.style.display = 'none';
            } else {
                wrapper.style.display = 'inline-flex';
                visibleVarsCount++;
            }
        });

        // Проверяем коэффициент - отдельно считаем без учета в visibleVarsCount
        const coeffWrapper = Array.from(contentElement.querySelectorAll('.variable-wrapper'))
            .find(w => {
                const picker = w.querySelector('.polynomial-expand-picker-container');
                if (!picker) return false;
                const selectedItem = picker.querySelector('.polynomial-expand-picker-item-selected');
                if (!selectedItem) return false;
                const text = selectedItem.textContent.trim();
                return !isNaN(parseInt(text)) && text.length <= 2; // Коэффициент это число до 20
            });

        if (coeffWrapper) {
            // Если это коэффициент, уменьшаем счетчик (он был посчитан выше)
            visibleVarsCount--;

            const hasOtherVars = visibleVarsCount > 0;

            // Показываем коэффициент только если:
            // 1. Коэффициент != 1, ИЛИ
            // 2. Коэффициент = 1 И нет других переменных
            if (this.coefficient === 1 && hasOtherVars) {
                coeffWrapper.style.display = 'none';
            } else {
                coeffWrapper.style.display = 'inline-flex';
            }
        }
    }

    remove() {
        this.element.remove();
    }

    updateIndex(newIndex) {
        this.index = newIndex;
        this.element.dataset.index = newIndex;
    }
}
