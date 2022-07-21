'use strict'

var gGameStates = []

function saveState(board) {
    var gameState = copyMat(board)
    gGameStates.push(gameState)
    console.log('gGameStates:', gGameStates)
}

function prevMove() {
    renderPrev(gGameStates[gGameStates.length - 1])
}

function renderPrev(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];
            // console.log(`cell: ${cell} isShown: ${cell.isShown}`);
            // figure class name
            var className = cell.isShown ? 'revealed' : 'covered'
            var rightClick = !cell.isShown ? 'oncontextmenu="onCellRightClick(this)"' : ''
            var tdId = `cell-${i}-${j}`;
            strHtml += `<td id="${tdId}" 
                        class="${className}" 
                        onclick="cellClicked(this)"
                        ${rightClick}>${cell.isShown ? getGameElement(cell) : EMPTY}</td>`
        }
        strHtml += '</tr>';
    }
    var elBoard = document.querySelector('.game-board');
    elBoard.innerHTML = strHtml;
}


function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            var cellCopy = Object.assign({}, mat[i][j])
            console.log('cellCopy:', cellCopy)
        }
    }
    return newMat;
}