//Struktur eines Ranglisteneintrags
export interface LeaderboardEntry {
    name: string;
    score: number;
    percentage: string;
}
  
//Fügt den aktuellen Spieler ins Leaderboard ein, speichert das Ergebnis in localStorage und ruft displayGlobalLeaderboard() auf
export function updateLeaderboard(playerName: string, score: number, maxScore: number): void {
    const leaderboardKey = "quizLeaderboard";
    //Der bisher gespeicherte Leaderboard-String wird gelesen und mit JSON.parse in LeaderboardEntry-Objekte umgewandelt
    let leaderboard: LeaderboardEntry[] =
        JSON.parse(localStorage.getItem(leaderboardKey) || "[]");
    const percentage = ((score / maxScore) * 100).toFixed(2);
    leaderboard.push({ name: playerName, score: score, percentage: percentage });
    leaderboard.sort((a, b) => b.score - a.score);
    //in JSON-String umwandeln
    localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    displayGlobalLeaderboard();
}
  
//Liest das Leaderboard aus localStorage aus und zeigt es an
export function displayGlobalLeaderboard(): void {
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