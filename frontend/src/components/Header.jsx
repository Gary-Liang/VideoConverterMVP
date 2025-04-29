import React from "react";

const Header = () => (
<header className="flex items-center justify-between p-4 bg-white shadow-md">
  <div className="flex items-center">
    <img src="logo.png" alt="Logo" className="h-10 mr-2" />
    <h1 className="text-2xl font-bold text-gray-800">AI Video to Reels Converter</h1>
  </div>
  <nav>
    <a href="#" className="text-blue-600 hover:underline mr-4">Home</a>
    <a href="#" className="text-blue-600 hover:underline">About</a>
  </nav>
</header>
);

export default Header;
