import LiveMapWrapper from "@/components/live-map-wrapper";

export default async function TrackAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ vendorId?: string }>;
}) {
  const params = await searchParams;
  const vendorId = params.vendorId || null;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Track Agents</h1>
          <p className="mt-1 text-muted-foreground">Real-time GPS tracking for field operations.</p>
        </div>
      </div>

      <LiveMapWrapper vendorId={vendorId} />
    </div>
  );
}
