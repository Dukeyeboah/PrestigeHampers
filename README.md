# Prestige Hampers

A full-stack e-commerce app for **Prestige Hampers** — premium gift hampers and treats. Customers browse hampers and products, save favourites, and place orders; admins manage inventory, orders, and analytics.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: TailwindCSS + shadcn/ui
- **Authentication**: Firebase Auth (Google, email, phone)
- **Database**: Firestore
- **Storage**: Firebase Storage + local `/public/images` assets
- **Offline Support**: IndexedDB (via PrestigeOfflineDB)
- **Package Manager**: npm / pnpm

## Features

### Customer
- Browse **hampers** and **individual products** with search and filters
- Save items for later (authenticated users)
- Shopping cart with quantity selection
- Account-required checkout (cash or MoMo)
- Order history tied to Firebase account

### Admin
- Passkey-protected admin portal (`/admin`)
- Manage **hampers** (catalog) and **products** (Firestore inventory)
- Order management with status workflow
- Analytics, invoices, and staff permissions

### Order status workflow
1. `pending` — order placed
2. `checking_stock` — shop checking availability
3. `shop_confirmed` — ready for customer verification
4. `customer_confirmed` — customer verified
5. `processing` — being fulfilled
6. `completed` — delivered
7. `cancelled`

> Legacy orders may still use `pharmacy_confirmed` in Firestore; the app maps this to **Shop Confirmed**.

## Setup

```bash
git clone https://github.com/Dukeyeboah/PrestigeHampers.git
cd PrestigeHampers
npm install
```

Create `.env.local` with your Firebase config (see `.env.example` pattern in docs). Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin setup
See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for passkey and admin access.

### Import sample products
1. Sign in at `/admin` with admin credentials
2. Click **Import 22 sample products** to seed Firestore inventory

Hampers are loaded from the catalog (`lib/hamper-catalog.ts`) and images in `public/images/hampers/`.

## Project structure

```
PrestigeHampers/
├── app/              # Pages (shop, cart, orders, admin)
├── components/       # UI components
├── hooks/            # React hooks
├── lib/              # Catalog, Firebase, helpers
├── public/images/    # Product & hamper images
└── scripts/          # Seed utilities
```

## Deploy

```bash
npm run build
npm start
```

Deploy Firestore rules, indexes, and storage rules:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## License

Private — Prestige Hampers
