
document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = 'friend'; // 'friend' or 'computer'
    let scores = { X: 0, O: 0, draws: 0 };
    let winningCells = [];

    // Audio elements
    const backgroundMusic = document.getElementById('background-music');
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const drawSound = document.getElementById('draw-sound');
    const soundToggle = document.getElementById('sound-toggle');

    // UI elements
    const statusDisplay = document.getElementById('status');
    const boardElement = document.getElementById('board');
    const resetButton = document.getElementById('reset-btn');
    const newGameButton = document.getElementById('new-game-btn');
    const friendModeBtn = document.getElementById('friend-mode');
    const computerModeBtn = document.getElementById('computer-mode');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreDraw = document.getElementById('score-draw');

    // Winning conditions
    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize the board
    function initializeBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }

    // Handle cell click
    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        // If cell is already filled or game is not active, ignore the click
        if (board[clickedCellIndex] !== '' || !gameActive) {
            return;
        }

        // Update board and UI
        updateCell(clickedCell, clickedCellIndex);

        // Check for win or draw
        const winResult = checkWin();
        if (winResult.won) {
            handleWin(winResult.winningCombo);
        } else if (checkDraw()) {
            handleDraw();
        } else {
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatus();

            // If playing against computer and it's computer's turn
            if (gameMode === 'computer' && currentPlayer === 'O' && gameActive) {
                setTimeout(makeComputerMove, 500);
            }
        }
    }

    // Update cell with current player's mark
    function updateCell(cell, index) {
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add(currentPlayer.toLowerCase());

        // Play click sound if sound is enabled
        if (soundToggle.checked) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
    }

    // Computer move logic
    function makeComputerMove() {
        if (!gameActive) return;

        // Simple AI: first try to win, then block, then random
        let bestMove = findWinningMove('O'); // Try to win
        if (bestMove === -1) bestMove = findWinningMove('X'); // Block player
        if (bestMove === -1) bestMove = findRandomMove(); // Random move

        if (bestMove !== -1 && board[bestMove] === '') {
            const cell = document.querySelector(`.cell[data-index="${bestMove}"]`);
            updateCell(cell, bestMove);

            // Check for win or draw after computer move
            const winResult = checkWin();
            if (winResult.won) {
                handleWin(winResult.winningCombo);
            } else if (checkDraw()) {
                handleDraw();
            } else {
                currentPlayer = 'X';
                updateStatus();
            }
        }
    }

    // Find a winning move for the given player
    function findWinningMove(player) {
        for (let condition of winningConditions) {
            let [a, b, c] = condition;
            // Check if two in a row with one empty
            if (board[a] === player && board[b] === player && board[c] === '') return c;
            if (board[a] === player && board[c] === player && board[b] === '') return b;
            if (board[b] === player && board[c] === player && board[a] === '') return a;
        }
        return -1;
    }

    // Find a random available move
    function findRandomMove() {
        const availableMoves = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        if (availableMoves.length > 0) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        return -1;
    }

    // Check for win
    function checkWin() {
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] !== '' && board[a] === board[b] && board[a] === board[c]) {
                return {
                    won: true,
                    winningCombo: condition
                };
            }
        }
        return { won: false };
    }

    // Check for draw
    function checkDraw() {
        return board.every(cell => cell !== '');
    }

    // Handle win
    function handleWin(winningCombo) {
        statusDisplay.textContent = `Player ${currentPlayer} wins!`;
        gameActive = false;
        scores[currentPlayer]++;
        updateScoreDisplay();

        // Highlight winning cells
        winningCombo.forEach(index => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.classList.add('win');
        });

        if (soundToggle.checked) {
            winSound.currentTime = 0;
            winSound.play();
        }
    }

    // Handle draw
    function handleDraw() {
        statusDisplay.textContent = "Game ended in a draw!";
        gameActive = false;
        scores.draws++;
        updateScoreDisplay();

        if (soundToggle.checked) {
            drawSound.currentTime = 0;
            drawSound.play();
        }
    }

    // Update game status display
    function updateStatus() {
        if (gameMode === 'computer' && currentPlayer === 'O') {
            statusDisplay.textContent = "Computer is thinking...";
        } else {
            statusDisplay.textContent = `Player ${currentPlayer}'s turn`;
        }
    }

    // Reset game (keep scores)
    function resetGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        updateStatus();

        // Clear board UI
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'disabled', 'win');
        });

        // If playing against computer and computer goes first
        if (gameMode === 'computer' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }

    // New game (reset scores)
    function newGame() {
        scores = { X: 0, O: 0, draws: 0 };
        updateScoreDisplay();
        resetGame();
    }

    // Update score display
    function updateScoreDisplay() {
        scoreX.textContent = scores.X;
        scoreO.textContent = scores.O;
        scoreDraw.textContent = scores.draws;
    }

    // Set game mode
    function setGameMode(mode) {
        gameMode = mode;
        friendModeBtn.classList.toggle('active', mode === 'friend');
        computerModeBtn.classList.toggle('active', mode === 'computer');
        resetGame();
    }

    // Toggle sound
    soundToggle.addEventListener('change', function () {
        if (this.checked) {
            backgroundMusic.play().catch(e => console.log("Auto-play prevented"));
        } else {
            backgroundMusic.pause();
        }
    });

    // Button event listeners
    resetButton.addEventListener('click', resetGame);
    newGameButton.addEventListener('click', newGame);
    friendModeBtn.addEventListener('click', () => setGameMode('friend'));
    computerModeBtn.addEventListener('click', () => setGameMode('computer'));

    // Start background music (will be muted until user interaction)
    backgroundMusic.volume = 0.3;
    document.body.addEventListener('click', function initAudio() {
        if (soundToggle.checked) {
            backgroundMusic.play().catch(e => console.log("Auto-play prevented"));
        }
        document.body.removeEventListener('click', initAudio);
    }, { once: true });

    // Initialize the game
    initializeBoard();
    updateScoreDisplay();
});