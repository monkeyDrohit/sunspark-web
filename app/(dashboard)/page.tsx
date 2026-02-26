import Link from "next/link";
import { fetchDashboardStats } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, ShoppingBag, FileText, Package, ShoppingCart, TrendingUp } from "lucide-react";

const statCards = [
  { key: 'customers', label: 'Customers', icon: Users, href: '/users/customers' },
  { key: 'fieldAgents', label: 'Field Agents', icon: UserCheck, href: '/users/field-agents' },
  { key: 'subAdmins', label: 'Team Agents (Subadmins)', icon: ShoppingBag, href: '/users/sub-admins' },
  { key: 'pendingQuotations', label: 'Pending Quotations', icon: FileText, href: '/quotations?status=PENDING' },
  { key: 'acceptedQuotations', label: 'Accepted Quotations', icon: FileText, href: '/quotations?status=ACCEPTED' },
  { key: 'rejectedQuotations', label: 'Rejected Quotations', icon: FileText, href: '/quotations?status=REJECTED' },
  { key: 'products', label: 'Total Products', icon: Package, href: '/products' },
  { key: 'orders', label: 'Orders', icon: ShoppingCart, href: '/orders' },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ vendorId?: string }>;
}) {
  const params = await searchParams;
  const vendorId = params.vendorId || null;
  
  let stats: Awaited<ReturnType<typeof fetchDashboardStats>> | null = null;
  let error: string | null = null;

  try {
    stats = await fetchDashboardStats(vendorId);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load dashboard';
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          SunSpark Solar ERP – Super Admin & Sub Admin Portal
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <p className="text-muted-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ensure the backend is running and <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code> is set correctly.
            </p>
          </CardContent>
        </Card>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {statCards.map(({ key, label, icon: Icon, href }) => {
              const value = stats![key as keyof typeof stats] as number;
              return (
                <Link key={key} href={href} className="block h-full group">
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-sm hover:bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {label}
                      </CardTitle>
                      <div className="p-2 bg-muted/50 rounded-md group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-semibold tracking-tight">{value}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Lead Summaries */}
          <div className="grid gap-8">
            <div>
              <h2 className="text-lg font-medium tracking-tight mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Service Lead Overview
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Pending', value: stats.leadSummary.pending, href: '/service-leads?status=PENDING', color: 'bg-amber-500' },
                  { label: 'Assigned', value: stats.leadSummary.assigned, href: '/service-leads?status=ASSIGNED', color: 'bg-blue-500' },
                  { label: 'Completed', value: stats.leadSummary.completed, href: '/service-leads?status=COMPLETED', color: 'bg-emerald-500' },
                  { label: 'Cancelled', value: stats.leadSummary.cancelled, href: '/service-leads?status=CANCELLED', color: 'bg-rose-500' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="block h-full group">
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/30 p-4 hover:bg-card hover:border-border transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${item.color} shadow-sm`} />
                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                      </div>
                      <span className="text-xl font-semibold">{item.value ?? 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium tracking-tight mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary/60" />
                Lead Stage Summary
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {[
                  // Business / Pre-installation stages
                  { label: 'Payment Pending', value: stats.leadStageSummary.paymentPending, stage: 'PAYMENT_PENDING' },
                  { label: 'Document Pending', value: stats.leadStageSummary.documentPending, stage: 'DOCUMENT_PENDING' },
                  { label: 'Feasibility Bal.', value: stats.leadStageSummary.feasibilityBalance, stage: 'FEASIBILITY_BALANCE' },
                  
                  // Installation / Technical stages
                  { label: 'Install Incomplete', value: stats.leadStageSummary.installationIncomplete, stage: 'INSTALLATION_INCOMPLETE' },
                  { label: 'Site Tech Issue', value: stats.leadStageSummary.siteTechnicalIssue, stage: 'SITE_TECHNICAL_ISSUE' },
                  { label: 'Inspection Wait', value: stats.leadStageSummary.inspectionWaiting, stage: 'INSPECTION_WAITING' },
                  
                  // Post-installation / Financial stages
                  { label: 'Bank Balance', value: stats.leadStageSummary.bankBalance, stage: 'BANK_BALANCE' },
                  { label: 'Jansamarth Bal.', value: stats.leadStageSummary.jansamarthBalance, stage: 'JANSAMARTH_BALANCE' },
                  { label: 'Wait for Subsidy', value: stats.leadStageSummary.waitingForSubsidy, stage: 'WAITING_FOR_SUBSIDY' },
                  
                  // Final states
                  { label: 'Completed', value: stats.leadStageSummary.completed, stage: 'COMPLETED' },
                  { label: 'Lead Lost', value: stats.leadStageSummary.leadLost, stage: 'LEAD_LOST' },
                ].map((item) => (
                  <Link key={item.label} href={`/service-leads?stage=${item.stage}`} className="block h-full group">
                    <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-card/20 p-4 hover:bg-card hover:border-border transition-all duration-300 h-full">
                      <span className="text-2xl font-light tracking-tight">{item.value ?? 0}</span>
                      <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground/80 group-hover:text-muted-foreground transition-colors line-clamp-2 leading-tight">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
