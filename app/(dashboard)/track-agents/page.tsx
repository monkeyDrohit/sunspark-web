import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default async function TrackAgentsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Track Agents</h1>
        <p className="mt-1 text-muted-foreground">Monitor field agents in real-time</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Agent Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Real-time agent tracking will be available here.
              <br />
              This feature requires GPS integration and will be implemented in the mobile app.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
