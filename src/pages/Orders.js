import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

function Orders() {
  const [orders, setOrders] = useState([]); // Initialize as an empty array
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  let userEmail = '';

  // Decode JWT to get user email
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
      fetchOrders();
    } else {
      setError('User is not authenticated. Please log in.');
    }
  }, [userEmail]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/api/order/user/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data || []);  // Ensure orders is an array, even if empty
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {error && <p className="text-red-500">{error}</p>}
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Order #{order.id}</h2>
              <p className="text-gray-600 mb-2">Date: {new Date(order.orderDate).toLocaleDateString()}</p> {/* Display order date */}
              <p className="text-gray-600 mb-4">Status: {order.status}</p> {/* Display order status */}
              <h3 className="text-lg font-semibold mb-2">Items:</h3>

              <ul className="list-none mb-4">
                {order.itemIds && order.itemIds.length > 0 ? (
                  order.itemIds.map((item, index) => {
                    // Assuming the backend now returns the item details as a concatenated string
                    const [id, name, price, imageUrl] = item.split('|'); // Adjust according to backend
                    return (
                      <li key={id} className="flex items-center mb-4">
                        <img 
                          src={imageUrl} 
                          alt={name} 
                          className="w-24 h-24 object-cover mr-4" 
                        />
                        <div>
                          <p className="text-lg font-semibold">{name}</p>
                          <p className="text-gray-600">Price: ${parseFloat(price).toFixed(2)}</p>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li>No items found for this order</li>
                )}
              </ul>

              <p className="text-xl font-bold">Total: ${order.totalAmount?.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
