import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 px-6 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-white text-2xl font-bold tracking-wide">
          SmartLMS
        </div>
        <ul className="flex space-x-6 items-center">
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
