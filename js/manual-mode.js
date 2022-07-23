'use strict'

var gIsManualMode
var gManuallyPlacedMines

function enterManualMode() {
    gameInit()
    gIsManualMode = true
    revealCells()
}

function revealCells() {
    var i = 0, j = 0

    var revealInterval = setInterval(() => {
        var elCell = document.querySelector(`#${getIdOfCell({ i, j })}`)
        elCell.classList.remove('covered')
        elCell.classList.add('revealed')
        j++
        if (j === gBoard[0].length) {
            i++
            j = 0
        }
        if (i === gBoard.length) clearInterval(revealInterval)
    }, 20)
}


function hideCells() {
    var i = gBoard.length - 1, j = gBoard[0].length - 1
    var gameBoard = document.querySelector('body')
    console.log('gameBoard:', gameBoard)
    gameBoard.style.pointerEvents = 'none'
    console.log('gameBoard:', gameBoard)
    var revealInterval = setInterval(() => {
        var elCell = document.querySelector(`#${getIdOfCell({ i, j })}`)
        elCell.classList.remove('revealed')
        elCell.classList.add('covered')
        elCell.innerText = EMPTY
        j--
        if (j < 0) {
            i--
            j = gBoard[0].length - 1
        }
        if (i < 0) clearInterval(revealInterval)
    }, 10)

    setTimeout(() => { gameBoard.style.pointerEvents = 'auto' }, 10 * gDifficulty.size * gDifficulty.size)
}

