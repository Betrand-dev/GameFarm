// DOM elements
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const gameContainer = document.querySelector('.game-container');
const questionElement = document.querySelector('.question');
const optionBtns = document.querySelectorAll('.option-btn');
const nextBtn = document.querySelector('.next-btn');
const restartBtn = document.querySelector('.restart-btn');
const scoreElement = document.querySelector('.score');
const resultContainer = document.querySelector('.result-container');
const finalScoreElement = document.querySelector('.score-display');
const timerBar = document.querySelector('.timer-bar');
const soundControl = document.querySelector('.sound-control');
const themeToggle = document.querySelector('.theme-toggle');

// Audio elements
const backgroundMusic = document.getElementById('backgroundMusic');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const timeoutSound = document.getElementById('timeoutSound');

// Game variables
let currentDifficulty = 'easy';
let score = 0;
let currentQuestion = {};
let acceptingAnswers = false;
let questionCounter = 0;
let availableQuestions = [];
let timer;
let timePerQuestion = 15;
let timeLeft;
let musicOn = true;
let soundsOn = true;

// Questions by difficulty
const questions = {
    easy: [
        {
            question: "What is 5 + 7?",
            options: ["11", "12", "13"],
            answer: 1
        },
        {
            question: "What is 8 × 3?",
            options: ["21", "24", "27"],
            answer: 1
        },
        {
            question: "What is 15 - 9?",
            options: ["5", "6", "7"],
            answer: 1
        },
        {
            question: "What is 20 ÷ 4?",
            options: ["4", "5", "6"],
            answer: 1
        },
        {
            question: "What is 3 + 4 × 2?",
            options: ["10", "11", "14"],
            answer: 1
        },
        {
            question: "What is 9 squared?",
            options: ["72", "81", "90"],
            answer: 1
        },
        {
            question: "What is 1/2 of 14?",
            options: ["6", "7", "8"],
            answer: 1
        },
        {
            question: "What is 5 × 5 - 10?",
            options: ["10", "15", "20"],
            answer: 1
        },
        {
            question: "What is 30% of 50?",
            options: ["10", "15", "20"],
            answer: 1
        },
        {
            question: "What is 7 + 8 + 3?",
            options: ["17", "18", "19"],
            answer: 1
        }
    ],
    medium: [
        {
            question: "What is 12 × 11?",
            options: ["121", "132", "143"],
            answer: 1
        },
        {
            question: "What is 144 ÷ 12?",
            options: ["10", "11", "12"],
            answer: 2
        },
        {
            question: "What is 15% of 200?",
            options: ["20", "30", "40"],
            answer: 1
        },
        {
            question: "What is 3² + 4²?",
            options: ["21", "24", "25"],
            answer: 2
        },
        {
            question: "What is 5! (5 factorial)?",
            options: ["100", "120", "150"],
            answer: 1
        },
        {
            question: "What is 17 × 3?",
            options: ["41", "51", "61"],
            answer: 1
        },
        {
            question: "What is √169?",
            options: ["11", "12", "13"],
            answer: 2
        },
        {
            question: "What is 2³ × 3²?",
            options: ["48", "64", "72"],
            answer: 2
        },
        {
            question: "What is 3/4 of 28?",
            options: ["18", "20", "21"],
            answer: 2
        },
        {
            question: "What is 7 × 8 - 15?",
            options: ["41", "42", "43"],
            answer: 0
        }
    ],
    hard: [
        {
            question: "What is 17 × 23?",
            options: ["371", "381", "391"],
            answer: 2
        },
        {
            question: "What is 256 ÷ 16?",
            options: ["14", "16", "18"],
            answer: 1
        },
        {
            question: "What is 35% of 340?",
            options: ["112", "119", "126"],
            answer: 1
        },
        {
            question: "What is 5³ - 4³?",
            options: ["51", "61", "71"],
            answer: 1
        },
        {
            question: "What is the square root of 625?",
            options: ["23", "25", "27"],
            answer: 1
        },
        {
            question: "What is 7! ÷ 6!?",
            options: ["5", "6", "7"],
            answer: 2
        },
        {
            question: "What is 11² + 13²?",
            options: ["270", "290", "310"],
            answer: 1
        },
        {
            question: "What is 3 × (4 + 5)²?",
            options: ["243", "248", "253"],
            answer: 0
        },
        {
            question: "What is 1/3 + 1/4?",
            options: ["5/12", "7/12", "9/12"],
            answer: 1
        },
        {
            question: "What is 19 × 21?",
            options: ["389", "399", "409"],
            answer: 1
        }
    ]
};

// Initialize the game
function initGame() {
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions[currentDifficulty]];
    scoreElement.innerText = score;
    gameContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    getNewQuestion();

    // Start background music if enabled
    if (musicOn) {
        backgroundMusic.volume = 0.3;
        backgroundMusic.play().catch(e => console.log("Auto-play prevented"));
    }
}

// Get a new question
function getNewQuestion() {
    if (availableQuestions.length === 0 || questionCounter >= 10) {
        return endGame();
    }

    questionCounter++;
    const questionIndex = Math.floor(Math.random() * availableQuestions.length);
    currentQuestion = availableQuestions[questionIndex];
    availableQuestions.splice(questionIndex, 1);

    questionElement.innerText = currentQuestion.question;

    optionBtns.forEach((btn, index) => {
        btn.innerText = currentQuestion.options[index];
        btn.classList.remove('correct', 'wrong');
    });

    acceptingAnswers = true;
    startTimer();
}

// Start the timer for the current question
function startTimer() {
    timeLeft = timePerQuestion;
    timerBar.style.width = '100%';
    timerBar.style.transition = 'none';
    timerBar.style.backgroundColor = '#4a6fa5';

    // Force a reflow to reset the transition
    timerBar.offsetHeight;

    timerBar.style.transition = `width ${timePerQuestion}s linear`;
    timerBar.style.width = '0%';

    timer = setTimeout(() => {
        if (acceptingAnswers) {
            timeUp();
        }
    }, timePerQuestion * 1000);
}

// Handle when time is up
function timeUp() {
    acceptingAnswers = false;
    timerBar.style.backgroundColor = '#f44336';

    if (soundsOn) {
        timeoutSound.currentTime = 0;
        timeoutSound.play();
    }

    optionBtns.forEach(btn => {
        btn.classList.add('wrong');
    });

    // Highlight the correct answer
    optionBtns[currentQuestion.answer].classList.add('correct');

    nextBtn.style.display = 'block';
    clearTimeout(timer);
}

// Handle option selection
optionBtns.forEach(btn => {
    btn.addEventListener('click', e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        clearTimeout(timer);

        const selectedOption = e.target;
        const selectedAnswer = Array.from(optionBtns).indexOf(selectedOption);

        let isCorrect = selectedAnswer === currentQuestion.answer;

        if (isCorrect) {
            if (soundsOn) {
                correctSound.currentTime = 0;
                correctSound.play();
            }
            selectedOption.classList.add('correct');
            score += timeLeft; // More points for faster answers
            scoreElement.innerText = score;
        } else {
            if (soundsOn) {
                wrongSound.currentTime = 0;
                wrongSound.play();
            }
            selectedOption.classList.add('wrong');
            // Highlight the correct answer
            optionBtns[currentQuestion.answer].classList.add('correct');
        }

        nextBtn.style.display = 'block';
    });
});

// Next question button
nextBtn.addEventListener('click', () => {
    nextBtn.style.display = 'none';
    getNewQuestion();
});

// Restart game button
restartBtn.addEventListener('click', () => {
    initGame();
});

// Difficulty selection
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = btn.dataset.difficulty;

        // Set time per question based on difficulty
        switch (currentDifficulty) {
            case 'easy':
                timePerQuestion = 15;
                break;
            case 'medium':
                timePerQuestion = 12;
                break;
            case 'hard':
                timePerQuestion = 10;
                break;
        }

        initGame();
    });
});

// Sound control
soundControl.addEventListener('click', () => {
    musicOn = !musicOn;
    soundsOn = !soundsOn;

    if (musicOn) {
        soundControl.querySelector('.sound-icon').textContent = '🔊';
        backgroundMusic.play().catch(e => console.log("Auto-play prevented"));
    } else {
        soundControl.querySelector('.sound-icon').textContent = '🔇';
        backgroundMusic.pause();
    }
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('.theme-icon');
    if (document.body.classList.contains('dark-mode')) {
        icon.textContent = '☀️';
    } else {
        icon.textContent = '🌙';
    }
});

// End the game
function endGame() {
    gameContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    finalScoreElement.innerText = score;
    backgroundMusic.pause();
}