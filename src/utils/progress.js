// Система прогресса и уровней

class ProgressTracker {
    constructor() {
        this.loadProgress();
    }

    // Загрузка прогресса из localStorage
    loadProgress() {
        const saved = localStorage.getItem('mathTrainerProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.level = data.level || 1;
            this.currentProgress = data.currentProgress || 0;
            this.totalCorrect = data.totalCorrect || 0;
            this.totalAttempts = data.totalAttempts || 0;
        } else {
            this.level = 1;
            this.currentProgress = 0;
            this.totalCorrect = 0;
            this.totalAttempts = 0;
        }
    }

    // Сохранение прогресса
    saveProgress() {
        localStorage.setItem('mathTrainerProgress', JSON.stringify({
            level: this.level,
            currentProgress: this.currentProgress,
            totalCorrect: this.totalCorrect,
            totalAttempts: this.totalAttempts
        }));
    }

    // Получение требуемого количества правильных ответов для текущего уровня
    getRequiredForLevel() {
        switch (this.level) {
            case 1: return 10;
            case 2: return 20;
            case 3: return 50;
            case 4: return 100;
            default: return 100;
        }
    }

    // Обработка правильного ответа
    correctAnswer() {
        this.currentProgress++;
        this.totalCorrect++;
        this.totalAttempts++;

        const required = this.getRequiredForLevel();

        // Проверка перехода на следующий уровень
        if (this.currentProgress >= required && this.level < 4) {
            this.level++;
            this.currentProgress = 0;
            this.saveProgress();
            return { levelUp: true, newLevel: this.level };
        }

        this.saveProgress();
        return { levelUp: false };
    }

    // Обработка неправильного ответа
    wrongAnswer() {
        this.currentProgress = 0; // Сброс прогресса
        this.totalAttempts++;
        this.saveProgress();
    }

    // Получение прогресса в процентах
    getProgressPercent() {
        const required = this.getRequiredForLevel();
        return (this.currentProgress / required) * 100;
    }

    // Получение названия уровня
    getLevelName() {
        return `Уровень ${this.level}`;
    }

    // Получение текста прогресса
    getProgressText() {
        const required = this.getRequiredForLevel();
        return `${this.currentProgress}/${required}`;
    }

    // Сброс прогресса
    reset() {
        this.level = 1;
        this.currentProgress = 0;
        this.totalCorrect = 0;
        this.totalAttempts = 0;
        this.saveProgress();
    }

    // Получение статистики
    getStats() {
        return {
            level: this.level,
            currentProgress: this.currentProgress,
            totalCorrect: this.totalCorrect,
            totalAttempts: this.totalAttempts,
            accuracy: this.totalAttempts > 0
                ? Math.round((this.totalCorrect / this.totalAttempts) * 100)
                : 0
        };
    }
}
