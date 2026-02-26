import { fetchPages } from "@/lib/cms";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Plus } from "lucide-react";
import Link from "next/link";

export default async function PagesPage() {
  let pages: any[] = [];
  let error = null;
  try {
    pages = await fetchPages();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load pages";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">CMS Pages</h1>
          <p className="mt-1 text-muted-foreground">Manage static content pages</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Page
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No pages found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page, i) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell className="font-mono text-xs">{page.slug}</TableCell>
                  <TableCell>{new Date(page.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" disabled>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled>
                        <Pencil className="h-4 w-4" />
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
