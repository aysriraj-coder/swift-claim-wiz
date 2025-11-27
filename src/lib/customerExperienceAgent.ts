export type ClaimStatus = 
  | "idle"
  | "analyzing_image"
  | "image_analyzed"
  | "extracting_documents"
  | "documents_extracted"
  | "making_decision"
  | "decision_made"
  | "executing_rpa"
  | "rpa_completed"
  | "claim_approved"
  | "claim_review"
  | "claim_flagged";

interface StatusMessage {
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error";
}

export function getStatusMessage(status: ClaimStatus): StatusMessage {
  const messages: Record<ClaimStatus, StatusMessage> = {
    idle: {
      title: "Ready to start",
      description: "Upload your vehicle damage image to begin the claim process",
      type: "info"
    },
    analyzing_image: {
      title: "Analyzing image...",
      description: "Our AI is examining the damage to your vehicle",
      type: "info"
    },
    image_analyzed: {
      title: "Image analysis complete",
      description: "Damage detected successfully. Please upload your claim documents",
      type: "success"
    },
    extracting_documents: {
      title: "Processing documents...",
      description: "Extracting information from your uploaded files",
      type: "info"
    },
    documents_extracted: {
      title: "Documents processed",
      description: "All information extracted. Evaluating your claim...",
      type: "success"
    },
    making_decision: {
      title: "Evaluating claim...",
      description: "Running decision engine to assess your claim",
      type: "info"
    },
    decision_made: {
      title: "Decision complete",
      description: "Your claim has been evaluated",
      type: "success"
    },
    executing_rpa: {
      title: "Processing claim...",
      description: "Automating system updates for your claim",
      type: "info"
    },
    rpa_completed: {
      title: "System updated",
      description: "All systems have been updated with your claim information",
      type: "success"
    },
    claim_approved: {
      title: "Claim approved! 🎉",
      description: "Your claim has been automatically approved and processed",
      type: "success"
    },
    claim_review: {
      title: "Manual review required",
      description: "Your claim needs additional review by our team",
      type: "warning"
    },
    claim_flagged: {
      title: "SIU review required",
      description: "Your claim has been flagged for special investigation",
      type: "error"
    }
  };

  return messages[status];
}
