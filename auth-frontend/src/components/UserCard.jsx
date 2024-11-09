import React from "react";
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    return null;
  }
        
  const getInitials = (name) => {
    if (!name) return '';
    const nameArray = name.split(' ');
    return nameArray.map((n) => n[0]).join('').toUpperCase();
  };

  const handleMessageClick = () => {
    navigate(`/chat/${user.email}`);
  };

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold">
          {getInitials(user.name)}
        </div>
        <h5 className="text-xl font-semibold text-gray-900">{user.name}</h5>
        <span className="text-sm text-gray-600">{user.email}</span>
      </div>
      <div className="flex justify-center mt-6 space-x-4">
        <button 
          onClick={handleMessageClick}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 focus:ring-4 focus:outline-none"
        >
          Message
        </button>
      </div>
    </div>
  );
}

export default UserCard;
