

//factory function for Cell objects
function createCell (){
    let value = 0;
    
    //accept a player's mark to change the cell's value
    const addMark = (player) => {
        value = player;
    };

    const getMark = () => value;

    return {
        addMark,
        getMark
    };
}


function createPlayer(name, number){
    let playerName = name;

    const setName = (newName) => playerName = newName;
    const getName = () => playerName;
    const getNumber = () => number;

    return {getName, setName, getNumber};
}


// Models state of the board
// Each square holds a Cell object
const gameBoard = (function(){
    const board = [];
    const dimension = 3

    for (let i = 0; i < dimension; i++){
        board[i] = [];
        for (let j = 0; j < dimension; j++){
            board[i][j] = createCell();
        }
    }

    const getBoard = () => board;
    const drawMark = (playerNum, row, column) => board[row][column].addMark(playerNum);
    const resetBoard = () => board.map((row) => row.map((cell) => cell.addMark(0)));

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => 
            row.map((cell) => {
                let symbol;
                switch (cell.getMark()) {
                    case 1:
                        symbol = "X";
                        break;
                    case 2: 
                        symbol = "O";
                        break;
                    default:
                        symbol = "-";
                }
                return symbol;
            }));
        console.log(boardWithCellValues);
    };

    return {getBoard, drawMark, resetBoard, printBoard};
})();


/*
 ** Controller to manipulate the game's states and win conditions.
 */

const gameController = (function (
    playerOneName = "Player One",
    playerTwoName = "Player Two"
){  
    const PLAYERONENUM = 1;
    const PLAYERTWONUM = 2;

    const board = gameBoard.getBoard();
    const players = [createPlayer(playerOneName, PLAYERONENUM), 
        createPlayer(playerTwoName, PLAYERTWONUM)];
    let activePlayer = players[0];
    let roundNum = 1; // Keep track of round number

    const getActivePlayer = () => activePlayer;

    // Every even round is player one, odd player two
    const switchActivePlayer = () => activePlayer = players[(roundNum - 1) % 2];
    const incrementRound = () => roundNum++;

    const getRoundNum = () => roundNum;

    // For console rendering
    const printNewRound = () => {
        console.log(`Round: ${roundNum}`);
        gameBoard.printBoard();
        console.log(`${activePlayer.getName()}'s turn.`);
    };

    // Auxillary factory function for checking player win condition
    // x = row, y = column
    const createWinCon = (x, y) => {
        const checkRowWin = () => {
            return board[x-1].filter((cell) => 
                cell.getMark() === activePlayer.getNumber()).length == board.length;
        };

        const checkColWin = () => {
            return board
                .map((row) => row[y-1])
                .filter((cell) => 
                cell.getMark() === activePlayer.getNumber()).length == board.length;
        };

        const checkDiagWin = () => {
            const diagOne = [];
            const diagTwo = [];
            for(let i = 0; i < board.length; i++){
                diagOne.push(board[i][i]);
                diagTwo.push(board[board.length-1-i][i]);
            }

            return diagOne.filter((cell) => 
                cell.getMark() === activePlayer.getNumber()).length == board.length ||
                diagTwo.filter((cell) => 
                    cell.getMark() === activePlayer.getNumber()).length == board.length;
        };

        const checkDraw = () => {
            return roundNum == Math.pow(board.length, 2)+1;
        };

        // Check win condition for all cases
        // Row, Column, or Diagonal Win
        const checkWin = () => checkRowWin() || checkColWin() || checkDiagWin();

        return {checkDraw, checkWin};
    };

    // Restarts game. 
    // Resets game state to 1st round
    const restartGame = () => {
        activePlayer = players[0];
        roundNum = 1;
        gameBoard.resetBoard();

        console.log("Restarting Game...");
        printNewRound();
    }

    const changePlayerName = (playerNumber, newName) => {
        if(playerNumber == 1 || playerNumber == 2){
            players[playerNumber-1].setName(newName);
            console.log("Changing player name...");
        } else {
            console.log("Invalid player number! Must be either 1 or 2.");
        }
    }

    // Main game logic here
    //x = row, y = column
    const playRound = (x, y) => {
        if (x < 1 || y < 1 || x > 3 || y > 3) {
            console.log("Invalid Choice! Coordinates must be 1, 2, or 3.");
            return;
        } else if (board[x-1][y-1].getMark() != 0){

            console.log("Invalid Choice! Cell is already occupied.");
            return;
        }

        // update round number at start of round
        incrementRound();

        console.log(`Drawing ${activePlayer.getName()}'s mark on \nRow: ${x}\nColumn: ${y}`);
        gameBoard.drawMark(activePlayer.getNumber(), x-1, y-1);

        // Create object to check win condition
        const winCondition = createWinCon(x, y); 

        // Checking if game is ended
        if(winCondition.checkWin()){
            console.log(`${activePlayer.getName()} Wins!`);
            return "WIN";
        } else if (winCondition.checkDraw()){
            console.log("Game End! Draw!");
            return "DRAW";
        } else {
        // Next round logic
            switchActivePlayer();
            printNewRound();
        }
    }

    // Initial Round Display
    printNewRound();

    return {getActivePlayer, playRound, restartGame, 
        changePlayerName, getRoundNum, getBoard: gameBoard.getBoard};
})();


const displayController = (function (){
    const params = new URLSearchParams(window.location.search);

    // Get all needed DOM elements
    const boardDiv = document.querySelector("#game-board");
    const playerOneName = document.querySelector("#player-one-name");
    const playerTwoName = document.querySelector("#player-two-name");
    const roundDisplaySpan = document.querySelector("#round-number");
    const restartBtn = document.querySelector("#restart-btn");
    const restartDialog = document.querySelector("#restart-dialog");
    const confirmBtn = document.querySelector("#confirm-btn");
    const cancelBtn = document.querySelector("#cancel-btn");
    const endMsgP = document.querySelector("#end-msg");
    const endDialog = document.querySelector("#end-dialog");
    const endRestartBtn = document.querySelector("#end-restart-btn");
    const activePlayerDiv = document.querySelector("#active-player");

    // Set player names
    gameController.changePlayerName(1,params.get("player-one"));
    gameController.changePlayerName(2,params.get("player-two"))
    playerOneName.textContent = params.get("player-one");
    playerTwoName.textContent = params.get("player-two");

    restartBtn.addEventListener("click", ()=>{
        restartDialog.showModal();
    });

    confirmBtn.addEventListener("click", ()=>{
        gameController.restartGame();
        restartDialog.close();
        updateScreen();
    });

    cancelBtn.addEventListener("click", ()=> restartDialog.close());

    endRestartBtn.addEventListener("click", ()=> {
        gameController.restartGame();
        endDialog.close()
        updateScreen();
    });

    // Render Screen
    const updateScreen = () => {
        // clear the board
        boardDiv.innerHTML = "";
        board = gameController.getBoard();

        activePlayerDiv.textContent = gameController.getActivePlayer().getName();
        roundDisplaySpan.textContent = gameController.getRoundNum();

        board.forEach((row, rowIndex) => 
            row.forEach((cell, colIndex) => {
                const newCell = document.createElement("div");
                const mark = document.createElement("img");
                
                newCell.appendChild(mark);
                newCell.classList.toggle("cell");

                switch (cell.getMark()) {
                    case 1:
                        mark.src = "logos/alpha-x.svg";
                        mark.dataset.column = colIndex + 1;
                        mark.dataset.row = rowIndex + 1;
                        mark.addEventListener("click", playerAction);
                        break;

                    case 2:
                        mark.src = "logos/circle-outline.svg";
                        mark.dataset.column = colIndex + 1;
                        mark.dataset.row = rowIndex + 1;
                        mark.addEventListener("click", playerAction);
                        break;

                    default:
                        newCell.dataset.column = colIndex + 1;
                        newCell.dataset.row = rowIndex + 1;
                        newCell.addEventListener("click", playerAction);
                }   
                boardDiv.appendChild(newCell);
            })
        );
    }

    const displayEndGame = (result) => {
        if(result === "WIN"){
            endMsgP.textContent = `${gameController.getActivePlayer().getName()} Wins!`
        } else if (result === "DRAW"){
            endMsgP.textContent = `Draw!`
        }

        endDialog.showModal()
    }

    const playerAction = (event) => {
        const result = gameController
            .playRound(event.target.dataset.row, event.target.dataset.column);
        if(result){
            displayEndGame(result);
        }
        updateScreen();
    }

    updateScreen();
})()

