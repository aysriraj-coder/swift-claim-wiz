import { useBackendStore } from './backendStore';

const API_BASE = "https://4e94a8e7-1668-4c39-85db-342a63b048e3-00-124qi2yd3st31.sisko.replit.dev:8000";

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

export async function getDecision(payload: DecisionPayload): Promise<DecisionResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const response = await fetch(`${API_BASE}/decision-engine`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Decision engine failed: ${response.statusText}`);
  }

  return response.json();
}
