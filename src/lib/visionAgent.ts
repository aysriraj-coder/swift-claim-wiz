import { useBackendStore } from './backendStore';
import { API_BASE, safeJsonParse } from './api';

export interface VisionAnalysisResult {
  damage_area: string;
  confidence: number;
  mismatch_detected: boolean;
  requires_more_images: boolean;
  escalate_to_siu: boolean;
}

// Upload an image to a claim
export async function uploadImage(claimId: string, imageFile: File): Promise<{ success: boolean; filename: string }> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const response = await fetch(`${API_BASE}/claims/${claimId}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (response.status === 404) {
      throw new Error('Backend endpoint not found. Please check API Base URL.');
    }

    if (!response.ok) {
      throw new Error(`Image upload failed: ${response.statusText}`);
    }

    return safeJsonParse<{ success: boolean; filename: string }>(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend unreachable. Please check API Base URL.');
    }
    throw error;
  }
}

// Analyze an uploaded image for damage detection
export async function analyzeImage(claimId: string, imageFile: File, userDescription?: string): Promise<VisionAnalysisResult> {
  const backendOnline = useBackendStore.getState().backendOnline;
  
  if (!backendOnline) {
    throw new Error('Backend is offline. Please start the Replit server.');
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  if (userDescription) {
    formData.append('description', userDescription);
  }

  try {
    const response = await fetch(`${API_BASE}/claims/${claimId}/analyze-image`, {
      method: 'POST',
      body: formData,
    });

    if (response.status === 404) {
      throw new Error('Backend endpoint not found. Please check API Base URL.');
    }

    if (!response.ok) {
      throw new Error(`Vision analysis failed: ${response.statusText}`);
    }

    return safeJsonParse<VisionAnalysisResult>(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Backend unreachable. Please check API Base URL.');
    }
    throw error;
  }
}
