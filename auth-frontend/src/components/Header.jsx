// Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  
  // Get the logged-in user's data from localStorage (JWT token)
  const getLoggedInUserData = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return {
        email: decodedToken.email,
        name: decodedToken.name,
      };
    }
    return null;
  };

  const { name, email } = getLoggedInUserData() || {};
  
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Navigate to login page after logout
  };

  // Generate avatar using the first letter of the first and last name
  const getInitials = () => {
    if (!name) return '';
    const nameArray = name.split(' ');
    return nameArray.map((n) => n[0]).join('');
  };


  return (
    <header className="flex justify-between items-center border border-b p-4 text-white">
      <div>
        <Link to="/chatroom" className="text-xl font-bold">Chat App</Link>
      </div>
      <div className="flex items-center">
        <div className="bg-blue-400 rounded-full w-10 h-10 flex items-center justify-center text-white text-md mr-4">
          {getInitials()}
        </div>
        <span className="mr-4">{name}</span>
        <button 
          onClick={handleLogout}
          className=" hover:bg-blue-500 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
