import { Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ClaimStatus, getStatusMessage } from "@/lib/customerExperienceAgent";
import { cn } from "@/lib/utils";

interface CustomerExperiencePanelProps {
  status: ClaimStatus;
}

export function CustomerExperiencePanel({ status }: CustomerExperiencePanelProps) {
  const message = getStatusMessage(status);

  const getIcon = () => {
    switch (message.type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (message.type) {
      case "success":
        return "bg-success/10 border-success/20 text-success";
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning";
      case "error":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      default:
        return "bg-primary/10 border-primary/20 text-primary";
    }
  };

  // Map status to human-friendly step indicator
  const getStepIndicator = () => {
    const steps = [
      { key: "image", label: "Image Analysis", statuses: ["analyzing_image", "image_analyzed"] },
      { key: "document", label: "Document Extraction", statuses: ["extracting_documents", "documents_extracted"] },
      { key: "decision", label: "Decision Engine", statuses: ["making_decision", "decision_made"] },
      { key: "rpa", label: "System Automation", statuses: ["executing_rpa", "rpa_completed"] },
      { key: "final", label: "Complete", statuses: ["claim_approved", "claim_review", "claim_flagged"] }
    ];

    const currentStepIndex = steps.findIndex(step => step.statuses.includes(status));
    
    if (currentStepIndex === -1 || status === "idle") return null;

    return (
      <div className="flex items-center gap-1 mt-2">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              index < currentStepIndex ? "bg-current opacity-100" :
              index === currentStepIndex ? "bg-current opacity-60 animate-pulse" :
              "bg-current opacity-20"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 p-4 max-w-sm border shadow-[var(--shadow-strong)] animate-slide-in-right",
        getColorClasses()
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold mb-1">{message.title}</p>
          <p className="text-sm opacity-90">{message.description}</p>
          {getStepIndicator()}
        </div>
      </div>
    </Card>
  );
}
