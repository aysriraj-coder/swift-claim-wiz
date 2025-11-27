import { useState, useMemo, useCallback, useEffect } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { ImageUploadStep } from "@/components/ImageUploadStep";
import { DocumentUploadStep } from "@/components/DocumentUploadStep";
import { DecisionDisplay } from "@/components/DecisionDisplay";
import { RPAAnimation } from "@/components/RPAAnimation";
import { CustomerExperiencePanel } from "@/components/CustomerExperiencePanel";
import { AgentStatusPanel } from "@/components/AgentStatusPanel";
import { ClaimSummary } from "@/components/ClaimSummary";
import { ClaimSummarySidebar } from "@/components/ClaimSummarySidebar";
import { Navbar } from "@/components/Navbar";
import { VisionAnalysisResult } from "@/lib/visionAgent";
import { ExtractedDocumentData } from "@/lib/documentAgent";
import { DecisionResult, getDecision } from "@/lib/decisionAgent";
import { RPAResult } from "@/lib/rpaAgent";
import { ClaimStatus } from "@/lib/customerExperienceAgent";
import { toast } from "sonner";
import { BackendStatusBanner } from "@/components/BackendStatusBanner";
import { useBackendStore } from "@/lib/backendStore";
import { createClaim } from "@/lib/api";

const STEPS = ["Upload Image", "Upload Documents", "Claim Decision"];

interface AuditEvent {
  id: string;
  timestamp: Date;
  type: "upload" | "analysis" | "decision" | "rpa" | "info";
  message: string;
}

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [documentData, setDocumentData] = useState<ExtractedDocumentData | null>(null);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [rpaResult, setRpaResult] = useState<RPAResult | null>(null);
  const [showRPA, setShowRPA] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Track uploaded files for sidebar
  const [uploadedImages, setUploadedImages] = useState<{ name: string; preview?: string }[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<{ name: string }[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Claim ID from global store
  const claimId = useBackendStore((state) => state.claimId);
  const setClaimId = useBackendStore((state) => state.setClaimId);
  const [isCreatingClaim, setIsCreatingClaim] = useState(false);

  const addAuditEvent = useCallback((type: AuditEvent["type"], message: string) => {
    setAuditEvents(prev => [...prev, {
      id: `${Date.now()}`,
      timestamp: new Date(),
      type,
      message
    }]);
  }, []);

  // Create claim on mount if not exists
  useEffect(() => {
    const initClaim = async () => {
      if (claimId) return;
      
      setIsCreatingClaim(true);
      try {
        const newClaimId = await createClaim();
        setClaimId(newClaimId);
        addAuditEvent("info", `Claim created: ${newClaimId}`);
      } catch (error) {
        console.error("Failed to create claim:", error);
        // Generate a local claim ID as fallback
        const fallbackId = `CLM-${Date.now().toString(36).toUpperCase()}`;
        setClaimId(fallbackId);
        addAuditEvent("info", `Using local claim ID: ${fallbackId}`);
      } finally {
        setIsCreatingClaim(false);
      }
    };
    
    initClaim();
  }, [claimId, setClaimId, addAuditEvent]);

  const handleImageComplete = (result: VisionAnalysisResult, images?: { name: string; preview?: string }[]) => {
    setVisionResult(result);
    if (images) {
      setUploadedImages(images);
    }
    setStatus("image_analyzed");
    addAuditEvent("analysis", `Vision analysis complete: ${result.damage_area}`);
    
    setTimeout(() => {
      setCurrentStep(2);
      setStatus("extracting_documents");
    }, 1000);
  };

  const handleDocumentComplete = async (data: ExtractedDocumentData, docName?: string) => {
    if (!claimId) {
      toast.error("No claim ID available");
      return;
    }
    
    setDocumentData(data);
    if (docName) {
      setUploadedDocuments(prev => [...prev, { name: docName }]);
    }
    setStatus("documents_extracted");
    addAuditEvent("analysis", `Document extracted: Policy ${data.policy_number}`);
    
    // Run decision engine
    setStatus("making_decision");
    addAuditEvent("decision", "Running decision engine...");
    
    try {
      const decisionResult = await getDecision(claimId, {
        vision_analysis: visionResult,
        document_data: data
      });
      
      setDecision(decisionResult);
      setStatus("decision_made");
      addAuditEvent("decision", `Decision: ${decisionResult.decision}`);
      
      setTimeout(() => {
        setCurrentStep(3);
        
        // Show RPA for auto-approve or manual review
        if (decisionResult.decision !== "SIU Flag") {
          setTimeout(() => {
            setStatus("executing_rpa");
            addAuditEvent("rpa", "Starting RPA simulation...");
            setShowRPA(true);
          }, 2000);
        } else {
          setStatus("claim_flagged");
          addAuditEvent("decision", "Claim flagged for SIU investigation");
          // Go directly to summary for SIU cases
          setTimeout(() => {
            setShowSummary(true);
          }, 2000);
        }
      }, 1000);
    } catch (error) {
      toast.error("Decision failed", {
        description: error instanceof Error ? error.message : "Failed to process decision"
      });
    }
  };

  const handleRPAComplete = useCallback((result: RPAResult) => {
    setRpaResult(result);
    setStatus("rpa_completed");
    addAuditEvent("rpa", "RPA simulation completed successfully");
    
    setTimeout(() => {
      if (decision?.decision === "Auto-Approve") {
        setStatus("claim_approved");
        addAuditEvent("decision", "Claim auto-approved");
      } else {
        setStatus("claim_review");
        addAuditEvent("decision", "Claim sent for manual review");
      }
      // Show final summary
      setTimeout(() => {
        setShowSummary(true);
      }, 1000);
    }, 500);
  }, [decision, addAuditEvent]);

  const stableClaimData = useMemo(() => ({ visionResult, documentData, decision }), [visionResult, documentData, decision]);

  // Loading state while creating claim
  if (isCreatingClaim || !claimId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Initializing claim...</p>
        </div>
      </div>
    );
  }

  // Show final summary page
  if (showSummary) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="container mx-auto px-4 py-8">
          <ClaimSummary 
            visionResult={visionResult}
            documentData={documentData}
            decision={decision}
            rpaResult={rpaResult}
          />
        </main>
        <CustomerExperiencePanel status={status} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-8 transition-all duration-300 ${sidebarOpen ? 'mr-80' : ''}`}>
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="mt-10">
          {currentStep === 1 && (
            <ImageUploadStep 
              claimId={claimId}
              onComplete={(result, images) => handleImageComplete(result, images)}
              onStatusChange={setStatus}
              onImagesChange={setUploadedImages}
            />
          )}

          {currentStep === 2 && (
            <DocumentUploadStep 
              claimId={claimId}
              onComplete={(data, docName) => {
                handleDocumentComplete(data, docName);
              }}
            />
          )}

          {currentStep === 3 && decision && (
            <>
              {!showRPA ? (
                <DecisionDisplay decision={decision} />
              ) : (
                <RPAAnimation
                  claimId={claimId}
                  claimData={stableClaimData}
                  onComplete={handleRPAComplete}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Claim Summary Sidebar */}
      <ClaimSummarySidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        claimId={claimId}
        status={status}
        currentStep={currentStep}
        uploadedImages={uploadedImages}
        uploadedDocuments={uploadedDocuments}
        visionResult={visionResult}
        documentData={documentData}
        decision={decision}
        auditEvents={auditEvents}
      />

      {/* Agent Status Panel */}
      <AgentStatusPanel status={status} />

      {/* Customer Experience Panel */}
      <CustomerExperiencePanel status={status} />
    </div>
  );
}
