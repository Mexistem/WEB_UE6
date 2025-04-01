interface Question {
    category: string;
    question: string;
    options: (string | number)[];
    answer: string | number;
    difficulty: string;
  }
  
  // Points mapping based on difficulty
  const pointsPerDifficulty: { [key: string]: number } = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  
  class QuizGame {
    private allQuestions: Question[] = [];
    private quizQuestions: Question[] = [];
    private currentQuestionIndex: number = 0;
    private score: number = 0;
    private maxScore: number = 0;
    private playerName: string = "";
  
    // DOM Elements
    private playerInputDiv = document.getElementById("player-input") as HTMLElement;
    private quizContainer = document.getElementById("quiz-container") as HTMLElement;
    private leaderboardDiv = document.getElementById("leaderboard") as HTMLElement;
  
    constructor(questions: Question[]) {
      this.allQuestions = questions;
      // Select 5 balanced questions (e.g. distribution: 2 easy, 2 medium, 1 hard)
      this.quizQuestions = this.selectBalancedQuestions(this.allQuestions, 5);
      this.maxScore = this.calculateMaxScore(this.quizQuestions);
    }
  
    // Selects questions ensuring as even a distribution as possible among difficulties
    private selectBalancedQuestions(questionBank: Question[], totalQuestions: number): Question[] {
      const difficulties = ["easy", "medium", "hard"];
      let requiredCount: { [key: string]: number } = {};
      const baseCount = Math.floor(totalQuestions / difficulties.length); // will be 1 for 5 questions
      let remainder = totalQuestions % difficulties.length; // remainder 2 for 5 questions
  
      difficulties.forEach((diff) => {
        requiredCount[diff] = baseCount;
        if (remainder > 0) {
          requiredCount[diff]++;
          remainder--;
        }
      });
      // Example outcome: { easy: 2, medium: 2, hard: 1 }
  
      let selected: Question[] = [];
      difficulties.forEach((diff) => {
        // Copy available questions for the given difficulty
        let available = questionBank.filter(
          (q) => q.difficulty.toLowerCase() === diff
        );
        for (let i = 0; i < requiredCount[diff]; i++) {
          if (available.length > 0) {
            const randomIndex = Math.floor(Math.random() * available.length);
            selected.push(available.splice(randomIndex, 1)[0]);
          }
        }
      });
      // Shuffle the selected questions to randomize their order
      selected.sort(() => Math.random() - 0.5);
      return selected;
    }
  
    // Calculate maximum possible score for the selected quiz
    private calculateMaxScore(questions: Question[]): number {
      return questions.reduce((sum, q) => {
        const diff = q.difficulty.toLowerCase();
        return sum + (pointsPerDifficulty[diff] || 0);
      }, 0);
    }
  
    // Start the quiz by showing the first question
    public startQuiz(playerName: string): void {
      this.playerName = playerName;
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.quizContainer.style.display = "block";
      this.playerInputDiv.style.display = "none";
      this.displayQuestion();
    }
  
    // Displays the current question and options in the quiz container
    private displayQuestion(): void {
      if (this.currentQuestionIndex >= this.quizQuestions.length) {
        this.endQuiz();
        return;
      }
  
      const currentQ = this.quizQuestions[this.currentQuestionIndex];
      // Build HTML content for the question
      let html = `<h3>${currentQ.question}</h3>`;
      html += `<div id="options" class="list-group">`;
  
      currentQ.options.forEach((option) => {
        html += `<button class="list-group-item list-group-item-action" data-option="${option}">${option}</button>`;
      });
      html += `</div>`;
      // Feedback container for immediate response
      html += `<div id="feedback" class="mt-3"></div>`;
  
      this.quizContainer.querySelector(".card-body")!.innerHTML = html;
  
      // Add event listeners to options
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
  
    // Process the answer selection
    private handleAnswer(selectedOption: string | number): void {
      const currentQ = this.quizQuestions[this.currentQuestionIndex];
      const feedbackDiv = document.getElementById("feedback") as HTMLElement;
      // Check answer (convert to string for a fair comparison)
      if (selectedOption.toString() === currentQ.answer.toString()) {
        feedbackDiv.innerHTML = `<div class="alert alert-success">Correct!</div>`;
        const diff = currentQ.difficulty.toLowerCase();
        this.score += pointsPerDifficulty[diff];
      } else {
        feedbackDiv.innerHTML = `<div class="alert alert-danger">Incorrect. The correct answer is ${currentQ.answer}.</div>`;
      }
      this.currentQuestionIndex++;
      // Proceed to next question after a short delay
      setTimeout(() => {
        this.displayQuestion();
      }, 1000);
    }
  
    // Ends the quiz and displays the final score and leaderboard
    private endQuiz(): void {
      const percentage = ((this.score / this.maxScore) * 100).toFixed(2);
      const resultHtml = `
        <h3>Quiz Completed!</h3>
        <p>Your Score: ${this.score} / ${this.maxScore}</p>
        <p>Percentage: ${percentage}%</p>
      `;
      this.quizContainer.querySelector(".card-body")!.innerHTML = resultHtml;
      // Update and show leaderboard
      this.updateLeaderboard();
    }
  
    // Retrieves leaderboard data from localStorage, updates it, and displays it
    private updateLeaderboard(): void {
      const leaderboardKey = "quizLeaderboard";
      // Get stored leaderboard or create an empty array if not exists
      let leaderboard: { name: string; score: number }[] =
        JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
      // Add current player's result
      leaderboard.push({ name: this.playerName, score: this.score });
      // Optionally, sort the leaderboard (highest score first)
      leaderboard.sort((a, b) => b.score - a.score);
      // Save back to localStorage
      localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
      // Build leaderboard HTML
      let html = `<ul class="list-group">`;
      leaderboard.forEach((entry) => {
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
                  ${entry.name}
                  <span class="badge badge-primary badge-pill">${entry.score}</span>
                </li>`;
      });
      html += `</ul>`;
      this.leaderboardDiv.innerHTML = `<h2>Leaderboard</h2>${html}`;
    }
  }
  
  // Load questions from the JSON file and initialize the quiz
  async function initQuiz() {
    try {
      const response = await fetch("questions.json");
      const questions: Question[] = await response.json();
  
      // Create player input form
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
  
      // Create a new QuizGame instance
      let quizGame: QuizGame;
  
      // Handle form submission
      const playerForm = document.getElementById("player-form") as HTMLFormElement;
      playerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const playerNameInput = document.getElementById("playerName") as HTMLInputElement;
        const playerName = playerNameInput.value.trim();
        if (playerName) {
          // Initialize quiz game and start the quiz
          quizGame = new QuizGame(questions);
          quizGame.startQuiz(playerName);
        }
      });
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  }
  
  // Start everything once the DOM is ready
  document.addEventListener("DOMContentLoaded", initQuiz);
  
  