import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaStar, FaUtensils, FaMotorcycle, FaShoppingCart } from 'react-icons/fa';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const HomePage = () => {
  const [items, setItems] = useState([]);
  const [itemAdded, setItemAdded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
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
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/inventory/all');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load items. Please try again later.');
    }
  };

  const addToCart = async (itemId, stock) => {
    try {
      if (!token || !userEmail) {
        toast.warn('You need to log in to add items to your cart.');
        navigate('/login');
        return;
      }

      if (stock <= 0) {
        toast.error('Item is out of stock.');
        return;
      }

      await api.post(
        `/api/cart/add/${userEmail}`,
        { itemId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItemAdded(true);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response && error.response.status === 403) {
        toast.error('Permission denied: You do not have access to this resource.');
      } else {
        toast.error(`Error adding to cart: ${error.message}`);
      }
    }
  };

  const goToCart = () => navigate('/cart');
  const inventorylink = () => navigate('/inventory');

  // const filteredItems = items.filter(item => 
  //   (selectedCategory === 'All' || item.category === selectedCategory) &&
  //   item.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  const categories = ['All', 'Veg', 'Mexican', 'Japanese', 'Non-Veg', 'Lunch', 'Drink'];
  const services = [
    {
      icon: <FaUtensils size={40} className="text-orange-500" />,
      title: 'Quality Food',
      description: 'FoodZone is all about family, feeling good, celebrating life, and showing love with good food.',
    },
    {
      icon: <FaStar size={40} className="text-orange-500" />,
      title: 'Super Taste',
      description: 'FoodZone is all about family, feeling good, celebrating life, and showing love with good food.',
    },
    {
      icon: <FaShoppingCart size={40} className="text-orange-500" />,
      title: 'Online Order',
      description: 'FoodZone is all about family, feeling good, celebrating life, and showing love with good food.',
    },
    {
      icon: <FaMotorcycle size={40} className="text-orange-500" />,
      title: 'Home Delivery',
      description: 'FoodZone is all about family, feeling good, celebrating life, and showing love with good food.',
    },
  ];

  return (
    <div className='min-h-screen bg-gray-100'>
      <ToastContainer />
 <div className="container mx-auto px-4 py-8">
      <HeroSection inventorylink={inventorylink} />
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
      <CategoryMenu categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      <ItemsGrid items={items} searchQuery={searchQuery} selectedCategory={selectedCategory} addToCart={addToCart} />
      <ServicesSection services={services} />
      <ReservationSection />
      {itemAdded && <GoToCartButton goToCart={goToCart} />}
    </div>
    </div>
   
  );
};

const HeroSection = ({ inventorylink }) => (
  <div className="bg-white py-12 px-4 sm:px-6 lg:px-8 rounded-lg shadow-lg mb-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-5xl font-bold mb-4">
            Simple <br />
            <span className="text-orange-500">&amp; Tasty</span>
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Treat your meat to something incredible! Our meat rubs are made with love and crafted with only the best spices money can buy. We package and ship our rubs directly to you, ensuring your next meal is one to remember.
          </p>
          <div className="space-x-4">
            <button className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition duration-300">
              ADD TO CART
            </button>
            <button onClick={inventorylink} className="border border-orange-500 text-orange-500 px-6 py-2 rounded-md hover:bg-orange-50 transition duration-300">
              VIEW DETAIL
            </button>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <img
            src="https://images.rawpixel.com/image_png_social_square/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA5L3Jhd3BpeGVsb2ZmaWNlMThfcGhvdG9fb2ZfbWluaW1hbF9maXNoX3N0ZWFrX3dpdGhfc2FsYWRfaXNvbGF0ZV9kYWZhNjlhZi03YjMwLTRiMDUtYmI2OS1iOWIyZWZhOGQ4NGYucG5n.png"
            alt="Delicious salad with grilled salmon"
            className="rounded-full w-full max-w-md mx-auto"
          />
        </div>
      </div>
    </div>
  </div>
);

const CategoryMenu = ({ categories, selectedCategory, setSelectedCategory }) => (
  <div className="flex justify-center space-x-6 mb-8 text-lg font-bold text-gray-700">
    {categories.map((category, index) => (
      <button 
        key={index} 
        className={`hover:text-orange-600 focus:text-orange-600 ${selectedCategory === category ? 'text-orange-600' : ''}`}
        onClick={() => setSelectedCategory(category)}
      >
        {category}
      </button>
    ))}
  </div>
);

const ItemsGrid = ({ items, searchQuery,selectedCategory, addToCart }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-orange-100 p-6 rounded-lg mb-8">
    {items
      .filter(item => (selectedCategory === 'All' || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(item => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
          <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
            <h3 className="font-semibold text-lg mb-1">{item.category}</h3>
            <div className="flex items-center mb-1">
              {[...Array(5)].map((_, index) => (
                <FaStar key={index} color={index < item.rating ? "#ffc107" : "#e4e5e9"} />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-orange-600">Rs {item.price.toFixed(2)}</span>
              {item.stock > 0 ? (
                <button
                  onClick={() => addToCart(item.id, item.stock)}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              ) : (
                <span className="text-red-600 font-bold">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      ))}
  </div>
);

const ServicesSection = ({ services }) => (
  <div className="bg-orange-50 py-12 rounded-lg mb-8">
    <h2 className="text-center text-4xl font-bold mb-6">
      We Provide These <span className="text-orange-500">Services</span>
    </h2>
    <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
      FoodZone is all about family, feeling good, celebrating life, and showing love with good food.
      FoodZone is a small, woman and family-owned company and promises to stay that way.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-8 lg:px-16">
      {services.map((service, index) => (
        <div key={index} className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center text-center">
          <div className="mb-4">{service.icon}</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.title}</h3>
          <p className="text-gray-600">{service.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const ReservationSection = () => (
  <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
    <h2 className="text-3xl font-bold text-center mb-4">
      Do You Have Any Plan Today? Reserve your <span className="text-orange-600">Delicious Foods</span>
    </h2>
    <p className="text-center text-gray-600 mb-6">
      They also have a love of the past and focus their product lines around ancient grain ingredients
      and traditional food preparation.
    </p>
    <div className="flex justify-center">
      <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
        Make Reservation
      </button>
    </div>
  </div>
);

const GoToCartButton = ({ goToCart }) => (
  <div className="text-center">
    <button
      onClick={goToCart}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      Go to Cart
    </button>
  </div>
);

export default HomePage;
