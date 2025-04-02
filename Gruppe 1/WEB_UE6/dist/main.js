import { QuizGame } from "./uiModule.js";
import { displayGlobalLeaderboard } from "./scoringModule.js";
async function initQuiz() {
    try {
        // Ladet die Fragen aus der externen JSON-Datei
        const response = await fetch("questions.json");
        const questions = await response.json();
        // Füge das Eingabeformular für den Spielernamen in die Seite ein.
        const playerInputDiv = document.getElementById("player-input");
        playerInputDiv.innerHTML = `
      <form id="player-form">
        <div class="form-group">
          <label for="playerName">Gib deinen Namen ein:</label>
          <input type="text" class="form-control" id="playerName" required>
        </div>
        <button type="submit" class="btn btn-primary">Start Quiz</button>
      </form>
    `;
        // Zeige das bestehende Leaderboard an, bevor ein neues Spiel gestartet wird.
        displayGlobalLeaderboard();
        let quizGame;
        const playerForm = document.getElementById("player-form");
        playerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const playerNameInput = document.getElementById("playerName");
            const playerName = playerNameInput.value.trim();
            if (playerName) {
                // Initialisiere eine neue QuizGame-Instanz mit den geladenen Fragen und starte das Quiz.
                quizGame = new QuizGame(questions);
                quizGame.startQuiz(playerName);
            }
        });
    }
    catch (error) {
        console.error("Error loading questions:", error);
    }
}
// Initialisiere die Quiz-Anwendung, sobald das DOM geladen ist.
document.addEventListener("DOMContentLoaded", initQuiz);
