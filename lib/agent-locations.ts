import { getAuthHeaders } from './api-helpers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface LiveAgentLocation {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture: string | null;
  latitude: number;
  longitude: number;
  lastLocationUpdate: string;
  user?: {
    assignedApplications: Array<{ id: string; serviceId: string }>;
  };
}

export async function fetchLiveAgentLocations(vendorId?: string | null): Promise<LiveAgentLocation[]> {
  const url = vendorId 
    ? `${API_BASE}/agent-locations/live?vendorId=${vendorId}` 
    : `${API_BASE}/agent-locations/live`;
  
  const headers = await getAuthHeaders();
  
  const res = await fetch(url, { 
    cache: 'no-store', // Always fetch fresh data
    credentials: 'include',
    headers,
  });
  
  if (!res.ok) throw new Error('Failed to fetch live agent locations');
  return res.json();
}
