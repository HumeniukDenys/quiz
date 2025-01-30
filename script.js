let currentCategory = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 10;
let timerInterval;

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const nextButton = document.getElementById('next-button');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

// Аудиоэлемент
const audioElement = new Audio();

// Список категорий и их JSON-файлов
const categoryFiles = {
    geography: 'geography.json',
    literature: 'literature.json',
    music: 'music.json' // Новая категория
};

// Показ категорий
function showCategories() {
    questionElement.innerHTML = '<h2>Выберите категорию:</h2>';
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
        const response = await fetch(file); // Загрузка JSON-файла
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
                audioElement.pause(); // Останавливаем мелодию
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
        score++; // +1 балл за правильный ответ
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
        alert(`Игра окончена! Ваш счет: ${score}`);
        currentQuestionIndex = 0;
        score = 0;
        showCategories();
    }
}

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
                audioElement.pause(); // Останавливаем мелодию
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

// Показ категорий при запуске
showCategories();