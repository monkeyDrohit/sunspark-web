import Link from "next/link";
import { fetchQuotations } from "@/lib/quotations";
import { getServerUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
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
import { Eye, Pencil, Plus } from "lucide-react";

export default async function QuotationsPage() {
  const user = await getServerUser();
  const canManage = user?.role === 'SYSTEM_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_ADMIN';
  let quotations: Awaited<ReturnType<typeof fetchQuotations>> = [];
  let error: string | null = null;

  try {
    quotations = await fetchQuotations();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load quotations";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Quotations</h1>
          <p className="mt-1 text-muted-foreground">Manage customer quotations</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/quotations/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Quotation
            </Link>
          </Button>
        )}
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : quotations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No quotations yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Quotation #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quotation, i) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {quotation.quotationNumber || "—"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{quotation.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{quotation.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>₹{parseFloat(quotation.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        quotation.status === "ACCEPTED"
                          ? "default"
                          : quotation.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(quotation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/quotations/${quotation.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canManage && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/quotations/${quotation.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
