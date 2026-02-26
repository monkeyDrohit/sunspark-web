import { fetchFaqs } from "@/lib/cms";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default async function FaqPage() {
  let faqs: any[] = [];
  let error = null;
  try {
    faqs = await fetchFaqs();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load FAQs";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">FAQs</h1>
          <p className="mt-1 text-muted-foreground">Manage frequently asked questions</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : faqs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No FAQs found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq, i) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium">{faq.question}</TableCell>
                  <TableCell>
                    <Badge variant={faq.status === "ACTIVE" ? "default" : "secondary"}>
                      {faq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" disabled>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled className="text-destructive">
                        <Trash2 className="h-4 w-4" />
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
