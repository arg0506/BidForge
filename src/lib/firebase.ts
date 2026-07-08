import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Standard scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export {
  app,
  auth,
  db,
  googleProvider,
  githubProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type FirebaseUser
};
