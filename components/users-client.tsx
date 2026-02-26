'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BaseUser, deleteUser } from '@/lib/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2, UserCheck, Loader2, Search, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function UsersClient({ initialUsers }: { initialUsers: BaseUser[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const canManage = user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_ADMIN' || user?.role === 'FIELD_AGENT';
  
  const [users, setUsers] = useState<BaseUser[]>(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setDeletingId(id);
      setError(null);
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    const matchesSearch = nameMatch || emailMatch;
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserCheck className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No users found.</p>
        </CardContent>
      </Card>
    );
  }

  // We only show the role filter if the initial users list contains multiple roles (i.e. the generic /users page)
  // Or simply check if the URL is not a role-specific one. The simplest proxy is if they pass initialUsers of mixed types.
  const hasMixedRoles = new Set(initialUsers.map(u => u.role)).size > 1 || initialUsers.length === 0;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {hasMixedRoles && (
          <div className="w-full sm:w-48">
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customers</option>
              <option value="FIELD_AGENT">Field Agents</option>
              <option value="SUB_ADMIN">Sub Admins</option>
              <option value="SUPER_ADMIN">Super Admins</option>
            </select>
          </div>
        )}

        <div className="w-full sm:w-48">
          <select
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile No</TableHead>
              <TableHead>Field Agent</TableHead>
              <TableHead>Team Lead</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="w-32">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManage ? 9 : 8} className="h-24 text-center">
                  No users match your search query.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u, i) => {
                const profile = u.customerProfile || u.fieldAgentProfile;
                const mobileNo = profile?.mobile || u.phone || "—";
                const fieldAgent = u.customerProfile?.fieldAgent?.name || "N/A";
                const teamLead = u.customerProfile?.teamLead?.name || u.teamLead?.name || "N/A";
                const teamLeadLink = u.customerProfile?.teamLeadId || u.teamLeadId;

                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.role.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{mobileNo}</TableCell>
                    <TableCell>
                      {u.customerProfile?.fieldAgentId ? (
                        <Link href={`/users/${u.customerProfile.fieldAgentId}`} className="text-primary hover:underline">
                          {fieldAgent}
                        </Link>
                      ) : (
                        fieldAgent
                      )}
                    </TableCell>
                    <TableCell>
                      {teamLeadLink ? (
                        <Link href={`/users/${teamLeadLink}`} className="text-primary hover:underline">
                          {teamLead}
                        </Link>
                      ) : (
                        teamLead
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild title="View">
                            <Link href={`/users/${u.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Edit">
                            <Link href={`/users/${u.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(u.id)}
                            disabled={deletingId === u.id}
                            title="Delete"
                          >
                            {deletingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
