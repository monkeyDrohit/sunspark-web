const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Vendor {
  id: string;
  name: string;
  logo: string | null;
  companyName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchVendors(): Promise<Vendor[]> {
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
  
  const res = await fetch(`${API_BASE}/vendors`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return res.json();
}

export async function fetchVendor(id: string): Promise<Vendor | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/vendors/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteVendor(id: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}/vendors/${id}`, { 
    method: 'DELETE',
    credentials: 'include',
    headers,
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete vendor');
  }
}
