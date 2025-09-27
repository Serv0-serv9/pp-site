// Сервис для работы с товарами (загрузка данных с сервера)
class ProductService {
    // Асинхронный метод для получения списка товаров с сервера
    static async getProducts() {
        try {
            // Отправляем GET-запрос к API для получения товаров
            const response = await fetch('http://localhost:3000/api/products');
            
            // Проверяем успешность HTTP-ответа (статус 200-299)
            if (!response.ok) throw new Error('Ошибка загрузки товаров');
            
            // Парсим JSON-ответ и возвращаем данные
            return await response.json();
        } catch (error) {
            // Логируем ошибку для отладки
            console.error('Error:', error);
            // Пробрасываем ошибку дальше для обработки в вызывающем коде
            throw error;
        }
    }
}

// Сервис для работы с корзиной покупок (работа с localStorage)
class CartService {
    // Получение корзины из localStorage
    static getCart() {
        // Получаем данные из localStorage, парсим JSON или возвращаем пустой массив если данных нет
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Сохранение корзины в localStorage
    static saveCart(cart) {
        // Преобразуем массив корзины в JSON строку и сохраняем
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Добавление товара в корзину
    static addToCart(product) {
        // Получаем текущую корзину
        const cart = this.getCart();
        // Проверяем, есть ли товар уже в корзине
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Если товар уже есть - увеличиваем количество на 1
            existingItem.quantity += 1;
        } else {
            // Если товара нет - добавляем новый объект товара с количеством 1
            cart.push({
                ...product,  // Копируем все свойства из исходного товара
                quantity: 1  // Добавляем свойство количества
            });
        }
        
        // Сохраняем обновленную корзину
        this.saveCart(cart);
        // Обновляем счетчик товаров в интерфейсе
        this.updateCartCount();
        // Показываем уведомление об успешном добавлении
        this.showNotification('Товар добавлен в корзину!', 'success');
    }

    // Обновление счетчика товаров в корзине (отображается в шапке сайта)
    static updateCartCount() {
        // Получаем текущую корзину
        const cart = this.getCart();
        // Вычисляем общее количество товаров (суммируем quantity каждого товара)
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Находим все элементы с id="cart-count" на странице и обновляем их текст
        document.querySelectorAll('#cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    }

    // Показ уведомлений пользователю
    static showNotification(message, type = 'success') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        // Устанавливаем CSS классы для стилизации (notification + тип уведомления)
        notification.className = `notification ${type}`;
        // Устанавливаем текст уведомления
        notification.textContent = message;
        // Добавляем уведомление в тело документа
        document.body.appendChild(notification);

        // Устанавливаем таймер для автоматического удаления уведомления через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Класс для отрисовки товаров на странице
class ProductRenderer {
    // Основной метод для отрисовки всех товаров в сетке
    static renderProducts(products) {
        // Находим контейнер для товаров по ID
        const grid = document.getElementById('products-grid');
        // Очищаем предыдущее содержимое контейнера
        grid.innerHTML = '';

        // Для каждого товара в массиве создаем и добавляем карточку
        products.forEach(product => {
            const productElement = this.createProductCard(product);
            grid.appendChild(productElement);
        });
    }

    // Создание HTML-элемента карточки товара
    static createProductCard(product) {
        // Создаем div элемент для карточки товара
        const card = document.createElement('div');
        // Устанавливаем CSS класс для стилизации
        card.className = 'product-card';
        
        // Заполняем внутренний HTML карточки данными товара
        card.innerHTML = `
            <!-- Изображение товара -->
            <img src="${product.image}" alt="${product.name}" class="product-image">
            
            <!-- Блок с информацией о товаре -->
            <div class="product-info">
                <!-- Название товара -->
                <h3 class="product-title">${product.name}</h3>
                
                <!-- Цена товара с форматированием для русской локали -->
                <div class="product-price">${product.price.toLocaleString()} руб.</div>
                
                <!-- Описание товара -->
                <p class="product-description">${product.description}</p>
                
                <!-- Кнопка для перехода к детальной странице товара -->
                <button class="btn btn-primary" onclick="ProductRenderer.viewProduct(${product.id})">
                    Подробнее
                </button>
            </div>
        `;
        
        return card;
    }

    // Метод для перехода на страницу детальной информации о товаре
    static viewProduct(productId) {
        // Перенаправляем пользователя на страницу товара с передачей ID в URL параметре
        window.location.href = `product.html?id=${productId}`;
    }
}

// Инициализация приложения после полной загрузки DOM документа
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Обновляем счетчик товаров в корзине при загрузке страницы
        CartService.updateCartCount();
        
        // Загружаем список товаров с сервера
        const products = await ProductService.getProducts();
        
        // Отрисовываем загруженные товары на странице
        ProductRenderer.renderProducts(products);
        
    } catch (error) {
        // В случае ошибки загрузки товаров показываем сообщение об ошибке
        document.getElementById('products-grid').innerHTML = 
            '<div class="error">Ошибка загрузки товаров. Попробуйте обновить страницу.</div>';
    }
});