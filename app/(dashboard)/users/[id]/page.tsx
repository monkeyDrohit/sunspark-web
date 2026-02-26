import { fetchUserById, fetchActivityLogs } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivitySidebar } from "@/components/activity-sidebar";

export default async function ViewUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  let logs: any[] = [];

  try {
    user = await fetchUserById(id);
    logs = await fetchActivityLogs('USER', id);
  } catch (e) {
    notFound();
  }

  const profile = user.customerProfile || user.fieldAgentProfile;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">User Details</h1>
            <p className="mt-1 text-muted-foreground">View detailed information for this user.</p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/users/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="outline" className="mt-1">{user.role}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'} className="mt-1">{user.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <p className="font-medium">{profile?.mobile || user.phone || "—"}</p>
                </div>
                {profile && 'gender' in profile && (
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{profile.gender?.toLowerCase() || "—"}</p>
                  </div>
                )}
                {user.role === 'CUSTOMER' && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Field Agent</p>
                      {user.customerProfile?.fieldAgentId ? (
                        <Link href={`/users/${user.customerProfile.fieldAgentId}`} className="font-medium text-primary hover:underline block">
                          {user.customerProfile.fieldAgent?.name || "View Agent"}
                        </Link>
                      ) : (
                        <p className="font-medium">Unassigned</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Team Lead</p>
                      {user.customerProfile?.teamLeadId ? (
                        <Link href={`/users/${user.customerProfile.teamLeadId}`} className="font-medium text-primary hover:underline block">
                          {user.customerProfile.teamLead?.name || "View Team Lead"}
                        </Link>
                      ) : (
                        <p className="font-medium">Unassigned</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    Address Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium whitespace-pre-wrap">{profile.address || "—"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{profile.city || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State / UT</p>
                      <p className="font-medium">{profile.state || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium">
                        {profile.country || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Zipcode</p>
                      <p className="font-medium">{profile.zipcode || "—"}</p>
                    </div>
                  </div>
                  
                  {profile.googleMapLink && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Google Maps Link</p>
                      <a href={profile.googleMapLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                        {profile.googleMapLink}
                      </a>
                    </div>
                  )}

                  {profile.latitude && profile.longitude && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Coordinates</p>
                      <p className="font-medium font-mono text-sm">
                        {profile.latitude}, {profile.longitude}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {user.role === 'FIELD_AGENT' && user.customerFieldAgents && user.customerFieldAgents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Assigned Customers ({user.customerFieldAgents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {user.customerFieldAgents.map((customer: any) => (
                    <Link key={customer.id} href={`/users/${customer.userId}`} className="block border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="font-medium text-foreground mb-1">{customer.name || "Unnamed Customer"}</div>
                      <div className="text-sm text-muted-foreground mb-1">{customer.email}</div>
                      <div className="text-sm">{customer.mobile || "No mobile"}</div>
                      <div className="text-sm text-muted-foreground mt-2">{customer.city || "No city specified"}</div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1 h-full">
          <ActivitySidebar logs={logs} />
        </div>
      </div>
    </div>
  );
}
