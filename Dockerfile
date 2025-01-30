# Используем базовый образ Node.js
FROM node:16

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы
COPY . .

# Открываем порт 3000
EXPOSE 3000

# Запускаем сервер
CMD ["node", "server.js"]