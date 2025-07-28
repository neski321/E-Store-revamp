import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const fetchFavorites = async () => {
            const user = auth.currentUser;
            if (user) {
                const favoritesRef = collection(db, 'favorites', user.uid, 'products');
                const favoritesSnapshot = await getDocs(favoritesRef);
                const favoritesList = favoritesSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id  // Store document ID for deletion ref
                }));
                setFavorites(favoritesList);
            }
        };

        fetchFavorites();
    }, []);

    const removeFromFavorites = async (productId) => {
        const user = auth.currentUser;
        if (user) {
            try {
                // Locate the specific favorite item in Firebase
                const favoriteDocRef = doc(db, 'favorites', user.uid, 'products', productId);
                await deleteDoc(favoriteDocRef);

                // Update the local state to remove the product from the list
                setFavorites(favorites.filter(fav => fav.id !== productId));
                alert("Product removed from favorites.");
            } catch (error) {
                console.error("Error removing product from favorites:", error);
                alert("Failed to remove from favorites.");
            }
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6 text-center">My Favorites</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {favorites.length > 0 ? (
                        favorites.map((product) => (
                            <div key={product.productId} className='border rounded p-4'>
                                <h3 className='text-xl font-semibold'>{product.name}</h3>
                                <p className='text-gray-700'>${product.price}</p>
                                <img src={product.images[0]} alt={product.name} className='w-full h-48 object-cover mt-2' />
                                <br />
                                <button className="bg-gray-200 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded mb-2">
                                    <Link to={`/products/${product.productId}`} className="text-blue-500 hover:underline">
                                        View Details
                                    </Link>
                                </button>
                                <button
                                    onClick={() => removeFromFavorites(product.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Remove from Favorites
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className='text-2xl text-center text-gray-700'>No favorites yet</p>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default FavoritesPage;
