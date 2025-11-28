import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, ChevronRight, Upload, FileCheck, AlertTriangle } from "lucide-react";
import { UploadResult, CheckResult, DecisionResult } from "@/lib/api";

interface CXAgentPanelProps {
  currentStep: number;
  claimId: string | null;
  uploadResults?: UploadResult[];
  checkResult?: CheckResult | null;
  decision?: DecisionResult | null;
  onRequestUpload?: () => void;
  onDismiss?: () => void;
}

interface AgentMessage {
  text: string;
  type: "info" | "success" | "warning" | "action";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function CXAgentPanel({
  currentStep,
  claimId,
  uploadResults = [],
  checkResult,
  decision,
  onRequestUpload,
  onDismiss,
}: CXAgentPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  useEffect(() => {
    const newMessages: AgentMessage[] = [];

    // Step-based messages
    if (currentStep === 1 && !claimId) {
      newMessages.push({
        text: "Welcome! Let's start your claim. Please fill in the required fields marked with * and click 'Start Claim'.",
        type: "info",
      });
    }

    if (currentStep === 2 && claimId) {
      newMessages.push({
        text: `Thanks — claim ${claimId.slice(0, 8)}... created! Please upload photos of the damage and any supporting documents so we can analyze them.`,
        type: "success",
      });

      // Show detected damage from uploads
      const damageDetections = uploadResults.filter(r => r.metadata?.detector);
      if (damageDetections.length > 0) {
        damageDetections.forEach(result => {
          const detector = result.metadata?.detector;
          if (detector?.damage_zone) {
            newMessages.push({
              text: `I found damage in: ${detector.damage_zone} (severity: ${detector.damage_severity || 'unknown'}). Would you like to confirm this assessment?`,
              type: "info",
            });
          }
        });
      }

      // Check for extracted document info
      const extractions = uploadResults.filter(r => r.metadata?.extract);
      if (extractions.length > 0) {
        newMessages.push({
          text: `I've extracted information from ${extractions.length} document(s). Please review the details above.`,
          type: "success",
        });
      }
    }

    if (currentStep === 3 && checkResult) {
      if (checkResult.status === "needs_info" && checkResult.missing?.length) {
        newMessages.push({
          text: `We need some additional information to proceed. Missing: ${checkResult.missing.join(", ")}.`,
          type: "warning",
          action: onRequestUpload ? {
            label: "Upload Documents",
            onClick: onRequestUpload,
          } : undefined,
        });
      } else {
        newMessages.push({
          text: "All required information has been collected. You can proceed to the decision step.",
          type: "success",
        });
      }
    }

    if (currentStep === 4 && decision) {
      const decisionType = decision.decision.toLowerCase();
      if (decisionType.includes("approve")) {
        newMessages.push({
          text: `Great news! Your claim has been approved. ${decision.reason}`,
          type: "success",
        });
      } else if (decisionType.includes("review") || decisionType === "needs_info") {
        newMessages.push({
          text: `Your claim requires additional review. ${decision.reason}`,
          type: "warning",
        });
      } else {
        newMessages.push({
          text: `Decision received: ${decision.decision}. ${decision.reason}`,
          type: "info",
        });
      }
    }

    if (currentStep === 5) {
      newMessages.push({
        text: "Running RPA workflow to process your claim through our systems. Please wait...",
        type: "info",
      });
    }

    setMessages(newMessages);
  }, [currentStep, claimId, uploadResults, checkResult, decision, onRequestUpload]);

  if (!isVisible || messages.length === 0) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-w-[calc(100vw-2rem)] shadow-[var(--shadow-strong)] animate-slide-in-right z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">ClaimFlow Assistant</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-2">
              <div
                className={`p-3 rounded-lg text-sm ${
                  msg.type === "success"
                    ? "bg-success/10 border border-success/20 text-foreground"
                    : msg.type === "warning"
                    ? "bg-warning/10 border border-warning/20 text-foreground"
                    : msg.type === "action"
                    ? "bg-primary/10 border border-primary/20 text-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.type === "warning" && <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
                  {msg.type === "success" && <FileCheck className="w-4 h-4 text-success mt-0.5 shrink-0" />}
                  <p>{msg.text}</p>
                </div>
              </div>
              {msg.action && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={msg.action.onClick}
                >
                  <Upload className="w-3 h-3 mr-2" />
                  {msg.action.label}
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
