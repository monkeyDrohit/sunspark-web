'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, Loader2, ArrowLeft, MapPin } from "lucide-react";
import { fetchUserById, updateUser } from "@/lib/users";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import DynamicMapPicker from "@/components/dynamic-map-picker";
import { useAuth } from "@/contexts/auth-context";
import { INDIAN_STATES, COUNTRIES } from "@/lib/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuth();
  const isFieldAgent = user?.role === 'FIELD_AGENT';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: "",
    name: "",
    email: "",
    phone: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    gender: "",
    city: "",
    state: "",
    address: "",
    zipcode: "",
    country: "",
    status: "ACTIVE",
    googleMapLink: "",
    latitude: null as number | null,
    longitude: null as number | null,
    fieldAgentId: "none",
    teamLeadId: "none",
  });

  const [fieldAgents, setFieldAgents] = useState<any[]>([]);
  const [teamLeads, setTeamLeads] = useState<any[]>([]);

  useEffect(() => {
    fetchUserById(id)
      .then((user) => {
        const profile = user.customerProfile || user.fieldAgentProfile;
        setFormData({
          role: user.role,
          name: user.name || "",
          email: user.email,
          phone: user.phone || "",
          mobile: profile?.mobile || "",
          password: "",
          confirmPassword: "",
          gender: profile?.gender || "",
          city: profile?.city || "",
          state: profile?.state || "",
          address: profile?.address || "",
          zipcode: profile?.zipcode || "",
          country: profile?.country || "",
          status: user.status,
          googleMapLink: profile?.googleMapLink || "",
          latitude: profile?.latitude ? parseFloat(profile.latitude as any) : null,
          longitude: profile?.longitude ? parseFloat(profile.longitude as any) : null,
          fieldAgentId: user.customerProfile?.fieldAgentId || "none",
          teamLeadId: user.customerProfile?.teamLeadId || "none",
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load user");
        setLoading(false);
      });

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      fetch(`${API_BASE}/users?role=FIELD_AGENT`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setFieldAgents(data) : null)
        .catch(console.error);
        
      fetch(`${API_BASE}/users?role=SUB_ADMIN`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setTeamLeads(data) : null)
        .catch(console.error);
    }
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required.";
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
    if (formData.password && formData.password.length < 6) return "Password must be at least 6 characters long.";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const { fieldAgentId, teamLeadId, confirmPassword, password, ...submitData } = formData;
    const finalData = {
      ...submitData,
      fieldAgentId: fieldAgentId === "none" ? null : fieldAgentId,
      teamLeadId: teamLeadId === "none" ? null : teamLeadId,
      ...(password ? { password } : {})
    };

    try {
      await updateUser(id, finalData as any);
      router.push('/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit User</h1>
          <p className="mt-1 text-muted-foreground">Update user details and permissions.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status" className="after:content-['*'] after:ml-0.5 after:text-red-500">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleChange("status", val)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Input id="role" value={formData.role} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="after:content-['*'] after:ml-0.5 after:text-red-500">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter the Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="after:content-['*'] after:ml-0.5 after:text-red-500">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter the Email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="after:content-['*'] after:ml-0.5 after:text-red-500">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  placeholder="Enter the Mobile"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Leave empty to keep current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>

              {['CUSTOMER', 'FIELD_AGENT'].includes(formData.role) && (
                <div className="space-y-2">
                  <Label htmlFor="gender" className="after:content-['*'] after:ml-0.5 after:text-red-500">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(val) => handleChange("gender", val)}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === 'CUSTOMER' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fieldAgentId">Field Agent</Label>
                    <Select
                      value={formData.fieldAgentId}
                      onValueChange={(val) => handleChange("fieldAgentId", val)}
                      disabled={isFieldAgent}
                    >
                      <SelectTrigger id="fieldAgentId">
                        <SelectValue placeholder="Select Field Agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select Field Agent --</SelectItem>
                        {fieldAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>{agent.name || agent.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teamLeadId">Team Lead (Sub Admin)</Label>
                    <Select
                      value={formData.teamLeadId}
                      onValueChange={(val) => handleChange("teamLeadId", val)}
                    >
                      <SelectTrigger id="teamLeadId">
                        <SelectValue placeholder="Select Team Lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Select Team Lead --</SelectItem>
                        {teamLeads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>{lead.name || lead.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {['CUSTOMER', 'FIELD_AGENT'].includes(formData.role) && (
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="profilePicture" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full justify-start text-muted-foreground font-normal"
                      onClick={() => document.getElementById('profilePicture')?.click()}
                    >
                      Choose file
                      <span className="ml-2 text-foreground">
                        No file chosen
                      </span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {['CUSTOMER', 'FIELD_AGENT'].includes(formData.role) && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-medium mb-4">User Address</h3>
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="after:content-['*'] after:ml-0.5 after:text-red-500">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(val) => handleChange("country", val)}
                      required
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="after:content-['*'] after:ml-0.5 after:text-red-500">State / UT</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(val) => handleChange("state", val)}
                      required
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select State/UT" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="after:content-['*'] after:ml-0.5 after:text-red-500">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Enter City"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipcode" className="after:content-['*'] after:ml-0.5 after:text-red-500">Zipcode</Label>
                    <Input
                      id="zipcode"
                      value={formData.zipcode}
                      onChange={(e) => handleChange("zipcode", e.target.value)}
                      placeholder="Enter the Zipcode"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="after:content-['*'] after:ml-0.5 after:text-red-500">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Enter Address"
                      required
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {['CUSTOMER', 'FIELD_AGENT'].includes(formData.role) && (
              <div className="pt-6 border-t border-border mt-8">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Map Location
                </h3>
                <DynamicMapPicker
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  initialLink={formData.googleMapLink}
                  onChange={({ lat, lng, link }) => {
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, googleMapLink: link }));
                  }}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
