import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ChatPage = () => {
  const { email } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch the logged-in user's email from the token stored in localStorage
  const getLoggedInUserEmail = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the token
      return decodedToken.email; // Ensure that your backend includes email in the token payload
    }
    return null;
  };

  const loggedInUserEmail = getLoggedInUserEmail();

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(
          `http://localhost:5000/api/chat/${loggedInUserEmail}/${email}`,
          {
            headers:{
              Authorization: token, // Include token in the headers
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [email, loggedInUserEmail]);

  // Handle sending a new message
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
            headers:{
              Authorization: token,

            }
         }
        );
      setMessages([...messages, response.data]);
      setNewMessage('');
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
            <span className={`inline-block max-w-sm p-2 rounded-lg ${
                msg.senderEmail === loggedInUserEmail
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
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
