import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AlertModal from '../components/AlertModal';

const API_URL = process.env.REACT_APP_API_URL;

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [checkoutList, setCheckoutList] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    // Fetch product details
    axios.get(`${API_URL}/products/${id}/`)
      .then(response => setProduct(response.data))
      .catch(error => console.error('Error fetching the product:', error));

    // Load checkout list
    loadCheckoutList();
  }, [id]);

  const loadCheckoutList = async () => {
    const user = auth.currentUser;
    if (user) {
      const checkoutRef = collection(db, 'checkout', user.uid, 'items');
      const querySnapshot = await getDocs(checkoutRef);
      const checkoutProducts = querySnapshot.docs.map(doc => doc.data().productId);
      setCheckoutList(checkoutProducts);
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
  };

  const addToCheckout = async () => {
    const user = auth.currentUser;
  if (user) {
    try {
      const checkoutRef = collection(db, 'checkout', user.uid, 'items');
      
      // thumbnail image or set a default placeholder
      const productImage = product.images && Array.isArray(product.images) && product.images.length > 0 
        ? product.images[0] 
        : 'https://via.placeholder.com/150';

      await addDoc(checkoutRef, {
        productId: product.id,
        name: product.title,
        price: product.price,
        images: [productImage], // Ensure this is an array format for Firestore
        discount: product.discount_percentage,
        stock: product.stock
      });
        setCheckoutList([...checkoutList, product.id]);
        showAlert('Added to checkout list');
      } catch (error) {
        console.error('Error adding to checkout:', error);
        showAlert('Failed to add to checkout list');
      }
    } else {
      showAlert('You need to be logged in to add items to checkout');
    }
  };

  const removeFromCheckout = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const checkoutRef = collection(db, 'checkout', user.uid, 'items');
        const querySnapshot = await getDocs(checkoutRef);
        const checkoutItem = querySnapshot.docs.find(doc => doc.data().productId === product.id);

        if (checkoutItem) {
          await deleteDoc(doc(db, 'checkout', user.uid, 'items', checkoutItem.id));
          setCheckoutList(checkoutList.filter(itemId => itemId !== product.id));
          showAlert('Removed from checkout list');
        }
      } catch (error) {
        console.error('Error removing from checkout:', error);
        showAlert('Failed to remove from checkout list');
      }
    }
  };

  const isInCheckout = checkoutList.includes(product?.id);

  const renderImage = () => {
    if (product?.images) {
      return <img src={product.images} alt={product.title} className="mt-4" />;
    } else {
      return <p className="text-gray-700">Image will be added soon</p>;
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {alertMessage && (
          <AlertModal message={alertMessage} onClose={() => setAlertMessage('')} />
        )}
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          {renderImage()}
          <br />
          <h2 className="text-xl font-semibold mb-4">Description</h2>
          <p className="text-gray-700">{product.description}</p>
          <br />
          <h3 className="text-xl font-semibold mb-4">Category</h3>
          <p className="text-gray-700">{product.category}</p>
          <br />
          <h3 className="text-xl font-semibold mb-4">Price</h3>
          <p className="text-gray-900 font-bold">${product.price}</p>
          <br />
          <h3 className="text-xl font-semibold mb-4">Availability</h3>
          <p className="text-gray-700">{product.availabilityStatus}</p>
          <br />
          <button
            onClick={isInCheckout ? removeFromCheckout : addToCheckout}
            className={`mt-4 text-white px-4 py-2 rounded ${
              isInCheckout ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isInCheckout ? 'Remove from Checkout' : 'Add to Checkout'}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;
