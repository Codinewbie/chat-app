import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Header from './Header';

const ChatPage = () => {
  const { email } = useParams();
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null); // Initialize as null instead of an array
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const chatroomRef = useRef(null); // Reference to the chatroom container

  // Function to get logged-in user's email
  const getLoggedInUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      return decodedToken.email;
    }
    return null;
  };

  const loggedInUserEmail = getLoggedInUserEmail();

  // Fetch the user data when email changes
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
        const chattingUser = allUsers.find((user) => user.email === email); // Changed to find() instead of filter()
        if (!didCancel) {
          setUser(chattingUser); // Set the user object
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
  }, [email]);

  // Fetch chat history from the server
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/${loggedInUserEmail}/${email}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    if (loggedInUserEmail && email) fetchMessages();
  }, [email, loggedInUserEmail]);

  // Socket connection and event listeners
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Join the chat room
    if (loggedInUserEmail && email) {
      newSocket.emit('joinRoom', { senderEmail: loggedInUserEmail, receiverEmail: email });
    }

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      // Avoid duplicate messages
      setMessages((prevMessages) => {
        if (prevMessages.find((msg) => msg._id === message._id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    };

    newSocket.on('receiveMessage', handleReceiveMessage);

    // Cleanup on component unmount
    return () => {
      newSocket.off('receiveMessage', handleReceiveMessage);
      newSocket.disconnect();
    };
  }, [loggedInUserEmail, email]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:5000/api/chat/send',
        {
          senderEmail: loggedInUserEmail,
          receiverEmail: email,
          content: newMessage,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      // Add the sent message to the local state
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');

      // Emit the message to the socket server
      socket.emit('sendMessage', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (chatroomRef.current) {
      chatroomRef.current.scrollTop = chatroomRef.current.scrollHeight;
    }
  }, [messages]); // Triggered when the messages change

  return (
    <div className="bg-gradient-to-t from-blue-300 to-blue-700 w-full">
      <Header />
      <div className="min-h-screen items-center p-4">
        <h2 className="text-2xl text-white font-bold mb-4 text-center">
          Chat with <span className="text-rose-400">{user ? user.name : 'Loading...'}</span>
        </h2>
        <div className="flex flex-col justify-center items-center">
          <div
            ref={chatroomRef}
            id="chatroom"
            className="bg-scroll bg-auto w-full max-w-lg shadow-lg p-4 rounded-lg overflow-y-scroll h-96 mb-4"
            style={{
              backgroundImage: 'url(/src/images/bg-image-2.jpg)',
              backgroundSize: 'cover',
            }}
          >
            {/* Custom CSS using Tailwind to hide the scrollbar */}
            <style>
              {`
                #chatroom::-webkit-scrollbar {
                  display: none;
                }
                #chatroom {
                  -ms-overflow-style: none;  /* for Internet Explorer */
                  scrollbar-width: none;  /* for Firefox */
                }
              `}
            </style>

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 text-left flex ${
                  msg.senderEmail === loggedInUserEmail ? 'flex-row-reverse ml-10' : 'flex-row mr-10'
                }`}
              >
                <span
                  className={`inline-block max-w-xl pb-2 pt-1 px-4 rounded-3xl ${
                    msg.senderEmail === loggedInUserEmail ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </span>
              </div>
            ))}
          </div>
          <div className="flex max-w-lg w-full">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2 border rounded-l-lg"
              placeholder="Type your message..."
            />
            <button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
