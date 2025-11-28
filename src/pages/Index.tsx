import { useState, useCallback } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { CreateClaimStep } from "@/components/CreateClaimStep";
import { FileUploadStep } from "@/components/FileUploadStep";
import { CheckStep } from "@/components/CheckStep";
import { DecisionStep } from "@/components/DecisionStep";
import { RPAStep } from "@/components/RPAStep";
import { ClaimSummary } from "@/components/ClaimSummary";
import { Navbar } from "@/components/Navbar";
import { CXAgentPanel } from "@/components/CXAgentPanel";
import { AuditTrail, createAuditEntry } from "@/components/AuditTrail";
import {
  CreateClaimPayload,
  UploadResult,
  CheckResult,
  DecisionResult,
  RPAResult,
} from "@/lib/api";

const STEPS = ["Create Claim", "Upload Files", "Check Info", "Decision", "RPA"];

interface AuditEntry {
  timestamp: string;
  action: string;
  details?: string;
  type: "create" | "upload" | "decision" | "rpa" | "cx_agent" | "check";
}

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

  // Audit trail
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);

  const addAuditEntry = useCallback(
    (action: string, type: AuditEntry["type"], details?: string) => {
      setAuditEntries((prev) => [...prev, createAuditEntry(action, type, details)]);
    },
    []
  );

  // Step 1: Create Claim
  const handleClaimCreated = (id: string, info: CreateClaimPayload) => {
    setClaimId(id);
    setClaimInfo(info);
    addAuditEntry("Claim Created", "create", `Claim ID: ${id}`);
    setCurrentStep(2);
  };

  // Step 2: Upload Files
  const handleFilesUploaded = (results: UploadResult[]) => {
    setUploadResults(results);
    addAuditEntry("Files Uploaded", "upload", `${results.length} files processed`);
    setCurrentStep(3);
  };

  // Handle mismatch resolution
  const handleMismatchResolved = (confirmedZone: string) => {
    if (claimInfo) {
      setClaimInfo({ ...claimInfo, damageDescription: confirmedZone });
    }
    addAuditEntry("Mismatch Resolved", "cx_agent", `Confirmed zone: ${confirmedZone}`);
  };

  // Step 3: Check
  const handleCheckComplete = (result: CheckResult) => {
    setCheckResult(result);
    addAuditEntry("Check Completed", "check", `Status: ${result.status}`);
    setCurrentStep(4);
  };

  // Step 4: Decision
  const handleDecisionComplete = (result: DecisionResult) => {
    setDecision(result);
    addAuditEntry("Decision Made", "decision", `Result: ${result.decision}`);
    setCurrentStep(5);
  };

  // Step 5: RPA
  const handleRPAComplete = (result: RPAResult) => {
    setRpaResult(result);
    addAuditEntry("RPA Completed", "rpa", `Status: ${result.status}`);
    setShowSummary(true);
  };

  // CX Agent upload request
  const handleCXAgentUploadRequest = (filterType?: string) => {
    // Navigate back to upload step if needed
    if (currentStep > 2) {
      setCurrentStep(2);
    }
  };

  // Check if missing docs
  const hasMissingDocs =
    checkResult?.status === "needs_info" && (checkResult?.missing?.length || 0) > 0;

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

          {/* Audit Trail */}
          <div className="max-w-4xl mx-auto mt-6">
            <AuditTrail entries={auditEntries} backendAudit={decision?.auditTrail} />
          </div>
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
          {currentStep === 1 && <CreateClaimStep onComplete={handleClaimCreated} />}

          {currentStep === 2 && claimId && (
            <FileUploadStep
              claimId={claimId}
              damageDescription={claimInfo?.damageDescription}
              onComplete={handleFilesUploaded}
              onMismatchResolved={handleMismatchResolved}
            />
          )}

          {currentStep === 3 && claimId && (
            <CheckStep claimId={claimId} onComplete={handleCheckComplete} />
          )}

          {currentStep === 4 && claimId && (
            <DecisionStep
              claimId={claimId}
              onComplete={handleDecisionComplete}
              hasMissingDocs={hasMissingDocs}
            />
          )}

          {currentStep === 5 && claimId && (
            <RPAStep claimId={claimId} onComplete={handleRPAComplete} />
          )}
        </div>

        {/* Audit Trail - shown during workflow */}
        {auditEntries.length > 0 && currentStep > 1 && (
          <div className="max-w-[900px] mx-auto mt-6">
            <AuditTrail entries={auditEntries} />
          </div>
        )}
      </main>

      {/* CX Agent Panel */}
      <CXAgentPanel
        currentStep={currentStep}
        claimId={claimId}
        uploadResults={uploadResults}
        checkResult={checkResult}
        decision={decision}
        onRequestUpload={handleCXAgentUploadRequest}
      />
    </div>
  );
}
