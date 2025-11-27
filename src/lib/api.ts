// Centralized API Configuration
export const API_BASE = "https://c8ccbc7a-0b0b-4b6b-8382-59c52e3d4ff1-00-mp30ce7exoea.pike.replit.dev";

// Helper to safely parse JSON responses
export async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}

export interface CreateClaimPayload {
  customerName: string;
  policyNumber: string;
  company: string;
}

// Create a new claim and return the claimId
export async function createClaim(payload: CreateClaimPayload): Promise<string> {
  const response = await fetch(`${API_BASE}/claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create claim: ${response.statusText}`);
  }

  const data = await safeJsonParse<{ claimId: string }>(response);
  return data.claimId;
}

// Upload a file (image or document)
export async function uploadFile(
  claimId: string,
  file: File,
  type: "image" | "document"
): Promise<{ filename: string; message: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await fetch(`${API_BASE}/claims/${claimId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}

// Re-export all agent functions for convenience
export { analyzeImage, type VisionAnalysisResult } from './visionAgent';
export { extractDocuments, type ExtractedDocumentData } from './documentAgent';
export { getDecision, type DecisionResult } from './decisionAgent';
export { simulateRPA, type RPAResult, type RPAStep } from './rpaAgent';
