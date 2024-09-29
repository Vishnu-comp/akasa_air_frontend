import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import styles for toast notifications

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState(''); 
  const { register } = useAuth();
  const navigate = useNavigate();

  // Function to check if email already exists
  const checkEmailExists = async () => {
    try {
      const response = await api.get('/api/auth/check-email', { params: { email } });
      return response.data; // true if email exists, false otherwise
    } catch (error) {
      console.error('Error checking email:', error);
      return false; 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if email already exists before registration
    const emailExists = await checkEmailExists();
    if (emailExists) {
      setEmailError('Email is already registered.');
      toast.error('Email is already registered.'); // Toast for existing email
      return; 
    }
    
    setEmailError(''); // Clear any previous error

    const success = await register(email, password, fullName);
    if (success) {
      toast.success('Registration successful! Please login.'); // Toast for success
      navigate('/login');
    } else {
      toast.error('Registration failed. Please try again.'); // Toast for failure
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${emailError ? 'border-red-500' : ''}`}
            required
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
          Register
        </button>
      </form>
      <ToastContainer /> {/* Add the ToastContainer here */}
    </div>
  );
}

export default Register;
