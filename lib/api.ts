const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export type StageSlug =
  | 'REGISTRATION'
  | 'APPLICATION'
  | 'FEASIBILITY'
  | 'VENDOR_SELECTION'
  | 'UPLOAD_AGREEMENT'
  | 'INSTALLATION'
  | 'INSPECTION'
  | 'PROJECT_COMMISSIONING'
  | 'SUBSIDY_REQUEST'
  | 'SUBSIDY_DISBURSAL';

export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface ApplicationStage {
  id: string;
  serviceLeadId: string;
  stageSlug: StageSlug;
  status: StageStatus;
  completedAt: string | null;
  notes: string | null;
}

export interface Discom {
  id: string;
  name: string;
  circle: string | null;
  division: string | null;
  subDivision: string | null;
  state: string | null;
  district: string | null;
}

export interface ServiceLead {
  id: string;
  serviceId: string;
  discomId: string;
  discom: Discom;
  consumerName: string;
  consumerPhone: string;
  consumerIdRef: string | null;
  approvedCapacityKwp: string;
  existingInstalledCapacityKwp: string | null;
  installedPvCapacityKwp: string | null;
  subsidyAmountRs: string | null;
  circle: string | null;
  division: string | null;
  subDivision: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  pinCode: string | null;
  stages: ApplicationStage[];
  customer?: { id: string; name: string };
  fieldAgent?: { id: string; name: string };
  projectType?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchServiceLeads(vendorId?: string | null): Promise<ServiceLead[]> {
  const url = vendorId ? `${API_BASE}/service-leads?vendorId=${vendorId}` : `${API_BASE}/service-leads`;
  
  // Get auth headers (works on both server and client)
  const headers: HeadersInit = {};
  if (typeof window === 'undefined') {
    // Server-side: read from cookies
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // Client-side: read from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const res = await fetch(url, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch service leads');
  return res.json();
}

export async function fetchServiceLead(id: string): Promise<ServiceLead | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/service-leads/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateServiceLeadStage(
  serviceLeadId: string,
  stageSlug: string,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
  notes?: string
): Promise<ApplicationStage> {
  const res = await fetch(`${API_BASE}/service-leads/${serviceLeadId}/stages`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ stageSlug, status, notes }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update service lead stage');
  }
  return res.json();
}