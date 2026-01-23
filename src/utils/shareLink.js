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

        // Получаем start_param из разных источников (для совместимости с разными версиями)
        let startParam = null;
        if (tg) {
            // Пробуем получить из launchParams (новый API, может обновляться)
            startParam = tg.launchParams?.startParam
                || tg.initDataUnsafe?.start_param
                || null;
        }

        if (tg && startParam) {
            // Telegram Mini App: декодируем из одной base64 строки
            try {
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
     * Копирует ссылку на челлендж в буфер обмена
     * @param {string} shareParams - Параметры для шаринга (startapp параметр или полная ссылка)
     * @returns {Promise<boolean>} - true если успешно
     */
    static async shareChallenge(shareParams) {
        const tg = window.Telegram?.WebApp;

        if (tg) {
            // Для Telegram Mini App: создаём полную ссылку и копируем в буфер
            const botUsername = 'rat_math_trainer_bot';
            const shareUrl = `https://t.me/${botUsername}?startapp=${shareParams}`;

            const success = await this.copyToClipboard(shareUrl);

            if (success && tg.showPopup) {
                tg.showPopup({
                    title: 'Ссылка скопирована!',
                    message: 'Ссылка на челлендж скопирована в буфер обмена.',
                    buttons: [{type: 'ok'}]
                });
            }

            return success;
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
