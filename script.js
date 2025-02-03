//gameboard
//players
//cells
//game controller


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
    
    const getName = () => name;
    const getNumber = () => number;

    return {getName, getNumber};
}


//models state of the board
//each square holds a Cell object
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
    
    const drawMark = (playerNum, row, column) => {
        if(board[row][column].getMark() === 0){
            board[row][column].addMark(playerNum);
        }
    };

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

    return {getBoard, drawMark, printBoard};
})();


/*
 ** Controller to manipulate the game's states and win conditions.
 */

const gameController = (function (
    playerOneName = "Player One",
    playerTwoName = "Player Two"
){
    const board = gameBoard.getBoard();
    const players = [createPlayer(playerOneName, 1), createPlayer(playerTwoName, 2)];
    let activePlayer = players[0];
    let roundNum = 0;

    const getActivePlayer = () => activePlayer;
    const switchActivePlayer = () => activePlayer = players[roundNum % 2];
    const incrementRound = () => roundNum++;

    const printNewRound = () => {
        console.log(`Round: ${roundNum}`);
        gameBoard.printBoard();
        console.log(`${activePlayer.getName()}'s turn.`);
    };

    // Auxillary factory function for checking player win condition
    //x = row, y = column
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
            return roundNum == Math.pow(board.length, 2)-1;
        };

        const checkWin = () => checkRowWin() || checkColWin() || checkDiagWin();

        return {checkDraw, checkWin};
    };

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

        console.log(`Drawing ${activePlayer.getName()}'s mark on \nRow: ${x}\nColumn: ${y}`);
        gameBoard.drawMark(activePlayer.getNumber(), x-1, y-1);

        // Create object to check win condition
        const winCondition = createWinCon(x, y); 

        // Checking if game is ended
        if(winCondition.checkWin()){
            console.log(`${activePlayer.getName()} Wins!`);
            return;
        } else if (winCondition.checkDraw()){
            console.log("Game End! Draw!");
            return;
        }
        
        // Next round logic
        incrementRound();
        switchActivePlayer();
        printNewRound();
    }

    // Initial Round Display
    printNewRound();

    return {getActivePlayer, playRound};
})();

/*
Win Con:
1. Column 1 or 3, Row 1 or 3
2. Column 1 or 3, Row 2
3. Column 2, row 1 or 3
4. Column 2, row 2
*/
