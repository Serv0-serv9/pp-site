CartService.test.js
import CartService from './CartService';

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test('getCart returns empty array if localStorage is empty', () => {
  expect(CartService.getCart()).toEqual([]);
});

test('getCart returns array from localStorage', () => {
  const cartItems = [{ id: 1, name: 'Item', quantity: 2 }];
  localStorage.setItem('cart', JSON.stringify(cartItems));

  expect(CartService.getCart()).toEqual(cartItems);
});

test('getCart handles invalid JSON and returns empty array', () => {
  localStorage.setItem('cart', '{ invalid JSON }');

  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(CartService.getCart()).toEqual([]);
  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Ошибка чтения корзины'));
  consoleSpy.mockRestore();
});