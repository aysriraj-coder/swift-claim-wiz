import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Gavel,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Code,
} from "lucide-react";
import { getDecision, DecisionResult } from "@/lib/api";
import { toast } from "sonner";
import { RiskScoreGauge } from "./RiskScoreGauge";
import { TriagePathStepper } from "./TriagePathStepper";

interface DecisionStepProps {
  claimId: string;
  onComplete: (decision: DecisionResult) => void;
  hasMissingDocs?: boolean;
  onRunAnyway?: () => void;
}

export function DecisionStep({ claimId, onComplete, hasMissingDocs, onRunAnyway }: DecisionStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleRunDecision = async () => {
    if (hasMissingDocs && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    setIsProcessing(true);
    setShowConfirmModal(false);
    try {
      const result = await getDecision(claimId);
      setDecision(result);
      toast.success("Decision engine completed");
    } catch (error) {
      toast.error("Decision engine failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDecisionIcon = () => {
    if (!decision) return null;
    const d = decision.decision.toLowerCase();
    if (d.includes("approve") || d === "auto-approve")
      return <CheckCircle className="w-12 h-12 text-success" />;
    if (d.includes("siu") || d.includes("flag"))
      return <XCircle className="w-12 h-12 text-destructive" />;
    if (d.includes("review") || d === "manual review")
      return <AlertTriangle className="w-12 h-12 text-warning" />;
    return <Gavel className="w-12 h-12 text-primary" />;
  };

  const getDecisionColor = () => {
    if (!decision) return "";
    const d = decision.decision.toLowerCase();
    if (d.includes("approve") || d === "auto-approve")
      return "bg-success/10 border-success/20";
    if (d.includes("siu") || d.includes("flag"))
      return "bg-destructive/10 border-destructive/20";
    return "bg-warning/10 border-warning/20";
  };

  const riskScore = decision?.riskScore ?? decision?.risk_score ?? 0;
  const path = decision?.path ?? decision?.triagePath ?? [];
  const thresholds = decision?.thresholds;

  return (
    <Card className="p-8 max-w-[900px] mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
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

        {/* Confirm Modal for Missing Docs */}
        {showConfirmModal && (
          <Card className="p-6 bg-warning/10 border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Missing Documents</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Some required documents are missing. Running the decision engine now may result
                  in a less accurate assessment. Are you sure you want to proceed?
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleRunDecision} variant="destructive" size="sm">
                    Run Decision Anyway
                  </Button>
                  <Button onClick={() => setShowConfirmModal(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {decision ? (
          <div className="space-y-6">
            {/* Main Decision Card */}
            <Card className={`p-6 ${getDecisionColor()}`}>
              <div className="text-center space-y-4">
                {getDecisionIcon()}
                <div>
                  <Badge
                    variant={
                      decision.decision.toLowerCase().includes("approve")
                        ? "default"
                        : decision.decision.toLowerCase().includes("siu") ||
                          decision.decision.toLowerCase().includes("flag")
                        ? "destructive"
                        : "secondary"
                    }
                    className={`text-lg px-4 py-1 ${
                      decision.decision.toLowerCase().includes("approve") ? "bg-success" : ""
                    }`}
                  >
                    {decision.decision}
                  </Badge>
                </div>
                <p className="text-foreground">{decision.reason}</p>
              </div>
            </Card>

            {/* Risk Score Gauge */}
            {riskScore !== undefined && (
              <Card className="p-6">
                <RiskScoreGauge score={riskScore} thresholds={thresholds} />
              </Card>
            )}

            {/* Thresholds */}
            {thresholds && (
              <Card className="p-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Engine Thresholds</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Auto-Approve Below</p>
                    <p className="text-lg font-bold text-success">
                      {thresholds.approve ?? thresholds.autoApprove ?? 30}
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Manual Review Below</p>
                    <p className="text-lg font-bold text-warning">
                      {thresholds.manualReview ?? thresholds.manual_review ?? 60}
                    </p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">SIU Flag Above</p>
                    <p className="text-lg font-bold text-destructive">
                      {thresholds.siuFlag ?? thresholds.deny ?? 90}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Triage Path */}
            {path.length > 0 && (
              <Card className="p-4">
                <TriagePathStepper path={path} />
              </Card>
            )}

            {/* Additional Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              {decision.riskLevel && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-sm">Risk Level</span>
                  <p className="font-medium text-foreground">{decision.riskLevel}</p>
                </div>
              )}
              {decision.damageZone && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-sm">Damage Zone</span>
                  <p className="font-medium text-foreground">{decision.damageZone}</p>
                </div>
              )}
              {(decision.mismatchCount !== undefined || decision.mismatch_score !== undefined) && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-sm">Mismatch Score</span>
                  <p className="font-medium text-foreground">
                    {decision.mismatch_score ?? decision.mismatchCount}
                  </p>
                </div>
              )}
              {decision.approvedAmount !== undefined && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-sm">Approved Amount</span>
                  <p className="font-medium text-success">
                    ₹{decision.approvedAmount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Raw JSON Collapsible */}
            <Collapsible open={showRawJson} onOpenChange={setShowRawJson}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Code className="w-4 h-4 mr-2" />
                  {showRawJson ? "Hide" : "Show"} Raw Decision Payload
                  {showRawJson ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="mt-3 p-4 bg-muted rounded-lg overflow-x-auto text-xs text-foreground">
                  {JSON.stringify(decision, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          !showConfirmModal && (
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
          )
        )}

        {decision && (
          <Button onClick={() => onComplete(decision)} className="w-full" size="lg">
            Continue to RPA Simulation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
}
