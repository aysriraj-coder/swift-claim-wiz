// Centralized API Configuration
export const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://c8ccbc7a-0b0b-4b6b-8382-59c52e3d4ff1-00-mp30ce7exoea.pike.replit.dev";

// CORS error detection helper
export function isCorsError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return true;
  }
  return false;
}

// User-friendly error message for CORS issues
export function getCorsErrorMessage(): string {
  return `Request blocked by browser (CORS). Please verify backend URL or enable CORS in backend.\n\nBackend URL: ${API_BASE}`;
}

// Helper to safely parse JSON responses
export async function safeJsonParse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}

// Wrapper for fetch with CORS error handling
async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (isCorsError(error)) {
      throw new Error(getCorsErrorMessage());
    }
    throw error;
  }
}

export interface CreateClaimPayload {
  company_id: string;
  policyNumber?: string;
  claimAmount?: number;
  damageDescription?: string;
}

// Create a new claim and return the claimId
export async function createClaim(payload: CreateClaimPayload): Promise<string> {
  const response = await safeFetch(`${API_BASE}/claims`, {
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

export interface UploadResult {
  status: string;
  filename?: string;
  metadata?: {
    detector?: {
      damage_severity?: string;
      damage_zone?: string;
      confidence?: number;
    };
    extract?: {
      documentType?: string;
      extractedText?: string;
      claimAmount?: number;
      policyNumber?: string;
    };
  };
}

// Upload a file (image or document)
export async function uploadFile(claimId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await safeFetch(`${API_BASE}/claims/${claimId}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}

export interface CheckResult {
  status: "needs_info" | "ok";
  missing?: string[];
}

// Check claim for missing info
export async function checkClaim(claimId: string): Promise<CheckResult> {
  const response = await safeFetch(`${API_BASE}/claims/${claimId}/check`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Check failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}

export interface DecisionResult {
  decision: string;
  reason: string;
  riskLevel?: string;
  riskScore?: number;
  damageZone?: string;
  mismatchCount?: number;
  approvedAmount?: number;
  thresholds?: {
    autoApprove?: number;
    manualReview?: number;
    siuFlag?: number;
  };
  triagePath?: string[];
  auditTrail?: Array<{
    step: string;
    result: string;
    timestamp?: string;
  }>;
  rawPayload?: Record<string, unknown>;
}

// Get decision for claim
export async function getDecision(claimId: string): Promise<DecisionResult> {
  const response = await safeFetch(`${API_BASE}/claims/${claimId}/decision`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Decision engine failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}

export interface RPAStep {
  step: number;
  description: string;
  status?: string;
  error?: string;
}

export interface RPAResult {
  status: string;
  steps: RPAStep[];
  error?: string;
}

// Execute RPA workflow - CORRECT ENDPOINT: /claims/{id}/rpa
export async function executeRPA(claimId: string): Promise<RPAResult> {
  const response = await safeFetch(`${API_BASE}/claims/${claimId}/rpa`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (response.status === 404) {
    throw new Error("RPA not available for this claim. Contact support.");
  }

  if (!response.ok) {
    throw new Error(`RPA execution failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}

// Health check
export async function pingBackend(): Promise<boolean> {
  try {
    const response = await safeFetch(`${API_BASE}/ping`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
