// src/pages/About.js
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-lg">
          Welcome to my E-Commerce Store! We offer a wide variety of high-quality product to meet and satisfy your needs.
        </p>
        <p className="mb-4 text-lg">
          Our mission is to provide our customers with the best products at affordable prices. We are committed to delivering excellent customer service and ensuring your satisfaction with every purchase.
        </p>
        <p className="mb-4 text-lg">
          Thank you for choosing E-Commerce Store. If you have any questions or need assistance, please don't hesitate to contact us.
        </p>
      </div>
    </div>
    </div>
    <Footer />
    </>
  );
}

export default About;
