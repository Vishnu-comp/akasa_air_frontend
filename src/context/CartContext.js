import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add item to cart
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.itemId === item.itemId);
      if (existingItem) {
        // Update the quantity if the item already exists in the cart
        return prevItems.map((cartItem) =>
          cartItem.itemId === item.itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      // Add the new item with quantity 1
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.itemId !== itemId));
  };

  // Clear all items from cart (e.g., after successful checkout)
  const clearCart = () => {
    setCartItems([]);  // Empty the cart
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,  // Added clearCart to the context value
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
