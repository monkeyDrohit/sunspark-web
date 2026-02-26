import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchServiceLead } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StageTracker } from "@/components/stage-tracker";
import { ApplicationActions } from "@/components/application-actions";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode | null | undefined;
}) {
  const v = value ?? "—";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{v}</span>
    </div>
  );
}

export default async function ServiceLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await fetchServiceLead(id);
  if (!lead) notFound();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/service-leads"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Service Leads
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              {lead.serviceId}
            </h1>
            <Badge variant="outline">{lead.status}</Badge>
            {lead.projectType && (
              <Badge variant="secondary">{lead.projectType.replace('_', ' ')}</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {lead.customer?.name || lead.consumerName} · {lead.consumerPhone}
          </p>
        </div>
        <ApplicationActions app={lead} />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Government Application Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <StageTracker stages={lead.stages || []} />
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InfoRow label="Service ID" value={lead.serviceId} />
            <InfoRow label="Project Type" value={lead.projectType?.replace('_', ' ')} />
            <InfoRow label="Status" value={lead.status} />
            <InfoRow label="Assigned Field Agent" value={lead.fieldAgent?.name || 'Unassigned'} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discom & Capacity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InfoRow label="Discom" value={lead.discom?.name} />
            <InfoRow label="Circle" value={lead.circle ?? lead.discom?.circle} />
            <InfoRow label="Division" value={lead.division ?? lead.discom?.division} />
            <InfoRow label="Sub Division" value={lead.subDivision ?? lead.discom?.subDivision} />
            <InfoRow label="Approved capacity (kWp)" value={lead.approvedCapacityKwp} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Financial & Technical
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InfoRow label="Subsidy Amount (Rs)" value={lead.subsidyAmountRs ? `₹${lead.subsidyAmountRs}` : null} />
            <InfoRow
              label="Existing Installed Capacity (kWp)"
              value={lead.existingInstalledCapacityKwp}
            />
            <InfoRow
              label="Installed PV Capacity (kWp)"
              value={lead.installedPvCapacityKwp}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <InfoRow label="State" value={lead.state} />
            <InfoRow label="District" value={lead.district} />
            <InfoRow label="Village" value={lead.village} />
            <InfoRow label="Pin Code" value={lead.pinCode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}