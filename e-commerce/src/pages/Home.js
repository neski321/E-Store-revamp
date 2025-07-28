// src/pages/Home.js
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
// import FeaturedProducts from '../components/FeaturedProducts';
import Footer from '../components/Footer';
import Categories from '../components/Categories';
import Product from '../components/Product';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Categories />
      
      <Product />
      <Footer />
    </>
  );
};

export default Home;
