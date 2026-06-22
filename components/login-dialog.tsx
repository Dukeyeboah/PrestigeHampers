'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone, Chrome } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { User } from '@/types';
import { AdminPasskeyDialog } from '@/components/admin-passkey-dialog';
import { isAdminEmail } from '@/lib/admin-config';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function LoginDialog({
  open,
  onOpenChange,
  defaultMode = 'login',
}: LoginDialogProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<{
    confirm: (code: string) => Promise<{ user: unknown }>;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showAdminPasskeyDialog, setShowAdminPasskeyDialog] = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setVerificationCode('');
    setConfirmationResult(null);
  };

  const setupRecaptcha = () => {
    if (typeof window === 'undefined' || !auth) return null;
    const container = document.getElementById('auth-recaptcha-container');
    if (container) container.innerHTML = '';
    return new RecaptchaVerifier(auth, 'auth-recaptcha-container', {
      size: 'invisible',
    });
  };

  const ensureUserProfile = async (
    firebaseUser: {
      uid: string;
      email: string | null;
      displayName: string | null;
      photoURL: string | null;
      phoneNumber: string | null;
    },
    phoneNumber?: string,
    displayName?: string
  ) => {
    if (!db) return;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    const userEmail = firebaseUser.email || '';

    if (!userDoc.exists()) {
      const shouldBeAdmin = isAdminEmail(userEmail);
      const newUser: User = {
        id: firebaseUser.uid,
        email: userEmail,
        phone: phoneNumber || firebaseUser.phoneNumber || '',
        role: 'client',
        name: displayName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: Date.now(),
      };

      if (shouldBeAdmin) {
        await setDoc(userDocRef, newUser);
        setShowAdminPasskeyDialog(true);
        return;
      }
      await setDoc(userDocRef, newUser);
    } else if (isAdminEmail(userEmail) && userDoc.data().role !== 'admin') {
      setShowAdminPasskeyDialog(true);
      return;
    }

    onOpenChange(false);
    resetForm();
    router.refresh();
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    if (!auth) {
      setError('Authentication unavailable.');
      setLoading(false);
      return;
    }
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserProfile(result.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!auth || !db) {
      setError('Authentication unavailable.');
      setLoading(false);
      return;
    }
    try {
      const credential =
        authMode === 'signup'
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(credential.user, undefined, name);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : authMode === 'signup'
            ? 'Sign up failed.'
            : 'Sign in failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async () => {
    setError('');
    setPhoneLoading(true);
    if (!auth) {
      setError('Authentication unavailable.');
      setPhoneLoading(false);
      return;
    }
    try {
      const formatted = phone.startsWith('+')
        ? phone
        : `+233${phone.replace(/^0/, '')}`;
      const verifier = setupRecaptcha();
      if (!verifier) throw new Error('reCAPTCHA failed.');
      const confirmation = await signInWithPhoneNumber(
        auth,
        formatted,
        verifier
      );
      setConfirmationResult(confirmation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send code.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    setError('');
    setLoading(true);
    if (!confirmationResult) {
      setError('Send a verification code first.');
      setLoading(false);
      return;
    }
    try {
      const result = await confirmationResult.confirm(verificationCode);
      await ensureUserProfile(result.user as Parameters<typeof ensureUserProfile>[0], phone);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className='sm:max-w-md rounded-2xl'>
          <DialogHeader className='text-center sm:text-center'>
            <DialogTitle className='text-xl'>
              {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
            </DialogTitle>
            <DialogDescription>
              Save favourites, track orders, and get updates from Prestige Hampers.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            className='w-full h-11 rounded-full'
            variant='outline'
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Chrome className='mr-2 h-4 w-4' />
            )}
            Continue with Google
          </Button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>or</span>
            </div>
          </div>

          <Tabs defaultValue='email' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='email'>
                <Mail className='h-4 w-4 mr-1.5' />
                Email
              </TabsTrigger>
              <TabsTrigger value='phone'>
                <Phone className='h-4 w-4 mr-1.5' />
                Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value='email' className='space-y-4 mt-4'>
              <form onSubmit={handleEmailSubmit} className='space-y-3'>
                {authMode === 'signup' && (
                  <div className='space-y-1.5'>
                    <Label htmlFor='auth-name'>Name</Label>
                    <Input
                      id='auth-name'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder='Your name'
                      className='rounded-xl'
                    />
                  </div>
                )}
                <div className='space-y-1.5'>
                  <Label htmlFor='auth-email'>Email</Label>
                  <Input
                    id='auth-email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='rounded-xl'
                  />
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='auth-password'>Password</Label>
                  <PasswordInput
                    id='auth-password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className='rounded-xl'
                  />
                </div>
                <Button type='submit' className='w-full rounded-full h-11' disabled={loading}>
                  {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {authMode === 'signup' ? 'Sign up' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='phone' className='space-y-4 mt-4'>
              <div id='auth-recaptcha-container' className='hidden' />
              {!confirmationResult ? (
                <>
                  <div className='space-y-1.5'>
                    <Label htmlFor='auth-phone'>Phone (Ghana)</Label>
                    <Input
                      id='auth-phone'
                      type='tel'
                      placeholder='0244123456'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className='rounded-xl'
                    />
                  </div>
                  <Button
                    className='w-full rounded-full h-11'
                    onClick={handlePhoneSend}
                    disabled={phoneLoading || !phone}
                  >
                    {phoneLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Send code
                  </Button>
                </>
              ) : (
                <>
                  <div className='space-y-1.5'>
                    <Label htmlFor='auth-code'>Verification code</Label>
                    <Input
                      id='auth-code'
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className='rounded-xl'
                    />
                  </div>
                  <Button
                    className='w-full rounded-full h-11'
                    onClick={handlePhoneVerify}
                    disabled={loading || !verificationCode}
                  >
                    {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Verify
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          <p className='text-center text-sm text-muted-foreground'>
            {authMode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type='button'
                  className='underline font-medium text-foreground'
                  onClick={() => setAuthMode('signup')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type='button'
                  className='underline font-medium text-foreground'
                  onClick={() => setAuthMode('login')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </DialogContent>
      </Dialog>

      {showAdminPasskeyDialog && (
        <AdminPasskeyDialog
          open={showAdminPasskeyDialog}
          onSuccess={() => {
            setShowAdminPasskeyDialog(false);
            onOpenChange(false);
            router.refresh();
          }}
          onCancel={() => setShowAdminPasskeyDialog(false)}
        />
      )}
    </>
  );
}
