import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

class AuthService {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
  }

  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
        ...userData
      });

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      this.user = null;
      this.isAuthenticated = false;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get current user data from Firestore
  async getUserData(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.isAuthenticated = !!user;
      callback(user);
    });
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }
}

export default new AuthService();