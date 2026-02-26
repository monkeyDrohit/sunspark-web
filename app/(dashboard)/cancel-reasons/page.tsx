import Link from "next/link";
import { fetchCancelReasons } from "@/lib/cancel-reasons";
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

export default async function CancelReasonsPage() {
  let reasons: Awaited<ReturnType<typeof fetchCancelReasons>> = [];
  let error: string | null = null;

  try {
    reasons = await fetchCancelReasons();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load cancel reasons";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cancel Reasons</h1>
          <p className="mt-1 text-muted-foreground">Manage order cancellation reasons</p>
        </div>
        <Button asChild>
          <Link href="/cancel-reasons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Reason
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : reasons.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No cancel reasons yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reasons.map((reason, i) => (
                <TableRow key={reason.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium">{reason.name}</TableCell>
                  <TableCell>{reason.description || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={reason.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {reason.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/cancel-reasons/${reason.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/cancel-reasons/${reason.id}/edit`}>
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
      )}
    </div>
  );
}
