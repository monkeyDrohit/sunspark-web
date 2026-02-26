import { fetchBanners } from "@/lib/cms";
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
import { Plus, Image as ImageIcon } from "lucide-react";

export default async function TopBannersPage() {
  let banners: any[] = [];
  let error = null;
  try {
    const allBanners = await fetchBanners();
    banners = allBanners.filter(b => b.position === 'top');
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load top banners";
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Top Banners</h1>
          <p className="mt-1 text-muted-foreground">Manage banners displayed at the top of the portal</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Top Banner
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      ) : banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No top banners found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">S.No.</TableHead>
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, i) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>
                    <div className="h-10 w-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={banner.status === "ACTIVE" ? "default" : "secondary"}>
                      {banner.status}
                    </Badge>
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
