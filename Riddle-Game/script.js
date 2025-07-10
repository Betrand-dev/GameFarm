const riddles = [
    {
        question: "What has keys but can't open locks?",
        options: ["A map", "A clock", "A piano", "A river"],
        answer: 2
    },
    {
        question: "What gets wetter as it dries?",
        options: ["A towel", "A sponge", "A soap", "A cloud"],
        answer: 0
    },
    {
        question: "What has a neck but no head?",
        options: ["A bottle", "A shirt", "A tree", "A shoe"],
        answer: 0
    },
    {
        question: "What can travel around the world while staying in a corner?",
        options: ["A shadow", "A stamp", "A coin", "A clock"],
        answer: 1
    },
    {
        question: "What has hands but can not clap?",
        options: ["A tree", "A monkey", "A robot", "A clock"],
        answer: 3
    },
    {
        question: "What has a heart that doesn’t beat?",
        options: ["An stone", "A artichoke", "A robot", "A tree"],
        answer: 1
    },
    {
        question: "What is always in front of you but can’t be seen?",
        options: ["The future", "The air", "A shadow", "A mirror"],
        answer: 0
    },
    {
        question: "What can you catch but not throw?",
        options: ["A fish", "A ball", "A cold", "A shadow"],
        answer: 2
    },
    {
        question: "What has one eye but can’t see?",
        options: ["A storm", "A needle", "A potato", "A hurricane"],
        answer: 1
    },
    {
        question: "What goes up but never comes down?",
        options: ["Your cloud", "A balloon", "A rocket", "A age"],
        answer: 3
    },
    {
        question: "What belongs to you, but other people use it more than you do?",
        options: ["Your phone", "Your name", "Your money", "Your car"],
        answer: 1
    },
    {
        question: "What has many teeth, but can’t bite?",
        options: ["A rake", "A saw", "A zipper", "A cumb"],
        answer: 3
    },
    {
        question: "What can fill a room but takes up no space?",
        options: ["Light", "Air", "Sound", "Water"],
        answer: 0
    },
    {
        question: "What kind of band never plays music?",
        options: ["A jazz band", "A rock band", "A rubber band", "A marching band"],
        answer: 2
    },
    {
        question: "What is so fragile that saying its name breaks it?",
        options: ["egg", "Glass", "silence", "Promise"],
        answer: 2
    }
];

// Shuffle riddles for random order
let shuffledRiddles = [];
function shuffleRiddles() {
    shuffledRiddles = riddles.slice();
    for (let i = shuffledRiddles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledRiddles[i], shuffledRiddles[j]] = [shuffledRiddles[j], shuffledRiddles[i]];
    }
}

let current = 0;
let score = 0;
const riddleQuestion = document.getElementById('riddleQuestion');
const optionsDiv = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const scoreDiv = document.getElementById('score');
const timerDiv = document.getElementById('timer');
let timer = null;
let timeLeft = 20;

function startTimer() {
    clearInterval(timer);
    timeLeft = 20;
    timerDiv.textContent = `Time Left: ${timeLeft}s`;
    timerDiv.style.color = '#1936f8';
    timer = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = `Time Left: ${timeLeft}s`;
        if (timeLeft <= 5) timerDiv.style.color = '#f87171';
        if (timeLeft === 0) {
            clearInterval(timer);
            skipQuestionOnTimeout();
        }
    }, 1000);
}

function skipQuestionOnTimeout() {
    score = Math.max(0, score - 1);
    current++;
    if (current < shuffledRiddles.length) {
        showRiddle(current);
    } else {
        showGameOver();
    }
}

function showRiddle(idx) {
    const r = shuffledRiddles[idx];
    riddleQuestion.textContent = r.question;
    optionsDiv.innerHTML = '';
    nextBtn.classList.remove('show');
    skipBtn.style.display = 'block';
    r.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => selectOption(i, btn);
        optionsDiv.appendChild(btn);
    });
    scoreDiv.textContent = `Score: ${score} / ${shuffledRiddles.length}`;
    startTimer();
}

function selectOption(selected, btn) {
    const r = shuffledRiddles[current];
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    if (selected === r.answer) {
        btn.classList.add('correct');
        score++;
    } else {
        btn.classList.add('incorrect');
        allBtns[r.answer].classList.add('correct');
    }
    nextBtn.classList.add('show');
    skipBtn.style.display = 'none';
    scoreDiv.textContent = `Score: ${score} / ${shuffledRiddles.length}`;
    clearInterval(timer);
}

nextBtn.onclick = () => {
    clearInterval(timer);
    current++;
    if (current < shuffledRiddles.length) {
        showRiddle(current);
    } else {
        showGameOver();
    }
};

skipBtn.onclick = () => {
    clearInterval(timer);
    score = Math.max(0, score - 1);
    current++;
    if (current < shuffledRiddles.length) {
        showRiddle(current);
    } else {
        showGameOver();
    }
};

function showGameOver() {
    clearInterval(timer);
    riddleQuestion.textContent = 'Game Over!';
    optionsDiv.innerHTML = '';
    nextBtn.style.display = 'none';
    skipBtn.style.display = 'none';
    scoreDiv.textContent = `Final Score: ${score} / ${shuffledRiddles.length}`;
    // Add restart button
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Restart Game';
    restartBtn.className = 'next-btn show';
    restartBtn.style.background = 'linear-gradient(90deg, #22c55e 0%, #009efd 100%)';
    restartBtn.style.marginTop = '18px';
    restartBtn.onclick = () => {
        current = 0;
        score = 0;
        nextBtn.style.display = '';
        shuffleRiddles();
        showRiddle(current);
    };
    optionsDiv.appendChild(restartBtn);
}

// Initialize game
shuffleRiddles();
showRiddle(current);
