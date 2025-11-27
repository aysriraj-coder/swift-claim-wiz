import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { getDecision, DecisionResult } from "@/lib/decisionAgent";
import { toast } from "sonner";

interface DecisionStepProps {
  claimId: string;
  onComplete: (decision: DecisionResult) => void;
}

export function DecisionStep({ claimId, onComplete }: DecisionStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<DecisionResult | null>(null);

  const handleRunDecision = async () => {
    setIsProcessing(true);
    try {
      const result = await getDecision(claimId);
      setDecision(result);
      toast.success("Decision engine completed");
    } catch (error) {
      toast.error("Decision engine failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDecisionIcon = () => {
    if (!decision) return null;
    switch (decision.decision) {
      case "APPROVE":
        return <CheckCircle className="w-12 h-12 text-success" />;
      case "REJECT":
        return <XCircle className="w-12 h-12 text-destructive" />;
      case "NEEDS_INFO":
        return <AlertTriangle className="w-12 h-12 text-warning" />;
      default:
        return <Gavel className="w-12 h-12 text-primary" />;
    }
  };

  const getDecisionColor = () => {
    if (!decision) return "";
    switch (decision.decision) {
      case "APPROVE":
        return "bg-success/10 border-success/20";
      case "REJECT":
        return "bg-destructive/10 border-destructive/20";
      case "NEEDS_INFO":
        return "bg-warning/10 border-warning/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Decision Engine</h2>
          <p className="text-muted-foreground">
            Run the AI decision engine to evaluate the claim
          </p>
        </div>

        {decision ? (
          <Card className={`p-6 ${getDecisionColor()}`}>
            <div className="text-center space-y-4">
              {getDecisionIcon()}
              <div>
                <Badge
                  variant={
                    decision.decision === "APPROVE" ? "default" :
                    decision.decision === "REJECT" ? "destructive" : "secondary"
                  }
                  className={`text-lg px-4 py-1 ${decision.decision === "APPROVE" ? "bg-success" : ""}`}
                >
                  {decision.decision}
                </Badge>
              </div>
              <p className="text-foreground">{decision.reason}</p>
              
              {decision.approvedAmount && (
                <div className="bg-background/50 rounded-lg p-4">
                  <span className="text-muted-foreground">Approved Amount:</span>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{decision.approvedAmount.toLocaleString()}
                  </p>
                </div>
              )}

              {decision.missingFields && decision.missingFields.length > 0 && (
                <div className="bg-background/50 rounded-lg p-4 text-left">
                  <span className="text-muted-foreground text-sm">Missing Information:</span>
                  <ul className="mt-2 space-y-1">
                    {decision.missingFields.map((field, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Button
            onClick={handleRunDecision}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Decision...
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4 mr-2" />
                Run Decision Engine
              </>
            )}
          </Button>
        )}

        {decision && (
          <Button
            onClick={() => onComplete(decision)}
            className="w-full"
            size="lg"
          >
            Continue to RPA Simulation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
}
