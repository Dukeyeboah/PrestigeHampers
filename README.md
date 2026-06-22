# Prestige Hampers

A full-stack e-commerce app for **Prestige Hampers** — premium gift hampers and treats. Customers browse products, save favourites, and place orders; admins manage inventory, orders, and analytics.

## 🎯 Purpose

Make it easy for wholesale clients to:
- Browse drugs and filter by category and stock availability
- Select quantities and place orders
- Track order history

Make it easy for pharmacy staff to:
- Manage inventory (add, edit, delete products, update stock)
- Confirm stock availability
- Track and manage orders through various statuses
- Monitor staff activity logs

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: TailwindCSS + shadcn/ui components
- **Authentication**: Firebase Auth (email/password)
- **Database**: Firestore
- **Storage**: Firebase Storage (for product images)
- **Offline Support**: IndexedDB (via custom OfflineDB wrapper)
- **Package Manager**: pnpm

## ✨ Features

### Client User Features
- ✅ Login screen with demo mode support
- ✅ Drug category browsing
- ✅ Inventory browsing with search and filters (In Stock, Out of Stock, Recently Added)
- ✅ Product detail pages with price, stock, description, and quantity selection
- ✅ Shopping cart system
- ✅ Order placement flow
- ✅ Order history page
- ✅ Real-time notifications (order status updates)

### Pharmacy Admin Features
- ✅ Admin login with role-based access
- ✅ Dashboard (pending orders, active orders)
- ✅ Inventory management (add, edit, delete, update stock)
- ✅ Order management with status workflow:
  - `pending` → `checking_stock` → `pharmacy_confirmed` → `customer_confirmed` → `completed`
- ✅ Staff activity logs
- ✅ Role-based access control (admin vs staff)

### UI/UX
- ✅ Clean, minimalist paper aesthetic
- ✅ Simple and accessible for low-tech users
- ✅ Mobile-first responsive design
- ✅ Real-time stock badges (green = in stock, red = out of stock)
- ✅ Dark mode support

### Offline Mode
- ✅ IndexedDB integration for offline data storage
- ✅ App remains usable when offline
- ✅ Automatic sync when connection returns

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (package manager) - Install with `npm install -g pnpm`
- **Firebase account** (for production use)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd LeetoniaWholesale
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Firebase (Optional for Development)

The app can run in demo mode without Firebase credentials. For full functionality:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage
5. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
pnpm build
pnpm start
```

## 🎮 Demo Mode

The app includes a demo mode that works without Firebase setup. On the login page, you can use:
- **Client Demo**: Browse inventory and place orders
- **Admin Demo**: Access admin dashboard and manage inventory

## 📁 Project Structure

```
LeetoniaWholesale/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── cart/              # Shopping cart
│   ├── inventory/         # Product inventory (client view)
│   ├── login/             # Authentication
│   ├── orders/            # Order management
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── auth-context.tsx  # Authentication context
│   ├── db.ts             # OfflineDB wrapper
│   ├── firebase.ts       # Firebase initialization
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🗄️ Database Structure (Firestore)

- `/users` - User profiles (admin, client)
- `/inventory` - Product catalog
- `/orders` - Customer orders
- `/logs` - Staff activity logs

## 🔐 Authentication & Authorization

- **Client Role**: Can browse inventory, add to cart, place orders, view order history
- **Admin Role**: Full access to inventory management, order management, and activity logs
- **Staff Role**: (Future implementation) Limited admin access

## 🎨 UI Guidelines

- Clean, minimalist design with paper aesthetic
- Simple and accessible for non-technical users
- Mobile-first responsive design
- Real-time stock status indicators
- Intuitive navigation and workflows

## 📝 Order Status Workflow

1. **pending** - Order placed by client
2. **checking_stock** - Pharmacy checking stock availability
3. **pharmacy_confirmed** - Pharmacy confirms order can be fulfilled
4. **customer_confirmed** - Customer confirms the order
5. **completed** - Order fulfilled and delivered
6. **cancelled** - Order cancelled (can occur at any stage)

## 🔄 Offline Mode

The app uses IndexedDB to store data locally, allowing:
- Browsing cached inventory when offline
- Adding items to cart offline
- Viewing order history offline
- Automatic sync when connection is restored

## 🚧 Future Enhancements

- [ ] Payment integration
- [ ] Staff role with limited permissions
- [ ] Advanced reporting and analytics
- [ ] Email/SMS notifications
- [ ] Barcode scanning for inventory
- [ ] Multi-location support
- [ ] Export functionality for reports

## 📄 License

Private - Leetonia Wholesale

## 👥 Support

For issues or questions, please contact the development team.

---

**Built for Prestige Hampers**

