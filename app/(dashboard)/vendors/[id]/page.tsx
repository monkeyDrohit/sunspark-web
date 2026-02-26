'use client';

import { useState, useEffect, use } from 'react';
import { fetchVendor } from '@/lib/vendors';
import { fetchActivityLogs } from '@/lib/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Pencil, Building2, Calendar, Globe } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ActivitySidebar } from '@/components/activity-sidebar';

function VendorDetailContent({ vendorId }: { vendorId: string }) {
  const [vendor, setVendor] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendorId) {
      Promise.all([
        fetchVendor(vendorId),
        fetchActivityLogs('VENDOR', vendorId).catch(() => [])
      ]).then(([v, l]) => {
        setVendor(v);
        setLogs(l);
        setLoading(false);
      }).catch((err) => {
        setError('Failed to load vendor');
        setLoading(false);
      });
    }
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="p-8">
        <Card className="border-destructive/50">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">{error || 'Vendor not found'}</p>
            <Button variant="outline" asChild className="mt-4">
              <Link href="/vendors">Back to Vendors</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/vendors"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Link>
          <h1 className="text-2xl font-semibold text-foreground">Vendor Details</h1>
          <p className="mt-1 text-muted-foreground">View comprehensive vendor information</p>
        </div>
        <Button asChild>
          <Link href={`/vendors/${vendorId}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Vendor
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative h-32 w-32 overflow-hidden rounded-xl border bg-muted mb-4">
                  {vendor.logo ? (
                    <Image
                      src={vendor.logo}
                      alt={vendor.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-full w-full p-8 text-muted-foreground" />
                  )}
                </div>
                <h2 className="text-xl font-bold">{vendor.name}</h2>
                <Badge className="mt-2" variant={vendor.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {vendor.status}
                </Badge>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-semibold">Vendor Name</Label>
                    <p className="font-medium">{vendor.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-semibold">Company Name</Label>
                    <p className="font-medium">{vendor.companyName || vendor.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-semibold text-flex items-center gap-1">
                      <Calendar className="h-3 w-3 inline mr-1" /> Created At
                    </Label>
                    <p className="font-medium">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase font-semibold text-flex items-center gap-1">
                      <Globe className="h-3 w-3 inline mr-1" /> Website / Logo
                    </Label>
                    <p className="font-medium truncate">{vendor.logo || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1 h-full">
          <ActivitySidebar logs={logs} />
        </div>
      </div>
    </div>
  );
}

// Minimal Label component for local use if not imported
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <VendorDetailContent vendorId={id} />;
}
