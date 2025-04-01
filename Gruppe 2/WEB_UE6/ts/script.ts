/*
 * Schnittstelle, die die Struktur einer Quizfrage definiert.
 * Jede Frage enthält die Kategorie, den Fragetext, die Antwortoptionen, die korrekte Antwort und den Schwierigkeitsgrad.
 */
interface Question {
    category: string;
    question: string;
    options: (string | number)[];
    answer: string | number;
    difficulty: string;
  }
  
  /*
   * Mapping zur Vergabe der Punkte basierend auf dem Schwierigkeitsgrad.
   * easy = 1 Punkt, medium = 2 Punkte, hard = 3 Punkte.
   */
  const pointsPerDifficulty: { [key: string]: number } = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  
  /*
   * Schnittstelle für einen Leaderboard-Eintrag.
   * Hier wird der berechnete Prozentwert bereits als fester String gespeichert.
   */
  interface LeaderboardEntry {
    name: string;
    score: number;
    percentage: string;
  }
  
  /*
   * Klasse QuizGame: Verantwortlich für die zentrale Funktionalität des Quiz.
   * - Verwalten des Fragenpools.
   * - Auswählen einer ausgewogenen Fragenauswahl (1 easy, 2 medium, 2 hard).
   * - Anzeigen der Fragen und Verarbeiten der Antworten.
   * - Berechnen und Aktualisieren der Punktzahl.
   * - Verwalten des Leaderboards.
   */
  class QuizGame {
    // Array, das alle aus der JSON-Datei geladenen Fragen speichert.
    private allQuestions: Question[] = [];
    // Array, das die ausgewählten Fragen für die aktuelle Quizrunde speichert.
    private quizQuestions: Question[] = [];
    // Index der aktuell angezeigten Frage.
    private currentQuestionIndex: number = 0;
    // Aktuelle Punktzahl des Spielers.
    private score: number = 0;
    // Maximale Punktzahl, die mit den ausgewählten Fragen erreichbar ist.
    private maxScore: number = 0;
    // Name des aktuellen Spielers.
    private playerName: string = "";
  
    // Referenzen zu den wichtigen DOM-Elementen.
    private playerInputDiv = document.getElementById("player-input") as HTMLElement;
    private quizContainer = document.getElementById("quiz-container") as HTMLElement;
    private leaderboardDiv = document.getElementById("leaderboard") as HTMLElement;
  
    /*
     * Konstruktor: Initialisiert das Quiz mit dem vollständigen Fragenpool.
     * Es wird eine ausgewogene Fragenauswahl getroffen und die maximale erreichbare Punktzahl berechnet.
     * @param questions: Array der aus der JSON-Datei geladenen Fragen.
     */
    constructor(questions: Question[]) {
      this.allQuestions = questions;
      // Wähle eine ausgewogene Fragenauswahl: 1 easy, 2 medium und 2 hard Fragen.
      this.quizQuestions = this.selectBalancedQuestions(this.allQuestions);
      // Berechne die maximale Punktzahl basierend auf den ausgewählten Fragen.
      this.maxScore = this.calculateMaxScore(this.quizQuestions);
    }
  
    /*
     * selectBalancedQuestions: Wählt aus dem Fragenpool genau 1 easy, 2 medium und 2 hard Fragen aus.
     * @param questionBank: Array aller verfügbaren Fragen.
     * @returns Ein Array mit 5 Fragen, ausgewählt nach der vordefinierten Verteilung.
     */
    private selectBalancedQuestions(questionBank: Question[]): Question[] {
      // Definiert die gewünschte Anzahl von Fragen pro Schwierigkeitsgrad.
      const distribution: { [key: string]: number } = { easy: 1, medium: 2, hard: 2 };
      let selected: Question[] = [];
  
      // Verwende Object.keys() und mappe die Einträge auf ein Array von [Schwierigkeitsgrad, Anzahl]-Tupeln.
      const entries: [string, number][] = Object.keys(distribution).map(key => [key, distribution[key]]);
      entries.forEach(([difficulty, count]) => {
        // Filtere Fragen, die zum aktuellen Schwierigkeitsgrad passen.
        let available = questionBank.filter(
          (q) => q.difficulty.toLowerCase() === difficulty
        );
        for (let i = 0; i < count; i++) {
          if (available.length > 0) {
            // Wähle zufällig eine Frage aus und entferne sie aus dem Pool.
            const randomIndex = Math.floor(Math.random() * available.length);
            selected.push(available.splice(randomIndex, 1)[0]);
          }
        }
      });
      // Mische die ausgewählten Fragen, um die Reihenfolge zu randomisieren.
      selected.sort(() => Math.random() - 0.5);
      return selected;
    }
  
    /*
     * calculateMaxScore: Berechnet die maximal erreichbare Punktzahl für die ausgewählten Fragen.
     * Es werden die Punkte jedes Schwierigkeitsgrads summiert.
     * @param questions: Array der ausgewählten Fragen.
     * @returns Die insgesamt maximale Punktzahl.
     */
    private calculateMaxScore(questions: Question[]): number {
      return questions.reduce((sum, q) => {
        const diff = q.difficulty.toLowerCase();
        // Punktezuweisung: easy = 1, medium = 2, hard = 3
        const points = diff === "easy" ? 1 : diff === "medium" ? 2 : 3;
        return sum + points;
      }, 0);
    }
  
    /*
     * startQuiz: Startet das Quiz.
     * Setzt den Spielernamen, setzt Punktzahl und Frageindex zurück und zeigt die erste Frage an.
     * @param playerName: Vom Spieler eingegebener Name.
     */
    public startQuiz(playerName: string): void {
      this.playerName = playerName;
      this.currentQuestionIndex = 0;
      this.score = 0;
      // Zeige den Quiz-Container an und blende das Spieler-Eingabeformular aus.
      this.quizContainer.style.display = "block";
      this.playerInputDiv.style.display = "none";
      // Zeige die erste Frage.
      this.displayQuestion();
    }
  
    /*
     * displayQuestion: Zeigt die aktuelle Frage und die zugehörigen Antwortoptionen an.
     * Falls keine weiteren Fragen vorhanden sind, wird endQuiz aufgerufen.
     */
    private displayQuestion(): void {
      if (this.currentQuestionIndex >= this.quizQuestions.length) {
        this.endQuiz();
        return;
      }
  
      // Hole die aktuelle Frage aus der ausgewählten Fragenauswahl.
      const currentQ = this.quizQuestions[this.currentQuestionIndex];
      // Erstelle das HTML-Markup für die Frage und die Antwortoptionen.
      let html = `<h3>${currentQ.question}</h3>`;
      html += `<div id="options" class="list-group">`;
      currentQ.options.forEach((option) => {
        html += `<button class="list-group-item list-group-item-action" data-option="${option}">${option}</button>`;
      });
      html += `</div>`;
      // Erstelle einen Bereich für das unmittelbare Feedback zur Antwort.
      html += `<div id="feedback" class="mt-3"></div>`;
  
      // Füge das generierte HTML in den Quiz-Container ein.
      this.quizContainer.querySelector(".card-body")!.innerHTML = html;
  
      // Füge Event-Listener zu den Antwortoptionen hinzu.
      const optionButtons = this.quizContainer.querySelectorAll(
        "#options button"
      );
      optionButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          // Hole die ausgewählte Antwort.
          const selectedOption = (e.target as HTMLElement).getAttribute("data-option");
          // Verarbeite die Antwort.
          this.handleAnswer(selectedOption!);
        });
      });
    }
  
    /*
     * handleAnswer: Verarbeitet die vom Spieler gewählte Antwort.
     * Vergleicht die Auswahl mit der korrekten Antwort, aktualisiert die Punktzahl und zeigt ein Feedback an.
     * Anschließend wird nach kurzer Verzögerung die nächste Frage angezeigt.
     * @param selectedOption: Die vom Spieler gewählte Antwort.
     */
    private handleAnswer(selectedOption: string | number): void {
      const currentQ = this.quizQuestions[this.currentQuestionIndex];
      const feedbackDiv = document.getElementById("feedback") as HTMLElement;
      // Überprüfe, ob die gewählte Antwort mit der korrekten Antwort übereinstimmt.
      if (selectedOption.toString() === currentQ.answer.toString()) {
        feedbackDiv.innerHTML = `<div class="alert alert-success">Correct!</div>`;
        // Aktualisiere die Punktzahl basierend auf dem Schwierigkeitsgrad der Frage.
        const diff = currentQ.difficulty.toLowerCase();
        this.score += pointsPerDifficulty[diff];
      } else {
        feedbackDiv.innerHTML = `<div class="alert alert-danger">Incorrect. The correct answer is ${currentQ.answer}.</div>`;
      }
      // Erhöhe den Frageindex, um zur nächsten Frage zu gelangen.
      this.currentQuestionIndex++;
      // Warte eine Sekunde, bevor die nächste Frage angezeigt wird.
      setTimeout(() => {
        this.displayQuestion();
      }, 1000);
    }
  
    /*
     * endQuiz: Beendet das Quiz, sobald alle Fragen beantwortet wurden.
     * Berechnet die finale Punktzahl und Prozentzahl, zeigt die Ergebnisse an
     * und aktualisiert das Leaderboard mit der Leistung des Spielers.
     */
    private endQuiz(): void {
      const percentage = this.maxScore > 0 ? ((this.score / this.maxScore) * 100).toFixed(2) : "0";
      const resultHtml = `
        <h3>Quiz Completed!</h3>
        <p>Your Score: ${this.score} / ${this.maxScore}</p>
        <p>Percentage: ${percentage}%</p>
      `;
      // Ersetze den Inhalt des Quiz-Containers durch die Endergebnisse.
      this.quizContainer.querySelector(".card-body")!.innerHTML = resultHtml;
      // Füge den aktuellen Spieler dem Leaderboard hinzu und aktualisiere die Anzeige.
      this.updateLeaderboard();
    }
  
    /*
     * updateLeaderboard: Fügt den aktuellen Spieler ins Leaderboard ein,
     * speichert das Ergebnis in localStorage und ruft displayGlobalLeaderboard() auf,
     * um das Leaderboard mit allen bisherigen Einträgen anzuzeigen.
     * Hier wird der Prozentwert direkt berechnet und gespeichert.
     */
    private updateLeaderboard(): void {
      const leaderboardKey = "quizLeaderboard";
      let leaderboard: LeaderboardEntry[] =
        JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
      // Berechne den Prozentsatz für den aktuellen Spieler.
      const percentage = this.maxScore > 0 ? ((this.score / this.maxScore) * 100).toFixed(2) : "0";
      leaderboard.push({ name: this.playerName, score: this.score, percentage: percentage });
      leaderboard.sort((a, b) => b.score - a.score);
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
      displayGlobalLeaderboard();
    }
  }
  
  /*
   * displayGlobalLeaderboard: Liest das Leaderboard aus localStorage aus und zeigt es an.
   * Diese Funktion wird auch beim Laden der Seite aufgerufen, damit das Leaderboard
   * bereits vor Beginn eines neuen Spiels sichtbar ist.
   */
  function displayGlobalLeaderboard(): void {
    const leaderboardKey = "quizLeaderboard";
    const leaderboardDiv = document.getElementById("leaderboard") as HTMLElement;
    let leaderboard: LeaderboardEntry[] =
      JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
    leaderboard.sort((a, b) => b.score - a.score);
    let html = `<ul class="list-group">`;
    leaderboard.forEach((entry) => {
      html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                  ${entry.name} - ${entry.percentage}% 
                  <span class="badge badge-primary badge-pill">${entry.score}</span>
                </li>`;
    });
    html += `</ul>`;
    leaderboardDiv.innerHTML = `<h2>Leaderboard</h2>${html}`;
  }
  
  /*
   * initQuiz: Initialisiert die Quiz-Anwendung.
   * Lädt die Fragen aus der JSON-Datei, erstellt das Formular für den Spielernamen
   * und richtet Event-Listener zum Starten des Quiz ein.
   */
  async function initQuiz() {
    try {
      // Lade die Fragen aus der externen JSON-Datei.
      const response = await fetch("questions.json");
      const questions: Question[] = await response.json();
  
      // Füge das Eingabeformular für den Spielernamen in die Seite ein.
      const playerInputDiv = document.getElementById("player-input") as HTMLElement;
      playerInputDiv.innerHTML = `
        <form id="player-form">
          <div class="form-group">
            <label for="playerName">Enter your name:</label>
            <input type="text" class="form-control" id="playerName" required>
          </div>
          <button type="submit" class="btn btn-primary">Start Quiz</button>
        </form>
      `;
      // Zeige das bestehende Leaderboard an, bevor ein neues Spiel gestartet wird.
      displayGlobalLeaderboard();
  
      let quizGame: QuizGame;
      const playerForm = document.getElementById("player-form") as HTMLFormElement;
      playerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
        const playerName = playerNameInput.value.trim();
        if (playerName) {
          // Initialisiere eine neue QuizGame-Instanz mit den geladenen Fragen und starte das Quiz.
          quizGame = new QuizGame(questions);
          quizGame.startQuiz(playerName);
        }
      });
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  }
  
  // Initialisiere die Quiz-Anwendung, sobald das DOM geladen ist.
  document.addEventListener("DOMContentLoaded", initQuiz);
  