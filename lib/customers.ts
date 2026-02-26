const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  gender: string | null;
  city: string | null;
  address: string | null;
  fieldAgentId: string | null;
  fieldAgent: { id: string; name: string; email: string } | null;
  teamLeadId: string | null;
  teamLead: { id: string; name: string; email: string } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCustomers(params?: {
  name?: string;
  mobile?: string;
  email?: string;
  city?: string;
  fieldAgentId?: string;
  status?: string;
}): Promise<Customer[]> {
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
  
  const res = await fetch(`${API_BASE}/customers?${searchParams}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomer(id: string): Promise<Customer | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/customers/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create customer');
  }
  return res.json();
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}/customers/${id}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update customer');
  }
  return res.json();
}
