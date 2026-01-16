// Утилита для работы с ссылками с параметрами тренажёров

class ShareLinkUtil {
    /**
     * Кодирует настройки тренажёра в строку URL параметров
     * @param {string} trainerName - Название тренажёра (например, 'multiplication-table')
     * @param {Object} settings - Объект с настройками тренажёра
     * @param {number} taskCount - Количество задач для челленджа
     * @returns {string} - Полная URL ссылка или startapp параметр для Telegram
     */
    static encodeSettings(trainerName, settings, taskCount = 10) {
        // Проверяем, запущено ли приложение в Telegram
        const tg = window.Telegram?.WebApp;

        if (tg) {
            // Для Telegram Mini App: кодируем всё в один base64 строку
            // start_param может содержать только: A-Z, a-z, 0-9, _, -
            const data = {
                trainer: trainerName,
                tasks: taskCount,
                settings: settings
            };
            const dataJson = JSON.stringify(data);
            // Кодируем в base64 и заменяем недопустимые символы
            const base64 = btoa(encodeURIComponent(dataJson))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
            return base64;
        } else {
            // Для обычного браузера - стандартный URL с параметрами
            const params = new URLSearchParams();
            params.set('trainer', trainerName);
            params.set('tasks', taskCount);
            const settingsJson = JSON.stringify(settings);
            const settingsBase64 = btoa(encodeURIComponent(settingsJson));
            params.set('settings', settingsBase64);

            const baseUrl = window.location.origin + window.location.pathname;
            return `${baseUrl}?${params.toString()}`;
        }
    }

    /**
     * Декодирует параметры из URL или Telegram startapp
     * @returns {Object|null} - Объект с параметрами {trainerName, settings, taskCount} или null
     */
    static decodeFromURL() {
        // Проверяем, запущено ли в Telegram
        const tg = window.Telegram?.WebApp;

        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
            // Telegram Mini App: декодируем из одной base64 строки
            try {
                const startParam = tg.initDataUnsafe.start_param;
                // Восстанавливаем стандартный base64 формат
                const base64 = startParam
                    .replace(/-/g, '+')
                    .replace(/_/g, '/');
                // Добавляем padding если нужен
                const padding = '='.repeat((4 - base64.length % 4) % 4);
                const base64WithPadding = base64 + padding;

                const dataJson = decodeURIComponent(atob(base64WithPadding));
                const data = JSON.parse(dataJson);

                return {
                    trainerName: data.trainer,
                    settings: data.settings,
                    taskCount: data.tasks
                };
            } catch (error) {
                console.error('Ошибка декодирования Telegram параметров:', error);
                return null;
            }
        } else {
            // Обычный URL с параметрами
            const params = new URLSearchParams(window.location.search);

            const trainerName = params.get('trainer');
            const taskCount = params.get('tasks');
            const settingsBase64 = params.get('settings');

            if (!trainerName || !settingsBase64 || !taskCount) {
                return null;
            }

            try {
                // Декодируем настройки из base64
                const settingsJson = decodeURIComponent(atob(settingsBase64));
                const settings = JSON.parse(settingsJson);

                return {
                    trainerName,
                    settings,
                    taskCount: parseInt(taskCount, 10)
                };
            } catch (error) {
                console.error('Ошибка декодирования URL параметров:', error);
                return null;
            }
        }
    }

    /**
     * Открывает меню шаринга в Telegram или копирует ссылку
     * @param {string} shareParams - Параметры для шаринга (startapp параметр или полная ссылка)
     * @param {string} trainerName - Название тренажёра для сообщения
     * @param {number} taskCount - Количество задач для сообщения
     * @returns {Promise<boolean>} - true если успешно
     */
    static async shareChallenge(shareParams, trainerName, taskCount) {
        const tg = window.Telegram?.WebApp;

        if (tg) {
            try {
                // Получаем имя бота из initData
                const botUsername = 'rat_math_trainer_bot'; // Замените на ваше имя бота

                // Создаём сообщение для шаринга
                const trainerNames = {
                    'multiplication-table': 'таблице умножения',
                    'divisibility': 'делимости',
                    'square-roots': 'квадратным корням',
                    'percentages': 'процентам',
                    'negatives': 'отрицательным числам',
                    'fractions': 'дробям',
                    'decimals': 'десятичным дробям',
                    'linear-equations': 'линейным уравнениям',
                    'quadratic-equations': 'квадратным уравнениям',
                    'powers': 'степеням',
                    // Добавьте остальные тренажёры по необходимости
                };

                const trainerTitle = trainerNames[trainerName] || trainerName;
                const message = `Челлендж по ${trainerTitle}: реши ${taskCount} задач без ошибок! 🎯`;

                // Создаём полную ссылку для Telegram
                const shareUrl = `https://t.me/${botUsername}?startapp=${encodeURIComponent(shareParams)}`;

                // Используем Telegram API для шаринга
                // Проверяем доступность метода switchInlineQuery (для новых версий)
                if (tg.switchInlineQuery) {
                    // Новый способ - через inline режим бота
                    tg.switchInlineQuery(shareUrl, ['users', 'groups', 'channels']);
                } else {
                    // Альтернативный способ - открываем диалог выбора чата
                    const fullMessage = `${message}\n${shareUrl}`;

                    // Копируем ссылку и показываем нотификацию
                    await this.copyToClipboard(shareUrl);

                    if (tg.showPopup) {
                        tg.showPopup({
                            title: 'Ссылка скопирована!',
                            message: 'Ссылка на челлендж скопирована. Отправьте её другу в Telegram.',
                            buttons: [{type: 'ok'}]
                        });
                    }
                }

                return true;
            } catch (error) {
                console.error('Ошибка шаринга в Telegram:', error);
                // Fallback - копируем в буфер обмена
                return await this.copyToClipboard(`https://t.me/rat_math_trainer_bot?startapp=${encodeURIComponent(shareParams)}`);
            }
        } else {
            // Для обычного браузера - просто копируем ссылку
            return await this.copyToClipboard(shareParams);
        }
    }

    /**
     * Копирует текст в буфер обмена
     * @param {string} text - Текст для копирования
     * @returns {Promise<boolean>} - true если успешно, false если ошибка
     */
    static async copyToClipboard(text) {
        try {
            // Используем Telegram WebApp API если доступен
            const tg = window.Telegram?.WebApp;
            if (tg && tg.isVersionAtLeast && tg.isVersionAtLeast('6.4')) {
                // Для новых версий Telegram используем их API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                } else {
                    throw new Error('Clipboard API not available');
                }
            } else {
                // Стандартный способ
                await navigator.clipboard.writeText(text);
            }
            return true;
        } catch (error) {
            // Fallback для старых браузеров
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                textArea.remove();
                return result;
            } catch (fallbackError) {
                console.error('Ошибка копирования:', fallbackError);
                return false;
            }
        }
    }
}
