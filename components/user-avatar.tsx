'use client';

import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string | null;
  email?: string | null;
  className?: string;
  fallbackClassName?: string;
  iconClassName?: string;
}

/**
 * Profile avatar — uses photoURL when present, otherwise a generic User icon
 * (for phone / email-password accounts without a Google photo).
 */
export function UserAvatar({
  photoURL,
  name,
  email,
  className,
  fallbackClassName,
  iconClassName,
}: UserAvatarProps) {
  const alt = name || email || 'User';
  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() ||
    email?.trim()?.charAt(0)?.toUpperCase() ||
    '';

  return (
    <Avatar className={className}>
      {photoURL ? <AvatarImage src={photoURL} alt={alt} /> : null}
      <AvatarFallback
        className={cn(
          'bg-neutral-100 text-neutral-600',
          fallbackClassName
        )}
      >
        {initial ? (
          <span className='font-medium'>{initial}</span>
        ) : (
          <User className={cn('h-4 w-4', iconClassName)} aria-hidden />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
