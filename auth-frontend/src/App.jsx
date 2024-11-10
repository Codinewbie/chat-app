import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import ChatRoom from '@/components/Chatroom';
import ChatPage from './components/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Signin />} />
          <Route path="/chatroom" element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          } />
          <Route path="/chat/:email" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Signin />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
