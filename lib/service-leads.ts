const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ServiceLead {
  id: string;
  serviceId: string;
  customerId: string;
  customerName: string;
  contactNumber: string;
  address: string | null;
  projectType: string | null;
  fieldAgentId: string | null;
  fieldAgent: { id: string; name: string; email: string } | null;
  agentStatus: string | null;
  status: string;
  stage: string | null;
  scheduledDate: string | null;
  deliveryTime: string | null;
  fileUploadMedium: string | null;
  documentsApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchServiceLeads(params?: {
  status?: string;
  stage?: string;
  projectType?: string;
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
  contactNumber?: string;
}): Promise<ServiceLead[]> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
  }
  
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
  
  const res = await fetch(`${API_BASE}/service-leads?${searchParams}`, { 
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

export async function updateServiceLead(id: string, data: Partial<ServiceLead>): Promise<ServiceLead> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}/service-leads/${id}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update service lead');
  }
  return res.json();
}
