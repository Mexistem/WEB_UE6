//Die Punkte für die Schwierigkeit
export const pointsDifficulty = {
    easy: 1,
    medium: 2,
    hard: 3,
};
//Wählt aus dem Fragenpool genau 1 easy, 2 medium und 2 hard Fragen aus
export function selectQuestions(questionBank) {
    // Definiert die gewünschte Anzahl von Fragen pro Schwierigkeitsgrad
    const distribution = { easy: 1, medium: 2, hard: 2 };
    let selected = [];
    // [Schwierigkeitsgrad, Anzahl]-Tupel
    const entries = Object.keys(distribution).map(key => [key, distribution[key]]);
    entries.forEach(([difficulty, count]) => {
        // Filtere Fragen, die zum aktuellen Schwierigkeitsgrad passen
        let available = questionBank.filter((q) => q.difficulty.toLowerCase() === difficulty);
        for (let i = 0; i < count; i++) {
            if (available.length > 0) {
                // Wähle zufällig eine Frage aus und entferne sie aus dem Pool
                const randomIndex = Math.floor(Math.random() * available.length);
                selected.push(available.splice(randomIndex, 1)[0]);
            }
        }
    });
    // Mischt die ausgewählten Fragen
    selected.sort(() => Math.random() - 0.5);
    return selected;
}
//Geht alle Fragen durch und berechnet die Summe der Punktewertungen
export function calculateMaxScore(questions) {
    return questions.reduce((sum, q) => {
        const diff = q.difficulty.toLowerCase();
        const points = diff === "easy" ? 1 : diff === "medium" ? 2 : 3;
        return sum + points;
    }, 0);
}
