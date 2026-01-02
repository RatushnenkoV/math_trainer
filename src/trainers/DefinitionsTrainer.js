// Тренажёр геометрических определений
class DefinitionsTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('mathTrainerDefinitionsSettings');
        let settings;

        if (savedSettings) {
            settings = JSON.parse(savedSettings);
        } else {
            // По умолчанию выбираем весь 7 класс
            settings = {
                selectedSections: [
                    { class: 7, sectionName: "Базовые геометрические понятия" },
                    { class: 7, sectionName: "Углы" },
                    { class: 7, sectionName: "Многоугольники" }
                ],
                termByDefinition: true,
                definitionByTerm: false,
                matching: false
            };
        }

        super({
            name: 'definitions',
            generator: new DefinitionsGenerator(settings),
            progressTracker: new ProgressTracker('mathTrainerDefinitionsProgress'),
            settings: settings,
            storageKey: 'mathTrainerDefinitionsSettings'
        });

        this.isAnswering = false; // Флаг для предотвращения множественных кликов
        this.allSections = []; // Все доступные разделы
        this.definitionsLoaded = false; // Флаг загрузки определений

        // Для режима сопоставления
        this.selectedTerm = null;
        this.selectedDefinition = null;
        this.matchedPairs = new Set();
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('definitions-screen'),
            backBtn: document.getElementById('definitions-back-btn'),
            settingsBtn: document.getElementById('definitions-settings-btn'),
            settingsScreen: document.getElementById('definitions-settings-screen'),
            settingsBackBtn: document.getElementById('definitions-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('definitions-level-text'),
            progressText: document.getElementById('definitions-progress-text'),
            progressFill: document.getElementById('definitions-progress-fill'),
            resultMessage: document.getElementById('definitions-result-message'),
            problemDisplay: document.getElementById('definitions-problem-display'),
            definitionElem: document.getElementById('definitions-definition'),

            // Контейнер для кнопок ответов
            answersContainer: document.getElementById('definitions-answers-container'),

            // Элементы настроек
            sectionsContainer: document.getElementById('definitions-sections-container')
        };

        // Инициализация обработчиков
        this.initEventHandlers();

        // Загружаем определения асинхронно
        this.initSettingsUI();
    }

    // Инициализация обработчиков событий
    initEventHandlers() {
        // Кнопка назад
        this.elements.backBtn.addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        // Кнопка настроек
        this.elements.settingsBtn.addEventListener('click', () => {
            this.showSettingsScreen();
        });

        // Кнопка назад из настроек
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
            this.generateNewProblem();
        });
    }

    // Инициализация UI настроек
    async initSettingsUI() {
        if (this.definitionsLoaded) {
            return; // Уже загружено
        }

        // Показываем сообщение о загрузке
        this.elements.sectionsContainer.innerHTML = '<div class="settings-group"><p>Загрузка разделов...</p></div>';

        try {
            // Ждём загрузки определений
            await this.generator.loadDefinitions();

            // Получаем все разделы
            this.allSections = this.generator.getAllSections();

            // Группируем разделы по классам
            const sectionsByClass = {};
            this.allSections.forEach(section => {
                if (!sectionsByClass[section.class]) {
                    sectionsByClass[section.class] = [];
                }
                sectionsByClass[section.class].push(section);
            });

            // Создаём UI для выбора разделов
            this.renderSectionsUI(sectionsByClass);
            this.definitionsLoaded = true;
        } catch (error) {
            console.error('Ошибка загрузки определений:', error);
            this.elements.sectionsContainer.innerHTML = '<div class="settings-group"><p>Ошибка загрузки разделов. Попробуйте перезагрузить страницу.</p></div>';
        }
    }

    // Рендеринг настроек режимов
    renderModeSettings() {
        const modeGroup = document.createElement('div');
        modeGroup.className = 'settings-group';

        const modeTitle = document.createElement('h3');
        modeTitle.textContent = 'Режимы тренировки';
        modeGroup.appendChild(modeTitle);

        // Режим: термин по определению
        const termByDefLabel = document.createElement('label');
        termByDefLabel.className = 'switch-label';

        const termByDefCheckbox = document.createElement('input');
        termByDefCheckbox.type = 'checkbox';
        termByDefCheckbox.checked = this.settings.termByDefinition;
        termByDefCheckbox.addEventListener('change', (e) => {
            this.settings.termByDefinition = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        const termByDefSpan = document.createElement('span');
        termByDefSpan.textContent = 'Термин по определению';

        termByDefLabel.appendChild(termByDefCheckbox);
        termByDefLabel.appendChild(termByDefSpan);
        modeGroup.appendChild(termByDefLabel);

        // Режим: определение по термину
        const defByTermLabel = document.createElement('label');
        defByTermLabel.className = 'switch-label';

        const defByTermCheckbox = document.createElement('input');
        defByTermCheckbox.type = 'checkbox';
        defByTermCheckbox.checked = this.settings.definitionByTerm;
        defByTermCheckbox.addEventListener('change', (e) => {
            this.settings.definitionByTerm = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        const defByTermSpan = document.createElement('span');
        defByTermSpan.textContent = 'Определение по термину';

        defByTermLabel.appendChild(defByTermCheckbox);
        defByTermLabel.appendChild(defByTermSpan);
        modeGroup.appendChild(defByTermLabel);

        // Режим: сопоставление
        const matchingLabel = document.createElement('label');
        matchingLabel.className = 'switch-label';

        const matchingCheckbox = document.createElement('input');
        matchingCheckbox.type = 'checkbox';
        matchingCheckbox.checked = this.settings.matching;
        matchingCheckbox.addEventListener('change', (e) => {
            this.settings.matching = e.target.checked;
            this.saveSettings();
            this.updateGeneratorSettings();
        });

        const matchingSpan = document.createElement('span');
        matchingSpan.textContent = 'Сопоставление';

        matchingLabel.appendChild(matchingCheckbox);
        matchingLabel.appendChild(matchingSpan);
        modeGroup.appendChild(matchingLabel);

        this.elements.sectionsContainer.appendChild(modeGroup);
    }

    // Рендеринг UI для выбора разделов
    renderSectionsUI(sectionsByClass) {
        this.elements.sectionsContainer.innerHTML = '';

        // Добавляем выбор режимов работы
        this.renderModeSettings();

        // Добавляем заголовок для разделов
        const sectionsHeader = document.createElement('div');
        sectionsHeader.className = 'settings-group';
        const sectionsTitle = document.createElement('h3');
        sectionsTitle.textContent = 'Разделы';
        sectionsTitle.style.marginBottom = '16px';
        sectionsHeader.appendChild(sectionsTitle);
        this.elements.sectionsContainer.appendChild(sectionsHeader);

        // Сортируем классы
        const classes = Object.keys(sectionsByClass).sort((a, b) => parseInt(a) - parseInt(b));

        classes.forEach(classNum => {
            const classGroup = document.createElement('div');
            classGroup.className = 'settings-group';

            // Заголовок класса с кнопкой "Выбрать всё"
            const classHeader = document.createElement('div');
            classHeader.style.display = 'flex';
            classHeader.style.justifyContent = 'space-between';
            classHeader.style.alignItems = 'center';
            classHeader.style.marginBottom = '10px';

            const classTitle = document.createElement('h3');
            classTitle.textContent = `${classNum} класс`;
            classTitle.style.margin = '0';

            const selectAllBtn = document.createElement('button');
            selectAllBtn.textContent = 'Выбрать всё';
            selectAllBtn.className = 'small-button';
            selectAllBtn.addEventListener('click', () => {
                this.selectAllInClass(parseInt(classNum));
            });

            classHeader.appendChild(classTitle);
            classHeader.appendChild(selectAllBtn);
            classGroup.appendChild(classHeader);

            sectionsByClass[classNum].forEach(section => {
                const label = document.createElement('label');
                label.className = 'switch-label';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.class = section.class;
                checkbox.dataset.section = section.sectionName;

                // Проверяем, выбран ли раздел
                const isSelected = this.settings.selectedSections.some(
                    s => s.class === section.class && s.sectionName === section.sectionName
                );
                checkbox.checked = isSelected;

                checkbox.addEventListener('change', (e) => {
                    this.toggleSection(
                        parseInt(e.target.dataset.class),
                        e.target.dataset.section,
                        e.target.checked
                    );
                });

                const span = document.createElement('span');
                span.textContent = section.sectionName;

                label.appendChild(checkbox);
                label.appendChild(span);
                classGroup.appendChild(label);
            });

            this.elements.sectionsContainer.appendChild(classGroup);
        });
    }

    // Выбрать все разделы класса
    selectAllInClass(classNum) {
        const classSections = this.allSections.filter(s => s.class === classNum);

        classSections.forEach(section => {
            const exists = this.settings.selectedSections.some(
                s => s.class === section.class && s.sectionName === section.sectionName
            );
            if (!exists) {
                this.settings.selectedSections.push({
                    class: section.class,
                    sectionName: section.sectionName
                });
            }
        });

        this.saveSettings();
        this.updateGeneratorSettings();

        // Обновляем UI
        const checkboxes = this.elements.sectionsContainer.querySelectorAll(`input[data-class="${classNum}"]`);
        checkboxes.forEach(cb => cb.checked = true);
    }

    // Переключение выбора раздела
    toggleSection(classNum, sectionName, isSelected) {
        if (isSelected) {
            // Добавляем раздел, если его нет
            const exists = this.settings.selectedSections.some(
                s => s.class === classNum && s.sectionName === sectionName
            );
            if (!exists) {
                this.settings.selectedSections.push({
                    class: classNum,
                    sectionName: sectionName
                });
            }
        } else {
            // Удаляем раздел
            this.settings.selectedSections = this.settings.selectedSections.filter(
                s => !(s.class === classNum && s.sectionName === sectionName)
            );
        }

        this.saveSettings();
        this.updateGeneratorSettings();
    }

    // Проверка, выбран ли хотя бы один раздел
    hasOperationsSelected() {
        return this.settings.selectedSections.length > 0;
    }

    // Отображение задачи
    displayProblem(problem) {
        if (!problem) {
            this.showNoOperationsMessage();
            return;
        }

        // Сбрасываем состояние режима сопоставления
        this.selectedTerm = null;
        this.selectedDefinition = null;
        this.matchedPairs = new Set();

        if (problem.mode === 'matching') {
            // Режим сопоставления
            this.displayMatchingProblem(problem);
        } else {
            // Обычные режимы (выбор из 4 вариантов)
            this.elements.definitionElem.textContent = problem.question;
            this.createAnswerButtons(problem.answers);
        }

        this.isAnswering = false;
    }

    // Отображение режима сопоставления
    displayMatchingProblem(problem) {
        // Скрываем обычный вопрос и показываем два столбца
        this.elements.definitionElem.textContent = 'Сопоставьте термины и определения';

        // Очищаем контейнер и меняем его структуру
        this.elements.answersContainer.innerHTML = '';
        this.elements.answersContainer.classList.remove('single-column');
        this.elements.answersContainer.classList.add('matching-mode');

        // Создаем два столбца
        const termsColumn = document.createElement('div');
        termsColumn.className = 'matching-column terms-column';

        const definitionsColumn = document.createElement('div');
        definitionsColumn.className = 'matching-column definitions-column';

        // Создаем кнопки для терминов
        problem.terms.forEach(term => {
            const button = document.createElement('button');
            button.className = 'matching-button matching-term';
            button.textContent = term.text;
            button.dataset.id = term.id;

            button.addEventListener('click', () => {
                this.selectTerm(button, term.id);
            });

            termsColumn.appendChild(button);
        });

        // Создаем кнопки для определений
        problem.definitions.forEach(def => {
            const button = document.createElement('button');
            button.className = 'matching-button matching-definition';
            button.textContent = def.text;
            button.dataset.id = def.id;

            button.addEventListener('click', () => {
                this.selectDefinition(button, def.id);
            });

            definitionsColumn.appendChild(button);
        });

        this.elements.answersContainer.appendChild(termsColumn);
        this.elements.answersContainer.appendChild(definitionsColumn);
    }

    // Выбор термина
    selectTerm(button, termId) {
        // Если уже сопоставлен, игнорируем
        if (this.matchedPairs.has(termId)) return;

        // Снимаем выделение с предыдущего термина
        const prevSelected = this.elements.answersContainer.querySelector('.matching-term.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // Выделяем текущий
        button.classList.add('selected');
        this.selectedTerm = termId;

        // Проверяем пару, если уже выбрано определение
        if (this.selectedDefinition) {
            this.checkPair();
        }
    }

    // Выбор определения
    selectDefinition(button, defId) {
        // Если уже сопоставлено, игнорируем
        if (this.matchedPairs.has(defId)) return;

        // Снимаем выделение с предыдущего определения
        const prevSelected = this.elements.answersContainer.querySelector('.matching-definition.selected');
        if (prevSelected) {
            prevSelected.classList.remove('selected');
        }

        // Выделяем текущее
        button.classList.add('selected');
        this.selectedDefinition = defId;

        // Проверяем пару, если уже выбран термин
        if (this.selectedTerm) {
            this.checkPair();
        }
    }

    // Проверка пары
    checkPair() {
        const isCorrect = this.selectedTerm === this.selectedDefinition;

        if (isCorrect) {
            // Правильно - отмечаем как сопоставленные
            this.matchedPairs.add(this.selectedTerm);

            const termButton = this.elements.answersContainer.querySelector(`.matching-term[data-id="${this.selectedTerm}"]`);
            const defButton = this.elements.answersContainer.querySelector(`.matching-definition[data-id="${this.selectedDefinition}"]`);

            termButton.classList.remove('selected');
            termButton.classList.add('matched');
            termButton.disabled = true;

            defButton.classList.remove('selected');
            defButton.classList.add('matched');
            defButton.disabled = true;

            // Проверяем, все ли пары сопоставлены
            if (this.matchedPairs.size === this.currentProblem.count) {
                this.handleCorrectAnswer();
            }
        } else {
            // Неправильно - показываем ошибку
            const termButton = this.elements.answersContainer.querySelector(`.matching-term[data-id="${this.selectedTerm}"]`);
            const defButton = this.elements.answersContainer.querySelector(`.matching-definition[data-id="${this.selectedDefinition}"]`);

            termButton.classList.add('wrong');
            defButton.classList.add('wrong');

            this.progressTracker.wrongAnswer();
            this.showResultMessage(false);

            setTimeout(() => {
                termButton.classList.remove('wrong', 'selected');
                defButton.classList.remove('wrong', 'selected');
                this.updateProgressDisplay();
            }, 1000);
        }

        // Сбрасываем выбор
        this.selectedTerm = null;
        this.selectedDefinition = null;
    }

    // Создание кнопок с вариантами ответов
    createAnswerButtons(answers) {
        this.elements.answersContainer.innerHTML = '';
        this.elements.answersContainer.classList.remove('matching-mode');

        answers.forEach((answer) => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = answer.text;

            // При клике сразу проверяем ответ
            button.addEventListener('click', () => {
                if (!this.isAnswering) {
                    this.checkAnswer(answer);
                }
            });

            this.elements.answersContainer.appendChild(button);
        });

        // Определяем, нужно ли переключиться на одноколоночную сетку
        this.adjustButtonLayout();
    }

    // Автоматическое определение макета кнопок
    adjustButtonLayout() {
        // Ждем следующий кадр, чтобы DOM обновился
        requestAnimationFrame(() => {
            const buttons = this.elements.answersContainer.querySelectorAll('.answer-button');
            let maxHeight = 0;

            // Находим максимальную высоту кнопки
            buttons.forEach(button => {
                const height = button.offsetHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                }
            });

            // Если кнопки слишком высокие (больше 80px), переключаемся на одноколоночный режим
            if (maxHeight > 80) {
                this.elements.answersContainer.classList.add('single-column');
            } else {
                this.elements.answersContainer.classList.remove('single-column');
            }
        });
    }

    // Проверка ответа
    checkAnswer(selectedAnswer) {
        if (this.isAnswering) {
            return; // Предотвращаем множественные клики
        }

        this.isAnswering = true;

        if (!this.currentProblem) {
            return;
        }

        const isCorrect = selectedAnswer.isCorrect;

        // Блокируем все кнопки
        this.disableInputs();

        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Обработка неправильного ответа
    handleWrongAnswer() {
        this.progressTracker.wrongAnswer();
        this.showResultMessage(false);
        this.showEmoji(false);

        setTimeout(() => {
            this.updateProgressDisplay();
            this.isAnswering = false;
            this.enableInputs();
        }, 1000);
    }

    // Обработка правильного ответа
    handleCorrectAnswer() {
        const result = this.progressTracker.correctAnswer();
        this.showResultMessage(true);
        this.showEmoji(true);

        if (result.levelUp) {
            setTimeout(() => {
                alert(`Поздравляем! Вы перешли на ${result.newLevel} уровень!`);
            }, 500);
        }

        setTimeout(() => {
            this.generateNewProblem();
            this.updateProgressDisplay();
        }, 1000);
    }

    // Очистка полей ввода
    clearInputs() {
        // Ничего не делаем, так как нет полей для очистки
    }

    // Скрыть сообщение об отсутствии выбранных разделов
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <div class="definitions-definition-container">
                <div id="definitions-definition" class="definitions-definition"></div>
            </div>
        `;
        // Обновляем ссылку на элемент после пересоздания HTML
        this.elements.definitionElem = document.getElementById('definitions-definition');
    }

    // Показать сообщение об отсутствии выбранных разделов
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<div class="no-operations-message">Не выбран ни один раздел в настройках 😢</div>';
        this.elements.answersContainer.innerHTML = '';
        this.elements.answersContainer.classList.remove('matching-mode', 'single-column');
    }

    // Отключить поля ввода
    disableInputs() {
        const allButtons = this.elements.answersContainer.querySelectorAll('.answer-button');
        allButtons.forEach(btn => btn.disabled = true);
    }

    // Включить поля ввода
    enableInputs() {
        const allButtons = this.elements.answersContainer.querySelectorAll('.answer-button');
        allButtons.forEach(btn => btn.disabled = false);
    }

    // Показать экран настроек
    async showSettingsScreen() {
        this.showScreen('definitions-settings-screen');

        // Убеждаемся, что настройки UI инициализированы
        if (!this.definitionsLoaded) {
            await this.initSettingsUI();
        }
    }

    // Скрыть экран настроек
    hideSettingsScreen() {
        this.showScreen('definitions-screen');
    }
}
