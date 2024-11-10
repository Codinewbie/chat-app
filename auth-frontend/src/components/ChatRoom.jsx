import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SlideControllers from './SlideControllers';
import UserCard from './UserCard';

const ChatRoom = () => {
  const [currentIndex, setCurrentIndex] = useState(0); // Start at the first user
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [users, setUsers] = useState([]);
  const carouselRef = useRef(null);

  // Decode the JWT token to get the logged-in user's ID
  const getLoggedInUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the token
      return decodedToken.email; // Ensure that your backend includes email in the token payload
    }
    return null;
  };
  
  const loggedInUserEmail = React.useMemo(getLoggedInUserEmail, [localStorage.getItem('token')]);

  // Fetch users from backend
 // Fetch users from backend
useEffect(() => {
  let didCancel = false; // Flag to prevent setting state if component unmounts

  const fetchUsers = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      // If token is missing, return early
      if (!token) {
        console.error('No token found, please sign in again.');
        return;
      }

      // Send a GET request with the token in the Authorization header
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: {
          Authorization: token, // Include the token in the headers
        },
      });

      const allUsers = response.data;

      // Filter out the logged-in user
      const filteredUsers = allUsers.filter((user) => user.email !== loggedInUserEmail);

      if (!didCancel) {
        setUsers(filteredUsers);
      }
    } catch (error) {
      if (!didCancel) {
        console.error('Error fetching users:', error);
      }
    }
  };

  fetchUsers();

  return () => {
    didCancel = true; // Cleanup to prevent memory leaks
  };
}, [loggedInUserEmail]);

  // Handle transition end to implement infinite looping
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === users.length) {
      setCurrentIndex(0);
      carouselRef.current.style.transition = 'none';
    } else if (currentIndex === -1) {
      setCurrentIndex(users.length - 1);
      carouselRef.current.style.transition = 'none';
    }
  };

  // Reset transition to enable smooth animation
  useEffect(() => {
    if (currentIndex === 0 || currentIndex === users.length - 1) {
      setTimeout(() => {
        carouselRef.current.style.transition = 'transform 0.35s ease-in-out';
      }, 50);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full bg-gray-200">
      <h1 className="text-4xl font-bold mb-6">Welcome to the Chat Room!</h1>

      {/* Carousel Wrapper */}
      <div className="relative w-full max-w-lg overflow-hidden">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-200 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {users.map((user, index) => (
            <div key={index} className="flex-shrink-0 w-full flex justify-center items-center">
              <UserCard user={user} />
            </div>
          ))}
        </div>
      </div>
      <SlideControllers
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
        setCurrentIndex={setCurrentIndex}
      />
    </div>
  );
};

export default ChatRoom;
