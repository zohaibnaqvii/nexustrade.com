import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  demoBalance: number;
  realBalance: number;
  isDemo: boolean;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isDemo: boolean;
  balance: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: (toDemo: boolean) => Promise<void>;
  updateBalance: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      // Listen to user data changes
      const userRef = doc(db, 'users', firebaseUser.uid);
      const unsubUser = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data() as UserData);
        }
        setLoading(false);
      });

      return () => unsubUser();
    });

    return () => unsubAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document
    const userRef = doc(db, 'users', result.user.uid);
    const newUserData: UserData = {
      uid: result.user.uid,
      email: email,
      demoBalance: 10000,
      realBalance: 0,
      isDemo: true,
      kycStatus: 'none',
      createdAt: new Date()
    };
    
    await setDoc(userRef, newUserData);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const switchAccount = async (toDemo: boolean) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { isDemo: toDemo });
  };

  const updateBalance = async (amount: number) => {
    if (!user || !userData) return;
    const userRef = doc(db, 'users', user.uid);
    
    if (userData.isDemo) {
      const newBalance = userData.demoBalance + amount;
      // Auto-refill demo balance if it goes to 0 or below
      if (newBalance <= 0) {
        await updateDoc(userRef, { demoBalance: 10000 });
      } else {
        await updateDoc(userRef, { demoBalance: newBalance });
      }
    } else {
      // For live account, prevent negative balance
      const newBalance = Math.max(0, userData.realBalance + amount);
      await updateDoc(userRef, { realBalance: newBalance });
    }
  };

  const isDemo = userData?.isDemo ?? true;
  const balance = isDemo ? (userData?.demoBalance ?? 10000) : (userData?.realBalance ?? 0);

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      isDemo,
      balance,
      login,
      signup,
      logout,
      switchAccount,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};
