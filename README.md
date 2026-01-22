# Математический тренажёр — Telegram Mini App

Telegram Mini App для тренировки математических навыков. 30 тренажёров по арифметике, алгебре, геометрии и тригонометрии.

## Быстрый старт для разработки

```bash
# Локальный запуск — просто открыть index.html в браузере
# Или использовать любой статический сервер:
npx serve .
```

---

## Архитектура проекта

### Точка входа
- `index.html` — единственная HTML-страница (SPA)
- `src/app.js` — главный JS-файл (~1200 строк), управляет всем приложением

### Паттерн: Web Components + Lazy Loading

Каждый тренажёр состоит из 3 файлов, которые загружаются динамически при клике:

```
[Generator] → [Trainer] → [Component]
     ↓            ↓            ↓
  Генерация   Логика      UI (Custom Element)
  примеров    проверки    extends HTMLElement
```

**Пример для тренажёра дробей:**
```
src/utils/generators/FractionsGenerator.js  — генерирует примеры
src/trainers/FractionsTrainer.js            — проверяет ответы, управляет прогрессом
src/components/FractionsComponent.js        — рендерит HTML, регистрирует <fractions-trainer>
```

### Наследование

```
BaseTrainer                    BaseTrainerComponent (extends HTMLElement)
     ↑                                   ↑
FractionsTrainer               FractionsComponent
LinearEquationsTrainer         LinearEquationsComponent
QuadraticEquationsTrainer      QuadraticEquationsComponent
... (30 тренажёров)            ...
```

---

## Структура файлов

```
math trainer/
├── index.html                      # Единственная HTML-страница
├── src/
│   ├── app.js                      # Главная логика (1200 строк)
│   │
│   ├── styles/
│   │   ├── main.css                # Базовые стили
│   │   ├── common/
│   │   │   ├── components.css      # Общие компоненты (кнопки, поля)
│   │   │   ├── animations.css      # Анимации
│   │   │   └── shareModal.css      # Модалка "Поделиться"
│   │   └── trainers/               # Стили для каждого тренажёра (29 файлов)
│   │       ├── multiplication-table.css
│   │       ├── linear-equations.css
│   │       └── ...
│   │
│   ├── utils/
│   │   ├── fractions.js            # Класс Fraction для работы с дробями
│   │   ├── progress.js             # ProgressTracker — сохранение прогресса
│   │   ├── RealSet.js              # Работа с множествами (для неравенств)
│   │   ├── powers.js               # Утилиты для степеней
│   │   ├── Monomial.js             # Класс одночлена
│   │   ├── Polynomial.js           # Класс многочлена
│   │   ├── shareLink.js            # Генерация ссылок для челленджей
│   │   ├── ShapeDrawer.js          # Рисование фигур (геометрия)
│   │   ├── TriangleDrawer.js       # Рисование треугольников
│   │   ├── ParallelogramDrawer.js  # Рисование параллелограммов
│   │   ├── generators/             # Генераторы примеров (30 файлов)
│   │   │   ├── FractionsGenerator.js
│   │   │   ├── LinearEquationsGenerator.js
│   │   │   └── ...
│   │   └── data/
│   │       └── definitionsData.js  # Данные для тренажёра определений
│   │
│   ├── trainers/                   # Логика тренажёров (30 файлов)
│   │   ├── BaseTrainer.js          # Базовый класс
│   │   ├── FractionsTrainer.js
│   │   ├── LinearEquationsTrainer.js
│   │   └── ...
│   │
│   └── components/                 # UI компоненты (30 файлов)
│       ├── BaseTrainerComponent.js # Базовый класс (extends HTMLElement)
│       ├── FractionsComponent.js
│       ├── LinearEquationsComponent.js
│       ├── MonomialInput.js        # Переиспользуемый компонент ввода
│       ├── FactorInput.js          # Компонент ввода множителей
│       └── ...
```

---

## Ключевые механизмы в app.js

### 1. Convention-based конфигурация (строка ~20)

Все пути генерируются автоматически из имени тренажёра:

```javascript
// Из имени 'linearEquations' автоматически генерируются:
// → screen: 'linear-equations-screen'
// → style: 'src/styles/trainers/linear-equations.css'
// → scripts: ['...Generator.js', '...Trainer.js', '...Component.js']

function getTrainerPaths(trainerName) {
    const kebab = toKebabCase(trainerName);  // linearEquations → linear-equations
    const pascal = toPascalCase(trainerName); // linearEquations → LinearEquations
    return {
        screen: `${kebab}-screen`,
        style: `src/styles/trainers/${kebab}.css`,
        scripts: [
            `src/utils/generators/${pascal}Generator.js`,
            `src/trainers/${pascal}Trainer.js`,
            `src/components/${pascal}Component.js`
        ]
    };
}
```

### 2. Исключения из конвенции (строка ~62)

```javascript
const trainerOverrides = {
    // Тренажёры без CSS
    squareRoots: { noStyle: true },

    // Дополнительные скрипты
    areas: {
        extraScripts: ['src/utils/ShapeDrawer.js', ...]
    },

    // Внешние библиотеки
    functions: {
        libraries: ['https://unpkg.com/d3@3/d3.min.js', ...]
    }
};
```

### 3. Автоопределение тренажёров из HTML (строка ~114)

```javascript
// Все кнопки тренажёров в HTML имеют id вида "{kebab-name}-btn"
// Из этого автоматически вычисляется всё остальное:
//   btnId: 'linear-equations-btn'
//   → trainer: 'linearEquations'
//   → name: текст кнопки из HTML
//   → screen: 'linear-equations-screen'

function getTrainerFromBtnId(btnId) {
    return toCamelCase(btnId.replace('-btn', ''));
}

// В initMainMenu():
document.querySelectorAll('.menu-button[id$="-btn"]').forEach(button => {
    const trainerName = getTrainerFromBtnId(button.id);
    // ...
});
```

### 4. Lazy Loading (строка ~202)

```javascript
async function loadTrainer(trainerName) {
    const paths = getTrainerPaths(trainerName);
    const overrides = trainerOverrides[trainerName] || {};

    // Собираем скрипты: extraScripts + стандартные
    const scripts = [...(overrides.extraScripts || []), ...paths.scripts];

    // Параллельная загрузка CSS + зависимостей, потом Component
    await Promise.all([cssPromise, ...dependencyScripts.map(loadScript)]);
    await loadScript(componentScript);
}
```

### 5. Универсальная навигация (строка ~490)

```javascript
function handleBackButton() {
    // Вместо switch на 200 строк — 3 простых проверки:
    if (isTrainerScreen(screenId)) {
        trainers[trainerName]?.handleBackButtonClick();
    } else if (isSettingsScreen(screenId)) {
        showScreen(getTrainerPaths(trainerName).screen);
    }
}
```

### 6. Режим челленджа (строка ~720)

```javascript
function loadChallengeMode() {
    // Парсит base64 из URL параметра tgWebAppStartParam
    // Загружает настройки челленджа
    // Запускает тренажёр с заданными параметрами
}
```

---

## Список тренажёров (30 штук)

| Раздел | Тренажёры |
|--------|-----------|
| **Арифметика** | Таблица умножения, Делимость, Проценты, Отрицательные числа, Квадратные корни |
| **Дроби** | Определение дроби (визуальное), Чувство дроби, Обыкновенные дроби, Десятичные дроби |
| **Уравнения** | Линейные, Системы линейных, Квадратные |
| **Неравенства** | Линейные, Квадратные, Системы неравенств |
| **Алгебра** | Степени, Приведение подобных, Раскрытие скобок, Формулы сокращённого умножения, Вынесение множителя, Графики функций |
| **Геометрия** | Определения, Координаты, Векторы, Действия над векторами, Площади |
| **Тригонометрия** | Перевод градусов в радианы, Табличные значения, Простейшие уравнения |

---

## Внешние зависимости

```html
<!-- Всегда загружаются -->
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>

<!-- Загружаются динамически только для тренажёра "Графики функций" -->
<script src="https://unpkg.com/d3@3/d3.min.js"></script>
<script src="https://unpkg.com/function-plot@1/dist/function-plot.js"></script>
```

- **Telegram WebApp API** — интеграция с Telegram (BackButton, expand, popups)
- **KaTeX** — рендеринг математических формул
- **D3.js + function-plot** — построение графиков функций

---

## Хранение данных

Всё хранится в `localStorage`:

| Ключ | Описание |
|------|----------|
| `{trainer}-progress` | Прогресс тренажёра (уровень, очки) |
| `{trainer}-settings` | Настройки тренажёра |
| `recent-trainers` | Список недавних тренажёров (макс. 3) |
| `menu-section-{name}` | Состояние секций меню (свёрнуто/развёрнуто) |

---

## Система прогресса

Каждый тренажёр имеет 4 уровня сложности:
- **Уровень 1**: 0-10 правильных ответов подряд
- **Уровень 2**: 10-20 правильных ответов подряд
- **Уровень 3**: 20-50 правильных ответов подряд
- **Уровень 4**: 50+ правильных ответов подряд

При ошибке прогресс сбрасывается до начала текущего уровня (не ниже).

---

## Режим челленджа

Пользователь может создать ссылку с определёнными настройками:
1. Настройки кодируются в base64
2. Передаются через `tgWebAppStartParam` в URL
3. При открытии ссылки тренажёр запускается с этими настройками
4. Отображается специальный UI с количеством заданий

---

## Оптимизации производительности

1. **Параллельная загрузка** — CSS, Generator, Trainer загружаются одновременно
2. **Предзагрузка** — загрузка начинается при `touchstart`/`mouseenter` на кнопку
3. **Динамическая загрузка D3** — тяжёлые библиотеки загружаются только для графиков
4. **Кеширование** — загруженные тренажёры не загружаются повторно
5. **Preconnect** — заранее устанавливается соединение с CDN

---

## Типичный flow пользователя

```
1. Открывает Mini App в Telegram
2. Видит главное меню с 7 секциями
3. Кликает на тренажёр → loadTrainer() загружает 3 файла
4. Component создаёт Custom Element и добавляет в DOM
5. Trainer.startTest() генерирует первый пример
6. Пользователь вводит ответ → Trainer.checkAnswer()
7. При правильном ответе → обновляется прогресс, генерируется новый пример
8. Кнопка "Назад" → возврат в меню (handleBackButton)
```

---

## Для разработки нового тренажёра

1. Создать `src/utils/generators/NewTrainerGenerator.js`
2. Создать `src/trainers/NewTrainer.js` (extends BaseTrainer)
3. Создать `src/components/NewTrainerComponent.js` (extends BaseTrainerComponent)
4. (Опционально) Создать `src/styles/trainers/new-trainer.css`
5. Добавить в `trainerConfig`, `trainerStyles`, `trainerScripts` в app.js
6. Добавить кнопку в index.html
7. Добавить обработку в `handleBackButton()`

---

## Лицензия

MIT
