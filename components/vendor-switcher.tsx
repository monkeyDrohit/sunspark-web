'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { fetchVendors } from '@/lib/vendors';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

function VendorSwitcherContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<Awaited<ReturnType<typeof fetchVendors>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'SYSTEM_ADMIN') {
      fetchVendors()
        .then(setVendors)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'SYSTEM_ADMIN' || loading) {
    return null;
  }

  const currentVendorId = searchParams.get('vendorId') || 'all';

  function handleVendorChange(vendorId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (vendorId === 'all') {
      params.delete('vendorId');
    } else {
      params.set('vendorId', vendorId);
    }
    const newUrl = params.toString() 
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.push(newUrl);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground hidden sm:block" />
      <Select value={currentVendorId} onValueChange={handleVendorChange}>
        <SelectTrigger className="w-[160px] sm:w-[200px] h-8 text-xs sm:text-sm">
          <SelectValue placeholder="Select vendor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vendors</SelectItem>
          {vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id}>
              {vendor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function VendorSwitcher() {
  return (
    <Suspense fallback={null}>
      <VendorSwitcherContent />
    </Suspense>
  );
}
