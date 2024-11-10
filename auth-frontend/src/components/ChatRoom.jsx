import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SlideControllers from './SlideControllers';
import UserCard from './UserCard';
import Header from './Header';

const ChatRoom = () => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at the cloned first slide
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
  useEffect(() => {
    let didCancel = false;

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found, please sign in again.');
          return;
        }
        const response = await axios.get('http://localhost:5000/api/auth/users', {
          headers: {
            Authorization: token,
          },
        });

        const allUsers = response.data;
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
      didCancel = true;
    };
  }, [loggedInUserEmail]);

  // Handle transition end
  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === users.length + 1) {
      setCurrentIndex(1); // Reset to the first real user after the cloned slide
      carouselRef.current.style.transition = 'none';
    } else if (currentIndex === 0) {
      setCurrentIndex(users.length); // Go to the last real user after the cloned first slide
      carouselRef.current.style.transition = 'none';
    }
  };

  // Reset transition to enable smooth animation
  useEffect(() => {
    if (isTransitioning) return;
    const timeout = setTimeout(() => {
      carouselRef.current.style.transition = 'transform 0.35s ease-in-out';
    }, 50);
    return () => clearTimeout(timeout);
  }, [isTransitioning]);

  return (
    <div className="w-full bg-gradient-to-t from-blue-300 to-blue-700">
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center w-full">
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
            {/* Cloned last slide */}
            {users.length > 0 && (
              <div className="flex-shrink-0 w-full flex justify-center items-center">
                <UserCard user={users[users.length - 1]} loggedInUserEmail={loggedInUserEmail} />
              </div>
            )}
            {/* Real slides */}
            {users.map((user, index) => (
              <div key={index} className="flex-shrink-0 w-full flex justify-center items-center">
                <UserCard user={user} loggedInUserEmail={loggedInUserEmail} />
              </div>
            ))}
            {/* Cloned first slide */}
            {users.length > 0 && (
              <div className="flex-shrink-0 w-full flex justify-center items-center">
                <UserCard user={users[0]} loggedInUserEmail={loggedInUserEmail} />
              </div>
            )}
          </div>
        </div>

        <SlideControllers
          isTransitioning={isTransitioning}
          setIsTransitioning={setIsTransitioning}
          setCurrentIndex={setCurrentIndex}
          usersLength={users.length}
          currentIndex={currentIndex}
        />
      </div>
    </div>
  );
};

export default ChatRoom;
