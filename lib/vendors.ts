import { getAuthHeaders } from './api-helpers';

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
  const headers = await getAuthHeaders();
  
  const res = await fetch(`${API_BASE}/vendors`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return res.json();
}

export async function fetchVendor(id: string): Promise<Vendor | null> {
  const headers = await getAuthHeaders();
  
  const res = await fetch(`${API_BASE}/vendors/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteVendor(id: string): Promise<void> {
  const baseHeaders = await getAuthHeaders();
  
  const res = await fetch(`${API_BASE}/vendors/${id}`, { 
    method: 'DELETE',
    credentials: 'include',
    headers: baseHeaders,
  });
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete vendor');
  }
}
