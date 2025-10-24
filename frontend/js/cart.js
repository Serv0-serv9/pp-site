
// Сервис для работы с корзиной покупок
class CartService {
    // Получение корзины из localStorage
    static getCart() {
        try {
            // Получаем данные корзины из localStorage
            const cartJson = localStorage.getItem('cart');
            // Если данные есть - парсим JSON, иначе возвращаем пустой массив
            return cartJson ? JSON.parse(cartJson) : [];
        } catch (error) {
            // Обработка ошибок чтения/парсинга данных
            console.error('Ошибка чтения корзины:', error);
            return [];
        }
    }

    // Сохранение корзины в localStorage
    static saveCart(cart) {
        try {
            // Преобразуем массив корзины в JSON и сохраняем
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            // Обработка ошибок сохранения
            console.error('Ошибка сохранения корзины:', error);
        }
    }

    // Добавление товара в корзину
    static addToCart(product) {
        // Получаем текущую корзину
        const cart = this.getCart();
        // Проверяем, есть ли товар уже в корзине
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            // Если товар уже есть - увеличиваем количество
            existingItem.quantity += 1;
        } else {
            // Если товара нет - добавляем новый с количеством 1
            cart.push({ ...product, quantity: 1 });
        }
        
        // Сохраняем обновленную корзину
        this.saveCart(cart);
        // Обновляем счетчик товаров в интерфейсе
        this.updateCartCount();
        // Показываем уведомление об успешном добавлении
        this.showNotification('Ваша заявка принята на рассмотрение!');
    }

    // Обновление счетчика товаров в корзине (в шапке сайта)
    static updateCartCount() {
        try {
            // Вычисляем общее количество товаров (суммируем quantity каждого товара)
            const totalItems = this.getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
            // Находим все элементы с id="cart-count" и обновляем их текст
            document.querySelectorAll('#cart-count').forEach(el => {
                el.textContent = totalItems;
            });
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    // Показ уведомлений пользователю
    static showNotification(message, type = 'success') {
        // Удаляем старые уведомления, чтобы не накапливались
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => notification.remove());
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        // HTML структура уведомления с кнопкой закрытия
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white; cursor: pointer;">×</button>
        `;
        
        // Добавляем уведомление в body
        document.body.appendChild(notification);
        // Автоматически удаляем уведомление через 3 секунды
        setTimeout(() => notification.remove(), 3000);
    }

    // Очистка корзины
    static clearCart() {
        this.saveCart([]); // Сохраняем пустой массив
        this.updateCartCount(); // Обновляем счетчик
    }
}

// Класс для управления страницей корзины
class CartPage {
    // Инициализация страницы корзины
    static init() {
        this.updateCartCount(); // Обновляем счетчик товаров
        this.renderCart();      // Рендерим содержимое корзины
        this.setupEventListeners(); // Настраиваем обработчики событий
    }

    // Обновление счетчика товаров (делегируем CartService)
    static updateCartCount() {
        CartService.updateCartCount();
    }

    // Отрисовка содержимого корзины
    static renderCart() {
        // Получаем корзину
        const cart = CartService.getCart();
        // Находим элементы DOM
        const container = document.getElementById('cart-items'); // Контейнер для товаров
        const totalElement = document.getElementById('cart-total'); // Элемент для общей суммы
        const checkoutBtn = document.getElementById('checkout-btn'); // Кнопка оформления заказа

        // Если контейнер не найден - выходим
        if (!container) return;

        // Если корзина пуста
        if (cart.length === 0) {
            // Показываем сообщение о пустой корзине
            container.innerHTML = `
                <div class="empty-cart">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📋</div>
                    <h3>У вас нет активных заявок</h3>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">Перейти к вакансиям</a>
                </div>
            `;
            
            // Обновляем общую сумму и кнопку оформления
            if (totalElement) totalElement.textContent = 'Итого: 0 руб.';
            if (checkoutBtn) checkoutBtn.disabled = true; // Делаем кнопку неактивной
            return;
        }

        // Вычисляем общую сумму и количество товаров
        const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

        // Генерируем HTML для каждого товара в корзине
        container.innerHTML = cart.map(item => {
            // Сумма для текущего товара (цена × количество)
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            return `
                <div class="cart-item" data-product-id="${item.id}">
                    <!-- Изображение товара -->
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <!-- Информация о товаре -->
                    <div class="cart-item-info">
                        <h3>${item.name || 'Неизвестный товар'}</h3>
                        <div class="cart-item-price">${(item.price).toLocaleString('ru-RU')} руб.</div>
                        <div class="item-total">${(item.category).toLocaleString('ru-RU')}</div>
                    </div>
                    <!-- Элементы управления -->
                    <div class="cart-item-controls">
                        <!-- Кнопка удаления товара -->
                        <button class="btn btn-danger" onclick="CartPage.removeItem(${item.id})">🗑️ Отменить</button>
                    </div>
                </div>
            `;
        }).join(''); // Объединяем массив HTML строк в одну строку

        // Обновляем блок с общей суммой
        if (totalElement) {
            totalElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Итого:</span>
                    <span style="font-size: 1.5em; color: #e74c3c;">${total.toLocaleString('ru-RU')} руб.</span>
                </div>
                <div style="font-size: 0.9em; color: #7f8c8d; margin-top: 0.5rem;">Товаров: ${totalItems} шт.</div>
            `;
        }

        // Активируем кнопку оформления заказа
        if (checkoutBtn) {
            checkoutBtn.disabled = false; // Делаем активной
            checkoutBtn.textContent = `Оформить заказ • ${total.toLocaleString('ru-RU')} руб.`; // Обновляем текст
        }
    }

    // Обновление количества товара
    static updateQuantity(productId, change) {
        const cart = CartService.getCart();
        // Находим индекс товара в корзине
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        // Если товар найден
        if (itemIndex !== -1) {
            const item = cart[itemIndex];
            // Изменяем количество
            item.quantity += change;
            
            // Если количество стало 0 или меньше - удаляем товар
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                // Сохраняем изменения и перерисовываем корзину
                CartService.saveCart(cart);
                this.renderCart();
                this.updateCartCount();
            }
        }
    }

    // Удаление товара из корзины
    static removeItem(productId) {
        const cart = CartService.getCart();
        // Находим товар для показа уведомления
        const item = cart.find(item => item.id === productId);
        // Фильтруем корзину, удаляя товар с указанным ID
        CartService.saveCart(cart.filter(item => item.id !== productId));
        // Перерисовываем корзину
        this.renderCart();
        this.updateCartCount();
        
        // Показываем уведомление об удалении
        if (item) {
            this.showNotification(`Отклик на вакансию "${item.name}" отменен`);
        }
    }

    // Оформление заказа
    static async checkout() {
        const cart = CartService.getCart();
        // Проверяем, что корзина не пуста
        if (cart.length === 0) {
            this.showNotification('Корзина пуста!', 'error');
            return;
        }

        // Вычисляем общую сумму и показываем подтверждение
        const total = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        if (!confirm(`Оформить заказ на ${total.toLocaleString('ru-RU')} руб.?`)) return;

        try {
            // Отправляем заказ на сервер
            const response = await fetch(`${window.location.origin}/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    cart: cart,           // Данные корзины
                    total: total,         // Общая сумма
                    timestamp: new Date().toISOString() // Время оформления
                })
            });

            // Если сервер ответил успешно
            if (response.ok) {
                const result = await response.json();
                this.showNotification(`✅ Заказ оформлен! Номер: ${result.orderId}`);
                // Очищаем корзину после успешного оформления
                CartService.clearCart();
                this.renderCart();
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (error) {
            // В случае ошибки работаем в демо-режиме
            this.showNotification('✅ Заказ оформлен в демо-режиме!');
            CartService.clearCart();
            this.renderCart();
        }
    }

    // Настройка обработчиков событий
    static setupEventListeners() {
        // Обработчик для кнопки оформления заказа
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.checkout());
    }

    // Показ уведомлений (делегируем CartService)
    static showNotification(message, type = 'success') {
        CartService.showNotification(message, type);
    }
}

// Инициализация при полной загрузке DOM
document.addEventListener('DOMContentLoaded', () => CartPage.init());

// Делаем классы доступными глобально для вызова из HTML
window.CartPage = CartPage;
window.CartService = CartService;