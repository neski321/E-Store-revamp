import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '', details: '' });
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorDialog({
          isOpen: true,
          title: 'Authentication Required',
          message: 'Please log in to send a message.',
          details: ''
        });
        setLoading(false);
        return;
      }

      const messageData = {
        ...formData,
        userId: user.uid,
        timestamp: new Date(),
        status: 'unread'
      };

      await addDoc(collection(db, 'contactMessages', user.uid, 'messages'), messageData);
      
      setSuccessDialog({
        isOpen: true,
        title: 'Message Sent! 📧',
        message: 'Thank you for your message. We\'ll get back to you soon!'
      });

      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Error Sending Message',
        message: 'Failed to send your message. Please try again.',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Navbar />
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
      />
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        title={successDialog.title}
        message={successDialog.message}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-gray-700 font-bold mb-2">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

export default Contact;
