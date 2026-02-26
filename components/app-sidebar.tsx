'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSidebar } from '@/contexts/sidebar-context';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MapPin,
  Tag,
  Grid3x3,
  FileText,
  Package,
  ShoppingCart,
  UserCog,
  Settings,
  XCircle,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'FIELD_AGENT', 'CUSTOMER'] },
  { href: '/vendors', label: 'Vendors', icon: Building2, roles: ['SYSTEM_ADMIN'] },
  {
    href: '/users',
    label: 'Users',
    icon: Users,
    roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'FIELD_AGENT'],
    children: [
      { href: '/users/customers', label: 'Customers' },
      { href: '/users/field-agents', label: 'Field Agents' },
      { href: '/users/sub-admins', label: 'Sub Admins' },
      { href: '/users/super-admins', label: 'Super Admins' },
      { href: '/users/system-admins', label: 'System Administrator' },
    ],
  },
  { href: '/track-agents', label: 'Track Agents', icon: MapPin, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/service-leads', label: 'Service Leads', icon: FileText, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'FIELD_AGENT', 'CUSTOMER'] },
  { href: '/brands', label: 'Brands', icon: Tag, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/categories', label: 'Category', icon: Grid3x3, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/quotations', label: 'Quotations', icon: FileText, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'FIELD_AGENT', 'CUSTOMER'] },
  { href: '/products', label: 'Products', icon: Package, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'] },
  { href: '/orders', label: 'Orders', icon: ShoppingCart, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'FIELD_AGENT', 'CUSTOMER'] },
  {
    href: '/cms',
    label: 'CMS',
    icon: Settings,
    roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN'],
    children: [
      { href: '/cms/pages', label: 'Pages' },
      { href: '/cms/faq', label: 'FAQ' },
      { href: '/cms/banners', label: 'Banners' },
      { href: '/cms/top-banners', label: 'Top Banners' },
    ],
  },
  { href: '/cancel-reasons', label: 'Reasons', icon: XCircle, roles: ['SYSTEM_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN'] },
];

export function AppSidebar() {
  const path = usePathname();
  const { user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';
  const vendorName = user?.vendor?.companyName || user?.vendor?.name || 'SunSpark';
  const vendorLogo = user?.vendor?.logo;

  return (
    <aside
      className={cn(
        'hidden flex-col border-r border-border bg-card transition-all duration-300 md:flex',
        isCollapsed ? 'w-[72px] items-center px-2 py-4' : 'w-64 p-4'
      )}
    >
      <div className={cn('mb-6 flex items-center', isCollapsed ? 'justify-center w-full flex-col gap-4' : 'justify-between w-full')}>
        <Link href="/" className={cn('flex items-center gap-2', isCollapsed && 'justify-center')}>
          {vendorLogo ? (
            <img src={vendorLogo} alt={vendorName} className="h-8 w-8 rounded" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <span className="text-sm font-bold">SS</span>
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="truncate text-sm font-semibold text-foreground" title={vendorName}>
                {vendorName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {isSystemAdmin ? 'System Admin' : 'Admin Portal'}
              </div>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('h-8 w-8 shrink-0 text-muted-foreground hover:bg-muted', isCollapsed && 'mt-2')}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && user && (
        <div className="mb-6 px-2 text-xs text-muted-foreground truncate" title={user.name || user.email}>
          {user.name || user.email}
        </div>
      )}

      <nav className={cn('flex flex-1 flex-col overflow-y-auto overflow-x-hidden', isCollapsed ? 'gap-2 w-full items-center' : 'gap-1')}>
        {navItems.map((item) => {
          if (user && item.roles && !item.roles.includes(user.role)) return null;

          const isActive = path === item.href || (item.children && item.children.some((c) => path === c.href));
          const Icon = item.icon;

          return (
            <div key={item.href} className={cn("w-full", isCollapsed && "flex justify-center")}>
              <Link
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-md transition-colors w-full group',
                  isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2 text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>

              {item.children && isActive && !isCollapsed && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = path === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-xs transition-colors truncate',
                          isChildActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                        title={child.label}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
