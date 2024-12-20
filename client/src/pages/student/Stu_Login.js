import React, { useState } from 'react';
import doodle from '../../assets/sidebar/doodle.svg';
import blueBox from '../../assets/sidebar/blueBox.svg';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
    } else {
      // Handle login logic here
      setError('');
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left Section */}
      <div className="w-full md:w-1/2 bg-blue-500 relative flex justify-center items-center max-w-md mx-auto px-4 py-8">
        {/* Background Image */}
        <img
          src={blueBox}
          alt="Blue Box Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Header Text */}
        <div className="absolute top-8 left-8 text-white text-left">
          <h1 className="text-5xl font-bold leading-tight">
            Aptitude
            <br />
            <span className="text-5xl font-bold leading-tight">Portal</span>
          </h1>
          <p className="mt-2">Turn your exams into success stories</p>
        </div>
        {/* Login Form */}
        <div className="relative z-10 flex flex-col items-center text-white mt-1 w-full">
          <h2 className="text-xl font-bold mb-8">Student Login: </h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 text-black focus:outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded border border-gray-300 text-black focus:outline-none"
              />
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-white hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Login
            </button>
          </form>
        </div>
      </div>
      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-white flex justify-center items-center relative">
        <img
          src={doodle}
          alt="Illustration of a student doodle"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default StudentLogin;
