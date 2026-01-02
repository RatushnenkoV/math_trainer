// Генератор вопросов по определениям
class DefinitionsGenerator {
    constructor(settings = {}) {
        this.settings = {
            selectedSections: [], // Выбранные разделы для тренировки
            termByDefinition: true, // Режим: термин по определению
            definitionByTerm: false, // Режим: определение по термину
            matching: false, // Режим: сопоставление терминов и определений
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

        // Определяем доступные режимы
        const availableModes = [];
        if (this.settings.termByDefinition) availableModes.push('termByDefinition');
        if (this.settings.definitionByTerm) availableModes.push('definitionByTerm');
        if (this.settings.matching) availableModes.push('matching');

        if (availableModes.length === 0) {
            return null; // Ни один режим не выбран
        }

        // Выбираем случайный режим из доступных
        const mode = availableModes[Math.floor(Math.random() * availableModes.length)];

        if (mode === 'matching') {
            // Режим сопоставления: выбираем термины из одного раздела
            // Группируем термины по разделам
            const termsBySection = {};
            terms.forEach(term => {
                const key = `${term.class}_${term.section}`;
                if (!termsBySection[key]) {
                    termsBySection[key] = [];
                }
                termsBySection[key].push(term);
            });

            // Находим разделы с достаточным количеством терминов
            const suitableSections = Object.entries(termsBySection).filter(([_, sectionTerms]) => sectionTerms.length >= 2);

            if (suitableSections.length === 0) {
                return null; // Нет подходящих разделов
            }

            // Выбираем случайный раздел
            const [_, sectionTerms] = suitableSections[Math.floor(Math.random() * suitableSections.length)];

            // Берём до 4 терминов из этого раздела
            const shuffledSectionTerms = this.shuffle([...sectionTerms]);
            const selectedTerms = shuffledSectionTerms.slice(0, Math.min(4, sectionTerms.length));

            // Перемешиваем термины и определения отдельно
            const shuffledTermsList = this.shuffle(selectedTerms.map(t => ({
                id: t.term,
                text: t.term
            })));
            const shuffledDefinitionsList = this.shuffle(selectedTerms.map(t => ({
                id: t.term,
                text: t.definition
            })));

            return {
                mode: 'matching',
                terms: shuffledTermsList,
                definitions: shuffledDefinitionsList,
                pairs: selectedTerms.map(t => ({ term: t.term, definition: t.definition })),
                count: selectedTerms.length
            };
        }

        // Выбираем случайный термин
        const correctTerm = terms[Math.floor(Math.random() * terms.length)];

        if (mode === 'termByDefinition') {
            // Режим: дано определение, нужно выбрать термин
            const wrongAnswers = this.getAdditionalTerms(correctTerm, 3);

            const allAnswers = [
                { text: correctTerm.term, isCorrect: true },
                ...wrongAnswers.map(t => ({ text: t.term, isCorrect: false }))
            ];

            const shuffledAnswers = this.shuffle(allAnswers);

            return {
                mode: 'termByDefinition',
                question: correctTerm.definition,
                correctAnswer: correctTerm.term,
                answers: shuffledAnswers,
                section: correctTerm.section,
                class: correctTerm.class
            };
        } else {
            // Режим: дан термин, нужно выбрать определение
            const wrongAnswers = this.getAdditionalTerms(correctTerm, 3);

            const allAnswers = [
                { text: correctTerm.definition, isCorrect: true },
                ...wrongAnswers.map(t => ({ text: t.definition, isCorrect: false }))
            ];

            const shuffledAnswers = this.shuffle(allAnswers);

            return {
                mode: 'definitionByTerm',
                question: correctTerm.term,
                correctAnswer: correctTerm.definition,
                answers: shuffledAnswers,
                section: correctTerm.section,
                class: correctTerm.class
            };
        }
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
        return userAnswer === problem.correctAnswer;
    }
}
