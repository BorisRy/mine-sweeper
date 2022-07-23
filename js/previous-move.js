'use strict'
var gGameStates = []
var gMoveCount = 0
var gPrevMoveMode

function saveState(board) {
    // copy model
    var gameState = copyMat(board)
    var elGameState = document.querySelector('.game-board').innerHTML
    var gGameState = copygGame(...Object.values(gGame))
    gGameStates.push({ gameState, elGameState, gGameState })

    var prevMoveButton = document.querySelector('p[onclick="prevMove()"]')
    prevMoveButton.classList.add('hover-effect')
    prevMoveButton.classList.add('activated')
    prevMoveButton.classList.remove('deactivated')

    gMoveCount++
}

function prevMove() {
    var gameHtml = document.querySelector('.game-board')
    var prevMove = gGameStates.splice(gMoveCount - 1, 1)[0]
    var prevMoveButton = document.querySelector('p[onclick="prevMove()"]')

    if (gMoveCount > 0) {
        gBoard = prevMove.gameState
        gameHtml.innerHTML = prevMove.elGameState
        gGame = prevMove.gGameState
        gPrevMoveMode = true
        gFlagCounter.innerText = FLAG + gGame.markedCount.toString()
        renderElements('lives')
        gMoveCount--
        if (gMoveCount === 0) {
            gIsFirstClick = true
            prevMoveButton.classList.remove('hover-effect')
            prevMoveButton.classList.remove('activated')
            prevMoveButton.classList.add('deactivated')
        }
    }
}

function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            var originCell = mat[i][j]
            var cellCopy = copyCell(
                originCell.isShown,
                originCell.minesAroundCount,
                originCell.isMarked,
                originCell.isMine,
                originCell.isMineShown)
            newMat[i].push(cellCopy)
        }
    }
    return newMat;
}

function copyCell(isShown, minesAroundCount, isMarked, isMine, isMineShown = false) {
    return {
        isShown: isShown,
        minesAroundCount: minesAroundCount,
        isMarked: isMarked,
        isMine: isMine,
        isMineShown: isMineShown
    }
}

function copygGame(isOn, shownCount, markedCount, secsPassed, lives, hints) {
    return {
        isOn: isOn,
        shownCount: shownCount,
        markedCount: markedCount,
        secsPassed: secsPassed,
        lives: lives,
        hints: hints,
    }
}

function placeMines(minesCoors) {
    for (var x = 0; x < gMinesCoors.length; x++) {
        var iCoor = minesCoors[x].i
        var jCoor = minesCoors[x].j
        var mineCell = gBoard[iCoor][jCoor]
        mineCell.isMine = true
    }
}