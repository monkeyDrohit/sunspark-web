import Link from "next/link";
import { fetchOrders } from "@/lib/orders";
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

export default async function OrdersPage() {
  let orders: Awaited<ReturnType<typeof fetchOrders>> = [];
  let error: string | null = null;

  try {
    orders = await fetchOrders();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load orders";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
          <p className="mt-1 text-muted-foreground">Manage customer orders</p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Link>
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, i) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>₹{parseFloat(order.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "DELIVERED"
                          ? "default"
                          : order.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/orders/${order.id}/edit`}>
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
