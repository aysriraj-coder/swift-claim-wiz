import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface DecisionResult {
  decision: "APPROVE" | "REJECT" | "NEEDS_INFO" | string;
  reason: string;
  approvedAmount?: number;
  missingFields?: string[];
}

export async function getDecision(claimId: string): Promise<DecisionResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  if (!backendOnline) throw new Error("Backend offline.");

  const response = await fetch(`${API_BASE}/claims/${claimId}/decision`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Decision engine failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}
