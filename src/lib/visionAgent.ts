import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface VisionAnalysisResult {
  damageSeverity: string;
  damageZone: string;
  confidence: number;
  error?: string;
}

// Analyze images that have been uploaded
export async function analyzeImage(claimId: string): Promise<VisionAnalysisResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  if (!backendOnline) throw new Error("Backend offline.");

  const response = await fetch(`${API_BASE}/claims/${claimId}/analyze-image`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Image analysis failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}
