import Link from "next/link";
import { fetchProducts } from "@/lib/products";
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
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default async function ProductsPage() {
  let products: Awaited<ReturnType<typeof fetchProducts>> = [];
  let error: string | null = null;

  try {
    products = await fetchProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load products";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Products</h1>
          <p className="mt-1 text-muted-foreground">Manage product inventory</p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No products yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead className="w-20">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, i) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>
                    {product.image ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>
                    ₹{parseFloat(product.amount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stockStatus === "IN_STOCK" ? "default" : "destructive"
                      }
                    >
                      {product.stockStatus === "IN_STOCK" ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/products/${product.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/products/${product.id}/edit`}>
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
