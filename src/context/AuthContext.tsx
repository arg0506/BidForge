import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  auth, 
  googleProvider, 
  githubProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  FirebaseUser 
} from '../lib/firebase';
import { updateProfile } from 'firebase/auth';

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'google' | 'github';
  address?: string;
  uid?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (provider: 'google' | 'github', customName?: string, customEmail?: string) => Promise<void>;
  logout: () => void;
  bypassToSandbox: (provider: 'google' | 'github', name?: string, email?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  useEffect(() => {
    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsAuthenticating(true);
      if (firebaseUser) {
        // User is logged in via real Firebase Auth
        const providerId = firebaseUser.providerData[0]?.providerId || '';
        const provider: 'google' | 'github' = providerId.includes('github') ? 'github' : 'google';
        
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Cryptographic Citizen',
          email: firebaseUser.email || 'anon@bidforge.network',
          avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
          provider: provider
        });
      } else {
        // No Firebase user - check if there's a local sandbox session
        const storedUser = localStorage.getItem('bidforge_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('bidforge_user');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (provider: 'google' | 'github', customName?: string, customEmail?: string) => {
    setIsAuthenticating(true);
    const selectedProvider = provider === 'google' ? googleProvider : githubProvider;
    
    try {
      // Attempt real Firebase popup login
      const result = await signInWithPopup(auth, selectedProvider);
      const firebaseUser = result.user;
      
      // If user entered a custom name/email on the landing page, we can update their Firebase profile
      if (customName && customName.trim() !== '' && firebaseUser.displayName !== customName) {
        try {
          await updateProfile(firebaseUser, { displayName: customName });
        } catch (updateErr) {
          console.warn("Could not update display name in Firebase:", updateErr);
        }
      }

      const providerLabel = provider === 'google' ? 'Google' : 'GitHub';
      toast.success(`Successfully authenticated with real ${providerLabel}! Welcome, ${customName || firebaseUser.displayName || 'User'}.`);
    } catch (error: any) {
      console.error("Firebase popup authentication failed:", error);
      setIsAuthenticating(false);

      // Identify specifically what failed
      let errorMessage = "Identity handshake failed.";
      let isIframeOrConfigIssue = false;

      if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked by your browser. Please enable popups or use 'Open in new tab'.";
        isIframeOrConfigIssue = true;
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed before completion.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = `${provider === 'google' ? 'Google' : 'GitHub'} Sign-In is not enabled in Firebase Console yet.`;
        isIframeOrConfigIssue = true;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network request failed. Check your internet connection.";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized in Firebase Console.";
        isIframeOrConfigIssue = true;
      }

      toast.error(errorMessage, { duration: 6000 });
      
      // Propagate error to LandingPage so it can handle sandbox bypass option if wanted
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const bypassToSandbox = (provider: 'google' | 'github', name?: string, email?: string) => {
    setIsAuthenticating(true);
    let loggedInUser: UserProfile;

    if (provider === 'google') {
      loggedInUser = {
        name: name || 'Alex Rivers',
        email: email || 'alex.rivers@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        provider: 'google'
      };
    } else {
      loggedInUser = {
        name: name || '0xDeFiDev',
        email: email || 'octocat.defi@github.com',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
        provider: 'github'
      };
    }

    localStorage.setItem('bidforge_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticating(false);
    toast.success(`Sandbox bypass active! Logged in as ${loggedInUser.name}.`, { icon: '🛡️' });
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase sign out failed, clearing local storage anyway", err);
    }
    localStorage.removeItem('bidforge_user');
    setUser(null);
    toast.success("Successfully logged out from terminal session.");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isAuthenticating, login, logout, bypassToSandbox }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
