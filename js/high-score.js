'use strict'

function updateHighScore(newScore, boardSize) {
    var difficulty = currDifficultyStr(boardSize)
    var previousHighScore = localStorage.getItem(`${difficulty}HighScore`)
    if (newScore < previousHighScore || !previousHighScore) {
        localStorage.setItem(`${difficulty}HighScore`, newScore)
    }
    renderHighScore(boardSize)
}

function renderHighScore(boardSize) {
    var difficulty = currDifficultyStr(boardSize)
    var highScoreBox = document.querySelector('.high-score')
    var highScore = localStorage.getItem(`${difficulty}HighScore`)
    var difficultyCapitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1, difficulty.length)

    if (highScore) {
        var htmlStr = difficultyCapitalized + ' High Score' + ': ' + highScore
        highScoreBox.innerText = htmlStr
    } else if (!highScore) {
        highScoreBox.innerText = difficultyCapitalized + ' High Score: '
    }
}