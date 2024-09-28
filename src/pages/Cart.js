import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  let userEmail = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userEmail = decodedToken.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchCart();
    } else {
      setError('User is not authenticated. Please log in.');
    }
  }, [userEmail]);

  const fetchCart = async () => {
    try {
      const response = await api.get(`/api/cart/user/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart. Please try again.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/api/cart/remove/${userEmail}/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart(); // Refresh cart after item is removed
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart.');
    }
  };

  const checkout = async () => {
    try {
      const itemIds = cart.items.map((item) => item.itemId);
      const totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      const response = await api.post(
        '/api/order/checkout',
        {
          userEmail,
          itemIds,
          totalAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Order placed:', response.data);
      alert('Order placed successfully!');
      setCart({ items: [] }); // Clear the cart after successful order placement
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Checkout failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-center">Your Cart</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {cart.items.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <>
          {/* Static Address Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h2 className="text-lg font-semibold">Delivery Address</h2>
            <p className="font-medium">1342 Morris Street</p>
            <p className="text-sm text-gray-500">Delivery Time: 40 mins | Distance: 5 km</p>
          </div>

          {/* Cart Items */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            {cart.items.map((item) => (
              <div key={item.itemId} className="flex justify-between items-center mb-4 border-b pb-2">
                <div className="flex items-center">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-gray-600">Quantity: {item.quantity}</p> {/* Displaying quantity */}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">Rs{(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Section */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Sub Total</span>
              <span className="font-bold">
                Rs{cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-bold">Rs{9}</span> {/* Example static delivery fee */}
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-xl font-bold">
                Rs{(cart.items.reduce((total, item) => total + item.price * item.quantity, 0) + 9).toFixed(2)} {/* Adjust total calculation */}
              </span>
            </div>
          </div>
          
          <button
            onClick={checkout}
            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg mt-4 hover:bg-orange-600 transition duration-300"
          >
            Check Out
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
