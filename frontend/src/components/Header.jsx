import React from "react";

const Header = () => (
<header className="p-6 bg-white shadow-md">
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <img src="logo.png" alt="Logo" className="h-12" />
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">ClipCraft</h1>
        <p className="text-sm text-gray-500 mt-1">Transform your videos into engaging reels in seconds!</p>
      </div>
    </div>
    {/* <nav className="space-x-6">
      <a href="#" className="text-gray-600 hover:text-blue-600 transition">Home</a>
      <a href="#" className="text-gray-600 hover:text-blue-600 transition">About</a>
    </nav> */}
  </div>
</header>
);

export default Header;
