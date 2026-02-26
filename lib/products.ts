const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brand: { id: string; name: string };
  categoryId: string;
  category: { id: string; name: string };
  sku: string;
  image: string | null;
  gallery: string[];
  amount: string;
  discount: string | null;
  quantity: number;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK';
  availability: string | null;
  description: string | null;
  features: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProducts(params?: {
  name?: string;
  brandId?: string;
  categoryId?: string;
  status?: string;
}): Promise<Product[]> {
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
  
  const res = await fetch(`${API_BASE}/products?${searchParams}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/products/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}
