'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchVendor } from '@/lib/vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function VendorSettingsContent({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (vendorId) {
      fetchVendor(vendorId).then((vendor) => {
        if (vendor) {
          setName(vendor.name);
          setCompanyName(vendor.companyName || '');
          setLogo(vendor.logo || '');
        }
        setLoading(false);
      }).catch(() => {
        setError('Failed to load vendor');
        setLoading(false);
      });
    }
  }, [vendorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId) return;
    
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/vendors/${vendorId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          name,
          companyName: companyName || name,
          logo: logo || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update vendor settings');
      }

      setSuccess('Vendor settings updated successfully');
      setTimeout(() => router.refresh(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Link
          href="/vendors"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Link>
        <h1 className="text-2xl font-semibold text-foreground">Vendor Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage vendor branding and display settings</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Branding & Display</CardTitle>
          <CardDescription>
            Update vendor logo and company name that will be displayed when vendor admins log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="url"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      disabled={saving}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL to vendor logo. This will be displayed in the sidebar when vendor admins log in.
                    </p>
                  </div>
                  {logo && (
                    <div className="relative h-16 w-16 overflow-hidden rounded border border-border">
                      <img
                        src={logo}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Display name for vendor"
                  required
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  This name will be shown in the sidebar when vendor admins log in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name (Internal)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Internal identifier (cannot be changed)
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VendorSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <VendorSettingsContent vendorId={id} />;
}
