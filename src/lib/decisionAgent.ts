import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface DecisionResult {
  decision: "Auto-Approve" | "Manual Review" | "SIU Flag";
  risk_score: number;
  mismatch_score: number;
  reasoning: string;
}

export interface DecisionPayload {
  vision_analysis: any;
  document_data: any;
}

export async function getDecision(claimId: string, payload: DecisionPayload): Promise<DecisionResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const response = await fetch(`${API_BASE}/claims/${claimId}/decision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Decision engine failed: ${response.statusText}`);
  }

  return safeJsonParse<DecisionResult>(response);
}
