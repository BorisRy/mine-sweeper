function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateNumbers(size) {
    var nums = []
    for (var i = 0; i < size; i++) {
        nums.push(i + 1)
    }
    return nums
}

function getRandomInt(min, max) {
    var random = Math.floor(Math.random() * (max - min) + min)
    return random
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createBoard(ROWS, COLS) {
    var board = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        board.push(row)
    }
    return board
}

function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // figure class name
            var tdId = `cell-${i}-${j}`;

            strHtml += `<td id="${tdId}" class="${className}" onclick="cellClicked(this)">
                            ${cell}
                        </td>`
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}

function getEmptyCells(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j].type === FLOOR && board[i][j].gameElement === null) {
                console.log('KKK')
            }
        }
    }
}

function getIdOfCell(location) {
    return `cell-${location.i}-${location.j}`
}

function getNeighbours(board, cellI, cellJ) {
    var neighbours = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[0].length) continue
            board[i][j].i = i
            board[i][j].j = j
            neighbours.push(board[i][j])
        }
    }
    return neighbours
}

function getCellLocation(elCell) {
    var i = +elCell.id.split('-')[1]
    var j = +elCell.id.split('-')[2]
    return { i, j }
}

function disableBoardTemporarily(timeInMs) {
    var timeOut = setTimeout(() => {
        gGame.isOn = true
        clearTimeout(timeOut)
    }, timeInMs)
}