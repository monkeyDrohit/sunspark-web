const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Document {
  id: string;
  serviceLeadId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string | null;
  approved: boolean;
  approvedBy: string | null;
  score: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchDocuments(serviceLeadId: string): Promise<Document[]> {
  const response = await fetch(`${API_BASE}/service-leads/${serviceLeadId}/documents`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
}

export async function uploadDocument(serviceLeadId: string, type: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('serviceLeadId', serviceLeadId);
  formData.append('type', type);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document');
  }
  return response.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete document');
}
