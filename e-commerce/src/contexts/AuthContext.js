// src/contexts/AuthContext.js
import React, { useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [role, setRole] = useState('');

  // Signup with Email and Password
  async function signup(email, password, role = 'user') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), { 
      email: user.email,
      role,
      createdAt: Timestamp.now()
    });
    return userCredential;
  }

  // Login with Email and Password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Guest Login (Anonymous Authentication)
  async function loginAsGuest() {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    // Create a guest user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: null,
      role: 'guest',
      isGuest: true,
      createdAt: Timestamp.now(),
      displayName: `Guest_${user.uid.slice(-6)}` // Create a readable guest name
    });
    
    return userCredential;
  }

  // Google Sign-In
  function googleSignIn() {
    return signInWithPopup(auth, googleProvider);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Update User Profile in Firestore
  async function updateProfile(data) {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, data);
  }

  // Fetch User Profile Info
  async function getProfile() {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    return userDoc.exists() ? userDoc.data() : null;
  }

  // Fetch Billing and Shipping Info
  async function fetchBillingAndShippingInfo() {
    if (!currentUser) {
      console.warn("No current user logged in.");
      return null;
    }
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error("Error fetching billing and shipping info:", error);
      return null;
    }
  }

  // Place an Order
  async function placeOrder(orderData) {
    if (!currentUser) return;
    const orderCollectionRef = collection(db, 'users', currentUser.uid, 'orders');
    await addDoc(orderCollectionRef, orderData);
  }

  // Send Contact Message
  async function sendContactMessage(contactData) {
    try {
      const contactCollectionRef = collection(db, 'contactMessages', currentUser.uid, 'messages');
      await addDoc(contactCollectionRef, {
        ...contactData,
      createdAt: Timestamp.now()
    });
    } catch (error) {
      console.error('Error sending contact message:', error);
      throw error;
    }
  }

  // Handle Authentication State Change
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || 'user');
          } else {
            // If user exists in Firebase Auth but not in Firestore, create a profile
            if (!user.isAnonymous) {
              await setDoc(userDocRef, {
                email: user.email,
                role: 'user',
                createdAt: Timestamp.now()
              });
              setRole('user');
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole('user');
        }
      } else {
        setRole('');
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    role,
    signup,
    login,
    loginAsGuest,
    googleSignIn,
    logout,
    updateProfile,
    getProfile,
    fetchBillingAndShippingInfo,
    placeOrder,
    sendContactMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
