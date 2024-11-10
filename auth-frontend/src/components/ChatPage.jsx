import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const { email } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

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

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Chat with {email}</h2>
      <div className="bg-white shadow-lg p-4 rounded-lg overflow-y-auto h-80 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 text-left flex ${
              msg.senderEmail === loggedInUserEmail ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <span
              className={`inline-block max-w-sm p-2 rounded-lg ${
                msg.senderEmail === loggedInUserEmail ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded-l-lg"
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 rounded-r-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
