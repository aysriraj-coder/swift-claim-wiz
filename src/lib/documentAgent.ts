import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface ExtractedDocumentData {
  claimAmount?: number;
  policyNumber?: string;
  extracted?: any;
}

export async function extractDocuments(
  claimId: string,
  documentFile: File
): Promise<ExtractedDocumentData> {

  const backendOnline = useBackendStore.getState().backendOnline;
  if (!backendOnline) throw new Error("Backend offline.");

  const formData = new FormData();
  formData.append("file", documentFile);

  const response = await fetch(`${API_BASE}/claims/${claimId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Document extraction failed: ${response.statusText}`);
  }

  const data = await safeJsonParse<{ metadata?: { extract?: ExtractedDocumentData } }>(response);
  return data.metadata?.extract || {};
}
