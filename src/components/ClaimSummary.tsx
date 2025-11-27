import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Scan, Gavel, Bot, RotateCcw, Download } from "lucide-react";
import { VisionAnalysisResult } from "@/lib/visionAgent";
import { ExtractedDocumentData } from "@/lib/documentAgent";
import { DecisionResult } from "@/lib/decisionAgent";
import { RPAResult } from "@/lib/rpaAgent";
import { CreateClaimPayload } from "@/lib/api";

interface ClaimSummaryProps {
  claimId?: string | null;
  claimInfo?: CreateClaimPayload | null;
  visionResult?: VisionAnalysisResult | null;
  documentData?: ExtractedDocumentData | null;
  decision?: DecisionResult | null;
  rpaResult?: RPAResult | null;
}

export function ClaimSummary({
  claimId,
  claimInfo,
  visionResult,
  documentData,
  decision,
  rpaResult
}: ClaimSummaryProps) {
  const handleNewClaim = () => {
    window.location.reload();
  };

  const handleDownload = () => {
    const summary = {
      claimId,
      claimInfo,
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
    a.download = `claim-summary-${claimId || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Claim Processing Complete</h1>
        <p className="text-muted-foreground">All workflow steps have been executed successfully</p>
        {claimId && (
          <Badge variant="outline" className="mt-2 text-lg">
            Claim ID: {claimId}
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Claim Info */}
        {claimInfo && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Claim Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium text-foreground">{claimInfo.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Policy:</span>
                <span className="font-medium text-foreground">{claimInfo.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium text-foreground">{claimInfo.company}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Vision Analysis */}
        {visionResult && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Scan className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Image Analysis</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Severity:</span>
                <Badge variant="secondary">{visionResult.damageSeverity}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <span className="font-medium text-foreground">{visionResult.damageZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium text-foreground">{(visionResult.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </Card>
        )}

        {/* Document Extraction */}
        {documentData && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Document Data</h3>
            </div>
            <div className="space-y-2 text-sm">
              {documentData.policyNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policy:</span>
                  <span className="font-medium text-foreground">{documentData.policyNumber}</span>
                </div>
              )}
              {documentData.claimAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-foreground">₹{documentData.claimAmount.toLocaleString()}</span>
                </div>
              )}
              {documentData.documentType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium text-foreground">{documentData.documentType}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Decision */}
        {decision && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Decision</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={decision.decision === "APPROVE" ? "default" : decision.decision === "REJECT" ? "destructive" : "secondary"}
                  className={decision.decision === "APPROVE" ? "bg-success" : ""}
                >
                  {decision.decision}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Reason:</span>
                <p className="font-medium text-foreground mt-1">{decision.reason}</p>
              </div>
              {decision.approvedAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved:</span>
                  <span className="font-medium text-success">₹{decision.approvedAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* RPA Result */}
        {rpaResult && (
          <Card className="p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">RPA Workflow</h3>
              <Badge variant="default" className="bg-success ml-auto">{rpaResult.status}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {rpaResult.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-foreground truncate">{step.description}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={handleDownload} variant="outline" size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
        <Button onClick={handleNewClaim} size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Claim
        </Button>
      </div>
    </div>
  );
}
