const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'SYSTEM_ADMIN' | 'SUPER_ADMIN' | 'SUB_ADMIN' | 'FIELD_AGENT' | 'CUSTOMER';
  status: string;
  vendorId: string | null;
  vendor: {
    id: string;
    name: string;
    logo: string | null;
    companyName: string | null;
  } | null;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await res.json();
  // Store token in localStorage for API calls
  if (typeof window !== 'undefined' && data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/auth/me`, {
      headers,
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function updateProfile(data: { name?: string; phone?: string; password?: string }): Promise<User> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update profile');
  }

  const result = await res.json();
  return result.user;
}

export async function getServerUser(): Promise<User | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}
