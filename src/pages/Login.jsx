import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';  // Import Link
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import img1 from '../asset/img4.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 rounded-lg shadow-lg">
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">Welcome</h1>
        <p className="text-gray-600 mb-8 text-center">We are glad to see you back with us</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email address"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold">
            LOGIN
          </button>
        </form>

        {/* Add the sign-up text and link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-0">
        <img src={img1} alt="Login illustration" className="max-w-full max-h-full object-contain" />
      </div>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;
