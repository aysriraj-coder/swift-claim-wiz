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
  company_id: string;
  policyNumber?: string;
  claimAmount?: number;
  damageDescription?: string;
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

  const response = await fetch(`${API_BASE}/claims/${claimId}/upload`, {
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
  const response = await fetch(`${API_BASE}/claims/${claimId}/check`, {
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
  damageZone?: string;
  mismatchCount?: number;
  approvedAmount?: number;
}

// Get decision for claim
export async function getDecision(claimId: string): Promise<DecisionResult> {
  const response = await fetch(`${API_BASE}/claims/${claimId}/decision`, {
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
}

export interface RPAResult {
  status: string;
  steps: RPAStep[];
}

// Simulate RPA workflow
export async function simulateRPA(claimId: string): Promise<RPAResult> {
  const response = await fetch(`${API_BASE}/claims/${claimId}/simulate-rpa`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`RPA simulation failed: ${response.statusText}`);
  }

  return safeJsonParse(response);
}
