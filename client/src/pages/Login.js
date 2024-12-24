import React, { useState } from 'react';
import doodle from '../../assets/sidebar/doodle.svg';
import gradient from '../../assets/sidebar/gradient.svg'; // New gradient SVG

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
    } else {
      setError('');
      // Handle login logic here
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/3 relative flex flex-col items-center p-6 bg-blue-500">
        {/* SVG Background */}
        <div className="absolute inset-0">
          <img
            src={gradient}
            alt="Gradient Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-xs text-center text-white">
          {/* Header Text - Moved to the top */}
          <div className="w-full text-center mb-6 mt-8">
            <h1 className="text-6xl font-extrabold leading-tight tracking-wide">
              Aptitude <br />
              <span>Portal</span>
            </h1>
            <p className="mt-3 text-lg">Turn your exams into success stories</p>
          </div>

          {/* Add margin-top to bring down the content */}
          <div className="mt-20 w-full">
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <h2 className="text-3xl font-bold mb-5">Student Login: </h2>
              {error && <div className="text-red-400 mb-2">{error}</div>}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white text-gray-800 rounded-xl shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-blue-200 hover:text-white transition underline cursor-pointer"
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-black text-white rounded-xl shadow-md hover:bg-gray-800 transition transform hover:scale-105"
              >
                Login
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