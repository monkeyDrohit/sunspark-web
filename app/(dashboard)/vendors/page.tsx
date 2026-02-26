import Link from "next/link";
import { fetchVendors } from "@/lib/vendors";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Building2 } from "lucide-react";
import { VendorTable } from "@/components/vendor-table";

export default async function VendorsPage() {
  let vendors: Awaited<ReturnType<typeof fetchVendors>> = [];
  let error: string | null = null;

  try {
    vendors = await fetchVendors();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load vendors";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vendors</h1>
          <p className="mt-1 text-muted-foreground">Manage vendors and tenants</p>
        </div>
        <Button asChild>
          <Link href="/vendors/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No vendors yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first vendor to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <VendorTable vendors={vendors} />
      )}
    </div>
  );
}
