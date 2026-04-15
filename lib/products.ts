import { getAuthHeaders } from './api-helpers';

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
  vendorId?: string | null;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
  }
  
  const url = `${API_BASE}/products?${searchParams}`;
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/products/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createProduct(data: Partial<Product> & { vendorId?: string | null }): Promise<Product> {
  const headers = await getAuthHeaders();
  headers['Content-Type'] = 'application/json';
  
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create product');
  }
  
  return res.json();
}
