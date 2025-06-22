document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const ROWS = 6;
    const COLS = 9;
    const WIN_LENGTH = 6;

    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let currentPlayer = 1;
    let gameOver = false;
    let vsComputer = false;
    let computerThinking = false;
    let musicOn = true;
    let soundsOn = true;
    let winningCells = [];

    // DOM elements
    const boardElement = document.getElementById('game-board');
    const currentPlayerText = document.getElementById('current-player-text');
    const currentPlayerIndicator = document.getElementById('current-player-indicator');
    const friendModeBtn = document.getElementById('friend-mode');
    const computerModeBtn = document.getElementById('computer-mode');
    const restartBtn = document.getElementById('restart-btn');
    const musicToggleBtn = document.getElementById('music-toggle');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const backgroundMusic = document.getElementById('background-music');
    const placeSound = document.getElementById('place-sound');
    const winSound = document.getElementById('win-sound');

    // Initialize the game
    initGame();

    // Event listeners
    friendModeBtn.addEventListener('click', () => {
        if (!vsComputer) return;
        vsComputer = false;
        friendModeBtn.classList.add('active');
        computerModeBtn.classList.remove('active');
        resetGame();
    });

    computerModeBtn.addEventListener('click', () => {
        if (vsComputer) return;
        vsComputer = true;
        computerModeBtn.classList.add('active');
        friendModeBtn.classList.remove('active');
        resetGame();
    });

    restartBtn.addEventListener('click', resetGame);

    musicToggleBtn.addEventListener('click', toggleMusic);
    soundToggleBtn.addEventListener('click', toggleSounds);

    // Initialize game board
    function initGame() {
        // Create board cells
        boardElement.innerHTML = '';

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell empty';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => handleCellClick(row, col));
                boardElement.appendChild(cell);
            }
        }

        // Start background music
        if (musicOn) {
            backgroundMusic.volume = 0.3;
            backgroundMusic.play().catch(e => console.log("Auto-play prevented:", e));
        }
    }

    // Handle cell click
    function handleCellClick(row, col) {
        if (gameOver || computerThinking) return;

        // Find the lowest empty row in the column
        const emptyRow = findEmptyRow(col);
        if (emptyRow === -1) return;

        // Make the move
        makeMove(emptyRow, col, currentPlayer);

        // Check for win or draw
        if (checkWin(emptyRow, col, currentPlayer)) {
            gameOver = true;
            highlightWinningCells();
            if (soundsOn) winSound.play();
            currentPlayerText.textContent = `Player ${currentPlayer} wins!`;
            return;
        } else if (checkDraw()) {
            gameOver = true;
            currentPlayerText.textContent = "It's a draw!";
            return;
        }

        // Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerDisplay();

        // Computer's turn if playing against computer
        if (vsComputer && currentPlayer === 2 && !gameOver) {
            computerThinking = true;
            setTimeout(computerMove, 500);
        }
    }

    // Find the lowest empty row in a column
    function findEmptyRow(col) {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                return row;
            }
        }
        return -1;
    }

    // Make a move on the board
    function makeMove(row, col, player) {
        board[row][col] = player;
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.remove('empty');
        cell.classList.add(`player${player}`);

        if (soundsOn) placeSound.play();
    }

    // Check for a win
    function checkWin(row, col, player) {
        // Directions: horizontal, vertical, diagonal down, diagonal up
        const directions = [
            [0, 1],  // horizontal
            [1, 0],  // vertical
            [1, 1],  // diagonal down
            [1, -1]   // diagonal up
        ];

        for (const [dx, dy] of directions) {
            let count = 1;
            let cells = [{ row, col }];

            // Check in positive direction
            let r = row + dx;
            let c = col + dy;
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                count++;
                cells.push({ row: r, col: c });
                r += dx;
                c += dy;
            }

            // Check in negative direction
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
                count++;
                cells.push({ row: r, col: c });
                r -= dx;
                c -= dy;
            }

            if (count >= WIN_LENGTH) {
                winningCells = cells;
                return true;
            }
        }

        return false;
    }

    // Check for a draw
    function checkDraw() {
        return board.every(row => row.every(cell => cell !== 0));
    }

    // Highlight winning cells
    function highlightWinningCells() {
        winningCells.forEach(({ row, col }) => {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winning');
        });
    }

    // Computer move logic
    function computerMove() {
        // Simple AI: prioritize winning moves, then blocking, then random
        let move;

        // Check for winning move
        move = findWinningMove(2);
        if (!move) {
            // Check for blocking opponent's winning move
            move = findWinningMove(1);
        }

        if (!move) {
            // Random move
            const availableCols = [];
            for (let col = 0; col < COLS; col++) {
                if (board[0][col] === 0) {
                    availableCols.push(col);
                }
            }

            if (availableCols.length > 0) {
                const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
                move = { row: findEmptyRow(randomCol), col: randomCol };
            }
        }

        if (move) {
            makeMove(move.row, move.col, 2);

            // Check for win or draw
            if (checkWin(move.row, move.col, 2)) {
                gameOver = true;
                highlightWinningCells();
                if (soundsOn) winSound.play();
                currentPlayerText.textContent = "Computer wins!";
            } else if (checkDraw()) {
                gameOver = true;
                currentPlayerText.textContent = "It's a draw!";
            } else {
                currentPlayer = 1;
                updatePlayerDisplay();
            }
        }

        computerThinking = false;
    }

    // Find a winning move for the specified player
    function findWinningMove(player) {
        for (let col = 0; col < COLS; col++) {
            const row = findEmptyRow(col);
            if (row === -1) continue;

            // Temporarily make the move
            board[row][col] = player;

            // Check if this move wins
            if (checkWin(row, col, player)) {
                // Undo the temporary move
                board[row][col] = 0;
                return { row, col };
            }

            // Undo the temporary move
            board[row][col] = 0;
        }
        return null;
    }

    // Update player display
    function updatePlayerDisplay() {
        currentPlayerText.textContent = vsComputer && currentPlayer === 2 ? "Computer's turn" : `Player ${currentPlayer}'s turn`;
        currentPlayerIndicator.className = 'current-player';
        currentPlayerIndicator.classList.add(currentPlayer === 1 ? 'player1' : 'player2');
    }

    // Reset the game
    function resetGame() {
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        currentPlayer = 1;
        gameOver = false;
        winningCells = [];

        // Reset board display
        document.querySelectorAll('.cell').forEach(cell => {
            cell.className = 'cell empty';
            cell.classList.remove('winning');
        });

        updatePlayerDisplay();

        // If it's computer's turn first
        if (vsComputer && currentPlayer === 2) {
            computerThinking = true;
            setTimeout(computerMove, 500);
        }
    }

    // Toggle music
    function toggleMusic() {
        musicOn = !musicOn;
        musicToggleBtn.textContent = `Music: ${musicOn ? 'ON' : 'OFF'}`;

        if (musicOn) {
            backgroundMusic.play().catch(e => console.log("Auto-play prevented:", e));
        } else {
            backgroundMusic.pause();
        }
    }

    // Toggle sound effects
    function toggleSounds() {
        soundsOn = !soundsOn;
        soundToggleBtn.textContent = `Sounds: ${soundsOn ? 'ON' : 'OFF'}`;
    }
});
