import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode'; // Corrected import
import img1 from '../asset/img1.png';
import img2 from '../asset/img2.png';
import img3 from '../asset/img3.png';
import Slider from 'react-slick'; // Import React Slick
import { FaHeart } from 'react-icons/fa'; // Heart icon for like button

const HomePage = () => {
  const [items, setItems] = useState([]); // Store available items
  const [itemAdded, setItemAdded] = useState(false); // Track if an item has been added to the cart
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Retrieve JWT token from localStorage
  let userEmail = '';

  // Decode JWT token to get user email
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userEmail = decodedToken.sub; // Assuming 'sub' contains the user's email
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // Fetch available items from the inventory
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // Public request: no token needed to fetch items
      const response = await api.get('/api/inventory/all');
      setItems(response.data); // Update items state
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to load items. Please try again later.');
    }
  };

  // Handle adding an item to the cart
  const addToCart = async (itemId) => {
    try {
      if (!token || !userEmail) {
        alert('You need to log in to add items to your cart.');
        navigate('/login');
        return;
      }

      // Send a request to add the item to the user's cart
      const response = await api.post(
        `/api/cart/add/${userEmail}`,
        { itemId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure token is included
          },
        }
      );

      setItemAdded(true); // Mark item as added to cart
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

  // Navigate to the cart page
  const goToCart = () => {
    navigate('/cart');
  };

  // Navigate to the orders page to place an order
  const order = () => {
    navigate('/orders');
  };

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // Array of promotion images for the slider
  const promotionImages = [img1, img2, img3];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Promotion Carousel */}
      <div className="mb-8">
        <Slider {...sliderSettings}>
          {promotionImages.map((image, index) => (
            <div key={index}>
              <img
                src={image}
                alt={`Promotion ${index + 1}`}
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          ))}
        </Slider>
      </div>

      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="What would you like to eat?"
            className="w-full p-4 pr-10 rounded-lg border border-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {['Nearby', 'Promotion', 'Newcomers', 'Best Seller', 'Top Rated', 'All'].map((filter) => (
          <button key={filter} className="px-4 py-2 bg-gray-200 rounded-full whitespace-nowrap">
            {filter}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {items
          .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">${item.price.toFixed(2)}</span>
                  {token ? (
                    <button
                      onClick={() => addToCart(item.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      <FaHeart size={18} className="inline mr-1" /> Like
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Order and Cart Buttons */}
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
};

export default HomePage;
