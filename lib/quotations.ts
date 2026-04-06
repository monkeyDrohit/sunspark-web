import { getAuthHeaders } from './api-helpers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Quotation {
  id: string;
  quotationNumber: string | null;
  applicationId: string | null;
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
    productId: string;
    product: { id: string; name: string };
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}

export interface QuotationInput {
  applicationId?: string;
  customerId: string;
  totalAmount: number;
  notes?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export async function fetchQuotations(vendorId?: string | null): Promise<Quotation[]> {
  const url = vendorId ? `${API_BASE}/quotations?vendorId=${vendorId}` : `${API_BASE}/quotations`;
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) throw new Error('Failed to fetch quotations');
  return res.json();
}

export async function fetchQuotation(id: string): Promise<Quotation | null> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/quotations/${id}`, { 
    cache: 'no-store',
    credentials: 'include',
    headers,
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createQuotation(data: QuotationInput): Promise<Quotation> {
  const baseHeaders = await getAuthHeaders();
  const headers = {
    ...baseHeaders,
    'Content-Type': 'application/json',
  };
  
  const res = await fetch(`${API_BASE}/quotations`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create quotation');
  }
  return res.json();
}
