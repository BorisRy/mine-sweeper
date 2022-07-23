'use strict'

var gIsSevenBoom

function get7boomMineCoors() {
    gameInit()
    gIsSevenBoom = true
    gIsFirstClick = false
    var cellIndex = 1
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var strCellIndex = cellIndex.toString()
            if (strCellIndex.includes('7') || cellIndex % 7 === 0) {
                gMinesCoors.push({ i: i, j: j })
            }
            cellIndex++
        }
    }

    gGame.markedCount = gMinesCoors.length
    gFlagCounter.innerText = FLAG + gGame.markedCount
}