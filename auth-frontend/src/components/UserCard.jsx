import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const UserCard = ({ user, loggedInUserEmail }) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    // Emit user email to identify them
    socket.emit('identifyUser', loggedInUserEmail);

    // Listen for the active users event
    socket.on('activeUsers', (users) => {
      setActiveUsers(users);
    });

    // Emit 'enterChat' when the user visits the chat page
    if (user && loggedInUserEmail === user.email) {
      socket.emit('enterChat', loggedInUserEmail);
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [user, loggedInUserEmail]);

  // Check if the user is in the active users list
  const isActive = activeUsers.includes(user.email);

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
    <div className={`w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-6 ${isActive ? 'border-green-500' : ''}`}>
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold">
          {getInitials(user.name)}
        </div>
        <h5 className="text-xl font-semibold text-gray-900">{user.name}</h5>
        <span className="text-sm text-gray-600">{user.email}</span>
        {isActive ? (
          <span className="text-green-500 text-sm">Active</span>
        ) : (
          <span className="text-gray-500 text-sm">Offline</span>
        )}
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
};

export default UserCard;
