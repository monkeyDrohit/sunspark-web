const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Document {
  id: string;
  applicationId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  score: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchDocuments(applicationId: string): Promise<Document[]> {
  const response = await fetch(`${API_BASE}/applications/${applicationId}/documents`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
}

export async function uploadDocument(applicationId: string, type: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('applicationId', applicationId);
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

export async function reviewDocument(
  documentId: string,
  data: { status: 'APPROVED' | 'REJECTED'; score?: number; notes?: string }
): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents/${documentId}/review`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to review document');
  }
  return response.json();
}

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${documentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete document');
}
