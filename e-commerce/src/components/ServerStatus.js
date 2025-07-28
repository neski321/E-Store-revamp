import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from './Footer';

const ServerStatus = () => {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    axios.get('https://e-commerce-6zf9.onrender.com/server-status/')
      .then(response => {
        setStatus(response.data.status);
      })
      .catch(error => {
        setStatus('Error: Unable to fetch server status');
      });
  }, []);

  return (
    <>
    <Navbar />
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Server Status</h1>
            <p className="text-gray-700">{status}</p>
        </div>
    </div>
    <Footer />
    </>
  );
};

export default ServerStatus;
