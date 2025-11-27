import { useState, useMemo, useCallback } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { ImageUploadStep } from "@/components/ImageUploadStep";
import { DocumentUploadStep } from "@/components/DocumentUploadStep";
import { DecisionDisplay } from "@/components/DecisionDisplay";
import { RPAAnimation } from "@/components/RPAAnimation";
import { CustomerExperiencePanel } from "@/components/CustomerExperiencePanel";
import { VisionAnalysisResult } from "@/lib/visionAgent";
import { ExtractedDocumentData } from "@/lib/documentAgent";
import { DecisionResult, getDecision } from "@/lib/decisionAgent";
import { ClaimStatus } from "@/lib/customerExperienceAgent";
import { Shield } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Upload Image", "Upload Documents", "Claim Decision"];

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<ClaimStatus>("idle");
  
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [documentData, setDocumentData] = useState<ExtractedDocumentData | null>(null);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [showRPA, setShowRPA] = useState(false);

  const handleImageComplete = (result: VisionAnalysisResult) => {
    setVisionResult(result);
    setStatus("image_analyzed");
    setTimeout(() => {
      setCurrentStep(2);
      setStatus("extracting_documents");
    }, 1000);
  };

  const handleDocumentComplete = async (data: ExtractedDocumentData) => {
    setDocumentData(data);
    setStatus("documents_extracted");
    
    // Run decision engine
    setStatus("making_decision");
    try {
      const decisionResult = await getDecision({
        vision_analysis: visionResult,
        document_data: data
      });
      
      setDecision(decisionResult);
      setStatus("decision_made");
      
      setTimeout(() => {
        setCurrentStep(3);
        
        // Show RPA for auto-approve or manual review
        if (decisionResult.decision !== "SIU Flag") {
          setTimeout(() => {
            setStatus("executing_rpa");
            setShowRPA(true);
          }, 2000);
        } else {
          setStatus("claim_flagged");
        }
      }, 1000);
    } catch (error) {
      toast.error("Decision failed", {
        description: error instanceof Error ? error.message : "Failed to process decision"
      });
    }
  };

  const handleRPAComplete = useCallback(() => {
    setStatus("rpa_completed");
    setTimeout(() => {
      if (decision?.decision === "Auto-Approve") {
        setStatus("claim_approved");
      } else {
        setStatus("claim_review");
      }
    }, 500);
  }, [decision]);

  const stableClaimData = useMemo(() => ({ visionResult, documentData, decision }), [visionResult, documentData, decision]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ClaimFlow AI</h1>
              <p className="text-sm text-muted-foreground">Intelligent Claim Automation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="mt-8">
          {currentStep === 1 && (
            <ImageUploadStep 
              onComplete={handleImageComplete}
            />
          )}

          {currentStep === 2 && (
            <DocumentUploadStep 
              onComplete={handleDocumentComplete}
            />
          )}

          {currentStep === 3 && decision && (
            <>
              {!showRPA ? (
                <DecisionDisplay decision={decision} />
              ) : (
                <RPAAnimation
                  claimData={stableClaimData}
                  onComplete={handleRPAComplete}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Customer Experience Panel */}
      <CustomerExperiencePanel status={status} />
    </div>
  );
}
