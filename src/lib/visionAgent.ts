import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface VisionAnalysisResult {
  damageSeverity: string;
  damageZone: string;
  confidence: number;
  error?: string;
}

export async function uploadImage(
  claimId: string,
  imageFile: File
): Promise<{ metadata: VisionAnalysisResult; filename: string }> {

  const backendOnline = useBackendStore.getState().backendOnline;
  if (!backendOnline) throw new Error("Backend offline.");

  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${API_BASE}/claims/${claimId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Image upload failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}
