// Тренажёр приведения подобных членов многочлена
class PolynomialSimplificationTrainer extends BaseTrainer {
    constructor() {
        const settings = {
            minMonomials: 4,
            maxMonomials: 6,
            maxCoefficient: 10,
            maxDegree: 3,
            negativeCoefficients: true
        };

        super({
            name: 'polynomial-simplification',
            generator: new PolynomialSimplificationGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerPolynomialSimplificationProgress'),
            settings: settings,
            storageKey: 'mathTrainerPolynomialSimplificationSettings'
        });

        this.currentMonomials = [];  // Текущие одночлены для отображения
        this.combinedPairs = [];     // Пары уже приведённых одночленов
        this.draggedElement = null;
        this.modalData = null;

        // Для touch events
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchElement = null;
        this.clone = null;
    }

    initDOM() {
        this.elements = {
            screen: document.getElementById('polynomial-simplification-screen'),
            backBtn: document.getElementById('polynomial-simplification-back-btn'),
            settingsBtn: document.getElementById('polynomial-simplification-settings-btn'),
            settingsScreen: document.getElementById('polynomial-simplification-settings-screen'),
            settingsBackBtn: document.getElementById('polynomial-simplification-settings-back-btn'),
            checkBtn: document.getElementById('polynomial-simplification-check-btn'),

            levelText: document.getElementById('polynomial-simplification-level-text'),
            progressText: document.getElementById('polynomial-simplification-progress-text'),
            progressFill: document.getElementById('polynomial-simplification-progress-fill'),
            resultMessage: document.getElementById('polynomial-simplification-result-message'),
            problemDisplay: document.getElementById('polynomial-simplification-problem-display'),

            // Модальное окно
            modal: document.getElementById('polynomial-combine-modal'),
            modalMonomial1: document.getElementById('polynomial-modal-monomial1'),
            modalMonomial2: document.getElementById('polynomial-modal-monomial2'),
            modalCoefficientInput: document.getElementById('polynomial-modal-coefficient-input'),
            modalLiteralPart: document.getElementById('polynomial-modal-literal-part'),
            modalOkBtn: document.getElementById('polynomial-modal-ok-btn'),
            modalCancelBtn: document.getElementById('polynomial-modal-cancel-btn'),

            // Кнопка "Поделиться"
            shareBtn: document.getElementById('polynomial-simplification-share-btn')
        };

        this.initEventHandlers();
        this.initModalHandlers();
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

    initModalHandlers() {
        this.elements.modalOkBtn.addEventListener('click', () => this.handleModalOk());
        this.elements.modalCancelBtn.addEventListener('click', () => this.hideModal());
        this.elements.modalCoefficientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleModalOk();
        });
    }

    hasOperationsSelected() {
        return true; // Для этого тренажёра всегда есть задания
    }

    displayProblem(problem) {
        this.currentMonomials = problem.monomials.map((m, i) => ({
            id: i,
            monomial: m,
            combined: false,
            literalKey: this.getLiteralKey(m)
        }));
        this.combinedPairs = [];
        this.renderMonomials();
    }

    renderMonomials() {
        this.elements.problemDisplay.innerHTML = '';

        // Отображаем только не скомбинированные одночлены
        const activeMonomials = this.currentMonomials.filter(m => !m.combined);

        activeMonomials.forEach((mData, displayIndex) => {
            const monomialDiv = document.createElement('div');
            monomialDiv.className = 'polynomial-monomial';
            monomialDiv.dataset.id = mData.id;
            monomialDiv.draggable = true;

            // Рендерим LaTeX с учётом знака
            let tex = mData.monomial.tex();

            // Для не первого одночлена добавляем знак
            if (displayIndex > 0 && !tex.startsWith('-')) {
                tex = '+' + tex;
            }

            katex.render(tex, monomialDiv, {
                throwOnError: false
            });

            // Обработчики drag-n-drop
            monomialDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
            monomialDiv.addEventListener('dragover', (e) => this.handleDragOver(e));
            monomialDiv.addEventListener('drop', (e) => this.handleDrop(e));
            monomialDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));

            // Обработчики touch events для мобильных устройств
            monomialDiv.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            monomialDiv.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
            monomialDiv.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

            this.elements.problemDisplay.appendChild(monomialDiv);
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('polynomial-dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';

        // Убираем подсветку со всех элементов
        document.querySelectorAll('.polynomial-monomial').forEach(el => {
            el.classList.remove('polynomial-drag-over');
        });

        // Добавляем подсветку текущему элементу
        const targetElement = e.target.closest('.polynomial-monomial');
        if (targetElement && targetElement !== this.draggedElement) {
            targetElement.classList.add('polynomial-drag-over');
        }

        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        const targetElement = e.target.closest('.polynomial-monomial');
        if (!targetElement || targetElement === this.draggedElement) {
            return false;
        }

        const draggedId = parseInt(this.draggedElement.dataset.id);
        const targetId = parseInt(targetElement.dataset.id);

        const draggedData = this.currentMonomials.find(m => m.id === draggedId);
        const targetData = this.currentMonomials.find(m => m.id === targetId);

        // Проверяем, подобные ли одночлены
        if (draggedData.literalKey === targetData.literalKey) {
            // Подобные - показываем модальное окно
            this.showModal(draggedData, targetData);
        } else {
            // Не подобные - показываем сообщение об ошибке, но продолжаем работу
            this.showResultMessage(false);
            this.showEmoji(false);
        }

        return false;
    }

    handleDragEnd(e) {
        e.target.classList.remove('polynomial-dragging');
        document.querySelectorAll('.polynomial-monomial').forEach(el => {
            el.classList.remove('polynomial-drag-over');
        });
    }

    showModal(monomial1Data, monomial2Data) {
        this.modalData = { monomial1Data, monomial2Data };

        // Отображаем одночлены в модальном окне
        katex.render(monomial1Data.monomial.tex(), this.elements.modalMonomial1, { throwOnError: false });
        katex.render(monomial2Data.monomial.tex(), this.elements.modalMonomial2, { throwOnError: false });

        // Отображаем буквенную часть (без знаков умножения)
        const literalPart = monomial1Data.monomial.powers.map(p => p.tex()).join('');
        katex.render(literalPart, this.elements.modalLiteralPart, { throwOnError: false });

        this.elements.modalCoefficientInput.value = '';
        this.elements.modal.style.display = 'flex';
        this.elements.modalCoefficientInput.focus();
    }

    hideModal() {
        this.elements.modal.style.display = 'none';
        this.modalData = null;
    }

    handleModalOk() {
        if (!this.modalData) return;

        const input = this.elements.modalCoefficientInput.value.trim().replace(',', '.');
        const userCoefficient = parseFloat(input);

        if (isNaN(userCoefficient)) {
            alert('Введите корректный коэффициент');
            return;
        }

        const { monomial1Data, monomial2Data } = this.modalData;
        const correctCoefficient = monomial1Data.monomial.coefficient + monomial2Data.monomial.coefficient;

        if (userCoefficient === correctCoefficient) {
            // Правильно!
            // Отмечаем оба одночлена как скомбинированные
            monomial1Data.combined = true;
            monomial2Data.combined = true;

            // Если коэффициент не равен нулю, создаём новый одночлен
            if (userCoefficient !== 0) {
                const newMonomial = new Monomial(userCoefficient, monomial1Data.monomial.powers);

                // Добавляем новый одночлен
                this.currentMonomials.push({
                    id: this.currentMonomials.length,
                    monomial: newMonomial,
                    combined: false,
                    literalKey: monomial1Data.literalKey
                });
            }
            // Если коэффициент равен нулю, одночлен просто исчезает (оба уже помечены как combined)

            // Сохраняем информацию о паре
            this.combinedPairs.push({
                monomial1: monomial1Data.id,
                monomial2: monomial2Data.id,
                result: userCoefficient
            });

            // Перерисовываем
            this.renderMonomials();
        } else {
            // Неправильно - показываем сообщение, но продолжаем задание
            this.showResultMessage(false);
            this.showEmoji(false);
        }

        this.hideModal();
    }

    getLiteralKey(monomial) {
        if (!(monomial instanceof Monomial)) return null;
        return monomial.powers.map(p => p.tex()).sort().join('*');
    }

    clearInputs() {
        // Ничего не нужно очищать для этого тренажёра
    }

    checkAnswer() {
        // Проверяем, полностью ли приведён многочлен
        const activeMonomials = this.currentMonomials.filter(m => !m.combined);

        // Проверяем, есть ли среди активных одночленов подобные
        const literalKeys = activeMonomials.map(m => m.literalKey);
        const uniqueLiteralKeys = new Set(literalKeys);

        const isFullySimplified = literalKeys.length === uniqueLiteralKeys.size;

        if (isFullySimplified) {
            // Многочлен полностью приведён - правильный ответ!
            this.handleCorrectAnswer();
        } else {
            // Остались неприведённые подобные - неправильно
            this.handleWrongAnswer();
        }
    }

    showNoOperationsMessage() {
        // Не используется в этом тренажёре
    }

    hideNoOperationsMessage() {
        // Не используется в этом тренажёре
    }

    disableInputs() {
        super.disableInputs();
        // Очищаем touch состояние, если оно было активно
        if (this.clone) {
            this.clone.remove();
            this.clone = null;
        }
        if (this.touchElement) {
            this.touchElement.classList.remove('polynomial-dragging');
            this.touchElement = null;
        }
        document.querySelectorAll('.polynomial-monomial').forEach(el => {
            el.classList.remove('polynomial-drag-over');
        });
    }

    enableInputs() {
        super.enableInputs();
    }

    // Touch events для мобильных устройств
    handleTouchStart(e) {
        e.preventDefault();

        this.touchElement = e.target.closest('.polynomial-monomial');
        if (!this.touchElement) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;

        // Создаём клон элемента для визуального перетаскивания
        this.clone = this.touchElement.cloneNode(true);
        this.clone.classList.add('polynomial-dragging-clone');
        this.clone.style.position = 'fixed';
        this.clone.style.zIndex = '1000';
        this.clone.style.pointerEvents = 'none';
        this.clone.style.left = touch.clientX + 'px';
        this.clone.style.top = touch.clientY + 'px';
        this.clone.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(this.clone);

        // Добавляем класс к оригинальному элементу
        this.touchElement.classList.add('polynomial-dragging');
    }

    handleTouchMove(e) {
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

        // Убираем подсветку со всех элементов
        document.querySelectorAll('.polynomial-monomial').forEach(el => {
            el.classList.remove('polynomial-drag-over');
        });

        // Добавляем подсветку целевому элементу
        const targetElement = elementBelow?.closest('.polynomial-monomial');
        if (targetElement && targetElement !== this.touchElement) {
            targetElement.classList.add('polynomial-drag-over');
        }
    }

    handleTouchEnd(e) {
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

        // Убираем классы
        this.touchElement.classList.remove('polynomial-dragging');
        document.querySelectorAll('.polynomial-monomial').forEach(el => {
            el.classList.remove('polynomial-drag-over');
        });

        // Обрабатываем drop
        const targetElement = elementBelow?.closest('.polynomial-monomial');
        if (targetElement && targetElement !== this.touchElement) {
            const draggedId = parseInt(this.touchElement.dataset.id);
            const targetId = parseInt(targetElement.dataset.id);

            const draggedData = this.currentMonomials.find(m => m.id === draggedId);
            const targetData = this.currentMonomials.find(m => m.id === targetId);

            // Проверяем, подобные ли одночлены
            if (draggedData.literalKey === targetData.literalKey) {
                // Подобные - показываем модальное окно
                this.showModal(draggedData, targetData);
            } else {
                // Не подобные - показываем сообщение об ошибке
                this.showResultMessage(false);
                this.showEmoji(false);
            }
        }

        this.touchElement = null;
    }
}
