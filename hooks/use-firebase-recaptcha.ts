'use client';

import { useCallback, useEffect, useRef } from 'react';
import { RecaptchaVerifier, type Auth } from 'firebase/auth';

/**
 * Manages a single invisible reCAPTCHA instance for Firebase phone auth.
 * Initialize when `enabled` is true (e.g. phone form visible); clears on unmount/disable.
 */
export function useFirebaseRecaptcha(
  auth: Auth | null | undefined,
  containerId: string,
  enabled: boolean,
  onExpired?: () => void
) {
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const readyRef = useRef(false);

  const clearRecaptcha = useCallback(() => {
    readyRef.current = false;
    if (verifierRef.current) {
      try {
        verifierRef.current.clear();
      } catch {
        // Verifier may already be cleared
      }
      verifierRef.current = null;
    }
    const container = document.getElementById(containerId);
    if (container) {
      container.replaceChildren();
    }
  }, [containerId]);

  useEffect(() => {
    if (!enabled || !auth || typeof window === 'undefined') {
      clearRecaptcha();
      return;
    }

    let cancelled = false;

    const init = async () => {
      clearRecaptcha();

      // Allow dialog content to mount before rendering reCAPTCHA
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (cancelled) return;

      const container = document.getElementById(containerId);
      if (!container) return;

      try {
        const verifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {
            readyRef.current = true;
          },
          'expired-callback': () => {
            readyRef.current = false;
            clearRecaptcha();
            onExpired?.();
          },
        });

        await verifier.render();
        if (cancelled) {
          try {
            verifier.clear();
          } catch {
            // ignore
          }
          return;
        }

        verifierRef.current = verifier;
        readyRef.current = true;
      } catch (error) {
        console.error('reCAPTCHA init failed:', error);
        readyRef.current = false;
      }
    };

    void init();

    return () => {
      cancelled = true;
      clearRecaptcha();
    };
  }, [auth, containerId, enabled, clearRecaptcha, onExpired]);

  const getVerifier = useCallback(async (): Promise<RecaptchaVerifier> => {
    if (!auth) {
      throw new Error('Authentication is not available.');
    }

    if (verifierRef.current && readyRef.current) {
      return verifierRef.current;
    }

    clearRecaptcha();

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error('reCAPTCHA container not found. Please try again.');
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        readyRef.current = true;
      },
      'expired-callback': () => {
        readyRef.current = false;
        clearRecaptcha();
        onExpired?.();
      },
    });

    await verifier.render();
    verifierRef.current = verifier;
    readyRef.current = true;
    return verifier;
  }, [auth, containerId, clearRecaptcha, onExpired]);

  return { getVerifier, clearRecaptcha };
}
