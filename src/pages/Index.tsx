import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { CreateClaimStep } from "@/components/CreateClaimStep";
import { FileUploadStep } from "@/components/FileUploadStep";
import { CheckStep } from "@/components/CheckStep";
import { DecisionStep } from "@/components/DecisionStep";
import { RPAStep } from "@/components/RPAStep";
import { ClaimSummary } from "@/components/ClaimSummary";
import { Navbar } from "@/components/Navbar";
import { CreateClaimPayload, UploadResult, CheckResult, DecisionResult, RPAResult } from "@/lib/api";

const STEPS = ["Create Claim", "Upload Files", "Check Info", "Decision", "RPA"];

export default function Index() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Claim data
  const [claimId, setClaimId] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<CreateClaimPayload | null>(null);
  
  // Results
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
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
  const handleFilesUploaded = (results: UploadResult[]) => {
    setUploadResults(results);
    setCurrentStep(3);
  };

  // Step 3: Check
  const handleCheckComplete = (result: CheckResult) => {
    setCheckResult(result);
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
            claimId={claimId!}
            claimInfo={claimInfo!}
            uploadResults={uploadResults}
            decision={decision!}
            rpaResult={rpaResult!}
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
            <CheckStep
              claimId={claimId}
              onComplete={handleCheckComplete}
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
