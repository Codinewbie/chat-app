import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const ChatPage = () => {
  const { email } = useParams(); // Get the email of the user to chat with
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const room = email; // Using the recipient's email as the room name

  // Join the room on component mount
  useEffect(() => {
    socket.emit('join_room', room);

    socket.on('receive_message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [room]);

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = {
        room,
        sender: 'Me', // You can replace this with the logged-in user's info
        message,
      };
      socket.emit('send_message', msgData);
      setMessages((prevMessages) => [...prevMessages, msgData]);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Chat with {email}</h2>
      <div className="w-full max-w-lg bg-white p-4 shadow rounded overflow-y-auto h-80">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex mt-4 w-full max-w-lg">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border rounded-l"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
