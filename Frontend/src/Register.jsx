import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input
    if (!firstName || !LastName || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
      console.log('Registering with URL:', `${baseUrl}/register`);
      
      const res = await axios.post(`${baseUrl}/register`, 
        { firstName, LastName, email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => navigate('/problems'), 1000);
      } else {
        setError('Registration failed: No user data received');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 via-blue-200 to-pink-100 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 flex flex-col items-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/src/assets/logo.png" 
            alt="AlgoArena Logo" 
            className="w-12 h-12 mr-3"
          />
          <h1 className="text-2xl font-bold text-purple-600">AlgoArena</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-600 drop-shadow">Register</h2>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
          <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full mb-4 p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300" required />
          <input type="text" placeholder="Last Name" value={LastName} onChange={e => setLastName(e.target.value)} className="w-full mb-4 p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300" required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-6 p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300" required />
          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-full hover:bg-purple-700 font-semibold text-lg transition-all duration-150">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register; 