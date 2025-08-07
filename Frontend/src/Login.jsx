import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminMode, setAdminMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const url = adminMode ? 'http://localhost:3000/login/admin' : 'http://localhost:3000/login';
      const res = await axios.post(url, { email, password }, {
        withCredentials: true
      });
      
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (adminMode) {
        localStorage.setItem('isAdmin', 'true');
      }
      
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/problems'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-purple-200 to-pink-100 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-96 flex flex-col items-center">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/src/assets/logo.png" 
            alt="AlgoArena Logo" 
            className="w-12 h-12 mr-3"
          />
          <h1 className="text-2xl font-bold text-blue-600">AlgoArena</h1>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-600 drop-shadow">Login</h2>
          {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
          {success && <div className="mb-4 text-green-600 text-center">{success}</div>}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-4 p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300" required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mb-4 p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300" required />
          
          <div className="w-full mb-6 flex items-center justify-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adminMode}
                onChange={(e) => setAdminMode(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Login as Admin</span>
            </label>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 font-semibold text-lg transition-all duration-150">
            {adminMode ? 'Admin Login' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-gray-600">New user? </span>
          <button 
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; 