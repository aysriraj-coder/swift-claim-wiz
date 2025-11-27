import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface ExtractedDocumentData {
  claimAmount?: number;
  policyNumber?: string;
  documentType?: string;
  extractedText?: string;
  metadata?: Record<string, any>;
}

// Extract data from uploaded documents
export async function extractDocuments(claimId: string): Promise<ExtractedDocumentData> {
  const backendOnline = useBackendStore.getState().backendOnline;
  if (!backendOnline) throw new Error("Backend offline.");

  const response = await fetch(`${API_BASE}/claims/${claimId}/extract-docs`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Document extraction failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}
