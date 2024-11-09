import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import ChatRoom from './components/Chatroom';
import ChatPage from './components/ChatPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/chatroom" element={<ChatRoom />} />
          <Route path="/chat/:email" element={<ChatPage />} />
          <Route path="/" element={<Signin />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
