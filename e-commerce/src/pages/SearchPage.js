import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import AlertModal from '../components/AlertModal';

const API_URL = process.env.REACT_APP_API_URL;

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [favorites, setFavorites] = useState([]);
  const [checkoutList, setCheckoutList] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    loadFavorites();
    loadCheckoutList();
  }, []);

  const loadFavorites = async () => {
    const user = auth.currentUser;
    if (user) {
      const favoritesRef = collection(db, 'favorites', user.uid, 'products');
      const querySnapshot = await getDocs(favoritesRef);
      const favoriteProducts = querySnapshot.docs.map(doc => doc.data().productId);
      setFavorites(favoriteProducts);
    }
  };

  const loadCheckoutList = async () => {
    const user = auth.currentUser;
    if (user) {
      const checkoutRef = collection(db, 'checkout', user.uid, 'items');
      const querySnapshot = await getDocs(checkoutRef);
      const checkoutProducts = querySnapshot.docs.map(doc => doc.data().productId);
      setCheckoutList(checkoutProducts);
    }
  };

  const handleSearch = async (e, searchType = 'regular') => {
    e.preventDefault();
    try {
      const response = await axios.get(`${API_URL}/products/`, {
        params: {
          search: query,
          type: searchType
        }
      });
      setResults(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
  };

  const addToFavorites = async (product) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const favoritesRef = collection(db, 'favorites', user.uid, 'products');
        await addDoc(favoritesRef, {
          productId: product.id,
          name: product.title,
          price: product.price,
          images: [product.thumbnail]
        });
        setFavorites([...favorites, product.id]);
        showAlert('Added to favorites');
      } catch (error) {
        console.error('Error adding to favorites:', error);
      }
    } else {
      showAlert('You need to be logged in to add favorites');
    }
  };

  const removeFromFavorites = async (product) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const favoritesRef = collection(db, 'favorites', user.uid, 'products');
        const querySnapshot = await getDocs(favoritesRef);
        const favoriteItem = querySnapshot.docs.find(doc => doc.data().productId === product.id);

        if (favoriteItem) {
          await deleteDoc(doc(db, 'favorites', user.uid, 'products', favoriteItem.id));
          setFavorites(favorites.filter(id => id !== product.id));
          showAlert('Removed from favorites');
        }
      } catch (error) {
        console.error('Error removing from favorites:', error);
      }
    }
  };

  const addToCheckout = async (product) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const checkoutRef = collection(db, 'checkout', user.uid, 'items');
        await addDoc(checkoutRef, {
          productId: product.id,
          name: product.title,
          price: product.price,
          images: [product.thumbnail],
          discount: product.discount_percentage,  
          stock: product.stock
        });
        setCheckoutList([...checkoutList, product.id]);
        showAlert('Added to checkout list');
      } catch (error) {
        console.error('Error adding to checkout:', error);
      }
    } else {
      showAlert('You need to be logged in to add items to checkout');
    }
  };

  const removeFromCheckout = async (product) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const checkoutRef = collection(db, 'checkout', user.uid, 'items');
        const querySnapshot = await getDocs(checkoutRef);
        const checkoutItem = querySnapshot.docs.find(doc => doc.data().productId === product.id);

        if (checkoutItem) {
          await deleteDoc(doc(db, 'checkout', user.uid, 'items', checkoutItem.id));
          setCheckoutList(checkoutList.filter(id => id !== product.id));
          showAlert('Removed from checkout list');
        }
      } catch (error) {
        console.error('Error removing from checkout:', error);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = results.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbar />
      {alertMessage && <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Search Products</h1>
        <form className="mb-6 flex flex-col items-center" onSubmit={(e) => handleSearch(e, 'regular')}>
          <div className="flex w-full md:w-1/2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border rounded-l p-2 w-full"
              placeholder="Search for products..."
            />
            <button type="submit" className="bg-blue-500 text-white py-2 px-6 rounded">
              Search
            </button>&nbsp;
            <button
              type="button"
              onClick={(e) => handleSearch(e, 'advanced')}
              className="bg-green-500 text-white py-2 px-6 rounded"
            >
              Advanced Search
            </button>
          </div>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((product) => (
              <div key={product.id} className="border rounded-lg shadow-lg p-4 flex flex-col items-center">
                <img src={product.images[0]} alt={product.title} className="w-32 h-32 object-cover mb-4 rounded" />
                <h2 className="font-bold text-lg mb-2">{product.title}</h2>
                <p className="text-gray-700 mb-2">{product.description}</p>
                <p className="text-gray-900 font-semibold mb-4">${product.price}</p>
                <button className="bg-gray-200 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">
                  <Link to={`/products/${product.id}`} className="text-blue-500 hover:underline">
                    View Details
                  </Link>
                </button>
                <button
                  onClick={() => favorites.includes(product.id) ? removeFromFavorites(product) : addToFavorites(product)}
                  className={`mt-2 text-white px-4 py-2 rounded ${favorites.includes(product.id) ? 'bg-red-500' : 'bg-gray-500'}`}
                >
                  {favorites.includes(product.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
                <button
                  onClick={() => checkoutList.includes(product.id) ? removeFromCheckout(product) : addToCheckout(product)}
                  className={`mt-2 text-white px-4 py-2 rounded ${checkoutList.includes(product.id) ? 'bg-green-500' : 'bg-blue-500'}`}
                >
                  {checkoutList.includes(product.id) ? 'Remove from Checkout' : 'Add to Checkout'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-700">No products matching your search were found</p>
          )}
        </div>
        {results.length > itemsPerPage && (
          <div className="flex justify-center mt-6">
            <nav>
              <ul className="pagination flex">
                {[...Array(Math.ceil(results.length / itemsPerPage)).keys()].map(number => (
                  <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                    <button onClick={() => paginate(number + 1)} className="page-link p-2 mx-1 border rounded">
                      {number + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
