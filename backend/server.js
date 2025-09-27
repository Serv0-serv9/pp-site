// Импорт необходимых модулей
const express = require('express'); // Фреймворк для создания веб-сервера
const cors = require('cors'); // Middleware для обработки CORS (Cross-Origin Resource Sharing)
const fs = require('fs'); // Модуль для работы с файловой системой
const path = require('path'); // Модуль для работы с путями файлов

// Создание экземпляра Express приложения
const app = express();
// Порт, на котором будет запущен сервер
const PORT = 3000;

// Настройка middleware
app.use(cors()); // Разрешаем CORS для всех запросов
app.use(express.json()); // Парсинг JSON данных из тела запроса
app.use(express.static('../frontend')); // Обслуживание статических файлов из папки frontend

// Функция для чтения данных о товарах из JSON файла
function getProducts() {
    // Формируем абсолютный путь к файлу products.json
    const productsPath = path.join(__dirname, 'products.json');
    // Синхронно читаем файл с кодировкой UTF-8
    const data = fs.readFileSync(productsPath, 'utf8');
    // Парсим JSON данные и возвращаем объект JavaScript
    return JSON.parse(data);
}

// ========== API ENDPOINTS ========== //

// GET /api/products - получение списка всех товаров
app.get('/api/products', (req, res) => {
    try {
        // Получаем массив товаров из файла
        const products = getProducts();
        // Отправляем товары в формате JSON
        res.json(products);
    } catch (error) {
        // В случае ошибки отправляем статус 500 и сообщение об ошибке
        res.status(500).json({ error: 'Ошибка загрузки товаров' });
    }
});

// GET /api/products/:id - получение конкретного товара по ID
app.get('/api/products/:id', (req, res) => {
    try {
        // Получаем все товары
        const products = getProducts();
        // Ищем товар с ID из параметров запроса (преобразуем строку в число)
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        // Если товар не найден, возвращаем 404 ошибку
        if (!product) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        // Отправляем найденный товар
        res.json(product);
    } catch (error) {
        // Обработка ошибок при загрузке товара
        res.status(500).json({ error: 'Ошибка загрузки товара' });
    }
});

// POST /api/cart - обработка оформления заказа
app.post('/api/cart', (req, res) => {

    // Для демо просто возвращаем успешный ответ
    res.json({ success: true, message: 'Заказ оформлен' });
});

// Запуск сервера на указанном порту
app.listen(PORT, () => {
    // Выводим сообщение в консоль при успешном запуске
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});