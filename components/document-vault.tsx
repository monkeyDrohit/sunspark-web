'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument, Document } from '@/lib/documents';
import { useToast } from '@/hooks/use-toast';

const DOCUMENT_TYPES = [
  { label: 'Aadhar Card', value: 'AADHAR_CARD' },
  { label: 'Electricity Bill', value: 'ELECTRICITY_BILL' },
  { label: 'Bank Passbook', value: 'BANK_PASSBOOK' },
  { label: 'PAN Card', value: 'PAN_CARD' },
  { label: 'Agreement', value: 'AGREEMENT' },
  { label: 'Installation Photo', value: 'INSTALLATION_PHOTO' },
  { label: 'Other', value: 'OTHER' },
];

export function DocumentVault({ serviceLeadId }: { serviceLeadId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('AADHAR_CARD');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    loadDocuments();
  }, [serviceLeadId]);

  async function loadDocuments() {
    try {
      setLoading(true);
      const data = await fetchDocuments(serviceLeadId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await uploadDocument(serviceLeadId, selectedType, selectedFile);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      loadDocuments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(id);
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      loadDocuments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete document',
        variant: 'destructive',
      });
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Vault
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Upload Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg border border-dashed">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="document-file">File</Label>
              <Input
                id="document-file"
                type="file"
                className="cursor-pointer"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {/* Documents List */}
          <div className="grid gap-3">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 bg-muted/10 rounded-lg border">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{doc.fileName}</span>
                          <Badge variant="secondary" className="text-[10px] h-4">
                            {doc.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Uploaded by {doc.uploadedBy} · {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a 
                          href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `${API_BASE_URL}${doc.fileUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
