import Link from "next/link";
import { fetchCategories } from "@/lib/categories";
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

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof fetchCategories>> = [];
  let error: string | null = null;

  try {
    categories = await fetchCategories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load categories";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="mt-1 text-muted-foreground">Manage product categories</p>
        </div>
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No categories yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, i) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                  <TableCell>{category.description || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={category.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {category.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/categories/${category.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/categories/${category.id}/edit`}>
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
