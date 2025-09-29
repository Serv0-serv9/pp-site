// Конфигурация
const API_BASE_URL = window.location.origin;

class ProductService {
    static async getProductById(productId) {
        try {
            console.log('Fetching product:', productId);
            const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const product = await response.json();
            console.log('Product loaded:', product);
            return product;
        } catch (error) {
            console.error('Error loading product:', error);
            // Возвращаем демо-товар если API недоступно
            return this.getDemoProduct(productId);
        }
    }

    static getDemoProduct(productId) {
        const demoProducts = {
            1: {
                id: 1,
                name: "iPhone 15 Pro",
                price: 99990,
                image: "img/iphone.jpg",
                description: "Новый iPhone 15 Pro с революционным дизайном и мощным процессором. Оснащен передовой камерой 48MP и титановым корпусом.",
                category: "Смартфоны",
                inStock: true,
                features: ["6.1\" OLED дисплей", "A17 Pro chip", "48MP камера", "Titanium корпус", "5G", "Face ID"]
            },
            2: {
                id: 2,
                name: "MacBook Air M2",
                price: 129990,
                image: "img/mac.jpg",
                description: "Невероятно тонкий и мощный ноутбук с чипом M2. Идеален для работы и творчества.",
                category: "Ноутбуки",
                inStock: true,
                features: ["13.6\" Liquid Retina", "M2 chip", "18h battery", "8GB RAM", "256GB SSD", "macOS"]
            },
            3: {
                id: 3,
                name: "AirPods Pro",
                price: 24990,
                image: "img/pods.jpg",
                description: "Наушники с активным шумоподавлением и премиальным звуком. Отличное качество звучания.",
                category: "Аксессуары",
                inStock: true,
                features: ["Шумоподавление", "Пространственное аудио", "6h работы", "Case", "Bluetooth 5.3"]
            },
            4: {
                id: 4,
                name: "Apple Watch Series 9",
                price: 41990,
                image: "img/watch.jpg",
                description: "Умные часы с передовыми функциями для здоровья и фитнеса. Всегда на связи.",
                category: "Гаджеты",
                inStock: false,
                features: ["45mm display", "ECG", "GPS", "Water resistant", "Heart rate", "Sleep tracking"]
            }
        };

        return demoProducts[productId] || {
            id: productId,
            name: "Товар не найден",
            price: 0,
            image: "",
            description: "Запрошенный товар не существует.",
            category: "Неизвестно",
            inStock: false,
            features: ["Информация недоступна"]
        };
    }
}

class CartService {
    static getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart')) || [];
        } catch (error) {
            console.error('Error reading cart:', error);
            return [];
        }
    }

    static saveCart(cart) {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    static addToCart(product) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart(cart);
        this.updateCartCount();
        this.showNotification('Ваша заявка принята на рассмотрение!', 'success');
    }

    static updateCartCount() {
        try {
            const cart = this.getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            const cartCountElements = document.querySelectorAll('#cart-count');
            
            cartCountElements.forEach(el => {
                el.textContent = totalItems;
            });
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    static showNotification(message, type = 'success') {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: none; border: none; color: white; cursor: pointer;">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

class ProductDetailRenderer {
    static async renderProductDetail() {
        const container = document.getElementById('product-detail');
        
        if (!container) {
            console.error('Product detail container not found');
            return;
        }

        // Показываем загрузку
        container.innerHTML = this.getLoadingHTML();

        try {
            // Получаем ID товара из URL
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            
            console.log('Product ID from URL:', productId);

            if (!productId || isNaN(productId)) {
                throw new Error('Неверный ID заявки');
            }

            // Загружаем товар
            const product = await ProductService.getProductById(productId);
            
            // Рендерим товар
            container.innerHTML = this.getProductHTML(product);
            
            // Добавляем обработчики событий
            this.addEventListeners(product);
            
        } catch (error) {
            console.error('Error rendering product:', error);
            container.innerHTML = this.getErrorHTML(error.message);
        }
    }

    static getLoadingHTML() {
        return `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Загрузка заявки...</p>
                <button onclick="location.reload()" class="btn btn-primary">Обновить страницу</button>
            </div>
        `;
    }

    static getErrorHTML(errorMessage) {
        return `
            <div class="error-container">
                <h2>Ошибка загрузки заявки</h2>
                <p>${errorMessage}</p>
                <div style="margin-top: 20px;">
                    <a href="index.html" class="btn btn-primary">Вернуться</a>
                    <button onclick="location.reload()" class="btn btn-secondary">Попробовать снова</button>
                </div>
            </div>
        `;
    }

    static getProductHTML(product) {
        return `
            <div class="product-detail">
                <div class="product-detail-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-detail-image">
                </div>
                <div class="product-detail-info">
                    <h1>${product.name}</h1>
                    <div class="product-detail-price">${product.price.toLocaleString('ru-RU')} руб.</div>
                    
                    <div class="stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                        ${product.inStock ? '✓ Есть места' : '✗ Нет мест'}
                    </div>
                    
                    <p class="product-detail-description">${product.description}</p>
                    
                    <h3>Требования:</h3>
                    <ul class="features-list">
                        ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    
                    <div class="product-actions">
                        <button class="btn btn-success add-to-cart-btn" 
                                ${!product.inStock ? 'disabled' : ''}
                                data-product-id="${product.id}">
                            ${product.inStock ? '📋 Отправить заявку' : '❌ Нет мест'}
                        </button>
                        <a href="index.html" class="btn btn-primary">← Назад к вакансиям</a>
                    </div>
                </div>
            </div>
        `;
    }

    static addEventListeners(product) {
        // Обработчик кнопки "Отправить заявку"
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                CartService.addToCart(product);
                // Визуальная обратная связь
                addToCartBtn.textContent = '✓ Отправлено!';
                addToCartBtn.style.background = '#27ae60';
            });
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Product page loaded');
    
    // Обновляем счетчик корзины
    CartService.updateCartCount();
    
    // Загружаем и рендерим товар
    ProductDetailRenderer.renderProductDetail();
});

// Глобальные функции для вызова из HTML
window.CartService = CartService;
window.ProductDetailRenderer = ProductDetailRenderer;

// Функция для ручного тестирования
window.debugProductPage = function() {
    console.log('URL params:', new URLSearchParams(window.location.search).toString());
    console.log('Cart:', CartService.getCart());
};