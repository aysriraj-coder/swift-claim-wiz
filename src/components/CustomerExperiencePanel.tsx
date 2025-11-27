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
        </div>
      </div>
    </Card>
  );
}
