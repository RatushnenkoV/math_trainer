# Как добавить новый тренажёр

Эта инструкция описывает простой процесс добавления нового тренажёра в приложение.

## Новая архитектура

После реорганизации приложение имеет модульную структуру:

```
src/
├── app.js                      # Главный файл (56 строк)
├── trainers/
│   ├── BaseTrainer.js         # Базовый класс с общей логикой
│   ├── FractionsTrainer.js    # Тренажёр обыкновенных дробей
│   └── DecimalsTrainer.js     # Тренажёр десятичных дробей
├── utils/
│   ├── fractions.js           # Вспомогательные классы
│   ├── progress.js            # Универсальная система прогресса
│   └── generators/
│       ├── FractionsGenerator.js
│       └── DecimalsGenerator.js
└── styles/
    └── main.css
```

## Процесс добавления нового тренажёра

### Шаг 1: Создать генератор задач

Создайте файл `src/utils/generators/YourGenerator.js`:

```javascript
class YourProblemGenerator {
    constructor(settings) {
        this.settings = settings;
    }

    updateSettings(settings) {
        this.settings = settings;
    }

    generate() {
        // Генерация задачи
        return {
            // Данные задачи
            num1: 5,
            num2: 3,
            operation: '+',
            result: 8
        };
    }
}
```

### Шаг 2: Создать класс тренажёра

Создайте файл `src/trainers/YourTrainer.js`:

```javascript
class YourTrainer extends BaseTrainer {
    constructor() {
        // Загрузка настроек
        const savedSettings = localStorage.getItem('yourTrainerSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {
            addition: true,
            subtraction: true,
            // ... другие настройки
        };

        super({
            name: 'your-trainer',
            generator: new YourProblemGenerator(settings),
            progressTracker: new ProgressTracker('yourTrainerProgress'),
            settings: settings,
            storageKey: 'yourTrainerSettings'
        });
    }

    // Инициализация DOM элементов
    initDOM() {
        this.elements = {
            screen: document.getElementById('your-screen'),
            backBtn: document.getElementById('your-back-btn'),
            settingsBtn: document.getElementById('your-settings-btn'),
            checkBtn: document.getElementById('your-check-btn'),
            settingsScreen: document.getElementById('your-settings-screen'),
            settingsBackBtn: document.getElementById('your-settings-back-btn'),

            // Элементы отображения
            levelText: document.getElementById('your-level-text'),
            progressText: document.getElementById('your-progress-text'),
            progressFill: document.getElementById('your-progress-fill'),
            resultMessage: document.getElementById('your-result-message'),
            problemDisplay: document.getElementById('your-problem-display'),

            // Элементы ввода
            answerInput: document.getElementById('your-answer-input')
        };

        this.initEventHandlers();
        this.initSettingsHandlers();
        this.initInputHandlers();
    }

    // Инициализация обработчиков ввода
    initInputHandlers() {
        this.elements.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
    }

    // Инициализация обработчиков настроек
    initSettingsHandlers() {
        const settingIds = ['your-addition', 'your-subtraction'];

        settingIds.forEach(id => {
            const element = document.getElementById(id);
            const key = id.replace('your-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());

            element.checked = this.settings[key];

            element.addEventListener('change', (e) => {
                this.settings[key] = e.target.checked;
                this.saveSettings();
                this.updateGeneratorSettings();
            });
        });
    }

    // Отображение задачи
    displayProblem(problem) {
        // Ваша логика отображения
    }

    // Очистка полей ввода
    clearInputs() {
        this.elements.answerInput.value = '';
        this.elements.answerInput.focus();
    }

    // Проверка ответа
    checkAnswer() {
        const userAnswer = parseFloat(this.elements.answerInput.value);
        const correctAnswer = this.currentProblem.result;

        if (userAnswer === correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }

    // Скрыть сообщение об отсутствии операций
    hideNoOperationsMessage() {
        this.elements.problemDisplay.innerHTML = `
            <!-- Ваша разметка задачи -->
        `;
    }

    // Отключить/включить поля ввода
    disableInputs() {
        super.disableInputs();
        this.elements.answerInput.disabled = true;
    }

    enableInputs() {
        super.enableInputs();
        this.elements.answerInput.disabled = false;
    }

    // Показать/скрыть экран настроек
    showSettingsScreen() {
        this.showScreen('your-settings-screen');
    }

    hideSettingsScreen() {
        this.showScreen('your-screen');
    }
}
```

### Шаг 3: Добавить HTML разметку

Добавьте в `index.html` экраны для вашего тренажёра:

```html
<!-- Your Trainer Screen -->
<div id="your-screen" class="screen">
    <div class="header">
        <button id="your-back-btn" class="icon-button">←</button>
        <div class="progress-container">
            <div class="progress-info">
                <span id="your-level-text">Уровень 1</span>
                <span id="your-progress-text">0/10</span>
            </div>
            <div class="progress-bar">
                <div id="your-progress-fill" class="progress-fill"></div>
            </div>
        </div>
        <button id="your-settings-btn" class="icon-button">⚙</button>
    </div>

    <div class="content">
        <div id="your-problem-display" class="problem-display">
            <!-- Ваша разметка задачи -->
        </div>

        <div class="answer-input">
            <input type="text" id="your-answer-input" placeholder="Ответ">
        </div>

        <button id="your-check-btn" class="check-button">Проверить</button>
        <div id="your-result-message" class="result-message"></div>
    </div>
</div>

<!-- Your Settings Screen -->
<div id="your-settings-screen" class="screen">
    <div class="header">
        <button id="your-settings-back-btn" class="icon-button">←</button>
        <h2>Настройки</h2>
        <div></div>
    </div>

    <div class="settings-content">
        <div class="settings-group">
            <h3>Операции</h3>
            <label class="switch-label">
                <input type="checkbox" id="your-addition" checked>
                <span>Сложение</span>
            </label>
            <!-- ... другие настройки -->
        </div>
    </div>
</div>
```

### Шаг 4: Подключить скрипты

В `index.html` добавьте подключение ваших файлов:

```html
<!-- Генераторы -->
<script src="src/utils/generators/YourGenerator.js"></script>

<!-- Тренажёры -->
<script src="src/trainers/YourTrainer.js"></script>
```

### Шаг 5: Зарегистрировать тренажёр

В `src/app.js` добавьте создание экземпляра и инициализацию:

```javascript
function initApp() {
    // Создание экземпляров тренажёров
    trainers.fractions = new FractionsTrainer();
    trainers.decimals = new DecimalsTrainer();
    trainers.yourTrainer = new YourTrainer(); // ДОБАВИТЬ ЭТУ СТРОКУ

    // Инициализация DOM для каждого тренажёра
    trainers.fractions.initDOM();
    trainers.decimals.initDOM();
    trainers.yourTrainer.initDOM(); // ДОБАВИТЬ ЭТУ СТРОКУ

    // ...
}
```

### Шаг 6: Добавить кнопку в главное меню

В `initMainMenu()` в `src/app.js`:

```javascript
function initMainMenu() {
    // ... существующие кнопки

    const yourBtn = document.getElementById('your-btn');
    yourBtn.addEventListener('click', () => {
        showScreen('your-screen');
        trainers.yourTrainer.startTest();
    });
}
```

И в HTML добавьте кнопку в главное меню:

```html
<div id="main-menu" class="screen active">
    <h1>Математический тренажер</h1>
    <button id="fractions-btn" class="menu-button">Обыкновенные дроби</button>
    <button id="decimals-btn" class="menu-button">Десятичные дроби</button>
    <button id="your-btn" class="menu-button">Ваш тренажёр</button>
</div>
```

## Итого

Добавление нового тренажёра требует:

1. **1 файл генератора** (~50-150 строк)
2. **1 файл тренажёра** (~100-200 строк)
3. **HTML разметка** (~30-50 строк)
4. **2 строки в app.js** (регистрация)
5. **~5 строк в index.html** (подключение скриптов + кнопка)

**Всего: ~200-400 строк кода** вместо ~700 строк в старой архитектуре.

## Преимущества новой архитектуры

- Весь общий код (70%) находится в `BaseTrainer`
- Не нужно дублировать логику прогресса, UI, обработчиков
- Легко тестировать каждый тренажёр отдельно
- Код организован и легко читается
- Добавление нового тренажёра занимает ~30 минут
