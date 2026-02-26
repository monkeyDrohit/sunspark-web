const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface BaseUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'SYSTEM_ADMIN' | 'SUPER_ADMIN' | 'SUB_ADMIN' | 'FIELD_AGENT' | 'CUSTOMER';
  status: string;
  vendorId: string | null;
  vendor?: { name: string };
  teamLeadId?: string | null;
  teamLead?: { name: string | null } | null;
  customerProfile?: {
    id: string;
    mobile: string;
    city: string | null;
    state: string | null;
    address: string | null;
    zipcode: string | null;
    country: string | null;
    gender: string | null;
    googleMapLink: string | null;
    latitude: number | null;
    longitude: number | null;
    fieldAgentId: string | null;
    teamLeadId: string | null;
    fieldAgent?: { name: string };
    teamLead?: { name: string };
  } | null;
  fieldAgentProfile?: {
    id: string;
    mobile: string;
    city: string | null;
    state: string | null;
    address: string | null;
    gender: string | null;
    zipcode: string | null;
    country: string | null;
    googleMapLink: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

export async function fetchUsers(role?: string): Promise<BaseUser[]> {
  const headers: HeadersInit = {};
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = new URL(`${API_BASE}/users`);
  if (role) url.searchParams.append('role', role);

  const res = await fetch(url.toString(), { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUserById(id: string): Promise<any> {
  const headers: HeadersInit = {};
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_BASE}/users/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

export async function updateUser(id: string, data: Partial<BaseUser>): Promise<BaseUser> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update user');
  }

  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete user');
  }
}

export interface ActivityLog {
  id: string;
  vendorId: string | null;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

export async function fetchActivityLogs(entityType: string, entityId: string): Promise<ActivityLog[]> {
  const headers: HeadersInit = {};
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } else {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/activity-logs/${entityType}/${entityId}`, {
    cache: 'no-store',
    credentials: 'include',
    headers,
  });

  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return res.json();
}


