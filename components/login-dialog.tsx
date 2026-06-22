'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  type ConfirmationResult,
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
import { Loader2, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleIcon } from '@/components/google-icon';
import { useFirebaseRecaptcha } from '@/hooks/use-firebase-recaptcha';
import type { User } from '@/types';
import { AdminPasskeyDialog } from '@/components/admin-passkey-dialog';
import { isAdminEmail } from '@/lib/admin-config';

const RECAPTCHA_CONTAINER_ID = 'auth-recaptcha-container';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

type AltAuthMethod = 'email' | 'phone' | null;

function formatGhanaPhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.startsWith('233')) return `+${trimmed}`;
  if (trimmed.startsWith('0')) return `+233${trimmed.slice(1)}`;
  return `+233${trimmed}`;
}

function isValidGhanaPhone(raw: string): boolean {
  return /^\+233[0-9]{9}$/.test(formatGhanaPhone(raw));
}

export function LoginDialog({
  open,
  onOpenChange,
  defaultMode = 'login',
}: LoginDialogProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(defaultMode);
  const [altMethod, setAltMethod] = useState<AltAuthMethod>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [showAdminPasskeyDialog, setShowAdminPasskeyDialog] = useState(false);
  const router = useRouter();

  const handleRecaptchaExpired = useCallback(() => {
    setError('Verification expired. Please send the code again.');
    setConfirmationResult(null);
  }, []);

  const phoneRecaptchaEnabled = open && altMethod === 'phone';
  const { getVerifier, clearRecaptcha } = useFirebaseRecaptcha(
    auth,
    RECAPTCHA_CONTAINER_ID,
    phoneRecaptchaEnabled,
    handleRecaptchaExpired
  );

  useEffect(() => {
    if (open) setAuthMode(defaultMode);
  }, [open, defaultMode]);

  const resetForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setVerificationCode('');
    setConfirmationResult(null);
    setAltMethod(null);
    clearRecaptcha();
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
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled.');
      } else {
        setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      }
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
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!isValidGhanaPhone(phone)) {
      setError('Enter a valid Ghana number (e.g. 0244123456).');
      return;
    }

    setPhoneLoading(true);
    if (!auth) {
      setError('Authentication unavailable.');
      setPhoneLoading(false);
      return;
    }

    try {
      const formatted = formatGhanaPhone(phone);
      const verifier = await getVerifier();
      const confirmation = await signInWithPhoneNumber(
        auth,
        formatted,
        verifier
      );
      setConfirmationResult(confirmation);
      setError('');
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait and try again.');
      } else if (code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA verification failed. Please try again.');
        clearRecaptcha();
      } else {
        setError(err instanceof Error ? err.message : 'Failed to send code.');
      }
      clearRecaptcha();
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
      await ensureUserProfile(
        result.user,
        formatGhanaPhone(phone)
      );
    } catch (err: unknown) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (code === 'auth/invalid-verification-code') {
        setError('Invalid code. Please try again.');
      } else if (code === 'auth/code-expired') {
        setError('Code expired. Please request a new one.');
        setConfirmationResult(null);
      } else {
        setError(err instanceof Error ? err.message : 'Verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectAltMethod = (method: 'email' | 'phone') => {
    setError('');
    setConfirmationResult(null);
    setVerificationCode('');
    if (altMethod === method) {
      setAltMethod(null);
      clearRecaptcha();
      return;
    }
    setAltMethod(method);
    if (method !== 'phone') {
      clearRecaptcha();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) {
            resetForm();
            setAuthMode(defaultMode);
          }
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
            type='button'
            className='w-full h-11 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-sm border-0'
            onClick={handleGoogle}
            disabled={loading || phoneLoading}
          >
            {loading ? (
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            ) : (
              <span className='mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white'>
                <GoogleIcon className='h-4 w-4' />
              </span>
            )}
            Continue with Google
          </Button>

          <div className='flex gap-2'>
            <Button
              type='button'
              variant={altMethod === 'email' ? 'default' : 'outline'}
              className='flex-1 rounded-full h-10'
              onClick={() => selectAltMethod('email')}
            >
              <Mail className='h-4 w-4 mr-1.5' />
              Email
            </Button>
            <Button
              type='button'
              variant={altMethod === 'phone' ? 'default' : 'outline'}
              className='flex-1 rounded-full h-10'
              onClick={() => selectAltMethod('phone')}
            >
              <Phone className='h-4 w-4 mr-1.5' />
              Phone
            </Button>
          </div>

          {altMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className='space-y-3 pt-1'>
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
                  autoComplete='email'
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
                  autoComplete={
                    authMode === 'signup' ? 'new-password' : 'current-password'
                  }
                />
              </div>
              <Button
                type='submit'
                className='w-full rounded-full h-11'
                disabled={loading}
              >
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {authMode === 'signup' ? 'Sign up' : 'Sign in'}
              </Button>
            </form>
          )}

          {altMethod === 'phone' && (
            <div className='space-y-3 pt-1'>
              {/* Must stay in DOM (not display:none) for Firebase invisible reCAPTCHA */}
              <div
                id={RECAPTCHA_CONTAINER_ID}
                className='sr-only'
                aria-hidden='true'
              />

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
                      autoComplete='tel'
                    />
                  </div>
                  <Button
                    type='button'
                    className='w-full rounded-full h-11'
                    onClick={handlePhoneSend}
                    disabled={phoneLoading || !phone.trim()}
                  >
                    {phoneLoading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Send verification code
                  </Button>
                </>
              ) : (
                <>
                  <p className='text-sm text-muted-foreground text-center'>
                    Code sent to {formatGhanaPhone(phone)}
                  </p>
                  <div className='space-y-1.5'>
                    <Label htmlFor='auth-code'>Verification code</Label>
                    <Input
                      id='auth-code'
                      inputMode='numeric'
                      autoComplete='one-time-code'
                      placeholder='6-digit code'
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className='rounded-xl text-center tracking-widest'
                      maxLength={6}
                    />
                  </div>
                  <Button
                    type='button'
                    className='w-full rounded-full h-11'
                    onClick={handlePhoneVerify}
                    disabled={loading || verificationCode.length < 6}
                  >
                    {loading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Verify &amp; continue
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    className='w-full rounded-full text-sm'
                    onClick={() => {
                      setConfirmationResult(null);
                      setVerificationCode('');
                    }}
                  >
                    Use a different number
                  </Button>
                </>
              )}
            </div>
          )}

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
