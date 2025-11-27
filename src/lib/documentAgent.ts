import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface ExtractedDocumentData {
  policy_number: string;
  vehicle_make: string;
  vehicle_model: string;
  claimant_name: string;
  damage_notes: string;
  claim_amount: number;
}

export async function extractDocuments(claimId: string, documentFile: File): Promise<ExtractedDocumentData> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const formData = new FormData();
  formData.append('file', documentFile);

  try {
    const response = await fetch(`${API_BASE}/claims/${claimId}/extract-docs`, {
      method: 'POST',
      body: formData,
    });

    if (response.status === 404) {
      throw new Error('Backend endpoint not found. Please check API Base URL.');
    }

    if (!response.ok) {
      throw new Error(`Document extraction failed: ${response.statusText}`);
    }

    return safeJsonParse<ExtractedDocumentData>(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend unreachable. Please check API Base URL.');
    }
    throw error;
  }
}
