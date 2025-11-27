import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface RPAStep {
  step: number;
  description: string;
}

export interface RPAResult {
  status: string;
  steps: RPAStep[];
}

export async function simulateRPA(claimId: string): Promise<RPAResult> {

  const backendOnline = useBackendStore.getState().backendOnline;
  if (!backendOnline) throw new Error("Backend offline.");

  const response = await fetch(`${API_BASE}/claims/${claimId}/simulate-rpa`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`RPA simulation failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}
