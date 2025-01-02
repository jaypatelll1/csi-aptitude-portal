import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setUser } from '../redux/userSlice'; // Import the setUser action
import doodle from '../assets/sidebar/doodle.svg';
import gradient from '../assets/sidebar/gradient.svg'; // New gradient SVG

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // For loading state
  const [showPassword, setShowPassword] = useState(false); // For showing/hiding password
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/users/login', {
        email,
        password,
      });

      if (response.data.message === 'Login Successful') {
        const userData = response.data.result;
        console.log(userData);

        dispatch(setUser(userData));

        if (userData.role === 'Student') {
          navigate('/home', { state: { userData: response.data.result } });
        } else if (userData.role === 'TPO') {
          navigate('/admin');
        } else {
          setError('Unauthorized role');
        }
      } else {
        setError('Invalid login credentials');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="w-full md:w-1/3 relative flex flex-col items-center p-6 bg-gradient-to-br from-[#0E2A47] to-[#04448D]">
        {/* SVG Background */}
        

        <div className="relative z-10 flex flex-col items-center w-full max-w-xs text-center text-white">
          {/* Header Text */}
          <div className="w-full text-center mb-6 mt-8">
            <h1 className="text-6xl font-extrabold leading-tight tracking-wide">
              Aptitude <br />
              <span>Portal</span>
            </h1>
            <p className="mt-3 text-lg">Turn your exams into success stories</p>
          </div>

          {/* Login Form */}
          <div className="mt-20 w-full">
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <h2 className="text-3xl font-bold mb-5">Login</h2>
              {error && <div className="text-red-400 mb-2">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="text-right">
               
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 text-white rounded-xl shadow-md transition transform hover:scale-105 ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800'
                }`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-2/3 bg-gray-50 flex justify-center items-center relative p-6">
        <img
          src={doodle}
          alt="Student Illustration"
          className="w-2/3 h-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Login;
