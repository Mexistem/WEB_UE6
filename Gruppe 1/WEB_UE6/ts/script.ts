//Struktur einer Quizfrage
interface Question {
    category: string;
    question: string;
    options: (string | number)[];
    answer: string | number;
    difficulty: string;
  }
  
  //Die Punkte für die Schwierigkeit
  const pointsDifficulty: { [key: string]: number } = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  
  //Struktur eines Ranglisteneintrags
  interface LeaderboardEntry {
    name: string;
    score: number;
    percentage: string;
  }
  
  class QuizGame {
    // Speichert alle aus der JSON Datei geladenen Fragen
    private allQuestions: Question[] = [];
    // Speichert die ausgewählten Fragen aus dem Pool
    private quizQuestions: Question[] = [];
    // Index der aktuell angezeigten Frage
    private currentQuestionIndex: number = 0;
    // Aktuelle Punktzahl des Spielers
    private score: number = 0;
    // Maximale Punktzahl, die mit den ausgewählten Fragen erreichbar ist
    private maxScore: number = 0;
    // Name des aktuellen Spielers
    private playerName: string = "";
  
    private playerInputDiv = document.getElementById("player-input") as HTMLElement;
    private quizContainer = document.getElementById("quiz-container") as HTMLElement;
    private leaderboardDiv = document.getElementById("leaderboard") as HTMLElement;
  
    constructor(questions: Question[]) {
      this.allQuestions = questions;
      // 1 easy, 2 medium und 2 hard Fragen
      this.quizQuestions = this.selectQuestions(this.allQuestions);
      // Berechnet die maximale Punktzahl 
      this.maxScore = this.calculateMaxScore(this.quizQuestions);
    }
  
    
    private selectQuestions(questionBank: Question[]): Question[] {
      // Definiert die gewünschte Anzahl von Fragen pro Schwierigkeitsgrad
      const distribution: { [key: string]: number } = { easy: 1, medium: 2, hard: 2 };
      let selected: Question[] = [];
  
      // [Schwierigkeitsgrad, Anzahl]-Tupel
      const entries: [string, number][] = Object.keys(distribution).map(key => [key, distribution[key]]);
      entries.forEach(([difficulty, count]) => {
        // Filtere Fragen, die zum aktuellen Schwierigkeitsgrad passen
        let available = questionBank.filter(
          (q) => q.difficulty.toLowerCase() === difficulty
        );
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
    private calculateMaxScore(questions: Question[]): number {
      return questions.reduce((sum, q) => {
        const diff = q.difficulty.toLowerCase();
        const points = diff === "easy" ? 1 : diff === "medium" ? 2 : 3;
        return sum + points;
      }, 0);
    }
  
    //Initialisiert das Quiz und blendet den Input für den Spielernamen aus
    public startQuiz(playerName: string): void {
      this.playerName = playerName;
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.quizContainer.style.display = "block";
      this.playerInputDiv.style.display = "none";
      // Zeige die erste Frage
      this.displayQuestion();
    }
  
    //Wenn alle Fragen abgeschlossen sind wird das Quiz beendet
    private displayQuestion(): void {
      if (this.currentQuestionIndex >= this.quizQuestions.length) {
        this.endQuiz();
        return;
      }
  
      // Holt die aktuelle Frage 
      const currentQ = this.quizQuestions[this.currentQuestionIndex];
      // Erstelle HTML für die Frage und die Antwortoptionen
      let html = `<h3>${currentQ.question}</h3>`;
      html += `<div id="options" class="list-group">`;
      currentQ.options.forEach((option) => {
        html += `<button class="list-group-item list-group-item-action" data-option="${option}">${option}</button>`;
      });
      html += `</div>`;
      // Feedback zur Antwort.
      html += `<div id="feedback" class="mt-3"></div>`;
  
      // Fügt HTML in den Quiz-Container ein
      this.quizContainer.querySelector(".card-body")!.innerHTML = html;
      //Alle Button-Elemente mit ID options selektieren
      const optionButtons = this.quizContainer.querySelectorAll(
        "#options button"
      );
      optionButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const selectedOption = (e.target as HTMLElement).getAttribute("data-option");
          this.handleAnswer(selectedOption!);
        });
      });
    }
  
    private handleAnswer(selectedOption: string | number): void {
      const currentQ = this.quizQuestions[this.currentQuestionIndex];
      const feedbackDiv = document.getElementById("feedback") as HTMLElement;
      // Überprüft, ob die gewählte Antwort mit der korrekten Antwort übereinstimmt
      if (selectedOption.toString() === currentQ.answer.toString()) {
        feedbackDiv.innerHTML = `<div class="alert alert-success">Correct!</div>`;
        // Aktualisiert die Punktzahl 
        const diff = currentQ.difficulty.toLowerCase();
        this.score += pointsDifficulty[diff];
      } else {
        feedbackDiv.innerHTML = `<div class="alert alert-danger">Incorrect. The correct answer is ${currentQ.answer}.</div>`;
      }
      // Erhöht den Frageindex, um zur nächsten Frage zu gelangen
      this.currentQuestionIndex++;
      // Wartet eine Sekunde, bevor die nächste Frage angezeigt wird
      setTimeout(() => {
        this.displayQuestion();
      }, 1000);
    }
  
    private endQuiz(): void {
      //Gibt die Prozente mit einer Nachkommastelle aus
      const percentage = ((this.score / this.maxScore) * 100).toFixed(1);
      const resultHtml = `
        <h3>Quiz Abgeschlossen!</h3>
        <p>Deine Punkteanzahl: ${this.score} / ${this.maxScore}</p>
        <p>Prozentanteil: ${percentage}%</p>
      `;
      // Ersetzt den Inhalt des Quiz-Containers durch die Endergebnisse
      this.quizContainer.querySelector(".card-body")!.innerHTML = resultHtml;
      // Füge den aktuellen Spieler dem Leaderboard hinzu
      this.updateLeaderboard();
    }
  
    private updateLeaderboard(): void {
      const leaderboardKey = "quizLeaderboard";
      //Der bisher gespeicherte Leaderboard-String wird gelesen und mit JSON.parse in LeaderboardEntry-Objekte umgewandelt
      let leaderboard: LeaderboardEntry[] =
        JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
      const percentage = ((this.score / this.maxScore) * 100).toFixed(2);
      leaderboard.push({ name: this.playerName, score: this.score, percentage: percentage });
      leaderboard.sort((a, b) => b.score - a.score);
      //in JSON-String umwandeln
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
      displayGlobalLeaderboard();
    }
  }
  
  function displayGlobalLeaderboard(): void {
    const leaderboardKey = "quizLeaderboard";
    const leaderboardDiv = document.getElementById("leaderboard") as HTMLElement;
    let leaderboard: LeaderboardEntry[] =
      JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
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
  
  async function initQuiz() {
    try {
      // Ladet die Fragen aus der externen JSON-Datei
      const response = await fetch("questions.json");
      const questions: Question[] = await response.json();
  
      // Füge das Eingabeformular für den Spielernamen in die Seite ein.
      const playerInputDiv = document.getElementById("player-input") as HTMLElement;
      playerInputDiv.innerHTML = `
        <form id="player-form">
          <div class="form-group">
            <label for="playerName">Gib deinen Namen ein:</label>
            <input type="text" class="form-control" id="playerName" required>
          </div>
          <button type="submit" class="btn btn-primary">Start Quiz</button>
        </form>
      `;
      displayGlobalLeaderboard();
  
      //Verarbeitung der Eingabe des Spielernamens
      let quizGame: QuizGame;
      const playerForm = document.getElementById("player-form") as HTMLFormElement;
      playerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
        const playerName = playerNameInput.value.trim();
        if (playerName) {
          quizGame = new QuizGame(questions);
          quizGame.startQuiz(playerName);
        }
      });
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  }
  
  document.addEventListener("DOMContentLoaded", initQuiz);
