'use client';

import { useAuth } from '@/contexts/auth-context';
import { VendorSwitcher } from '@/components/vendor-switcher';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator, 
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { UserCircle, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const mainNav = [
  { href: '/', label: 'Dashboard' },
  { href: '/customers', label: 'Customers' },
  { href: '/field-agents', label: 'Field Agents' },
  { href: '/products', label: 'Products' },
  { href: '/service-leads', label: 'Service Leads' },
  { href: '/quotations', label: 'Quotations' },
  { href: '/orders', label: 'Orders' },
];

export function TopHeader() {
  const { user, logout } = useAuth();
  const path = usePathname();

  // Get user initials for avatar fallback
  const initials = user?.name 
    ? user.name.substring(0, 2).toUpperCase() 
    : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'U');

  return (
    <header className="flex h-14 items-center justify-between px-4 py-2 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {mainNav.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={path === item.href ? 'bg-primary/10 text-primary w-full' : 'w-full'}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Brand */}
        <Link href="/" className="text-lg font-semibold text-foreground md:hidden">
          SunSpark
        </Link>

        {/* Desktop Vendor Switcher (only rendered if user is SYSTEM_ADMIN due to its internal logic) */}
        <div className="hidden md:block">
          <VendorSwitcher />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Mobile Vendor Switcher (only rendered if user is SYSTEM_ADMIN) */}
        <div className="md:hidden">
           <VendorSwitcher />
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border bg-muted hover:bg-muted/80 p-0 overflow-hidden">
                <span className="flex h-full w-full items-center justify-center font-medium text-muted-foreground text-sm">
                  {initials}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex items-center w-full">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
