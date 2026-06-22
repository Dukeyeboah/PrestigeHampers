# Admin Setup Guide — Prestige Hampers

## Admin portal passkey (`/admin`)

The passkey you enter on the **Admin** login screen is defined here:

**File:** `lib/admin-config.ts`

```typescript
export const ADMIN_PORTAL_PASSKEY =
  process.env.NEXT_PUBLIC_ADMIN_PORTAL_PASSKEY || 'Prestige!!';
```

- **Default passkey:** `Prestige!!`
- **Optional override:** add to `.env.local`:
  ```env
  NEXT_PUBLIC_ADMIN_PORTAL_PASSKEY=YourCustomPasskey
  ```

After entering the passkey, sign in with **Google** to access the admin dashboard.

---

## Setting up admin users

### Method 1: `/admin` portal (recommended)

1. Go to `/admin`
2. Enter passkey: `Prestige!!` (unless you changed it in `lib/admin-config.ts`)
3. Sign in with Google — your account is granted `admin` role in Firestore

### Method 2: Email whitelist + per-user passkey (legacy login flow)

Edit `lib/admin-config.ts` → `ADMIN_WHITELIST`:

```typescript
export const ADMIN_WHITELIST: AdminConfig[] = [
  {
    email: 'you@example.com',
    passkey: 'YourPersonalPasskey',
    name: 'Your Name',
  },
];
```

When a whitelisted email signs in via `/login`, they are prompted for their personal passkey.

### Method 3: Manual Firestore update

1. Firebase Console → Firestore → `users` collection
2. Open the user document → set `role` to `"admin"` → Save

---

## Admin features

- **Import sample products** — Manage Inventory → Import 22 sample products
- **Manage inventory** — add, edit, hide, delete products with images
- **Orders & analytics** — view orders, update status, revenue stats
- **View toggle** (sidebar) — switch between admin and client views

---

## Security notes

- Change the default passkey before going to production
- Prefer `NEXT_PUBLIC_ADMIN_PORTAL_PASSKEY` in `.env.local` (never commit secrets you care about)
- Publish `firestore.rules` and `storage.rules` from this repo after changes

---

## Firestore index for orders

Create composite index on `orders`:
- `userId` (Ascending)
- `createdAt` (Descending)

Firebase will provide a link in the console if the index is missing.
