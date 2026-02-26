'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { fetchVendor } from '@/lib/vendors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function EditVendorContent({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vendorId) {
      fetchVendor(vendorId).then((vendor) => {
        if (vendor) {
          setName(vendor.name);
          setCompanyName(vendor.companyName || '');
          setLogo(vendor.logo || '');
          setStatus(vendor.status as 'ACTIVE' | 'INACTIVE');
        }
        setLoading(false);
      }).catch(() => {
        setError('Failed to load vendor');
        setLoading(false);
      });
    }
  }, [vendorId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError('Icon image should be less than 1MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId) return;
    
    setError('');
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
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update vendor');
      }

      router.push('/vendors');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
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
        <h1 className="text-2xl font-semibold text-foreground">Edit Vendor</h1>
        <p className="mt-1 text-muted-foreground">Update vendor details</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Vendor Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'ACTIVE' | 'INACTIVE')} disabled={saving}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logo"
                  type="url"
                  value={logo.startsWith('data:') ? '' : logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={saving}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                URL to vendor logo (optional)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Or Upload Icon</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  {logo && (logo.startsWith('data:') || logo.startsWith('http')) ? (
                    <div className="relative">
                      <img 
                        src={logo} 
                        alt="Preview" 
                        className="h-16 w-16 object-contain border rounded bg-muted" 
                      />
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        disabled={saving}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="h-16 w-16 border border-dashed rounded flex items-center justify-center bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={saving}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                    >
                      {logo ? 'Change Icon' : 'Select Icon File'}
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Recommended dimensions: <strong>256x256 pixels</strong></p>
                  <p>Max file size: <strong>1MB</strong>. Supported formats: <strong>PNG, JPG, SVG</strong></p>
                </div>
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
                  'Save Changes'
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

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EditVendorContent vendorId={id} />;
}
