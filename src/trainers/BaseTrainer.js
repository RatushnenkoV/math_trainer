// Базовый класс для всех тренажёров
class BaseTrainer {
    constructor(config) {
        this.name = config.name;
        this.generator = config.generator;
        this.progressTracker = config.progressTracker;
        this.settings = config.settings;
        this.storageKey = config.storageKey;
        this.currentProblem = null;

        // DOM элементы (будут установлены в initDOM)
        this.elements = {};
    }

    // Инициализация DOM элементов (переопределяется в подклассах)
    initDOM() {
        throw new Error('initDOM должен быть реализован в подклассе');
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

        // Кнопка проверки
        this.elements.checkBtn.addEventListener('click', () => {
            this.checkAnswer();
        });

        // Кнопка назад из настроек
        this.elements.settingsBackBtn.addEventListener('click', () => {
            this.hideSettingsScreen();
            this.generateNewProblem();
        });
    }

    // Загрузка настроек из localStorage
    loadSettings() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.settings = JSON.parse(saved);
        }
        return this.settings;
    }

    // Сохранение настроек в localStorage
    saveSettings() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    }

    // Обновление настроек генератора
    updateGeneratorSettings() {
        if (this.generator && this.generator.updateSettings) {
            this.generator.updateSettings(this.settings);
        }
    }

    // Проверка, выбрана ли хотя бы одна операция
    hasOperationsSelected() {
        return this.settings.addition || this.settings.subtraction ||
               this.settings.multiplication || this.settings.division;
    }

    // Начало теста
    startTest() {
        this.updateProgressDisplay();
        this.generateNewProblem();
    }

    // Генерация нового примера
    generateNewProblem() {
        if (!this.hasOperationsSelected()) {
            this.showNoOperationsMessage();
            this.disableInputs();
            return;
        }

        this.hideNoOperationsMessage();
        this.enableInputs();
        this.currentProblem = this.generator.generate();
        this.displayProblem(this.currentProblem);
        this.clearInputs();
    }

    // Отображение примера (переопределяется в подклассах)
    displayProblem(problem) {
        throw new Error('displayProblem должен быть реализован в подклассе');
    }

    // Очистка полей ввода (переопределяется в подклассах)
    clearInputs() {
        throw new Error('clearInputs должен быть реализован в подклассе');
    }

    // Проверка ответа (переопределяется в подклассах)
    checkAnswer() {
        throw new Error('checkAnswer должен быть реализован в подклассе');
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

    // Обработка неправильного ответа
    handleWrongAnswer() {
        this.progressTracker.wrongAnswer();
        this.showResultMessage(false);
        this.showEmoji(false);

        setTimeout(() => {
            this.updateProgressDisplay();
        }, 1000);
    }

    // Обновление отображения прогресса
    updateProgressDisplay() {
        this.elements.levelText.textContent = this.progressTracker.getLevelName();
        this.elements.progressText.textContent = this.progressTracker.getProgressText();
        this.elements.progressFill.style.width = this.progressTracker.getProgressPercent() + '%';
    }

    // Показ сообщения с результатом
    showResultMessage(isCorrect) {
        const messageElement = this.elements.resultMessage;

        if (isCorrect) {
            messageElement.textContent = 'Верно!';
            messageElement.className = 'result-message correct show';
        } else {
            messageElement.textContent = 'Неверно';
            messageElement.className = 'result-message wrong show';
        }

        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 1000);
    }

    // Показ эмодзи при ответе
    showEmoji(isCorrect) {
        const correctEmojis = ['🎉', '✨', '🌟', '💫', '🎊', '👏', '🎯', '⭐', '💪', '🔥'];
        const wrongEmojis = ['😢', '😞', '😔', '💔', '😓', '😰', '😥', '🤔', '😕', '😖'];

        const emojis = isCorrect ? correctEmojis : wrongEmojis;
        const container = document.getElementById('emoji-container');

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

    // Показать сообщение об отсутствии операций
    showNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = '<span class="no-operations-message">Не выбрано ни одного типа задач в настройках 😢</span>';
    }

    // Скрыть сообщение об отсутствии операций (переопределяется в подклассах)
    hideNoOperationsMessage() {
        throw new Error('hideNoOperationsMessage должен быть реализован в подклассе');
    }

    // Отключить поля ввода и кнопку
    disableInputs() {
        this.elements.checkBtn.disabled = true;
        // Отключение конкретных полей ввода определяется в подклассах
    }

    // Включить поля ввода и кнопку
    enableInputs() {
        this.elements.checkBtn.disabled = false;
        // Включение конкретных полей ввода определяется в подклассах
    }

    // Переключение экранов
    showScreen(screenId) {
        // Используем глобальную функцию showScreen из app.js
        if (window.showScreen) {
            window.showScreen(screenId);
        } else {
            // Fallback на случай, если глобальная функция недоступна
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
        }
    }

    // Показать экран настроек (переопределяется в подклассах)
    showSettingsScreen() {
        throw new Error('showSettingsScreen должен быть реализован в подклассе');
    }

    // Скрыть экран настроек (переопределяется в подклассах)
    hideSettingsScreen() {
        throw new Error('hideSettingsScreen должен быть реализован в подклассе');
    }
}
