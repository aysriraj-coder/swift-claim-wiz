const API_BASE = "https://4e94a8e7-1668-4c39-85db-342a63b048e3-00-124qi2yd3st31.sisko.replit.dev:8000";

export interface RPAStep {
  step: number;
  description: string;
  status: "completed" | "in_progress" | "pending";
}

export interface RPAResult {
  steps: RPAStep[];
  overall_status: "success" | "failed";
}

export async function simulateRPA(claimData: any): Promise<RPAResult> {
  const response = await fetch(`${API_BASE}/simulate-rpa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(claimData),
  });

  if (!response.ok) {
    throw new Error(`RPA simulation failed: ${response.statusText}`);
  }

  return response.json();
}
