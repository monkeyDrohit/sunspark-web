'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewServiceLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // In a real implementation, you would post this data to /api/service-leads
    // For now, let's just mock a success and redirect back
    setTimeout(() => {
      router.push('/service-leads');
      router.refresh();
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/service-leads"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Service Leads
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-foreground">
            Create Service Lead
          </h1>
          <p className="text-muted-foreground mt-1">
            Manually log a new inquiry or government application.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Lead Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="consumerName">Consumer Name</Label>
                <Input id="consumerName" required placeholder="e.g. John Doe" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="consumerPhone">Phone Number</Label>
                <Input id="consumerPhone" required placeholder="e.g. 9876543210" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="serviceId">Service ID / App Number</Label>
                <Input id="serviceId" required placeholder="e.g. SRV-1002" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="capacity">Approved Capacity (kWp)</Label>
                <Input id="capacity" type="number" step="0.1" required placeholder="e.g. 3.0" />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Lead'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}