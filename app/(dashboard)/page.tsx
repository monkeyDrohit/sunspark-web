import Link from "next/link";
import { fetchDashboardStats, DashboardResponse } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, CheckCircle, MapPin, HardHat, TrendingUp, AlertTriangle, BatteryCharging, Wrench, Activity, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ vendorId?: string }>;
}) {
  const params = await searchParams;
  const vendorId = params.vendorId || null;
  
  let stats: DashboardResponse | null = null;
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
          SunSpark Solar ERP Command Center
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
          {stats.role === 'SYSTEM_ADMIN' && <SystemAdminDashboard data={stats.data} />}
          {stats.role === 'SUPER_ADMIN' && <SuperAdminDashboard data={stats.data} />}
          {stats.role === 'SUB_ADMIN' && <SubAdminDashboard data={stats.data} />}
          {['FIELD_AGENT', 'CUSTOMER'].includes(stats.role) && (
            <Card>
              <CardContent className="py-12 flex items-center justify-center text-center text-muted-foreground">
                Welcome. Please use the mobile application to access your specific features.
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

function SystemAdminDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium tracking-tight mb-4">Platform Adoption</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Vendors</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{data.vendors.active}</div>
              <p className="text-xs text-muted-foreground mt-1">{data.vendors.inactive} Inactive Vendors</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{data.users.customers}</div>
              <p className="text-xs text-muted-foreground mt-1">Platform-wide end users</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Field Agents</CardTitle>
              <HardHat className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{data.users.fieldAgents}</div>
              <p className="text-xs text-muted-foreground mt-1">Deploying on the ground</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Admin Staff</CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{data.users.superAdmins + data.users.subAdmins}</div>
              <p className="text-xs text-muted-foreground mt-1">Managing vendor operations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BatteryCharging className="h-5 w-5 text-primary" />
              Global Environmental Impact
            </CardTitle>
            <CardDescription>Aggregate capacity deployed across all vendors</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-8">
            <div>
              <div className="text-5xl font-bold text-primary">{data.impact.totalKwp.toFixed(2)}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Total kWp Deployed</div>
            </div>
            <div className="h-16 w-px bg-border"></div>
            <div>
              <div className="text-3xl font-semibold">{data.impact.completedApps}</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Successful Installations</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">DisCom Efficiency</CardTitle>
            <CardDescription>Utility companies handling the most applications</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topDiscoms.length === 0 ? (
              <p className="text-muted-foreground text-sm">No applications linked to DisComs yet.</p>
            ) : (
              <div className="space-y-4">
                {data.topDiscoms.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{d.name}</span>
                    <span className="text-sm text-muted-foreground">{d.count} apps</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SuperAdminDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium tracking-tight mb-4">Application Pipeline Funnel</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Apps</span>
              <span className="text-2xl font-semibold">{data.pipeline.totalApps}</span>
            </CardContent>
          </Card>
          <div className="hidden lg:flex items-center justify-center"><TrendingUp className="text-muted-foreground" /></div>
          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quotations</span>
              <span className="text-2xl font-semibold">{data.pipeline.quotations}</span>
            </CardContent>
          </Card>
          <div className="hidden lg:flex items-center justify-center"><TrendingUp className="text-muted-foreground" /></div>
          <Card className="border-border/50 bg-card/30">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Installations</span>
              <span className="text-2xl font-semibold">{data.pipeline.installations}</span>
            </CardContent>
          </Card>
          <div className="hidden lg:flex items-center justify-center"><TrendingUp className="text-muted-foreground" /></div>
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">Completed</span>
              <span className="text-2xl font-bold text-primary">{data.pipeline.completed}</span>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Leaderboard
            </CardTitle>
            <CardDescription>Top field agents by completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topAgents.length === 0 ? (
              <p className="text-muted-foreground text-sm">No agent activity yet.</p>
            ) : (
              <div className="space-y-4">
                {data.topAgents.map((a: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium">{a.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{a.completedJobs} jobs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SubAdminDashboard({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium tracking-tight mb-4">Operations & Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/quotations" className="block h-full">
            <Card className="h-full border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-500 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-amber-700 dark:text-amber-500">{data.actionRequired.pendingQuotations}</div>
                <p className="text-xs text-amber-700/80 dark:text-amber-500/80 mt-1">Quotations Pending Review</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/applications" className="block h-full">
            <Card className="h-full border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-500 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-blue-700 dark:text-blue-500">{data.actionRequired.pendingDocs}</div>
                <p className="text-xs text-blue-700/80 dark:text-blue-500/80 mt-1">Documents Pending Approval</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/track-agents" className="block h-full">
            <Card className="h-full border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-500 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Field Agents Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-emerald-700 dark:text-emerald-500">{data.agents.online}</div>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80 mt-1">{data.agents.offline} Agents Offline</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>Recent actions from the field</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {data.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Wrench className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.agentName}</span> logged{' '}
                        <Badge variant="secondary" className="text-[10px] uppercase">{activity.action}</Badge>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>App: {activity.applicationId}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(activity.time), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
