'use client';

import { ServiceLead } from "@/lib/service-leads";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";

interface ServiceLeadListProps {
  leads: ServiceLead[];
  error?: string | null;
}

export function ServiceLeadList({ leads, error }: ServiceLeadListProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "outline",
      ASSIGNED: "default",
      COMPLETED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-6">
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No service leads found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">S.No.</TableHead>
            <TableHead>Service ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="w-32">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead, i) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{i + 1}</TableCell>
              <TableCell className="font-mono text-sm">{lead.serviceId}</TableCell>
              <TableCell>{lead.customerName}</TableCell>
              <TableCell>{lead.contactNumber}</TableCell>
              <TableCell>{getStatusBadge(lead.status)}</TableCell>
              <TableCell>
                {lead.stage ? (
                  <Badge variant="outline">{lead.stage.replace(/_/g, " ")}</Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/service-leads/${lead.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/service-leads/${lead.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
