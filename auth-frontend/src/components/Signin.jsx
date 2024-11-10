import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const[email,setEmail] = useState('');
  const navigate = useNavigate();

  // Handle form input changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message
    setEmail(formData.email);

    try {
      // Send a POST request to the backend /login route
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = response.data;

      // Store the token in local storage for future authenticated requests
      localStorage.setItem('token', token);

      // Redirect to the chatroom page
      navigate('/chatroom');
    } catch (err) {
      // Handle errors from the backend
      if (err.response && err.response.data) {
        setError(err.response.data.msg || 'Login failed');
      } else {
        setError('Something went wrong, please try again later');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Signin</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Sign In
        </button>
      </form>
      <div className = "mt-4 text-center"> New User? 
        <button type="submit" onClick={() =>navigate('/register')} className="underline underline-offset-1 pl-2">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Signin;
