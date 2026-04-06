import { getAuthHeaders } from './api-helpers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface SystemAdminData {
  vendors: { active: number; inactive: number };
  users: { superAdmins: number; subAdmins: number; fieldAgents: number; customers: number };
  impact: { completedApps: number; totalKwp: number };
  topDiscoms: Array<{ name: string; count: number }>;
}

export interface SuperAdminData {
  pipeline: { totalApps: number; serviceLeads: number; quotations: number; installations: number; completed: number };
  topAgents: Array<{ name: string; completedJobs: number }>;
}

export interface SubAdminData {
  actionRequired: { pendingQuotations: number; pendingDocs: number };
  recentActivity: Array<{ id: string; agentName: string; action: string; applicationId: string; time: string }>;
  agents: { online: number; offline: number };
}

export interface DashboardResponse {
  role: 'SYSTEM_ADMIN' | 'SUPER_ADMIN' | 'SUB_ADMIN' | 'FIELD_AGENT' | 'CUSTOMER';
  data: SystemAdminData | SuperAdminData | SubAdminData | any;
}

export async function fetchDashboardStats(vendorId?: string | null): Promise<DashboardResponse> {
  const url = vendorId ? `${API_BASE}/dashboard/stats?vendorId=${vendorId}` : `${API_BASE}/dashboard/stats`;
  
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}
