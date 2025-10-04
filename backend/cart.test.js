const CartService = require('./cart');

// мок документа и localStorage, если нужно
describe('CartService', () => {
    beforeEach(() => {
        // Очистка localStorage перед каждым тестом
        localStorage.clear();
        jest.spyOn(localStorage, 'setItem');
        jest.spyOn(localStorage, 'getItem');
        Object.defineProperty(global, 'localStorage', {
            value: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            writable: true,
        });
        // Мокаем document.querySelectorAll, если понадобится
        // В основном, jest.fn, чтобы проверить изменения текста
        document.querySelectorAll = jest.fn().mockReturnValue([]);
        document.body.innerHTML = ''; // очистка body
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('getCart возвращает пустой массив, если localStorage не содержит данных', () => {
        localStorage.getItem.mockReturnValue(null);
        const result = CartService.getCart();
        expect(result).toEqual([]);
    });

    test('getCart возвращает массив, если есть валидный JSON', () => {
        const mockCart = [{ id: 1, name: 'item1', quantity: 2 }];
        localStorage.getItem.mockReturnValue(JSON.stringify(mockCart));
        const result = CartService.getCart();
        expect(result).toEqual(mockCart);
    });

    test('getCart возвращает пустой массив и логирует ошибку при некорректном JSON', () => {
        localStorage.getItem.mockReturnValue('invalid json');
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const result = CartService.getCart();
        expect(result).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('saveCart вызывает localStorage.setItem с правильными данными', () => {
        const cart = [{ id: 1, name: 'item1', quantity: 1 }];
        CartService.saveCart(cart);
        expect(localStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify(cart));
    });

    test('addToCart добавляет новый товар с quantity = 1', () => {
        // мок getCart возвращает пустой массив
        jest.spyOn(CartService, 'getCart').mockReturnValue([]);
        // вызов addToCart
        const product = { id: 42, name: 'Test Product' };
        CartService.addToCart(product);
        // Проверка вызова saveCart с обновленным массивом
        expect(localStorage.setItem).toHaveBeenCalled();
        const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
        expect(savedData).toEqual([{ ...product, quantity: 1 }]);
    });

    test('addToCart увеличивает quantity существующего товара', () => {
        // корзина с одним товаром
        const existingItem = { id: 99, name: 'existing', quantity: 3 };
        jest.spyOn(CartService, 'getCart').mockReturnValue([existingItem]);
        // Вызов добавления того же товара
        const product = { id: 99, name: 'existing' };
        CartService.addToCart(product);
        // В saveCart должна сохраниться корзина с увеличенным количеством
        const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
        expect(savedData[0].quantity).toBe(4);
    });

    test('clearCart очищает корзину и обновляет счетчик', () => {
        // Мокаем updateCartCount
        jest.spyOn(CartService, 'updateCartCount');
        CartService.clearCart();
        expect(localStorage.setItem).toHaveBeenCalledWith('cart', JSON.stringify([]));
        expect(CartService.updateCartCount).toHaveBeenCalled();
    });
});