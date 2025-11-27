import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DecisionResult } from "@/lib/decisionAgent";
import { cn } from "@/lib/utils";

interface DecisionDisplayProps {
  decision: DecisionResult;
}

export function DecisionDisplay({ decision }: DecisionDisplayProps) {
  const getDecisionIcon = () => {
    switch (decision.decision) {
      case "Auto-Approve":
        return <CheckCircle className="w-12 h-12 text-success" />;
      case "Manual Review":
        return <AlertTriangle className="w-12 h-12 text-warning" />;
      case "SIU Flag":
        return <AlertCircle className="w-12 h-12 text-destructive" />;
    }
  };

  const getDecisionColor = () => {
    switch (decision.decision) {
      case "Auto-Approve":
        return "text-success";
      case "Manual Review":
        return "text-warning";
      case "SIU Flag":
        return "text-destructive";
    }
  };

  const getDecisionBg = () => {
    switch (decision.decision) {
      case "Auto-Approve":
        return "bg-success/10 border-success/20";
      case "Manual Review":
        return "bg-warning/10 border-warning/20";
      case "SIU Flag":
        return "bg-destructive/10 border-destructive/20";
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">{getDecisionIcon()}</div>
          <div>
            <h2 className={cn("text-3xl font-bold mb-2", getDecisionColor())}>
              {decision.decision}
            </h2>
            <p className="text-muted-foreground">{decision.reasoning}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={cn("rounded-lg p-4 border", getDecisionBg())}>
            <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
            <p className="text-2xl font-bold text-foreground">
              {(decision.risk_score * 100).toFixed(0)}%
            </p>
          </div>
          <div className={cn("rounded-lg p-4 border", getDecisionBg())}>
            <p className="text-sm text-muted-foreground mb-1">Mismatch Score</p>
            <p className="text-2xl font-bold text-foreground">
              {(decision.mismatch_score * 100).toFixed(0)}%
            </p>
          </div>
        </div>

        {decision.decision === "Auto-Approve" && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
            <p className="text-success font-medium">
              Your claim will be automatically processed
            </p>
          </div>
        )}

        {decision.decision === "Manual Review" && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
            <p className="text-warning font-medium">
              A claims specialist will review your case within 24 hours
            </p>
          </div>
        )}

        {decision.decision === "SIU Flag" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium">
              This claim requires special investigation unit review
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
