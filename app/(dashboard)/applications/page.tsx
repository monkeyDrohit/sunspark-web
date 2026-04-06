import { fetchApplications } from "@/lib/api";
import { ApplicationsClient } from "@/components/applications-client";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ vendorId?: string; status?: string; stage?: string }>;
}) {
  const params = await searchParams;
  const vendorId = params.vendorId || null;
  const initialStatus = params.status || 'ALL';
  const initialStage = params.stage || 'ALL';
  
  let applications: Awaited<ReturnType<typeof fetchApplications>> = [];
  let error: string | null = null;
  
  try {
    applications = await fetchApplications(vendorId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load applications";
  }

  return (
    <ApplicationsClient 
      initialData={applications} 
      error={error} 
      initialStatus={initialStatus} 
      initialStage={initialStage} 
    />
  );
}
