import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import logger from '../../utils/logger';

const AdminDashboard = () => {
  const [ip, setIp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setIp(e.target.value);
  };

  const handleBlockIp = async () => {
    try {
      const response = await axios.post('/admin/permanent-block', { ip });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setError(error.response.data.error || 'Failed to block IP');
      setMessage('');
    }
  };

  const handleUnblockIp = async () => {
    try {
      const response = await axios.post('/admin/unblock', { ip });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setError(error.response.data.error || 'Failed to unblock IP');
      setMessage('');
    }
  };

  const handleCheckBlock = async () => {
    try {
      const response = await axios.get('/admin/check-block', { params: { ip } });
      setMessage(response.data.message);
      setError('');
    } catch (error) {
      setError(error.response.data.error || 'Failed to check IP');
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <input type="text" value={ip} onChange={handleInputChange} placeholder="Enter IP address" />
        <button onClick={handleBlockIp}>Block IP</button>
        <button onClick={handleUnblockIp}>Unblock IP</button>
        <button onClick={handleCheckBlock}>Check IP Block Status</button>
      </div>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

// Ensure the 'root' element exists and is of type HTMLElement
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<AdminDashboard />);
} else {
    logger.error('Root element not found');
}
