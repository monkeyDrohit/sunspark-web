'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApplicationActions } from '@/components/application-actions';
import type { ServiceLead } from '@/lib/api';

function getCurrentStageStatus(stages: { status: string }[]) {
  if (!stages || stages.length === 0) return { label: 'Pending', variant: 'outline' as const };
  const inProgress = stages.find((s) => s.status === 'IN_PROGRESS');
  const lastCompleted = [...stages].reverse().find((s) => s.status === 'COMPLETED');
  
  if (inProgress) return { label: 'In Progress', variant: 'default' as const };
  if (lastCompleted) return { label: 'Completed', variant: 'secondary' as const };
  return { label: 'Pending', variant: 'outline' as const };
}

export function ServiceLeadsClient({
  initialData,
  error,
  initialStatus = 'ALL',
  initialStage = 'ALL',
}: {
  initialData: ServiceLead[];
  error: string | null;
  initialStatus?: string;
  initialStage?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState(initialStage);

  const filteredData = useMemo(() => {
    return initialData.filter((lead) => {
      const matchesSearch =
        lead.consumerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.serviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.fieldAgent?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || lead.projectType === typeFilter;
      
      // Stage filtering logic
      let matchesStage = true;
      if (stageFilter !== 'ALL') {
        if (stageFilter === 'COMPLETED') {
           // We might consider it completed if the final stage in the DB is completed, or if lead.status is COMPLETED
           // For exact match with old logic, check if last completed stage is the final one, or just check the last stages 
           // We will just do a simple check if any stage matches the filter and is completed or in progress, or specific fallback for "COMPLETED"
           const allCompleted = lead.stages?.every(s => s.status === 'COMPLETED') && lead.stages?.length > 0;
           matchesStage = allCompleted || lead.status === 'COMPLETED';
        } else {
           // For specific stages like JANSAMARTH_BALANCE, we check if that stage exists in the lead's stages
           const hasStage = lead.stages?.some(s => s.stageSlug === stageFilter);
           matchesStage = hasStage;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesStage;
    });
  }, [initialData, searchTerm, statusFilter, typeFilter, stageFilter]);

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Cannot load service leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Service Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage solar project applications, field assignments, and tracking.
          </p>
        </div>
        <Button asChild>
          <Link href="/service-leads/new">
            <Plus className="mr-2 h-4 w-4" /> Create Service Lead
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_150px_150px_150px]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, Customer, or Agent..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Project Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="NEW_INSTALLATION">New Installation</SelectItem>
            <SelectItem value="UPGRADE">Upgrade</SelectItem>
            <SelectItem value="AMC">AMC</SelectItem>
            <SelectItem value="RESIDENTIAL">Residential</SelectItem>
            <SelectItem value="COMMERCIAL">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Govt Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Stages</SelectItem>
            <SelectItem value="REGISTRATION">Registration</SelectItem>
            <SelectItem value="APPLICATION">Application</SelectItem>
            <SelectItem value="FEASIBILITY">Feasibility</SelectItem>
            <SelectItem value="VENDOR_SELECTION">Vendor Selection</SelectItem>
            <SelectItem value="UPLOAD_AGREEMENT">Upload Agreement</SelectItem>
            <SelectItem value="INSTALLATION">Installation</SelectItem>
            <SelectItem value="INSPECTION">Inspection</SelectItem>
            <SelectItem value="PROJECT_COMMISSIONING">Commissioning</SelectItem>
            <SelectItem value="SUBSIDY_REQUEST">Subsidy Request</SelectItem>
            <SelectItem value="SUBSIDY_DISBURSAL">Subsidy Disbursal</SelectItem>
            <SelectItem value="JANSAMARTH_BALANCE">Jansamarth Balance</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {initialData.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No service leads yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Field Agent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Govt Stage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((lead) => {
                const stageStatus = getCurrentStageStatus(lead.stages);
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-mono text-sm">{lead.serviceId}</TableCell>
                    <TableCell>{lead.customer?.name || lead.consumerName}</TableCell>
                    <TableCell>{lead.fieldAgent?.name || '—'}</TableCell>
                    <TableCell>{lead.projectType?.replace('_', ' ') || '—'}</TableCell>
                    <TableCell>{lead.approvedCapacityKwp} kWp</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stageStatus.variant}>{stageStatus.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/service-leads/${lead.id}`}>View</Link>
                        </Button>
                        <ApplicationActions app={lead as any} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    No matching service leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}