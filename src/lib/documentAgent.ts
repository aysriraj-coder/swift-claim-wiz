import { useBackendStore } from './backendStore';

const API_BASE = "https://4e948ef7-1668-4c39-85db-342a63b048e3-00-124qj2yd3st31.sisko.replit.dev:8000";

export interface ExtractedDocumentData {
  policy_number: string;
  vehicle_make: string;
  vehicle_model: string;
  claimant_name: string;
  damage_notes: string;
  claim_amount: number;
}

export async function extractDocuments(documentFile: File): Promise<ExtractedDocumentData> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const formData = new FormData();
  formData.append('document', documentFile);

  const response = await fetch(`${API_BASE}/extract-documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Document extraction failed: ${response.statusText}`);
  }

  return response.json();
}
