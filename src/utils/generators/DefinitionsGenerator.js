// Генератор вопросов по определениям
class DefinitionsGenerator {
    constructor(settings = {}) {
        this.settings = {
            selectedSections: [], // Выбранные разделы для тренировки
            ...settings
        };
        this.definitions = [];
        this.loadingPromise = null;
    }

    // Загрузка определений
    async loadDefinitions() {
        // Если уже загружаем, возвращаем существующий промис
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        // Если уже загружено, просто возвращаем
        if (this.definitions.length > 0) {
            return Promise.resolve();
        }

        this.loadingPromise = (async () => {
            try {
                // Используем встроенные данные, если доступны
                if (typeof DEFINITIONS_DATA !== 'undefined') {
                    this.definitions = DEFINITIONS_DATA;
                    console.log('Определения загружены из встроенных данных:', this.definitions);
                } else {
                    // Fallback: пытаемся загрузить из JSON файла
                    const response = await fetch('./defenitions.json');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    this.definitions = await response.json();
                    console.log('Определения загружены из файла:', this.definitions);
                }
            } catch (error) {
                console.error('Ошибка загрузки определений:', error);
                this.definitions = [];
                throw error; // Пробрасываем ошибку выше
            }
        })();

        return this.loadingPromise;
    }

    // Обновление настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    // Получить все доступные разделы
    getAllSections() {
        const sections = [];
        this.definitions.forEach(classData => {
            classData.sections.forEach(section => {
                sections.push({
                    class: classData.class,
                    sectionName: section.section,
                    termsCount: section.terms.length
                });
            });
        });
        return sections;
    }

    // Получить разделы по классу
    getSectionsByClass(classNumber) {
        const classData = this.definitions.find(c => c.class === classNumber);
        if (!classData) return [];

        return classData.sections.map(section => ({
            class: classNumber,
            sectionName: section.section,
            termsCount: section.terms.length
        }));
    }

    // Получить термины из выбранных разделов
    getTermsFromSelectedSections() {
        const terms = [];

        this.settings.selectedSections.forEach(sectionInfo => {
            const classData = this.definitions.find(c => c.class === sectionInfo.class);
            if (!classData) return;

            const section = classData.sections.find(s => s.section === sectionInfo.sectionName);
            if (!section) return;

            section.terms.forEach(term => {
                terms.push({
                    ...term,
                    class: sectionInfo.class,
                    section: sectionInfo.sectionName
                });
            });
        });

        return terms;
    }

    // Получить термины для дополнения вариантов ответов
    getAdditionalTerms(correctTerm, count) {
        // Сначала пытаемся взять термины из того же раздела
        const classData = this.definitions.find(c => c.class === correctTerm.class);
        if (!classData) return [];

        const section = classData.sections.find(s => s.section === correctTerm.section);
        if (!section) return [];

        // Термины из того же раздела (исключая правильный ответ)
        let availableTerms = section.terms
            .filter(t => t.term !== correctTerm.term)
            .map(t => ({
                ...t,
                class: correctTerm.class,
                section: correctTerm.section
            }));

        // Если в разделе меньше 3 терминов, берем из более ранних разделов того же или более ранних классов
        if (availableTerms.length < count) {
            // Получаем термины из более ранних разделов
            this.definitions.forEach(classData => {
                if (classData.class <= correctTerm.class) {
                    classData.sections.forEach(section => {
                        section.terms.forEach(term => {
                            // Добавляем только если термина еще нет в списке
                            if (!availableTerms.find(t => t.term === term.term) &&
                                term.term !== correctTerm.term) {
                                availableTerms.push({
                                    ...term,
                                    class: classData.class,
                                    section: section.section
                                });
                            }
                        });
                    });
                }
            });
        }

        // Перемешиваем и берем нужное количество
        const shuffled = this.shuffle(availableTerms);
        return shuffled.slice(0, count);
    }

    // Генерация вопроса
    generate() {
        const terms = this.getTermsFromSelectedSections();

        if (terms.length === 0) {
            return null;
        }

        // Выбираем случайный термин
        const correctTerm = terms[Math.floor(Math.random() * terms.length)];

        // Генерируем неправильные варианты ответов
        const wrongAnswers = this.getAdditionalTerms(correctTerm, 3);

        // Формируем все варианты ответов
        const allAnswers = [
            { term: correctTerm.term, isCorrect: true },
            ...wrongAnswers.map(t => ({ term: t.term, isCorrect: false }))
        ];

        // Перемешиваем варианты ответов
        const shuffledAnswers = this.shuffle(allAnswers);

        return {
            definition: correctTerm.definition,
            correctTerm: correctTerm.term,
            answers: shuffledAnswers,
            section: correctTerm.section,
            class: correctTerm.class
        };
    }

    // Перемешивание массива (алгоритм Фишера-Йетса)
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    // Проверка ответа
    checkAnswer(userAnswer, problem) {
        return userAnswer === problem.correctTerm;
    }
}
