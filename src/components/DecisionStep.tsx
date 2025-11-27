import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, CheckCircle, XCircle, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { getDecision, DecisionResult } from "@/lib/api";
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
    const d = decision.decision.toLowerCase();
    if (d.includes("approve") || d === "auto-approve") return <CheckCircle className="w-12 h-12 text-success" />;
    if (d.includes("reject") || d === "siu") return <XCircle className="w-12 h-12 text-destructive" />;
    if (d.includes("review") || d === "manual review") return <AlertTriangle className="w-12 h-12 text-warning" />;
    return <Gavel className="w-12 h-12 text-primary" />;
  };

  const getDecisionColor = () => {
    if (!decision) return "";
    const d = decision.decision.toLowerCase();
    if (d.includes("approve") || d === "auto-approve") return "bg-success/10 border-success/20";
    if (d.includes("reject") || d === "siu") return "bg-destructive/10 border-destructive/20";
    return "bg-warning/10 border-warning/20";
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Decision Summary</h2>
          <p className="text-muted-foreground">
            AI-powered claim decision based on uploaded evidence
          </p>
        </div>

        {decision ? (
          <Card className={`p-6 ${getDecisionColor()}`}>
            <div className="text-center space-y-4">
              {getDecisionIcon()}
              <div>
                <Badge
                  variant={
                    decision.decision.toLowerCase().includes("approve") ? "default" :
                    decision.decision.toLowerCase().includes("reject") || decision.decision.toLowerCase() === "siu" ? "destructive" : "secondary"
                  }
                  className={`text-lg px-4 py-1 ${decision.decision.toLowerCase().includes("approve") ? "bg-success" : ""}`}
                >
                  {decision.decision}
                </Badge>
              </div>
              <p className="text-foreground">{decision.reason}</p>
              
              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-3 text-left">
                {decision.riskLevel && (
                  <div className="bg-background/50 rounded-lg p-3">
                    <span className="text-muted-foreground text-sm">Risk Level</span>
                    <p className="font-medium text-foreground">{decision.riskLevel}</p>
                  </div>
                )}
                {decision.damageZone && (
                  <div className="bg-background/50 rounded-lg p-3">
                    <span className="text-muted-foreground text-sm">Damage Zone</span>
                    <p className="font-medium text-foreground">{decision.damageZone}</p>
                  </div>
                )}
                {decision.mismatchCount !== undefined && (
                  <div className="bg-background/50 rounded-lg p-3">
                    <span className="text-muted-foreground text-sm">Mismatch Count</span>
                    <p className="font-medium text-foreground">{decision.mismatchCount}</p>
                  </div>
                )}
                {decision.approvedAmount !== undefined && (
                  <div className="bg-background/50 rounded-lg p-3">
                    <span className="text-muted-foreground text-sm">Approved Amount</span>
                    <p className="font-medium text-success">₹{decision.approvedAmount.toLocaleString()}</p>
                  </div>
                )}
              </div>
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
