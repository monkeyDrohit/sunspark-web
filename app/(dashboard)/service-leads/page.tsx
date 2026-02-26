import { fetchServiceLeads } from "@/lib/api";
import { ServiceLeadsClient } from "@/components/service-leads-client";

export default async function ServiceLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ vendorId?: string; status?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const vendorId = params.vendorId || null;
  const initialStatus = params.status || 'ALL';
  const initialStage = params.stage || 'ALL';
  
  let serviceLeads: Awaited<ReturnType<typeof fetchServiceLeads>> = [];
  let error: string | null = null;
  
  try {
    serviceLeads = await fetchServiceLeads(vendorId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load service leads";
  }

  return (
    <ServiceLeadsClient 
      initialData={serviceLeads} 
      error={error} 
      initialStatus={initialStatus} 
      initialStage={initialStage} 
    />
  );
}
