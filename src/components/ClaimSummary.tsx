import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Download, 
  Eye, 
  FileText, 
  Brain, 
  Bot, 
  Users 
} from "lucide-react";
import { VisionAnalysisResult } from "@/lib/visionAgent";
import { ExtractedDocumentData } from "@/lib/documentAgent";
import { DecisionResult } from "@/lib/decisionAgent";
import { RPAResult } from "@/lib/rpaAgent";
import { cn } from "@/lib/utils";

interface ClaimSummaryProps {
  visionResult: VisionAnalysisResult | null;
  documentData: ExtractedDocumentData | null;
  decision: DecisionResult | null;
  rpaResult: RPAResult | null;
}

export function ClaimSummary({ visionResult, documentData, decision, rpaResult }: ClaimSummaryProps) {
  const handleDownload = () => {
    const summary = {
      timestamp: new Date().toISOString(),
      visionAnalysis: visionResult,
      documentExtraction: documentData,
      decision: decision,
      rpaExecution: rpaResult
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claim-summary-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDecisionIcon = () => {
    switch (decision?.decision) {
      case "Auto-Approve":
        return <CheckCircle className="w-8 h-8 text-success" />;
      case "Manual Review":
        return <AlertTriangle className="w-8 h-8 text-warning" />;
      case "SIU Flag":
        return <AlertCircle className="w-8 h-8 text-destructive" />;
      default:
        return null;
    }
  };

  const getDecisionColor = () => {
    switch (decision?.decision) {
      case "Auto-Approve":
        return "text-success";
      case "Manual Review":
        return "text-warning";
      case "SIU Flag":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getDecisionIcon()}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Claim Processing Complete</h1>
              <p className="text-muted-foreground">All agents have completed their tasks</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-lg px-4 py-2", getDecisionColor())}
          >
            {decision?.decision || "Processing"}
          </Badge>
        </div>
      </Card>

      {/* Agent Results Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vision Agent Results */}
        <Card className="p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Vision Agent</h3>
              <p className="text-sm text-muted-foreground">Image Analysis</p>
            </div>
          </div>
          {visionResult ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Damage Zone</span>
                <span className="font-medium text-foreground">{visionResult.damageZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severity</span>
                <span className="font-medium text-foreground">{visionResult.damageSeverity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="font-medium text-foreground">{(visionResult.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No vision data available</p>
          )}
        </Card>

        {/* Document Agent Results */}
        <Card className="p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Document Agent</h3>
              <p className="text-sm text-muted-foreground">Data Extraction</p>
            </div>
          </div>
          {documentData ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Policy Number</span>
                <span className="font-medium text-foreground">{documentData.policyNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim Amount</span>
                <span className="font-medium text-foreground">
                  ₹{documentData.claimAmount?.toLocaleString() || "N/A"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No document data available</p>
          )}
        </Card>

        {/* Decision Agent Results */}
        <Card className="p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
              <Brain className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Decision Agent</h3>
              <p className="text-sm text-muted-foreground">Risk Assessment</p>
            </div>
          </div>
          {decision ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Decision</span>
                <Badge className={cn(
                  decision.decision === "Auto-Approve" && "bg-success/20 text-success",
                  decision.decision === "Manual Review" && "bg-warning/20 text-warning",
                  decision.decision === "SIU Flag" && "bg-destructive/20 text-destructive"
                )}>
                  {decision.decision}
                </Badge>
              </div>
              {decision.approvedAmount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved Amount</span>
                  <span className="font-medium text-foreground">₹{decision.approvedAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Reason</p>
                <p className="text-sm text-foreground">{decision.reason || "N/A"}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No decision data available</p>
          )}
        </Card>

        {/* RPA Agent Results */}
        <Card className="p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">RPA Agent</h3>
              <p className="text-sm text-muted-foreground">System Automation</p>
            </div>
          </div>
          {rpaResult ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={rpaResult.status === "success" ? "default" : "destructive"}>
                  {rpaResult.status === "success" ? "Completed" : rpaResult.status}
                </Badge>
              </div>
              <div className="space-y-2">
                {rpaResult.steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-foreground">{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">RPA not executed (SIU flagged)</p>
          )}
        </Card>
      </div>

      {/* Customer Experience Summary */}
      <Card className="p-6 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Customer Experience Agent</h3>
            <p className="text-sm text-muted-foreground">Final Status</p>
          </div>
        </div>
        <div className={cn(
          "p-4 rounded-lg border",
          decision?.decision === "Auto-Approve" && "bg-success/10 border-success/20",
          decision?.decision === "Manual Review" && "bg-warning/10 border-warning/20",
          decision?.decision === "SIU Flag" && "bg-destructive/10 border-destructive/20"
        )}>
          <p className={cn("font-medium", getDecisionColor())}>
            {decision?.decision === "Auto-Approve" && "Your claim has been automatically approved and processed."}
            {decision?.decision === "Manual Review" && "Your claim requires additional review by our team. We'll contact you within 24-48 hours."}
            {decision?.decision === "SIU Flag" && "Your claim has been flagged for special investigation. Our team will reach out for more information."}
          </p>
        </div>
      </Card>

      {/* Download Button */}
      <div className="flex justify-center">
        <Button onClick={handleDownload} size="lg" className="gap-2">
          <Download className="w-5 h-5" />
          Download Claim Summary
        </Button>
      </div>
    </div>
  );
}
