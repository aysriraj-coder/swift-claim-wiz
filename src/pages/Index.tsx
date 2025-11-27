import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { CreateClaimStep } from "@/components/CreateClaimStep";
import { FileUploadStep } from "@/components/FileUploadStep";
import { AnalysisStep } from "@/components/AnalysisStep";
import { DecisionStep } from "@/components/DecisionStep";
import { RPAStep } from "@/components/RPAStep";
import { ClaimSummary } from "@/components/ClaimSummary";
import { Navbar } from "@/components/Navbar";
import { VisionAnalysisResult } from "@/lib/visionAgent";
import { ExtractedDocumentData } from "@/lib/documentAgent";
import { DecisionResult } from "@/lib/decisionAgent";
import { RPAResult } from "@/lib/rpaAgent";
import { CreateClaimPayload } from "@/lib/api";

const STEPS = ["Create Claim", "Upload Files", "Analysis", "Decision", "RPA"];

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Claim data
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<CreateClaimPayload | null>(null);
  
  // File tracking
  const [hasImages, setHasImages] = useState(false);
  const [hasDocs, setHasDocs] = useState(false);
  
  // Results
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [documentData, setDocumentData] = useState<ExtractedDocumentData | null>(null);
  const [decision, setDecision] = useState<DecisionResult | null>(null);
  const [rpaResult, setRpaResult] = useState<RPAResult | null>(null);
  
  const [showSummary, setShowSummary] = useState(false);

  // Step 1: Create Claim
  const handleClaimCreated = (id: string, info: CreateClaimPayload) => {
    setClaimId(id);
    setClaimInfo(info);
    setCurrentStep(2);
  };

  // Step 2: Upload Files
  const handleFilesUploaded = (imageCount: number, docCount: number) => {
    setHasImages(imageCount > 0);
    setHasDocs(docCount > 0);
    setCurrentStep(3);
  };

  // Step 3: Analysis
  const handleAnalysisComplete = (vision: VisionAnalysisResult | null, doc: ExtractedDocumentData | null) => {
    setVisionResult(vision);
    setDocumentData(doc);
    setCurrentStep(4);
  };

  // Step 4: Decision
  const handleDecisionComplete = (result: DecisionResult) => {
    setDecision(result);
    setCurrentStep(5);
  };

  // Step 5: RPA
  const handleRPAComplete = (result: RPAResult) => {
    setRpaResult(result);
    setShowSummary(true);
  };

  // Show final summary
  if (showSummary) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <ClaimSummary
            claimId={claimId || undefined}
            claimInfo={claimInfo || undefined}
            visionResult={visionResult || undefined}
            documentData={documentData || undefined}
            decision={decision || undefined}
            rpaResult={rpaResult || undefined}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} steps={STEPS} />

        <div className="mt-10">
          {currentStep === 1 && (
            <CreateClaimStep onComplete={handleClaimCreated} />
          )}

          {currentStep === 2 && claimId && (
            <FileUploadStep
              claimId={claimId}
              onComplete={handleFilesUploaded}
            />
          )}

          {currentStep === 3 && claimId && (
            <AnalysisStep
              claimId={claimId}
              hasImages={hasImages}
              hasDocs={hasDocs}
              onComplete={handleAnalysisComplete}
            />
          )}

          {currentStep === 4 && claimId && (
            <DecisionStep
              claimId={claimId}
              onComplete={handleDecisionComplete}
            />
          )}

          {currentStep === 5 && claimId && (
            <RPAStep
              claimId={claimId}
              onComplete={handleRPAComplete}
            />
          )}
        </div>
      </main>
    </div>
  );
}
