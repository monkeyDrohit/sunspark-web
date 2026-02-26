const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface DashboardStats {
  customers: number;
  fieldAgents: number;
  subAdmins: number;
  pendingQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  products: number;
  orders: number;
  leadSummary: {
    pending: number;
    assigned: number;
    completed: number;
    cancelled: number;
  };
  leadStageSummary: {
    paymentPending: number;
    installationIncomplete: number;
    bankBalance: number;
    leadLost: number;
    documentPending: number;
    inspectionWaiting: number;
    siteTechnicalIssue: number;
    feasibilityBalance: number;
    waitingForSubsidy: number;
    jansamarthBalance: number;
    completed: number;
  };
}

export async function fetchDashboardStats(vendorId?: string | null): Promise<DashboardStats> {
  const url = vendorId ? `${API_BASE}/dashboard/stats?vendorId=${vendorId}` : `${API_BASE}/dashboard/stats`;
  
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
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}
