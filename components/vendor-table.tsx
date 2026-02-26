'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Vendor, deleteVendor } from '@/lib/vendors';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, Building2, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Card } from '@/components/ui/card';

interface VendorTableProps {
  vendors: Vendor[];
}

export function VendorTable({ vendors: initialVendors }: VendorTableProps) {
  const router = useRouter();
  const [vendors, setVendors] = useState(initialVendors);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch = 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (v.companyName && v.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchQuery, statusFilter]);

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setDeletingId(id);
    try {
      await deleteVendor(id);
      setVendors(vendors.filter((v) => v.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to delete vendor');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors by name..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No vendors match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    {vendor.logo ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <img
                          src={vendor.logo}
                          alt={vendor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.companyName || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={vendor.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild title="View">
                        <Link href={`/vendors/${vendor.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Edit">
                        <Link href={`/vendors/${vendor.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                        onClick={() => handleDelete(vendor.id)}
                        disabled={isDeleting && deletingId === vendor.id}
                      >
                        {isDeleting && deletingId === vendor.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
