document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const state = {
        words: [
            { word: "apple", hint: "A crunchy fruit that keeps the doctor away" },
            { word: "moon", hint: "Earth's natural setelite" },
            { word: "book", hint: "Contains pages and can be read" },
            { word: "guitar", hint: "A musical instrument with strings" },
            { word: "internet", hint: "The global network that connects computers" },
            { word: "castle", hint: "A large, fortified building from medieval time" },
            { word: "electricity", hint: "Powers lights and devices" },
            { word: "chocolate", hint: "A sweet treat made from cocoa" },
            { word: "telescope", hint: "Used to observe distant stars and planets" },
            { word: "dragon", hint: "A mythical fire-breathing creature" }
        ],
        currentWord: "",
        hint: "",
        guessedLetters: [],
        wrongGuesses: 0,
        remainingLives: 6,
        maxLives: 6,
        score: 0,
        wordsGuessed: 0,
        gameOver: false,
        musicEnabled: true,
        soundEffectsEnabled: true,
        availableWords: []
    };

    // DOM elements
    const wordDisplayEl = document.getElementById('word-display');
    const keyboardEl = document.getElementById('keyboard');
    const hangmanDrawingEl = document.getElementById('hangman-drawing');
    const livesEl = document.getElementById('lives');
    const scoreEl = document.getElementById('score');
    const wordsGuessedEl = document.getElementById('words-guessed');
    const hintEl = document.getElementById('hint');
    const gameOverEl = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    const musicBtn = document.getElementById('music-btn');
    const soundBtn = document.getElementById('sound-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    const quitBtn = document.getElementById('quit-btn');

    // Audio elements
    const bgMusic = document.getElementById('background-music');
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');

    // Hangman drawings for each wrong guess
    const hangmanDrawings = [
        `
  +---+
  |   |
      |
      |
      |
      |
=========
        `,
        `
  +---+
  |   |
  O   |
      |
      |
      |
=========
        `,
        `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========
        `,
        `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========
        `,
        `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========
        `,
        `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========
        `,
        `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========
        `
    ];

    // Initialize the game
    function initGame() {
        state.score = 0;
        state.wordsGuessed = 0;
        state.remainingLives = state.maxLives;
        state.wrongGuesses = 0;
        state.gameOver = false;
        state.availableWords = [...state.words];

        loadRandomWord();
        updateScore();
        createKeyboard();

        gameOverEl.textContent = '';
        gameOverEl.className = 'game-over';
        livesEl.textContent = state.remainingLives;

        if (state.musicEnabled) {
            bgMusic.volume = 0.3;
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
        }
    }

    // Load a random word from available words
    function loadRandomWord() {
        if (state.availableWords.length === 0) {
            endGame(true);
            return;
        }

        state.guessedLetters = [];
        state.wrongGuesses = 0;
        state.gameOver = false;

        const randomIndex = Math.floor(Math.random() * state.availableWords.length);
        const selectedWord = state.availableWords[randomIndex];
        state.availableWords.splice(randomIndex, 1);

        state.currentWord = selectedWord.word.toLowerCase();
        state.hint = selectedWord.hint;

        hintEl.textContent = `Hint: ${state.hint}`;
        livesEl.textContent = state.remainingLives;
        wordsGuessedEl.textContent = state.wordsGuessed;
        gameOverEl.textContent = '';
        hangmanDrawingEl.textContent = hangmanDrawings[state.wrongGuesses];

        document.querySelectorAll('.key').forEach(key => {
            key.className = 'key';
        });

        renderWord();
    }

    // Render the word with placeholders
    function renderWord() {
        wordDisplayEl.innerHTML = '';

        for (let letter of state.currentWord) {
            const letterEl = document.createElement('div');
            letterEl.className = 'letter';

            const charEl = document.createElement('div');
            charEl.className = 'letter-char';
            charEl.textContent = state.guessedLetters.includes(letter) ? letter : '';

            const lineEl = document.createElement('div');
            lineEl.className = 'letter-line';

            letterEl.appendChild(charEl);
            letterEl.appendChild(lineEl);
            wordDisplayEl.appendChild(letterEl);
        }

        checkWin();
    }

    // Create the keyboard
    function createKeyboard() {
        keyboardEl.innerHTML = '';

        const alphabet = 'abcdefghijklmnopqrstuvwxyz';

        for (let letter of alphabet) {
            const key = document.createElement('button');
            key.className = 'key';
            key.textContent = letter;
            key.dataset.letter = letter;

            key.addEventListener('click', () => handleGuess(letter));

            keyboardEl.appendChild(key);
        }
    }

    // Handle a letter guess
    function handleGuess(letter) {
        if (state.gameOver || state.guessedLetters.includes(letter)) return;

        state.guessedLetters.push(letter);

        const key = document.querySelector(`.key[data-letter="${letter}"]`);

        if (!state.currentWord.includes(letter)) {
            state.wrongGuesses++;
            state.remainingLives--;
            key.classList.add('wrong');
            hangmanDrawingEl.textContent = hangmanDrawings[state.wrongGuesses];
            playSound(wrongSound);

            if (state.remainingLives <= 0) {
                endGame(false);
                return;
            }
        } else {
            key.classList.add('correct');
            playSound(correctSound);
        }

        key.classList.add('used');
        livesEl.textContent = state.remainingLives;
        renderWord();
    }

    // Check if the player has won the current word
    function checkWin() {
        const wordGuessed = [...state.currentWord].every(letter =>
            state.guessedLetters.includes(letter)
        );

        if (wordGuessed) {
            state.score += 10;
            state.wordsGuessed++;
            updateScore();
            playSound(winSound);

            if (state.availableWords.length > 0) {
                setTimeout(loadRandomWord, 1500);
            } else {
                endGame(true);
            }
        }
    }

    // Update the score display
    function updateScore() {
        scoreEl.textContent = state.score;
        wordsGuessedEl.textContent = state.wordsGuessed;
    }

    // End the game
    function endGame(win) {
        state.gameOver = true;

        if (win) {
            modalTitle.textContent = 'Congratulations!';
            modalMessage.textContent = `You've guessed all ${state.words.length} words with ${state.remainingLives} lives remaining! Final score: ${state.score}`;
            playSound(winSound);
        } else {
            modalTitle.textContent = 'Game Over';
            modalMessage.textContent = `You ran out of lives! The word was "${state.currentWord}". You guessed ${state.wordsGuessed} words. Final score: ${state.score}`;
            playSound(loseSound);

            for (let letter of state.currentWord) {
                if (!state.guessedLetters.includes(letter)) {
                    state.guessedLetters.push(letter);
                }
            }
            renderWord();
        }

        document.querySelectorAll('.key').forEach(key => {
            key.classList.add('used');
        });

        gameOverModal.style.display = 'flex';
    }

    // Play sound effect
    function playSound(audioElement) {
        if (state.soundEffectsEnabled) {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => console.log("Sound play failed:", e));
        }
    }

    // Toggle background music
    musicBtn.addEventListener('click', () => {
        state.musicEnabled = !state.musicEnabled;
        musicBtn.textContent = state.musicEnabled ? '🔊' : '🔇';

        if (state.musicEnabled) {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
        } else {
            bgMusic.pause();
        }
    });

    // Toggle sound effects
    soundBtn.addEventListener('click', () => {
        state.soundEffectsEnabled = !state.soundEffectsEnabled;
        soundBtn.textContent = state.soundEffectsEnabled ? '🔔' : '🔕';
    });

    // Play again button in modal
    playAgainBtn.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        initGame();
    });

    // Quit button in modal
    quitBtn.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
    });

    // Restart the game
    restartBtn.addEventListener('click', () => {
        initGame();
    });

    // Keyboard event listener
    document.addEventListener('keydown', (e) => {
        if (state.gameOver) return;

        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            const letter = e.key.toLowerCase();
            if (!state.guessedLetters.includes(letter)) {
                handleGuess(letter);
            }
        }
    });

    // Start the game
    initGame();
});
