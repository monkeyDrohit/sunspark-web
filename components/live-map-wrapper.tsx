'use client';

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Dynamically import the map inside a Client Component to allow ssr: false
const LiveMap = dynamic(() => import("@/components/live-map"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] border rounded-xl bg-muted/20">
      <div className="animate-pulse flex flex-col items-center">
        <MapPin className="h-8 w-8 text-muted-foreground mb-2 animate-bounce" />
        <p className="text-sm font-medium text-muted-foreground">Loading Map Interface...</p>
      </div>
    </div>
  ),
});

export default function LiveMapWrapper({ vendorId }: { vendorId?: string | null }) {
  return <LiveMap vendorId={vendorId} />;
}
