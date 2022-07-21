'use strict'


const MINE = '<img src="images/mine.png">'
const FLAG = ' 🚩'
const EMPTY = ' '
var gBoard
var gIsFirstClick
var gMinesCoors
var gDifficulty = { size: 8, mines: 12, lives: 3, hints: 3 }
var gStartTime
var gTimerInterval
var gBombRevealInterval
var gFlagCounter
var gHintMode
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 0,
    hints: 0,
}

function gameInit() {
    gFlagCounter = document.querySelector('.flags')
    resetGame()
    renderElements('lives')
    renderElements('hints')
    gBoard = createBoard(gDifficulty.size, gDifficulty.size)
    renderBoard(gBoard)
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // figure class name
            var className = cell.isShown ? 'revealed' : 'covered'
            var rightClick = !cell.isShown ? 'oncontextmenu="onCellRightClick(this)"' : ''
            var tdId = `cell-${i}-${j}`;
            strHtml += `<td id="${tdId}" 
                        class="${className}" 
                        onclick="cellClicked(this)"
                        ${rightClick}
                        >
                        ${getGameElement(cell)}               
                        </td>`
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;
}

function createBoard(ROWS, COLS) {
    var board = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push(createCell())
        }
        board.push(row)
    }
    return board
}

function createCell() {
    return {
        isShown: false,
        minesAroundCount: 0,
        isMarked: false,
        isMine: false
    }
}

function cellClicked(elCell) {
    var cellLocation = getCellLocation(elCell)
    var modelCell = gBoard[cellLocation.i][cellLocation.j]
    if (gGame.isOn && !modelCell.isMarked) {
        // first click
        if (gIsFirstClick) {
            startTimer()
            gIsFirstClick = false
            gMinesCoors = []
            placeMines(cellLocation, gDifficulty.mines)
            countMineNeighbours()

        }
        // if click on empty cell
        if (modelCell.minesAroundCount === 0 && !modelCell.isShown && !gHintMode) {
            revealEmptyCells(cellLocation.i, cellLocation.j)
            revealDigitsWhenHitEmpty()
        }
        if (gHintMode && !gIsFirstClick) {
            var hintCells = getNeighbours(gBoard, cellLocation.i, cellLocation.j)
            hintCells.push(modelCell)
            getHintElements(hintCells)
            return
        }
        // if click on cell with mine nbrs
        if (modelCell.minesAroundCount !== 0 && !modelCell.isShown && !gHintMode) {
            modelCell.isShown = true
            renderCell(cellLocation, modelCell.minesAroundCount)
            colorDigits(elCell, modelCell.minesAroundCount)
        }
        // if click on mine
        if (modelCell.isMine && !gHintMode) {
            renderCell(cellLocation, MINE)
            if (gGame.lives > 0) {
                showSurprisedFace()
                hideLastHeart(gGame.lives)
                gGame.lives--
                modelCell.isMarked = true
                gGame.markedCount--
                gFlagCounter.innerText = FLAG + gGame.markedCount.toString()

            }
            else if (gGame.lives === 0) {
                gGame.isOn = false
                revealAllMines()
            }
        }
    }

    calcShownAmount()
    isGameWon()
}

function onCellRightClick(elCell) {
    var cellLocation = getCellLocation(elCell)
    var modelCell = gBoard[cellLocation.i][cellLocation.j]
    gFlagCounter = document.querySelector('.flags')
    if (!modelCell.isShown) {
        if (!modelCell.isMarked) {
            renderCell(cellLocation, FLAG)
            elCell.setAttribute(onclick, '')
            gGame.markedCount--
            modelCell.isMarked = !modelCell.isMarked
        } else if (modelCell.isMarked) {
            renderCell(cellLocation, EMPTY)
            elCell.setAttribute(onclick, '')
            gGame.markedCount++
            modelCell.isMarked = !modelCell.isMarked
        }

        gFlagCounter.innerText = FLAG + gGame.markedCount.toString()
        elCell.classList.add('covered')
        isGameWon()
    }

}

function renderCell(location, value) {
    var cellSelector = '#' + getIdOfCell(location)
    var elCell = document.querySelector(cellSelector)
    switch (value) {
        case MINE:
            elCell.classList.remove('covered')
            elCell.classList.add('mine')
            break
        default:
            elCell.classList.remove('covered')
            elCell.classList.add('revealed')
    }
    elCell.innerHTML = value
}

function placeMines(initialLocation, numberOfMines) {
    var nbrsOfInitialClicked = getNeighbours(gBoard, initialLocation.i, initialLocation.j)
    // so there won't be a bomb in the initial click
    nbrsOfInitialClicked.push(gBoard[initialLocation.i][initialLocation.j])
    var mines = numberOfMines

    while (mines > 0) {
        var randI = getRandomInt(0, gBoard.length)
        var randJ = getRandomInt(0, gBoard[0].length)
        var cell = gBoard[randI][randJ]
        if (!nbrsOfInitialClicked.includes(cell)) {
            cell.isMine = true
            mines--
            gMinesCoors.push({ i: randI, j: randJ })
        }
    }
}

function countMineNeighbours() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) continue
            var amountOfMines = getNumberOfMines(gBoard, { i, j })
            gBoard[i][j].minesAroundCount = amountOfMines
            if (amountOfMines > 0 && !gBoard[i][j].isMine) {
                gBoard[i][j].minesAroundCount = amountOfMines
            }
        }
    }
}

function getNumberOfMines(board, location) {
    var mines = 0
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue
            if (j < 0 || j >= board[0].length) continue
            if (board[i][j].isMine) mines++
        }
    }
    return mines
}

function revealEmptyCells(i, j) {
    if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length) {
        return
    }

    var cell = gBoard[i][j]
    var elCell = document.querySelector(`#${getIdOfCell({ i, j })}`)

    if (cell.isMine || cell.isShown == true) {
        return
    } else if (cell.minesAroundCount === 0 && cell.isShown === false) {
        renderCell(getCellLocation(elCell), EMPTY)
        if (cell.isMarked) {
            cell.isMarked = !cell.isMarked
            gGame.markedCount++
            gFlagCounter.innerText = gGame.markedCount.toString()
        }
        cell.isShown = true
        revealEmptyCells(i - 1, j + 1)
        revealEmptyCells(i + 1, j - 1)
        revealEmptyCells(i - 1, j)
        revealEmptyCells(i + 1, j)
        revealEmptyCells(i, j - 1)
        revealEmptyCells(i, j + 1)
        revealEmptyCells(i + 1, j + 1)
        revealEmptyCells(i - 1, j - 1)
    }
}

function revealDigitsWhenHitEmpty() {
    var rows = gBoard.length
    var cols = gBoard[0].length
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = gBoard[i][j]
            var elCell = document.querySelector(`#${getIdOfCell({ i, j })}`)
            var cellAdjecntEmpty = getNeighbours(gBoard, i, j).filter(cell => cell.isShown && cell.minesAroundCount === 0)
            if (cell.minesAroundCount > 0 && cellAdjecntEmpty.length > 0 && !cell.isShown) {
                // get rid of flagged cells
                if (cell.isMarked) {
                    cell.isMarked = !cell.isMarked
                    gGame.markedCount++
                    gFlagCounter.innerText = gGame.markedCount.toString()
                }
                renderCell({ i, j }, cell.minesAroundCount)
                colorDigits(elCell, cell.minesAroundCount)
                cell.isShown = true
            }
        }
    }
}


function getMines() {
    var rows = gBoard.length
    var cols = gBoard[0].length
    var mines = []
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                mines.push(cell)
            }
        }
    }
    return mines
}

function startTimer() {
    gStartTime = Date.now()
    var timer = document.querySelector('.time')
    gTimerInterval = setInterval(() => {
        var timePassed = parseInt((Date.now() - gStartTime) / 1000)
        gGame.secsPassed = timePassed.toString().padStart(3, '0')
        timer.innerText = gGame.secsPassed
    }, 1000)
}

function isGameWon() {
    var nonMineCellsAmount = Math.pow(gDifficulty.size, 2) - gDifficulty.mines
    var cellsShownAmount = gGame.shownCount
    var restartButton = document.querySelector('#restart')
    console.log('gGame.markedCount:', gGame.markedCount)
    console.log('nonMineCellsAmount:', nonMineCellsAmount)
    console.log('cellsShownAmount:', cellsShownAmount)
    if (gGame.markedCount === 0 && nonMineCellsAmount === cellsShownAmount) {
        restartButton.innerHTML = '<img src="images/smiling.png">'
        clearInterval(gTimerInterval)
        console.log(':gDifficulty.size', gDifficulty.size)
        updateHighScore(gGame.secsPassed, gDifficulty.size)
    } else if (gGame.isOn === false) {
        restartButton.innerHTML = '<img src="images/dead.png">'
        clearInterval(gTimerInterval)
    }
}
// console.log('gGame.markedCount:', gGame.markedCount)
// console.log('nonMineCellsAmount:', nonMineCellsAmount)
// console.log('cellsShownAmount:', cellsShownAmount)

function changeDifficulty(elCell) {
    var elDiffButtons = document.querySelectorAll('.difficulty > p')
    for (var button of elDiffButtons) {
        button.classList.remove('diff-chosen')
    }
    elCell.classList.add('diff-chosen')



    var chosenDiff = elCell.dataset.diff
    var difficulties = [
        { size: 4, mines: 2, lives: 1, hints: 1 },
        { size: 8, mines: 12, lives: 3, hints: 3 },
        { size: 12, mines: 30, lives: 3, hints: 3 }]
    gDifficulty = difficulties[chosenDiff]
    gameInit()
}

function revealAllMines() {
    gBombRevealInterval = setInterval(() => {
        var currMine = gMinesCoors.splice(0, 1)[0]
        renderCell(currMine, MINE)
        if (gMinesCoors.length === 0) clearInterval(gBombRevealInterval)
    }, 300)
}

function resetGame() {
    var restartButton = document.querySelector('#restart')
    var safeClicksLeft = document.querySelector('.clicks-left')
    restartButton.innerHTML = '<img src="images/1.png">'
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 0,
        hints: 3
    }
    gIsFirstClick = true
    gSafeLeft = 3
    gGame.markedCount = gDifficulty.mines
    gGame.lives = gDifficulty.lives
    gGame.hints = gDifficulty.hints
    renderHighScore(gDifficulty.size)
    gMinesCoors = []
    var timer = document.querySelector('.time').innerText = '000'
    gFlagCounter.innerText = FLAG + gGame.markedCount.toString()
    safeClicksLeft.innerText = 'Clicks left: ' + gSafeLeft
    clearInterval(gTimerInterval)
    clearInterval(gBombRevealInterval)
}

function colorDigits(elCell, minesAround) {
    switch (minesAround) {
        case 1:
            elCell.style.color = '#00b2ca'
            break
        case 2:
            elCell.style.color = '#43aa8b'
            break
        case 3:
            elCell.style.color = '#ae2012'
            break
        case 4:
            elCell.style.color = '#90be6d'
            break
        case 5:
            elCell.style.color = '#f9c74f'
            break
        case 6:
            elCell.style.color = '#f9844a'
            break
        case 7:
            elCell.style.color = '#f3722c'
            break
        case 8:
            elCell.style.color = '#f94144'
            break
    }
}

function hideLastHeart(heartIndex) {
    var elHeart = document.querySelector(`.heart:nth-of-type(${heartIndex})`)
    elHeart.style.visibility = 'hidden'
}

function showSurprisedFace() {
    var restartButton = document.querySelector('#restart')
    restartButton.innerHTML = '<img src="images/surprised.png"></img>'
    var timeOut = setTimeout(() => {
        restartButton.innerHTML = '<img src="images/1.png"></img>'
        clearTimeout(timeOut)
    }, 2300)
}

function renderElements(elements) {
    var elContainer = document.querySelector(`.${elements}`)
    var innerHTMLTxt = ''
    var bulb = '<img class="bulb" onclick="giveHint(this)" src="images/bulb.png">'
    var heart = '<img class="heart" src="images/heart.png">'

    for (var i = 0; i < gGame.lives; i++) {
        innerHTMLTxt += (elements === 'lives' ? heart : bulb)
    }
    elContainer.innerHTML = innerHTMLTxt
}

function giveHint(elBulb) {
    if (!gIsFirstClick) {
        gHintMode = true
        document.body.style.cursor = 'pointer'
    } else {
        document.body.style.cursor = 'auto'
    }

}

function getHintElements(hintCells) {
    var elHintCells = []
    var hintCellsNotShown = hintCells.filter(cell => !cell.isShown)
    var restartButton = document.querySelector('#restart')
    restartButton.innerHTML = '<img src="images/loading.png">'

    for (var x = 0; x < hintCellsNotShown.length; x++) {
        var elHintCellId = getIdOfCell({ i: hintCellsNotShown[x].i, j: hintCellsNotShown[x].j })
        var elHintCell = document.querySelector(`#${elHintCellId}`)
        elHintCells.push(elHintCell)
        renderCell({ i: hintCellsNotShown[x].i, j: hintCellsNotShown[x].j },
            getGameElement(hintCellsNotShown[x]))
    }

    var hideTimeOut = setTimeout(() => {
        for (var x = 0; x < hintCellsNotShown.length; x++) {
            renderCell({ i: hintCellsNotShown[x].i, j: hintCellsNotShown[x].j }, EMPTY)
            elHintCells[x].classList.add('covered')
            elHintCells[x].classList.remove('mine')
            if (hintCellsNotShown[x].isMarked) elHintCells[x].innerText = FLAG
        }
        var elBulb = document.querySelector(`.bulb:nth-of-type(${gGame.hints})`)
        console.log('gGame.hints:', gGame.hints)
        console.log('elBulb:', elBulb)
        elBulb.style.visibility = 'hidden'
        document.body.style.cursor = 'auto'
        gGame.hints--
        restartButton.innerHTML = '<img src="images/1.png">'
        gHintMode = false

        clearTimeout(hideTimeOut)
    }, 1000)

}

function getGameElement(cell) {
    if (cell.isMine) return MINE
    else if (cell.minesAroundCount > 0 && !cell.isMine) return cell.minesAroundCount
    else if (cell.minesAroundCount === 0) return EMPTY
}

function currDifficultyStr(boardSize) {
    var difficultyStr
    if (boardSize === 4) difficultyStr = 'easy'
    else if (boardSize === 8) difficultyStr = 'medium'
    else if (boardSize === 12) difficultyStr = 'expert'
    return difficultyStr
}

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

function calcShownAmount() {
    var currCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isShown) currCount++
        }
    }
    gGame.shownCount = currCount
}


