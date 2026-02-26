const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
  position: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

async function getHeaders() {
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
  return headers;
}

export async function fetchPages(): Promise<Page[]> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/pages`, { cache: 'no-store', headers, credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch pages');
  return res.json();
}

export async function fetchFaqs(): Promise<Faq[]> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/faqs`, { cache: 'no-store', headers, credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch faqs');
  return res.json();
}

export async function fetchBanners(): Promise<Banner[]> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}/banners`, { cache: 'no-store', headers, credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
}
