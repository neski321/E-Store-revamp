// src/contexts/AuthContext.js
import React, { useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
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
    });
    return userCredential;
  }

  // Login with Email and Password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
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
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
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
    googleSignIn,
    logout,
    updateProfile,
    getProfile,
    fetchBillingAndShippingInfo,  // Direct billing info fetch function
    placeOrder,        // Direct order placement function
    sendContactMessage,   // <-- New Function Exposed Here!
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
