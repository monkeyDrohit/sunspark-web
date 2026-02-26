import Link from "next/link";
import { fetchUsers } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UsersClient from "@/components/users-client";
import { Card, CardContent } from "@/components/ui/card";

export default async function CustomersPage() {
  let users: Awaited<ReturnType<typeof fetchUsers>> = [];
  let error: string | null = null;

  try {
    users = await fetchUsers('CUSTOMER');
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load users";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
          <p className="mt-1 text-muted-foreground">Manage all registered customer accounts.</p>
        </div>
        <Button asChild>
          <Link href="/users/new?role=CUSTOMER">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <UsersClient initialUsers={users} />
      )}
    </div>
  );
}
