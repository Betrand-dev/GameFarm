document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const timeDisplay = document.getElementById('time');
    const movesDisplay = document.getElementById('moves');
    const restartButton = document.getElementById('restart');
    const flipSound = document.getElementById('flip-sound');
    const matchSound = document.getElementById('match-sound');
    const winSound = document.getElementById('win-sound');

    const cards = ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍐', '🍉'];
    const totalPairs = cards.length;
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let matchedPairs = 0;
    let moves = 0;
    let time = 0;
    let timer;

    // Duplicate cards to create pairs
    const gameCards = [...cards, ...cards];

    // Shuffle cards
    function shuffleCards() {
        for (let i = gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
        }
    }

    // Create card elements
    function createBoard() {
        shuffleCards();
        gameBoard.innerHTML = '';
        gameCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.innerHTML = `
                <div class="card-face card-back"></div>
                <div class="card-face card-front">${emoji}</div>
            `;
            card.addEventListener('click', flipCard);
            gameBoard.appendChild(card);
        });
    }

    // Flip card
    function flipCard() {
        if (lockBoard || this === firstCard) return;
        flipSound.play();

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    // Check if cards match
    function checkForMatch() {
        moves++;
        movesDisplay.textContent = moves;
        const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

        if (isMatch) {
            matchSound.play();
            disableCards();
            matchedPairs++;
            if (matchedPairs === totalPairs) {
                winSound.play();
                clearInterval(timer);
                setTimeout(() => alert(`🎉 You won in ${time}s with ${moves} moves!`), 500);
            }
        } else {
            unflipCards();
        }
    }

    // Disable matched cards
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        resetBoard();
    }

    // Unflip mismatched cards
    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    // Reset board state
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Start timer
    function startTimer() {
        timer = setInterval(() => {
            time++;
            timeDisplay.textContent = time;
        }, 1000);
    }

    // Restart game
    function restartGame() {
        clearInterval(timer);
        time = 0;
        moves = 0;
        matchedPairs = 0;
        timeDisplay.textContent = time;
        movesDisplay.textContent = moves;
        resetBoard();
        createBoard();
        startTimer();
    }

    // Initialize game
    restartButton.addEventListener('click', restartGame);
    createBoard();
    startTimer();
});