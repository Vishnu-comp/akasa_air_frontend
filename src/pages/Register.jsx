import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import img from '../asset/img5.png';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async () => {
    try {
      const response = await api.get('/api/auth/check-email', { params: { email } });
      return response.data;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email format
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      return;
    }

    const emailExists = await checkEmailExists();
    if (emailExists) {
      setEmailError('Email is already registered.');
      toast.error('Email is already registered.');
      return;
    }
    
    setEmailError('');

    const success = await register(email, password, fullName);
    if (success) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-200 rounded-lg shadow-lg">
      {/* Left side (form) */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">Register</h1>
        <p className="text-gray-600 mb-8 text-center">Create your account</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="sr-only">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-lg bg-white border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Full Name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-lg bg-white border ${emailError ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
              className="w-full p-3 rounded-lg bg-white border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              required
            />
          </div>

          {emailError && <p className="text-red-500 text-sm mt-2">{emailError}</p>}

          <div>
            <button type="submit" className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Register
            </button>
          </div>
        </form>
      </div>
      
      {/* Right side (image) */}
      <div className="w-full md:w-1/2 bg-orange-100 flex items-center justify-center p-4 md:p-0">
        <img src={img} alt="Astronaut illustration" className="max-w-full max-h-full object-contain" />
      </div>

      <ToastContainer />
    </div>
  );
}

export default Register;
