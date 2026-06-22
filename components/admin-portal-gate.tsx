'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { verifyPortalPasskey, ADMIN_PASSKEY_SESSION_KEY } from '@/lib/admin-config';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Chrome, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types';

interface AdminPortalGateProps {
  onSuccess: () => void;
}

export function AdminPortalGate({ onSuccess }: AdminPortalGateProps) {
  const [passkey, setPasskey] = useState('');
  const [passkeyVerified, setPasskeyVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verifyPortalPasskey(passkey)) {
      sessionStorage.setItem(ADMIN_PASSKEY_SESSION_KEY, 'true');
      setPasskeyVerified(true);
      toast.success('Passkey accepted');
    } else {
      setError('Invalid passkey. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    if (!auth || !db) {
      setError('Authentication service unavailable.');
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      const adminUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: 'admin',
        name: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        phone: firebaseUser.phoneNumber || '',
        createdAt: userDoc.exists()
          ? (userDoc.data() as User).createdAt
          : Date.now(),
      };

      await setDoc(userDocRef, adminUser, { merge: true });

      sessionStorage.removeItem(ADMIN_PASSKEY_SESSION_KEY);
      toast.success('Welcome to the admin dashboard');
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in with Google.';
      if (message.includes('popup-closed')) {
        setError('Sign-in was cancelled.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-white p-4'>
      <Card className='w-full max-w-md border-neutral-200 shadow-sm rounded-2xl'>
        <CardHeader className='text-center space-y-2'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100'>
            <Lock className='h-5 w-5 text-neutral-700' />
          </div>
          <CardTitle className='text-2xl font-semibold tracking-tight'>
            Prestige Admin
          </CardTitle>
          <CardDescription>
            {passkeyVerified
              ? 'Sign in with Google to access the admin dashboard.'
              : 'Enter your admin passkey to continue.'}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!passkeyVerified ? (
            <form onSubmit={handlePasskeySubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='admin-passkey'>Admin Passkey</Label>
                <PasswordInput
                  id='admin-passkey'
                  placeholder='Enter passkey'
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  required
                  autoFocus
                  className='rounded-xl'
                />
              </div>
              <Button type='submit' className='w-full rounded-full h-11'>
                Continue
              </Button>
            </form>
          ) : (
            <div className='space-y-4'>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className='w-full rounded-full h-11'
                variant='outline'
              >
                {loading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Chrome className='mr-2 h-4 w-4' />
                )}
                Sign in with Google
              </Button>
              <Button
                variant='ghost'
                className='w-full text-muted-foreground'
                onClick={() => {
                  setPasskeyVerified(false);
                  sessionStorage.removeItem(ADMIN_PASSKEY_SESSION_KEY);
                }}
              >
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
