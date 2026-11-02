'use client';

import { useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { formatGhanaPhone, isValidGhanaPhone } from '@/lib/ghana-phone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CompleteProfileDialog() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const needsProfile =
    !!user &&
    user.role === 'client' &&
    (user.profileComplete === false || !user.name?.trim());

  useEffect(() => {
    if (authLoading || !user) {
      setOpen(false);
      return;
    }
    if (needsProfile) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setError('');
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [authLoading, user, needsProfile]);

  const handlePhoneBlur = () => {
    if (!phone.trim()) return;
    setPhone(formatGhanaPhone(phone));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter your name — we need it to complete your profile.');
      return;
    }

    const trimmedPhone = phone.trim() ? formatGhanaPhone(phone) : '';
    if (trimmedPhone && !isValidGhanaPhone(trimmedPhone)) {
      setError('Enter a valid Ghana phone number (e.g. 0244123456).');
      return;
    }

    if (!db || !user) {
      setError('Unable to save right now. Please try again.');
      return;
    }

    setSaving(true);
    try {
      const updates: Record<string, unknown> = {
        name: trimmedName,
        email: email.trim(),
        phone: trimmedPhone,
        address: address.trim(),
        profileComplete: true,
        updatedAt: Date.now(),
      };

      await setDoc(doc(db, 'users', user.id), updates, { merge: true });
      await refreshUser();
      setOpen(false);
      toast.success('Profile saved. Welcome!');
    } catch (err) {
      console.error('Profile save error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to save profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!needsProfile && !open) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Must save the form before dismissing (name required)
        if (!next) return;
        setOpen(next);
      }}
    >
      <DialogContent
        className='sm:max-w-md rounded-2xl [&>button]:hidden'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Complete your profile</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself so we can contact you about orders.
            Name is required — a phone number helps us reach you quickly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className='space-y-3'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-1.5'>
            <Label htmlFor='profile-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='profile-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Your full name'
              className='rounded-xl'
              required
              autoComplete='name'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='profile-phone'>Phone number</Label>
            <Input
              id='profile-phone'
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handlePhoneBlur}
              placeholder='0244123456'
              className='rounded-xl'
              autoComplete='tel'
            />
            <p className='text-xs text-muted-foreground'>
              Recommended — so we can confirm your order on WhatsApp or call.
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='profile-email'>Email</Label>
            <Input
              id='profile-email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              className='rounded-xl'
              autoComplete='email'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='profile-address'>
              Address / location{' '}
              <span className='text-muted-foreground font-normal'>
                (optional)
              </span>
            </Label>
            <Input
              id='profile-address'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder='Area, city, or delivery address'
              className='rounded-xl'
              autoComplete='street-address'
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='submit'
              className='w-full rounded-full h-11'
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving…
                </>
              ) : (
                'Save & continue'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
