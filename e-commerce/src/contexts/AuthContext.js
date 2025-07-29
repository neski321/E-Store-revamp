// src/contexts/AuthContext.js
import React, { useContext, useState, useEffect } from 'react';
import { auth, googleProvider, facebookProvider, githubProvider, db } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  signInAnonymously,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  // Signup with Email and Password
  async function signup(email, password, role = 'user', displayName = '') {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    await setDoc(doc(db, 'users', user.uid), { 
      email: user.email,
      role,
      displayName: displayName || user.displayName,
      emailVerified: false,
      createdAt: Timestamp.now()
    });
    return userCredential;
  }

  // Login with Email and Password
  async function login(email, password, rememberMe = false) {
    // Set persistence based on remember me
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    
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
  async function googleSignIn() {
    return signInWithPopup(auth, googleProvider);
  }

  // Facebook Sign-In
  async function facebookSignIn() {
    return signInWithPopup(auth, facebookProvider);
  }

  // GitHub Sign-In
  async function githubSignIn() {
    return signInWithPopup(auth, githubProvider);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Send Password Reset Email
  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Send Email Verification
  async function sendVerificationEmail() {
    if (currentUser && !currentUser.emailVerified) {
      return sendEmailVerification(currentUser);
    }
    throw new Error('User not found or email already verified');
  }

  // Update User Profile in Firestore
  async function updateUserProfile(data) {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, data);
  }

  // Update Firebase Auth Profile
  async function updateAuthProfile(profileData) {
    if (!currentUser) return;
    await updateProfile(currentUser, profileData);
  }

  // Fetch User Profile Info
  async function getProfile() {
    if (!currentUser) {
      console.warn('getProfile: No current user');
      return null;
    }
    
    try {
      console.log('Fetching profile for user:', currentUser.uid);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('Profile data retrieved:', data);
        return data;
      } else {
        console.log('No profile document found for user:', currentUser.uid);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
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

  // Re-authenticate user (for sensitive operations)
  async function reauthenticateUser(password) {
    if (!currentUser || !currentUser.email) {
      throw new Error('No authenticated user with email');
    }
    
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    return reauthenticateWithCredential(currentUser, credential);
  }

  // Handle Authentication State Change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      setLoading(true);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role || 'user');
            
            // Update email verification status
            if (user.emailVerified !== userData.emailVerified) {
              await updateDoc(userDocRef, { emailVerified: user.emailVerified });
            }
          } else {
            // If user exists in Firebase Auth but not in Firestore, create a profile
            if (!user.isAnonymous) {
              await setDoc(userDocRef, {
                email: user.email,
                role: 'user',
                displayName: user.displayName || '',
                emailVerified: user.emailVerified,
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
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    role,
    loading,
    rememberMe,
    setRememberMe,
    signup,
    login,
    loginAsGuest,
    googleSignIn,
    facebookSignIn,
    githubSignIn,
    logout,
    resetPassword,
    sendVerificationEmail,
    updateUserProfile,
    updateAuthProfile,
    getProfile,
    fetchBillingAndShippingInfo,
    placeOrder,
    sendContactMessage,
    reauthenticateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
