import React from 'react';
import doodle from '../../assets/sidebar/doodle.svg';
import blueBox from '../../assets/sidebar/blueBox.svg';

const StudentLogin = () => {
  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div className="w-1/2 bg-blue-500 relative flex flex-col justify-center items-center">
        {/* Background Image */}
        <img
          src={blueBox}
          alt="Blue Box"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl font-bold">Aptitude Portal</h1>
          <p className="mt-2">Turn your exams into success stories</p>
          <form className="mt-8 space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-64 px-4 py-2 rounded border border-gray-300 text-black focus:outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-64 px-4 py-2 rounded border border-gray-300 text-black focus:outline-none"
              />
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-white hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-64 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              Login
            </button>
          </form>
        </div>
      </div>
      {/* Right Section */}
      <div className="w-1/2 bg-white flex justify-center items-center relative">
        <img
          src={doodle}
          alt="Doodle"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default StudentLogin;
