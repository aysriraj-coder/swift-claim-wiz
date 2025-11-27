import { useBackendStore } from './backendStore';

const API_BASE = "https://4e94a8e7-1668-4c39-85db-342a63b048e3-00-124qi2yd3st31.sisko.replit.dev:8000";

export interface VisionAnalysisResult {
  damage_area: string;
  confidence: number;
  mismatch_detected: boolean;
  requires_more_images: boolean;
  escalate_to_siu: boolean;
}

export async function analyzeImage(imageFile: File, userDescription?: string): Promise<VisionAnalysisResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const formData = new FormData();
  formData.append('image', imageFile);
  if (userDescription) {
    formData.append('description', userDescription);
  }

  const response = await fetch(`${API_BASE}/analyze-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Vision analysis failed: ${response.statusText}`);
  }

  return response.json();
}
