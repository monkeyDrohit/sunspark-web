const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchCategories(): Promise<Category[]> {
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
  
  const res = await fetch(`${API_BASE}/categories`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
