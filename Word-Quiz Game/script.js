document.addEventListener('DOMContentLoaded', () => {
    // Game Elements
    const wordDisplay = document.getElementById('word-display');
    const optionsContainer = document.getElementById('options');
    const nextBtn = document.getElementById('next-btn');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const finalScoreDisplay = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const soundToggle = document.getElementById('sound-toggle');

    // Audio Elements
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const gameOverSound = document.getElementById('game-over-sound');
    const tickSound = document.getElementById('tick-sound');

    // Game Variables
    let currentWord = '';
    let correctAnswer = '';
    let score = 0;
    let timeLeft = 30;
    let timer;
    let difficulty = 'easy';
    let isGameRunning = false;

    // Word Database (Can be expanded)
    const wordDatabase = {
        easy: [
            { word: "Apple", options: ["Fruit", "Vegetable", "Animal", "Color"], correct: 0 },
            { word: "Dog", options: ["Animal", "Fruit", "Vehicle", "Planet"], correct: 0 },
            { word: "Red", options: ["Color", "Shape", "Number", "Food"], correct: 0 },
            { word: "Car", options: ["Vehicle", "Animal", "Fruit", "Country"], correct: 0 },
            { word: "Spain", options: ["Country", "City", "Language", "Food"], correct: 0 }
        ],
        medium: [
            { word: "Eloquent", options: ["Fluent", "Angry", "Quiet", "Fast"], correct: 0 },
            { word: "Pragmatic", options: ["Practical", "Theoretical", "Lazy", "Creative"], correct: 0 },
            { word: "Ephemeral", options: ["Short-lived", "Permanent", "Colorful", "Loud"], correct: 0 },
            { word: "Ubiquitous", options: ["Everywhere", "Nowhere", "Rare", "Expensive"], correct: 0 },
            { word: "Alacrity", options: ["Eagerness", "Sadness", "Fear", "Anger"], correct: 0 }
        ],
        hard: [
            { word: "Pulchritudinous", options: ["Beautiful", "Ugly", "Smart", "Dangerous"], correct: 0 },
            { word: "Sesquipedalian", options: ["Long-worded", "Short", "Fast", "Quiet"], correct: 0 },
            { word: "Defenestration", options: ["Throwing out a window", "Eating", "Running", "Sleeping"], correct: 0 },
            { word: "Obfuscate", options: ["Confuse", "Clarify", "Help", "Ignore"], correct: 0 },
            { word: "Lugubrious", options: ["Mournful", "Happy", "Angry", "Excited"], correct: 0 }
        ]
    };

    // Initialize Game
    function initGame() {
        score = 0;
        timeLeft = 30;
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        gameOverScreen.style.display = "none";
        nextBtn.style.display = "none";
        isGameRunning = true;

        loadNewWord();
        startTimer();
    }

    // Load a new word
    function loadNewWord() {
        const words = wordDatabase[difficulty];
        const randomWord = words[Math.floor(Math.random() * words.length)];

        currentWord = randomWord.word;
        correctAnswer = randomWord.options[randomWord.correct];

        wordDisplay.textContent = currentWord;

        // Shuffle options
        const shuffledOptions = [...randomWord.options].sort(() => Math.random() - 0.5);

        optionsContainer.innerHTML = '';
        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => checkAnswer(option));
            optionsContainer.appendChild(button);
        });
    }

    // Check selected answer
    function checkAnswer(selectedOption) {
        if (!isGameRunning) return;

        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.disabled = true;
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === selectedOption && selectedOption !== correctAnswer) {
                button.classList.add('wrong');
            }
        });

        if (selectedOption === correctAnswer) {
            score += 10;
            scoreDisplay.textContent = score;
            if (soundToggle.checked) correctSound.play();
        } else {
            if (soundToggle.checked) wrongSound.play();
        }

        nextBtn.style.display = "block";
        isGameRunning = false;
        clearInterval(timer);
    }

    // Start timer
    function startTimer() {
        clearInterval(timer);
        timeLeft = 30;
        timeDisplay.textContent = timeLeft;

        timer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;

            if (timeLeft <= 5 && soundToggle.checked) {
                tickSound.play();
            }

            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    // End game
    function endGame() {
        isGameRunning = false;
        gameOverScreen.style.display = "flex";
        finalScoreDisplay.textContent = score;
        if (soundToggle.checked) gameOverSound.play();
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => {
        loadNewWord();
        nextBtn.style.display = "none";
        isGameRunning = true;
        startTimer();
    });

    restartBtn.addEventListener('click', initGame);

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            initGame();
        });
    });

    soundToggle.addEventListener('change', () => {
        if (!soundToggle.checked) {
            correctSound.pause();
            wrongSound.pause();
            gameOverSound.pause();
            tickSound.pause();
        }
    });

    // Start the game
    initGame();
});
