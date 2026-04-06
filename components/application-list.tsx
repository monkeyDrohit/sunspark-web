'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Application, deleteApplication } from "@/lib/applications";
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
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface ApplicationListProps {
  leads: Application[];
  error?: string | null;
}

export function ApplicationList({ leads: initialLeads, error }: ApplicationListProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setDeletingId(id);
    try {
      await deleteApplication(id);
      setLeads(leads.filter((lead) => lead.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to delete application');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }

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
          <p className="text-muted-foreground">No applications found.</p>
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
            <TableHead>Application ID</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Field Agent</TableHead>
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
              <TableCell className="font-mono text-sm">
                <Link href={`/applications/${lead.id}`} className="text-primary hover:underline">
                  {lead.serviceId}
                </Link>
              </TableCell>
              <TableCell>
                {lead.consumerUserId ? (
                  <Link href={`/users/${lead.consumerUserId}`} className="text-primary hover:underline font-medium">
                    {lead.customerName}
                  </Link>
                ) : (
                  lead.customerName
                )}
              </TableCell>
              <TableCell>
                {lead.fieldAgentId ? (
                  <Link href={`/users/${lead.fieldAgentId}`} className="text-primary hover:underline">
                    {lead.fieldAgent?.name || '—'}
                  </Link>
                ) : (
                  '—'
                )}
              </TableCell>
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
                  <Button variant="ghost" size="icon" asChild title="View">
                    <Link href={`/applications/${lead.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                    onClick={() => handleDelete(lead.id)}
                    disabled={isDeleting && deletingId === lead.id}
                  >
                    {isDeleting && deletingId === lead.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
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
