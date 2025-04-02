import { selectQuestions, calculateMaxScore, pointsDifficulty } from "./questionModule.js";
import { updateLeaderboard } from "./scoringModule.js";
//Klasse QuizGame
export class QuizGame {
    constructor(questions) {
        this.allQuestions = [];
        this.quizQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.maxScore = 0;
        this.playerName = "";
        this.playerInputDiv = document.getElementById("player-input");
        this.quizContainer = document.getElementById("quiz-container");
        this.allQuestions = questions;
        // 1 easy, 2 medium und 2 hard Fragen
        this.quizQuestions = selectQuestions(this.allQuestions);
        // Berechnet die maximale Punktzahl 
        this.maxScore = calculateMaxScore(this.quizQuestions);
    }
    //Initialisiert das Quiz und blendet den Input für den Spielernamen aus
    startQuiz(playerName) {
        this.playerName = playerName;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizContainer.style.display = "block";
        this.playerInputDiv.style.display = "none";
        // Zeige die erste Frage
        this.displayQuestion();
    }
    //Wenn alle Fragen abgeschlossen sind wird das Quiz beendet
    displayQuestion() {
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
        // Feedback zur Antwort
        html += `<div id="feedback" class="mt-3"></div>`;
        // Fügt HTML in den Quiz-Container ein
        this.quizContainer.querySelector(".card-body").innerHTML = html;
        //Alle Button-Elemente mit ID options selektieren
        const optionButtons = this.quizContainer.querySelectorAll("#options button");
        optionButtons.forEach((button) => {
            button.addEventListener("click", (e) => {
                const selectedOption = e.target.getAttribute("data-option");
                this.handleAnswer(selectedOption);
            });
        });
    }
    handleAnswer(selectedOption) {
        const currentQ = this.quizQuestions[this.currentQuestionIndex];
        const feedbackDiv = document.getElementById("feedback");
        // Überprüft, ob die gewählte Antwort mit der korrekten Antwort übereinstimmt
        if (selectedOption.toString() === currentQ.answer.toString()) {
            feedbackDiv.innerHTML = `<div class="alert alert-success">Correct!</div>`;
            // Aktualisiert die Punktzahl 
            const diff = currentQ.difficulty.toLowerCase();
            this.score += pointsDifficulty[diff];
        }
        else {
            feedbackDiv.innerHTML = `<div class="alert alert-danger">Incorrect. The correct answer is ${currentQ.answer}.</div>`;
        }
        // Erhöht den Frageindex, um zur nächsten Frage zu gelangen
        this.currentQuestionIndex++;
        // Wartet eine Sekunde, bevor die nächste Frage angezeigt wird
        setTimeout(() => {
            this.displayQuestion();
        }, 1000);
    }
    endQuiz() {
        //Gibt die Prozente mit einer Nachkommastelle aus
        const percentage = ((this.score / this.maxScore) * 100).toFixed(1);
        const resultHtml = `
        <h3>Quiz Abgeschlossen!</h3>
        <p>Deine Punkteanzahl: ${this.score} / ${this.maxScore}</p>
        <p>Prozentanteil: ${percentage}%</p>
      `;
        // Ersetzt den Inhalt des Quiz-Containers durch die Endergebnisse
        this.quizContainer.querySelector(".card-body").innerHTML = resultHtml;
        // Füge den aktuellen Spieler dem Leaderboard hinzu
        updateLeaderboard(this.playerName, this.score, this.maxScore);
    }
}
