// Centralized API Configuration
export const API_BASE = "https://4e948ef7-1668-4c39-85db-342a63b048e3-00-124qj2yd3st31.sisko.replit.dev";

// Helper to safely parse JSON responses
export async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}

// Create a new claim and return the claimId
export async function createClaim(): Promise<string> {
  const response = await fetch(`${API_BASE}/claims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Failed to create claim: ${response.statusText}`);
  }

  const data = await safeJsonParse<{ claimId: string }>(response);
  return data.claimId;
}

// Re-export all agent functions for convenience
export { uploadImage, type VisionAnalysisResult } from './visionAgent';
export { extractDocuments, type ExtractedDocumentData } from './documentAgent';
export { getDecision, type DecisionResult } from './decisionAgent';
export { simulateRPA, type RPAResult, type RPAStep } from './rpaAgent';
