'use strict'


const MINE = '<img src="images/mine.png">'
const FLAG = ' 🚩'
const EMPTY = ' '
var gBoard
var gIsFirstClick
var gMinesCoors
var gDifficulty = { size: 8, mines: 12 }
var gStartTime
var gTimerInterval
var gBombRevealInterval
var gFlagCounter
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function gameInit() {

    var flagCounter = document.querySelector('.flags')
    resetGame()
    gIsFirstClick = true
    gGame.markedCount = gDifficulty.mines
    flagCounter.innerText = gGame.markedCount.toString()
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
        gameElement: EMPTY,
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
        if (gIsFirstClick === true) {
            startTimer()
            gIsFirstClick = false
            gMinesCoors = []
            placeMines(cellLocation, gDifficulty.mines)
            countMineNeighbours()
        }
        // if click on empty cell
        if (modelCell.minesAroundCount === 0 && !modelCell.isShown) {
            revealEmptyCells(cellLocation.i, cellLocation.j)
            revealDigitsWhenHitEmpty()
        }
        // if click on cell with 
        if (modelCell.minesAroundCount !== 0 && !modelCell.isShown) {
            gGame.shownCount++
            modelCell.isShown = true
            renderCell(cellLocation, modelCell.minesAroundCount)
            colorDigits(elCell, modelCell.minesAroundCount)
        }
        // if click on mine
        if (modelCell.gameElement === MINE) {
            renderCell(cellLocation, MINE)
            gGame.isOn = false
            revealAllMines()
        }
    }
    isGameWon()
    console.log(gBoard)
}

function onCellRightClick(elCell) {
    var cellLocation = getCellLocation(elCell)
    var modelCell = gBoard[cellLocation.i][cellLocation.j]
    gFlagCounter = document.querySelector('.flags')
    if (!modelCell.isShown) {
        if (!modelCell.markedCount) {
            renderCell(cellLocation, FLAG)
            elCell.setAttribute(onclick, '')
            gGame.markedCount--
        } else {
            renderCell(cellLocation, EMPTY)
            elCell.setAttribute(onclick, '')
            gGame.markedCount++
        }
        modelCell.isMarked = !modelCell.isMarked
        gFlagCounter.innerText = gGame.markedCount.toString()
        elCell.classList.add('covered')
        isGameWon()
    }

}

function renderCell(location, value) {
    var cellSelector = '#' + getIdOfCell(location)
    var elCell = document.querySelector(cellSelector)
    var cellLocation = getCellLocation(elCell)
    var modelCell = gBoard[cellLocation.i][cellLocation.j]
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
            cell.gameElement = MINE
            mines--
            gMinesCoors.push({ i: randI, j: randJ })
        }
    }
}

function countMineNeighbours() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].gameElement === MINE) continue
            var amountOfMines = getNumberOfMines(gBoard, { i, j })
            gBoard[i][j].minesAroundCount = amountOfMines
            if (amountOfMines > 0 && gBoard[i][j].gameElement !== MINE) {
                gBoard[i][j].gameElement = amountOfMines
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
            if (board[i][j].gameElement === MINE) mines++
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

    if (cell.gameElement === MINE || cell.isShown == true) {
        return
    } else if (cell.minesAroundCount === 0 && cell.isShown === false) {
        renderCell(getCellLocation(elCell), EMPTY)
        if (cell.isMarked) {
            cell.isMarked = !cell.isMarked
            gGame.markedCount++
            gFlagCounter.innerText = gGame.markedCount.toString()
        }
        cell.isShown = true
        gGame.shownCount += 1
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
            var cellAdjecntEmpty = getNeighbours(gBoard, i, j).filter(cell => cell.isShown && cell.gameElement === EMPTY)
            if (cell.minesAroundCount > 0 && cellAdjecntEmpty.length > 0) {
                console.log('cell.isMarked:', cell.isMarked)
                if (cell.isMarked) {
                    cell.isMarked = !cell.isMarked
                    gGame.markedCount++
                    gFlagCounter.innerText = gGame.markedCount.toString()
                }
                renderCell({ i, j }, cell.minesAroundCount)
                colorDigits(elCell, cell.minesAroundCount)
                gGame.shownCount += 1
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
            if (cell.gameElement === MINE) {
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

    if (gGame.markedCount === 0 && nonMineCellsAmount === cellsShownAmount) {
        restartButton.innerHTML = '<img src="images/smiling.png">'
        clearInterval(gTimerInterval)
    } else if (gGame.isOn === false) {
        restartButton.innerHTML = '<img src="images/dead.png">'
        clearInterval(gTimerInterval)
    }
}

function changeDifficulty(elCell) {
    var chosenDiff = elCell.dataset.diff
    var difficulties = [{ size: 4, mines: 2 }, { size: 8, mines: 12 }, { size: 12, mines: 30 }]
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
    restartButton.innerHTML = '<img src="images/1.png">'
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gMinesCoors = []
    var timer = document.querySelector('.time').innerText = '000'
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