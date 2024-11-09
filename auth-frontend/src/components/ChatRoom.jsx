import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SlideControllers from './SlideControllers';
import UserCard from './UserCard';
const jwt_decode = await import('jwt-decode').then((mod) => mod.default || mod);



const ChatRoom = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [users, setUsers] = useState([]);
  const carouselRef = useRef(null);

  // Decode the JWT token to get the logged-in user's ID
  const getLoggedInUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwt_decode(token);
        return decodedToken.userId;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  };

  const loggedInUserId = React.useMemo(getLoggedInUserId, [localStorage.getItem('token')]);

  // Fetch users from backend
  useEffect(() => {
    let didCancel = false; // Flag to prevent setting state if component unmounts
  
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/users');
        const allUsers = response.data;
        
        // Filter out the logged-in user
        const filteredUsers = allUsers.filter((user) => user._id !== loggedInUserId);
        
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
  }, [loggedInUserId]);
  

  // Create a duplicate array to enable infinite loop effect
  const extendedUsers = [users[users.length - 1], ...users, users[0]];

  // Handle transition end to implement infinite looping
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === extendedUsers.length - 1) {
      setCurrentIndex(1);
      carouselRef.current.style.transition = 'none';
    } else if (currentIndex === 0) {
      setCurrentIndex(users.length);
      carouselRef.current.style.transition = 'none';
    }
  };

  // Reset transition to enable smooth animation
  useEffect(() => {
    if (currentIndex === 1 || currentIndex === users.length) {
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
          {extendedUsers.map((user, index) => (
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
