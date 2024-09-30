import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import HomePage from './pages/Homepage';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Inventory from './pages/Inventory';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/inventory" element={<Inventory />} />

                {/* Private Routes */}
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
              </Routes>
            </main>
            <footer className="bg-orange-500 text-white text-center py-4">
      <div>
        <span>MADE BY VISHNU NAIR</span>
      </div>
      <div className="flex justify-center space-x-2 mt-2">
        <a
          href="https://github.com/Vishnu-comp"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          <FaGithub size={30} />
        </a>
        <a
          href="https://www.linkedin.com/in/vishnu-nair-aa462b245/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          <FaLinkedin size={30} />
        </a>
      </div>
    </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;