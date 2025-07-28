// src/pages/Home.js
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Categories from '../components/Categories';
import Product from '../components/Product';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      
      {/* Categories Section */}
      <div className="bg-gray-50">
        <Categories />
      </div>
      
      {/* Featured Products Section */}
      <div className="bg-white">
        <Product />
      </div>
      
      <Footer />
    </>
  );
};

export default Home;
