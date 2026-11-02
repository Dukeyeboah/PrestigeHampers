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
    { label: 'Home', href: '/', icon: Home },
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

  // Desktop center nav: Home, Shop, My Cart only
  const desktopNavRoutes = navRoutes.filter((r) =>
    ['/', '/products', '/cart'].includes(r.href)
  );

  const menuRoutes = [
    ...navRoutes.filter((r) => !r.requiresAuth || user),
    ...menuOnlyRoutes,
    ...adminRoutes,
  ];

  return (
    <>
      <header className='fixed top-0 inset-x-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md safe-area-inset-top'>
        <div className='mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-8'>
          <Link href='/' className='flex items-center gap-2 shrink-0'>
            <Image
              src='/images/Prestige_Logo.svg'
              alt='Prestige Hampers'
              width={32}
              height={40}
              className='h-7 w-auto md:h-8 object-contain'
              priority
              unoptimized
            />
            <span className='text-base md:text-lg font-semibold tracking-tight text-neutral-900'>
              Prestige Hampers
            </span>
          </Link>

          {/* Desktop text nav only */}
          <nav className='hidden md:flex flex-1 items-center justify-center gap-1'>
            {desktopNavRoutes.map((route) => {
              const active =
                route.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    active
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {route.label}
                </Link>
              );
            })}
          </nav>

          <div className='flex-1 md:flex-none' />

          <div className='flex items-center gap-2 shrink-0'>
            <Link href='/cart' className='relative'>
              <Button
                variant={pathname === '/cart' ? 'default' : 'outline'}
                size='icon'
                className='rounded-full h-9 w-9'
              >
                <ShoppingCart className='h-4 w-4' />
                <span className='sr-only'>My Cart</span>
              </Button>
              {cartCount > 0 && (
                <Badge className='absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px] rounded-full pointer-events-none'>
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
            </Link>

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
