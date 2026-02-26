import Link from "next/link";
import { fetchBrands } from "@/lib/brands";
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
import Image from "next/image";

export default async function BrandsPage() {
  let brands: Awaited<ReturnType<typeof fetchBrands>> = [];
  let error: string | null = null;

  try {
    brands = await fetchBrands();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load brands";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Brands</h1>
          <p className="mt-1 text-muted-foreground">Manage product brands</p>
        </div>
        <Button asChild>
          <Link href="/brands/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : brands.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No brands yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand, i) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">{brand.name.charAt(0)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{brand.name}</TableCell>
                  <TableCell className="font-mono text-sm">{brand.slug}</TableCell>
                  <TableCell>
                    <Badge
                      variant={brand.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {brand.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/brands/${brand.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/brands/${brand.id}/edit`}>
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
