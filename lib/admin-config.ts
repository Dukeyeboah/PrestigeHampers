/**
 * Admin Configuration
 *
 * Portal passkey: required at /admin before Google sign-in.
 * Whitelist passkeys: optional per-email passkeys for legacy login flow.
 */

export const ADMIN_PASSKEY_SESSION_KEY = 'prestige_admin_passkey_verified';

/** Passkey for /admin portal — override via NEXT_PUBLIC_ADMIN_PORTAL_PASSKEY in .env.local */
export const ADMIN_PORTAL_PASSKEY =
  process.env.NEXT_PUBLIC_ADMIN_PORTAL_PASSKEY || 'Prestige!!';

export function verifyPortalPasskey(passkey: string): boolean {
  return passkey === ADMIN_PORTAL_PASSKEY;
}

export interface AdminConfig {
  email: string;
  passkey: string;
  name?: string;
}

// Admin email whitelist with passkeys
// In production, consider storing this in Firestore or environment variables
export const ADMIN_WHITELIST: AdminConfig[] = [
  { email: 'dkyeboah1@gmail.com', passkey: 'M@trix', name: 'Duke Yeboah' },
  {
    email: 'judithbanquist@gmail.com',
    passkey: '3mpre$$',
    name: 'Nana Afrakuma',
  },

  // Example:
  // { email: "admin@prestigehampers.com", passkey: "Prestige!!", name: "Store Manager" },
];

/**
 * Check if an email is in the admin whitelist
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_WHITELIST.some(
    (admin) => admin.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Verify admin passkey for an email
 */
export function verifyAdminPasskey(email: string, passkey: string): boolean {
  const admin = ADMIN_WHITELIST.find(
    (a) =>
      a.email.toLowerCase() === email.toLowerCase() && a.passkey === passkey
  );
  return !!admin;
}

/**
 * Get admin config by email
 */
export function getAdminConfig(email: string): AdminConfig | undefined {
  return ADMIN_WHITELIST.find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  );
}
