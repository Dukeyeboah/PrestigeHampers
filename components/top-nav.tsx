'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
  ShoppingCart,
  ClipboardList,
  Package,
  LayoutDashboard,
  LogIn,
  LogOut,
  Home,
  Bookmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/hooks/use-cart';
import { LoginDialog } from '@/components/login-dialog';

export function TopNav() {
  const pathname = usePathname();
  const { user, isAdmin, isStaff, logout } = useAuth();
  const { cart } = useCart();
  const [showLogin, setShowLogin] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navRoutes = [
    { label: 'About', href: '/about', icon: Home },
    { label: 'Shop', href: '/products', icon: Package },
    { label: 'My Cart', href: '/cart', icon: ShoppingCart },
    { label: 'My Orders', href: '/orders', icon: ClipboardList, requiresAuth: true },
  ];

  // Saved stays in the hamburger menu only (not the desktop center nav)
  const menuOnlyRoutes = [
    { label: 'Saved', href: '/saved', icon: Bookmark },
  ];

  const adminRoutes = isAdmin
    ? [
        {
          label: 'Admin Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
        },
      ]
    : isStaff
      ? [
          {
            label: 'Staff Dashboard',
            href: '/staff',
            icon: LayoutDashboard,
          },
        ]
      : [];

  const menuRoutes = [
    ...navRoutes.filter((r) => !r.requiresAuth || user),
    ...menuOnlyRoutes,
    ...adminRoutes,
  ];

  return (
    <>
      <header className='editorial-nav'>
        <div className='announcement'>Christmas pre-orders are open · Thoughtful gifts, beautifully wrapped</div>
        <div className='editorial-nav-inner'>
          <nav className='desktop-links'><Link href='/products#sets'>Shop all</Link><Link href='/about'>About</Link><Link href='/about#contact'>Contact</Link></nav>
          <Link href='/' className='editorial-brand nav-brand'>
            <Image
              src='/images/Prestige_Logo.svg'
              alt='Prestige Hampers'
              width={32}
              height={40}
              className='h-7 w-auto md:h-8 object-contain'
              priority
              unoptimized
            />
            <span>Prestige<br/>Hampers</span>
          </Link>

          <div className='nav-search'><form action='/products'><input name='q' aria-label='Search hampers' placeholder='Search'/><button type='submit' className='sr-only'>Search</button></form></div>

          <div className='flex items-center gap-2 shrink-0'>
            <Link href='/cart' className='bag-link'>Bag ({cartCount})</Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='rounded-full h-9 w-9 border-neutral-200'
                >
                  <Menu className='h-4 w-4' />
                  <span className='sr-only'>Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56 rounded-xl'>
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {menuRoutes.map((route) => {
                  const Icon = route.icon;
                  const active =
                    route.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(route.href);
                  return (
                    <DropdownMenuItem asChild key={route.href}>
                      <Link
                        href={route.href}
                        className={`flex w-full items-center gap-2 ${active ? 'font-medium' : ''}`}
                      >
                        <Icon className='h-4 w-4' />
                        <span>{route.label}</span>
                        {route.href === '/cart' && cartCount > 0 && (
                          <Badge variant='secondary' className='ml-auto text-xs'>
                            {cartCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className='text-red-600 focus:text-red-600'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign out
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowLogin(true)}>
                    <LogIn className='mr-2 h-4 w-4' />
                    Sign in
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
