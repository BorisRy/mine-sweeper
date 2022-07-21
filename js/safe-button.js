'use strict'

var gSafeLeft

function safeButton(elSafeButton) {
    var amountOfCells = gDifficulty.size ** gDifficulty.size
    if (gSafeLeft && !gIsFirstClick) {
        while (true) {
            var randI = getRandomInt(0, gBoard.length)
            var randJ = getRandomInt(0, gBoard[0].length)
            var randCell = gBoard[randI][randJ]

            if (!randCell.isMine && !randCell.isShown) {
                var elCell = document.querySelector(`#${getIdOfCell({ i: randI, j: randJ })}`)
                renderCell({ i: randI, j: randJ }, getGameElement(randCell))
                setTimeout(() => {
                    var safeClicksLeft = document.querySelector('.clicks-left')

                    safeClicksLeft.innerText = 'Clicks left: ' + gSafeLeft
                    renderCell({ i: randI, j: randJ }, EMPTY)
                    elCell.classList.add('covered')
                    if (gSafeLeft === 0) {
                        elSafeButton.style.color = 'rgb(52, 49, 49)'
                        elSafeButton.classList.remove('hover-effect')
                    }
                }, 500)
                break
            }

            amountOfCells--
            if (amountOfCells <= 0) break
        }
        gSafeLeft--
    }


}