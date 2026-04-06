import { getAuthHeaders } from './api-helpers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Discom {
  id: string;
  name: string;
  circle: string | null;
  division: string | null;
  subDivision: string | null;
  state: string | null;
  district: string | null;
}

export async function fetchDiscoms(vendorId?: string | null): Promise<Discom[]> {
  const url = vendorId ? `${API_BASE}/discoms?vendorId=${vendorId}` : `${API_BASE}/discoms`;
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch discoms');
  return res.json();
}
