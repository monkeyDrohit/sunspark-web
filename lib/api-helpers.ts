import { cookies } from 'next/headers';

/**
 * Get auth headers for API requests
 * Works in both server and client components
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {};
  
  // On server, read from cookies
  if (typeof window === 'undefined') {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } else {
    // On client, read from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}
