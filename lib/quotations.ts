const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Quotation {
  id: string;
  quotationNumber: string | null;
  customerId: string;
  customer: { id: string; name: string; email: string };
  status: string;
  totalAmount: string;
  notes: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    product: { id: string; name: string };
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

export async function fetchQuotations(): Promise<Quotation[]> {
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
  
  const res = await fetch(`${API_BASE}/quotations`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch quotations');
  return res.json();
}
