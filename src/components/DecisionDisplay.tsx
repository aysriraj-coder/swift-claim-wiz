import { CheckCircle, AlertTriangle, AlertCircle, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

  const getThresholdExplanation = () => {
    const riskPercent = decision.risk_score * 100;
    const mismatchPercent = decision.mismatch_score * 100;
    
    if (decision.decision === "Auto-Approve") {
      return `Risk score (${riskPercent.toFixed(0)}%) and mismatch score (${mismatchPercent.toFixed(0)}%) are both below approval thresholds.`;
    } else if (decision.decision === "Manual Review") {
      return `Risk score (${riskPercent.toFixed(0)}%) or mismatch score (${mismatchPercent.toFixed(0)}%) exceeded auto-approval threshold but not SIU threshold.`;
    } else {
      return `Risk score (${riskPercent.toFixed(0)}%) or mismatch score (${mismatchPercent.toFixed(0)}%) exceeded SIU investigation threshold.`;
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        {/* Decision Header */}
        <div className={cn("p-6 rounded-lg border text-center", getDecisionBg())}>
          <div className="flex justify-center mb-4">{getDecisionIcon()}</div>
          <h2 className={cn("text-3xl font-bold mb-2", getDecisionColor())}>
            {decision.decision}
          </h2>
          <p className="text-muted-foreground">
            {decision.decision === "Auto-Approve" && "Your claim has been automatically approved"}
            {decision.decision === "Manual Review" && "Your claim requires additional review"}
            {decision.decision === "SIU Flag" && "Your claim has been flagged for investigation"}
          </p>
        </div>

        {/* Decision Agent Card */}
        <Card className="p-4 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Decision Agent Analysis</h3>
              <p className="text-sm text-muted-foreground">Threshold-based risk assessment</p>
            </div>
          </div>

          {/* Risk Scores */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Risk Score</span>
                <Badge variant={decision.risk_score > 0.7 ? "destructive" : decision.risk_score > 0.4 ? "outline" : "secondary"}>
                  {(decision.risk_score * 100).toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={decision.risk_score * 100} 
                className={cn(
                  "h-2",
                  decision.risk_score > 0.7 ? "[&>div]:bg-destructive" : 
                  decision.risk_score > 0.4 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                )}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Mismatch Score</span>
                <Badge variant={decision.mismatch_score > 0.6 ? "destructive" : decision.mismatch_score > 0.3 ? "outline" : "secondary"}>
                  {(decision.mismatch_score * 100).toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={decision.mismatch_score * 100} 
                className={cn(
                  "h-2",
                  decision.mismatch_score > 0.6 ? "[&>div]:bg-destructive" : 
                  decision.mismatch_score > 0.3 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                )}
              />
            </div>
          </div>

          {/* Threshold Explanation */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Threshold Logic:</strong> {getThresholdExplanation()}
            </p>
          </div>
        </Card>

        {/* Reasoning */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Reasoning</h3>
          <p className="text-muted-foreground bg-muted p-4 rounded-lg">
            {decision.reasoning}
          </p>
        </div>

        {/* Status Messages */}
        {decision.decision === "Auto-Approve" && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <p className="text-success font-medium text-center">
              ✓ System automation will begin shortly
            </p>
          </div>
        )}

        {decision.decision === "Manual Review" && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <p className="text-warning font-medium text-center">
              ⚠ A claims specialist will review your case within 24-48 hours
            </p>
          </div>
        )}

        {decision.decision === "SIU Flag" && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive font-medium text-center">
              ⚠ Special Investigation Unit will contact you for additional information
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
