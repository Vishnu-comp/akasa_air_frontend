import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Corrected import

function Home() {
  const [items, setItems] = useState([]);
  const [itemAdded, setItemAdded] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let userEmail = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);  // Correct decoding
      userEmail = decodedToken.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      console.log('Token:', token); // Log the token to verify it's being retrieved
      const response = await api.get(`/api/inventory/all`, {
        headers: {
          Authorization: `Bearer ${token}` // Include the token in the headers
        }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const addToCart = async (itemId) => {
    try {
      console.log('Adding to cart:', { itemId, quantity: 1, userEmail });

      if (!token || !userEmail) {
        alert('Invalid or missing token. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await api.post(`/api/cart/add/${userEmail}`, { itemId, quantity: 1 }, {
        headers: {
          Authorization: `Bearer ${token}`,  // Make sure token is included
        },
      });

      console.log('Response from server:', response.data);
      setItemAdded(true);
      alert('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);

      if (error.response && error.response.status === 403) {
        alert('Permission denied: You do not have access to this resource.');
      } else {
        alert(`Error adding to cart: ${error.message}`);
      }
    }
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const order = () => {
    navigate('/orders');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
            {/* Display item image */}
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-48 object-cover mb-4" 
            />
            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
            <p className="text-gray-600 mb-2">{item.category}</p>
            <p className="text-lg font-bold mb-4">${item.price.toFixed(2)}</p>
            <button
              onClick={() => addToCart(item.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      <div>
        <button
          onClick={order}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Order
        </button>
      </div>
      {itemAdded && (
        <button
          onClick={goToCart}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Go to Cart
        </button>
      )}
    </div>
  );
}

export default Home;
