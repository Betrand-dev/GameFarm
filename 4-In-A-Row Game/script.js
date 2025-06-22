document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const ROWS = 6;
    const COLS = 7;
    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let currentPlayer = 1;
    let gameOver = false;
    let vsComputer = false;
    let scores = [0, 0];

    // Audio elements
    const backgroundMusic = document.getElementById('backgroundMusic');
    const dropSound = document.getElementById('dropSound');
    const winSound = document.getElementById('winSound');
    const drawSound = document.getElementById('drawSound');

    // UI elements
    const gameBoard = document.getElementById('gameBoard');
    const gameInfo = document.getElementById('gameInfo');
    const player1Score = document.getElementById('player1Score');
    const player2Score = document.getElementById('player2Score');
    const vsFriendBtn = document.getElementById('vsFriendBtn');
    const vsComputerBtn = document.getElementById('vsComputerBtn');
    const musicToggle = document.getElementById('musicToggle');
    const soundToggle = document.getElementById('soundToggle');
    const resetBtn = document.getElementById('resetBtn');

    // Sound settings
    let musicEnabled = true;
    let soundsEnabled = true;

    // Initialize the game board
    function initBoard() {
        gameBoard.innerHTML = '';

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Add hover effects for columns
                cell.addEventListener('mouseenter', () => handleCellHover(col));
                cell.addEventListener('mouseleave', () => removeHoverClass());

                cell.addEventListener('click', () => handleCellClick(col));

                gameBoard.appendChild(cell);
            }
        }
    }

    // Handle cell hover
    function handleCellHover(col) {
        if (gameOver) return;

        const row = getLowestEmptyRow(col);
        if (row === -1) return;

        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell && !cell.classList.contains('occupied')) {
            removeHoverClass();
            cell.classList.add(currentPlayer === 1 ? 'hover-player1' : 'hover-player2');
        }
    }

    function removeHoverClass() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('hover-player1', 'hover-player2');
        });
    }

    // Handle cell click
    function handleCellClick(col) {
        if (gameOver) return;

        const row = getLowestEmptyRow(col);
        if (row === -1) return;

        makeMove(row, col);

        // Computer's turn if playing against computer
        if (!gameOver && vsComputer && currentPlayer === 2) {
            setTimeout(computerMove, 500);
        }
    }

    // Make a move
    function makeMove(row, col) {
        board[row][col] = currentPlayer;
        updateBoardUI();

        if (soundsEnabled) {
            dropSound.currentTime = 0;
            dropSound.play();
        }

        if (checkWin(row, col)) {
            handleWin();
            return;
        }

        if (checkDraw()) {
            handleDraw();
            return;
        }

        switchPlayer();
    }

    // Computer move logic (simple AI)
    function computerMove() {
        // First, check if computer can win in the next move
        for (let col = 0; col < COLS; col++) {
            const row = getLowestEmptyRow(col);
            if (row === -1) continue;

            // Test if this move would win
            board[row][col] = 2;
            if (checkWin(row, col)) {
                board[row][col] = 0; // Undo test move
                makeMove(row, col);
                return;
            }
            board[row][col] = 0; // Undo test move
        }

        // Then, check if player can win in the next move and block
        for (let col = 0; col < COLS; col++) {
            const row = getLowestEmptyRow(col);
            if (row === -1) continue;

            // Test if this move would block player
            board[row][col] = 1;
            if (checkWin(row, col)) {
                board[row][col] = 0; // Undo test move
                makeMove(row, col);
                return;
            }
            board[row][col] = 0; // Undo test move
        }

        // Otherwise, make a random move
        const availableCols = [];
        for (let col = 0; col < COLS; col++) {
            if (getLowestEmptyRow(col) !== -1) {
                availableCols.push(col);
            }
        }

        if (availableCols.length > 0) {
            const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
            const row = getLowestEmptyRow(randomCol);
            makeMove(row, randomCol);
        }
    }

    // Get the lowest empty row in a column
    function getLowestEmptyRow(col) {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    // Update the board UI
    function updateBoardUI() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.className = 'cell';
                    if (board[row][col] === 1) {
                        cell.classList.add('player1', 'occupied');
                    } else if (board[row][col] === 2) {
                        cell.classList.add('player2', 'occupied');
                    }
                }
            }
        }
    }

    // Check for a win
    function checkWin(row, col) {
        const player = board[row][col];
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [1, -1]   // diagonal down-left
        ];

        for (const [dx, dy] of directions) {
            let count = 1;
            const winningCells = [{ row, col }];

            // Check in positive direction
            for (let i = 1; i < 4; i++) {
                const newRow = row + i * dx;
                const newCol = col + i * dy;
                if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol] !== player) {
                    break;
                }
                count++;
                winningCells.push({ row: newRow, col: newCol });
            }

            // Check in negative direction
            for (let i = 1; i < 4; i++) {
                const newRow = row - i * dx;
                const newCol = col - i * dy;
                if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS || board[newRow][newCol] !== player) {
                    break;
                }
                count++;
                winningCells.push({ row: newRow, col: newCol });
            }

            if (count >= 4) {
                // Highlight winning cells
                winningCells.forEach(cell => {
                    const winningCell = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
                    if (winningCell) {
                        winningCell.classList.add('winning-cell');
                    }
                });
                return true;
            }
        }

        return false;
    }

    // Check for a draw
    function checkDraw() {
        return board.every(row => row.every(cell => cell !== 0));
    }

    // Handle win
    function handleWin() {
        gameOver = true;
        scores[currentPlayer - 1]++;
        updateScores();

        if (soundsEnabled) {
            winSound.currentTime = 0;
            winSound.play();
        }

        gameInfo.innerHTML = `<span class="player${currentPlayer}-text">Player ${currentPlayer} wins!</span>`;
    }

    // Handle draw
    function handleDraw() {
        gameOver = true;

        if (soundsEnabled) {
            drawSound.currentTime = 0;
            drawSound.play();
        }

        gameInfo.textContent = "It's a draw!";
    }

    // Switch players
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayerDisplay();
    }

    // Update current player display
    function updateCurrentPlayerDisplay() {
        const playerSpan = document.querySelector('.current-player');
        playerSpan.className = `current-player player${currentPlayer}-text`;
        playerSpan.textContent = vsComputer && currentPlayer === 2 ? 'Computer (Blue)' : `Player ${currentPlayer} (${currentPlayer === 1 ? 'Red' : 'Blue'})`;
    }

    // Update scores
    function updateScores() {
        player1Score.textContent = scores[0];
        player2Score.textContent = scores[1];
    }

    // Reset the game
    function resetGame() {
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        currentPlayer = 1;
        gameOver = false;
        updateBoardUI();
        updateCurrentPlayerDisplay();
        gameInfo.innerHTML = '<span>Current turn: </span><span class="current-player player1-text">Player 1 (Red)</span>';
    }

    // Event listeners
    vsFriendBtn.addEventListener('click', () => {
        vsComputer = false;
        vsFriendBtn.classList.add('active');
        vsComputerBtn.classList.remove('active');
        resetGame();
        updateCurrentPlayerDisplay();
    });

    vsComputerBtn.addEventListener('click', () => {
        vsComputer = true;
        vsComputerBtn.classList.add('active');
        vsFriendBtn.classList.remove('active');
        resetGame();
        updateCurrentPlayerDisplay();
    });

    musicToggle.addEventListener('click', () => {
        musicEnabled = !musicEnabled;
        musicToggle.textContent = `Music: ${musicEnabled ? 'On' : 'Off'}`;
        if (musicEnabled) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });

    soundToggle.addEventListener('click', () => {
        soundsEnabled = !soundsEnabled;
        soundToggle.textContent = `Sounds: ${soundsEnabled ? 'On' : 'Off'}`;
    });

    resetBtn.addEventListener('click', resetGame);

    // Start the game
    initBoard();
    backgroundMusic.volume = 0.3;
    if (musicEnabled) {
        backgroundMusic.play().catch(e => console.log("Autoplay prevented:", e));
    }
});