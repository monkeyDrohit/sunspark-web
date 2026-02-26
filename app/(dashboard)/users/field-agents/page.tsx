import Link from "next/link";
import { fetchUsers } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UsersClient from "@/components/users-client";
import { Card, CardContent } from "@/components/ui/card";

export default async function FieldAgentsPage() {
  let users: Awaited<ReturnType<typeof fetchUsers>> = [];
  let error: string | null = null;

  try {
    users = await fetchUsers('FIELD_AGENT');
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load users";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Field Agents</h1>
          <p className="mt-1 text-muted-foreground">Manage on-field agents and their profiles.</p>
        </div>
        <Button asChild>
          <Link href="/users/new?role=FIELD_AGENT">
            <Plus className="mr-2 h-4 w-4" />
            Add Field Agent
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
