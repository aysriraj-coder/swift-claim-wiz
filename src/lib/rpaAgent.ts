import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface RPAStep {
  step: number;
  description: string;
  status: "completed" | "in_progress" | "pending";
}

export interface RPAResult {
  steps: RPAStep[];
  overall_status: "success" | "failed";
}

export async function simulateRPA(claimId: string, claimData: any): Promise<RPAResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  try {
    const response = await fetch(`${API_BASE}/claims/${claimId}/simulate-rpa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claimData),
    });

    if (response.status === 404) {
      throw new Error('Backend endpoint not found. Please check API Base URL.');
    }

    if (!response.ok) {
      throw new Error(`RPA simulation failed: ${response.statusText}`);
    }

    return safeJsonParse<RPAResult>(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend unreachable. Please check API Base URL.');
    }
    throw error;
  }
}
