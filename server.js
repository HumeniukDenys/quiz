const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {}; // Хранит данные игроков
let currentQuestion = null; // Текущий вопрос
let timer = null; // Таймер
let gameStarted = false; // Статус игры

// Подключение игроков
io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    // Регистрация игрока
    socket.on('register', (name) => {
        players[socket.id] = { name, score: 0 };
        io.emit('updatePlayers', players); // Обновляем список игроков
    });

    // Ответ игрока
    socket.on('answer', (answer) => {
        if (currentQuestion && answer === currentQuestion.answer) {
            players[socket.id].score += 1; // Начисляем балл
        }
        io.emit('updatePlayers', players); // Обновляем список игроков
    });

    // Отключение игрока
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players); // Обновляем список игроков
    });
});

// Запуск игры (для ведущего)
app.post('/start', (req, res) => {
    if (!gameStarted) {
        gameStarted = true;
        startGame();
        res.send('Игра началась!');
    } else {
        res.send('Игра уже идет.');
    }
});

// Запуск сервера
server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});

// Логика игры
function startGame() {
    const questions = [
        {
            question: "Угадайте мелодию",
            audio: "audio/melody1.mp3",
            options: ["Калинка", "Катюша", "Смуглянка", "Подмосковные вечера"],
            answer: "Калинка"
        },
        {
            question: "Угадайте мелодию",
            audio: "audio/melody2.mp3",
            options: ["Yesterday", "Bohemian Rhapsody", "Smells Like Teen Spirit", "Hotel California"],
            answer: "Yesterday"
        }
    ];

    let questionIndex = 0;

    function nextQuestion() {
        if (questionIndex < questions.length) {
            currentQuestion = questions[questionIndex];
            io.emit('question', currentQuestion); // Отправляем вопрос всем
            startTimer(10); // Таймер на 10 секунд
            questionIndex++;
        } else {
            endGame();
        }
    }

    function startTimer(seconds) {
        let timeLeft = seconds;
        timer = setInterval(() => {
            io.emit('timer', timeLeft); // Отправляем время всем
            timeLeft--;
            if (timeLeft < 0) {
                clearInterval(timer);
                nextQuestion();
            }
        }, 1000);
    }

    function endGame() {
        io.emit('endGame', players); // Отправляем результаты
        gameStarted = false;
    }

    nextQuestion();
}