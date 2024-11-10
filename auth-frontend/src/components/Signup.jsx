import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const[email,setEmail] = useState('');
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Signup form submitted:', formData);
    setEmail(formData.email);
    setError(''); // Reset error message

    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', formData);
        const { token, user } = response.data;

      // Store the token in local storage for future authenticated requests
        localStorage.setItem('token', token);
        console.log('User registered:', response.data);
        // On successful registration, navigate to the chat room or any other route
        
        navigate('/chatroom');
      } catch (err) {
        if (err.response && err.response.data) {
          setError(err.response.data.msg || 'Login failed');
        } else {
          setError('Something went wrong, please try again later');
        }
      }
  };

  return (
    <div className="w-full bg-gradient-to-t from-blue-300 to-blue-700">
    
    <div className="min-h-screen flex flex-col items-center justify-center w-full">
      <h1 className="text-4xl text-gray-300 font-bold mb-10">Welcome to the Real-time Chat App!</h1>

    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Sign Up
        </button>
      </form>
      <div className = "mt-4 text-center"> Already have an account? 
        <button type="submit" onClick={() =>navigate('/login')} className="underline underline-offset-1 pl-2">
          Sign In
        </button>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Signup;
