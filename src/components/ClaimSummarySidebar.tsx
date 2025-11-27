import { useState } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ClaimStatus } from "@/lib/customerExperienceAgent";
import { VisionAnalysisResult } from "@/lib/visionAgent";
import { ExtractedDocumentData } from "@/lib/documentAgent";
import { DecisionResult } from "@/lib/decisionAgent";

interface AuditEvent {
  id: string;
  timestamp: Date;
  type: "upload" | "analysis" | "decision" | "rpa" | "info";
  message: string;
}

interface ClaimSummarySidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  claimId: string;
  status: ClaimStatus;
  currentStep: number;
  uploadedImages: { name: string; preview?: string }[];
  uploadedDocuments: { name: string }[];
  visionResult?: VisionAnalysisResult | null;
  documentData?: ExtractedDocumentData | null;
  decision?: DecisionResult | null;
  auditEvents: AuditEvent[];
}

const statusLabels: Record<ClaimStatus, { label: string; color: string }> = {
  idle: { label: "Draft", color: "bg-muted text-muted-foreground" },
  uploading_images: { label: "Uploading", color: "bg-primary/20 text-primary" },
  analyzing_image: { label: "Analyzing", color: "bg-primary/20 text-primary" },
  mismatch_detected: { label: "Mismatch", color: "bg-warning/20 text-warning" },
  awaiting_correct_image: { label: "Awaiting Images", color: "bg-warning/20 text-warning" },
  image_analyzed: { label: "Images OK", color: "bg-success/20 text-success" },
  extracting_documents: { label: "Extracting", color: "bg-primary/20 text-primary" },
  documents_extracted: { label: "Docs OK", color: "bg-success/20 text-success" },
  making_decision: { label: "Deciding", color: "bg-primary/20 text-primary" },
  decision_made: { label: "Decision Ready", color: "bg-success/20 text-success" },
  executing_rpa: { label: "RPA Running", color: "bg-primary/20 text-primary" },
  rpa_completed: { label: "RPA Done", color: "bg-success/20 text-success" },
  claim_approved: { label: "Approved", color: "bg-success/20 text-success" },
  claim_review: { label: "Manual Review", color: "bg-warning/20 text-warning" },
  claim_flagged: { label: "SIU Flagged", color: "bg-destructive/20 text-destructive" },
};

const steps = [
  { id: 1, label: "Upload Images" },
  { id: 2, label: "Upload Documents" },
  { id: 3, label: "Decision" },
];

export function ClaimSummarySidebar({
  isOpen,
  onToggle,
  claimId,
  status,
  currentStep,
  uploadedImages,
  uploadedDocuments,
  visionResult,
  documentData,
  decision,
  auditEvents,
}: ClaimSummarySidebarProps) {
  const statusInfo = statusLabels[status] || statusLabels.idle;

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed top-20 z-40 transition-all duration-300 shadow-[var(--shadow-medium)] rounded-full",
          isOpen ? "right-[21rem]" : "right-4"
        )}
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-card border-l border-border shadow-[var(--shadow-strong)] z-30 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col pt-16">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-foreground">Claim Summary</h2>
              <Badge className={cn("text-xs", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{claimId}</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Steps Progress */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Progress
                </h3>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors",
                        step.id < currentStep && "bg-success/10",
                        step.id === currentStep && "bg-primary/10",
                        step.id > currentStep && "bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          step.id < currentStep && "bg-success text-success-foreground",
                          step.id === currentStep && "bg-primary text-primary-foreground",
                          step.id > currentStep && "bg-muted text-muted-foreground"
                        )}
                      >
                        {step.id < currentStep ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm",
                          step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Uploaded Files */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Uploaded Files
                </h3>
                
                {uploadedImages.length === 0 && uploadedDocuments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No files uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        {img.preview ? (
                          <img src={img.preview} alt="" className="w-8 h-8 rounded object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-xs text-foreground truncate flex-1">{img.name}</span>
                      </div>
                    ))}
                    {uploadedDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-foreground truncate flex-1">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vision Summary */}
              {visionResult && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Vision Analysis</h3>
                    <Card className="p-3 bg-muted/30 border-0">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Damage Zone:</span>
                          <span className="text-foreground font-medium">{visionResult.damageZone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="text-foreground font-medium">{(visionResult.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {/* Document Summary */}
              {documentData && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Document Data</h3>
                    <Card className="p-3 bg-muted/30 border-0">
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Policy:</span>
                          <span className="text-foreground font-medium">{documentData.policyNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="text-foreground font-medium">₹{documentData.claimAmount?.toLocaleString() || "N/A"}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {/* Decision Summary */}
              {decision && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">Decision</h3>
                    <Badge
                      className={cn(
                        "w-full justify-center py-1",
                        decision.decision === "Auto-Approve" && "bg-success/20 text-success",
                        decision.decision === "Manual Review" && "bg-warning/20 text-warning",
                        decision.decision === "SIU Flag" && "bg-destructive/20 text-destructive"
                      )}
                    >
                      {decision.decision}
                    </Badge>
                  </div>
                </>
              )}

              <Separator />

              {/* Audit Log */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Activity Log
                </h3>
                {auditEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    {auditEvents.slice(-5).reverse().map((event) => (
                      <div key={event.id} className="flex items-start gap-2 text-xs">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                            event.type === "upload" && "bg-primary",
                            event.type === "analysis" && "bg-accent",
                            event.type === "decision" && "bg-success",
                            event.type === "rpa" && "bg-warning",
                            event.type === "info" && "bg-muted-foreground"
                          )}
                        />
                        <div className="flex-1">
                          <p className="text-foreground">{event.message}</p>
                          <p className="text-muted-foreground">
                            {event.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
