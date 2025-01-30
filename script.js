let currentCategory = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timerInterval;
let playerName = "";

const loginContainer = document.getElementById('login-container');
const quizContainer = document.getElementById('quiz-container');
const leaderboardContainer = document.getElementById('leaderboard-container');
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-button');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const leaderboardBody = document.querySelector('#leaderboard tbody');
const playAgainButton = document.getElementById('play-again-button');

// Аудиоэлемент
const audioElement = new Audio();

// Список категорий и их JSON-файлов
const categoryFiles = {
    geography: 'geography.json',
    literature: 'literature.json',
    music: 'music.json'
};

// Таблица лидеров (хранится в localStorage)
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Обработчик отправки формы авторизации
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    playerName = usernameInput.value.trim();
    if (playerName) {
        loginContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        showCategories();
    } else {
        alert('Пожалуйста, введите ваше имя.');
    }
});

// Показ категорий
function showCategories() {
    questionElement.innerHTML = `<h2>${playerName}, выберите категорию:</h2>`;
    Object.keys(categoryFiles).forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.addEventListener('click', () => {
            currentCategory = category;
            loadQuestions(categoryFiles[category]);
        });
        questionElement.appendChild(button);
    });
}

// Загрузка вопросов для выбранной категории
async function loadQuestions(file) {
    try {
        const response = await fetch(file);
        questions = await response.json();
        startGame();
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
    }
}

// Запуск игры
function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = `Счет: ${score}`;
    showQuestion();
}

// Показ вопроса
function showQuestion() {
    startTimer();
    const question = questions[currentQuestionIndex];
    questionElement.textContent = question.question;

    // Если это музыкальная категория, воспроизводим мелодию
    if (currentCategory === 'music' && question.audio) {
        audioElement.src = question.audio;
        audioElement.play();
    }

    optionsElement.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => {
            stopTimer();
            if (currentCategory === 'music') {
                audioElement.pause();
            }
            checkAnswer(option);
        });
        optionsElement.appendChild(button);
    });
}

// Проверка ответа
function checkAnswer(selectedOption) {
    const question = questions[currentQuestionIndex];
    if (selectedOption === question.answer) {
        score++;
    }
    scoreElement.textContent = `Счет: ${score}`;
    nextButton.style.display = 'block';
}

// Переход к следующему вопросу
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
        nextButton.style.display = 'none';
    } else {
        endGame();
    }
}

// Завершение игры
function endGame() {
    // Добавляем результат игрока в таблицу лидеров
    leaderboard.push({ name: playerName, score: score });

    // Сортируем таблицу лидеров
    leaderboard.sort((a, b) => {
        if (b.score === a.score) {
            return a.name.localeCompare(b.name); // Сортировка по алфавиту при равных баллах
        }
        return b.score - a.score; // Сортировка по баллам (по убыванию)
    });

    // Сохраняем таблицу лидеров в localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Показываем таблицу лидеров
    showLeaderboard();
}

// Показ таблицы лидеров
function showLeaderboard() {
    quizContainer.style.display = 'none';
    leaderboardContainer.style.display = 'block';

    // Очищаем таблицу
    leaderboardBody.innerHTML = '';

    // Заполняем таблицу
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}. ${entry.name}</td>
            <td>${entry.score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}

// Обработчик кнопки "Играть снова"
playAgainButton.addEventListener('click', () => {
    leaderboardContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

// Таймер
function startTimer() {
    timeLeft = 10;
    timerElement.textContent = `Осталось времени: ${timeLeft} сек`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Осталось времени: ${timeLeft} сек`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (currentCategory === 'music') {
                audioElement.pause();
            }
            checkAnswer(null);
            nextQuestion();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// Обработчик кнопки "Следующий вопрос"
nextButton.addEventListener('click', nextQuestion);