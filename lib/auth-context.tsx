'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin-config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  viewMode: 'admin' | 'client' | 'staff';
  setViewMode: (mode: 'admin' | 'client' | 'staff') => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (
    permission: keyof import('@/types').StaffPermissions
  ) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isStaff: false,
  viewMode: 'client',
  setViewMode: () => {},
  logout: async () => {},
  refreshUser: async () => {},
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'client' | 'staff'>(
    'client'
  );
  const router = useRouter();

  const applyRoleView = (role: User['role']) => {
    if (role === 'admin') setViewMode('admin');
    else if (role === 'staff') setViewMode('staff');
    else setViewMode('client');
  };

  const refreshUser = useCallback(async () => {
    if (!auth?.currentUser || !db) return;
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (snap.exists()) {
      const data = snap.data() as User;
      setUser({
        ...data,
        photoURL: auth.currentUser.photoURL || data.photoURL,
      });
    }
  }, []);

  useEffect(() => {
    if (!auth || !db) {
      console.error(
        'Firebase not initialized. Please check your .env.local configuration.'
      );
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            const updatedUser = {
              ...userData,
              photoURL: firebaseUser.photoURL || userData.photoURL,
            };
            setUser(updatedUser);
            applyRoleView(updatedUser.role);
          } else {
            const email = firebaseUser.email || '';
            const shouldBeAdmin = isAdminEmail(email);

            const newUser: User = {
              id: firebaseUser.uid,
              email: email,
              role: shouldBeAdmin ? 'admin' : 'client',
              name: firebaseUser.displayName || '',
              phone: firebaseUser.phoneNumber || '',
              profileComplete: false,
              createdAt: Date.now(),
              ...(firebaseUser.photoURL
                ? { photoURL: firebaseUser.photoURL }
                : {}),
            };

            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            } catch (error) {
              console.error('Error creating user profile:', error);
            }

            setUser(newUser);
            applyRoleView(newUser.role);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'client',
            name: firebaseUser.displayName || '',
            phone: firebaseUser.phoneNumber || '',
            profileComplete: false,
            createdAt: Date.now(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setViewMode('client');
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      setUser(null);
      setViewMode('client');
      router.push('/');
    }
  };

  const hasPermission = (
    permission: keyof import('@/types').StaffPermissions
  ): boolean => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'staff' && user.permissions) {
      return user.permissions[permission] === true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
        viewMode:
          user?.role === 'admin'
            ? viewMode
            : user?.role === 'staff'
              ? 'staff'
              : 'client',
        setViewMode: (mode) => {
          if (user?.role === 'admin') {
            setViewMode(mode);
            if (mode === 'admin') {
              router.push('/admin');
            } else {
              router.push('/products');
            }
          }
        },
        logout,
        refreshUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
