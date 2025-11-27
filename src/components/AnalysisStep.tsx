import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scan, FileSearch, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { analyzeImage, VisionAnalysisResult } from "@/lib/visionAgent";
import { extractDocuments, ExtractedDocumentData } from "@/lib/documentAgent";
import { toast } from "sonner";

interface AnalysisStepProps {
  claimId: string;
  hasImages: boolean;
  hasDocs: boolean;
  onComplete: (visionResult: VisionAnalysisResult | null, docResult: ExtractedDocumentData | null) => void;
}

export function AnalysisStep({ claimId, hasImages, hasDocs, onComplete }: AnalysisStepProps) {
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  const [isExtractingDocs, setIsExtractingDocs] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);
  const [docResult, setDocResult] = useState<ExtractedDocumentData | null>(null);

  const handleAnalyzeImages = async () => {
    setIsAnalyzingImages(true);
    try {
      const result = await analyzeImage(claimId);
      setVisionResult(result);
      toast.success("Image analysis complete");
    } catch (error) {
      toast.error("Image analysis failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  const handleExtractDocs = async () => {
    setIsExtractingDocs(true);
    try {
      const result = await extractDocuments(claimId);
      setDocResult(result);
      toast.success("Document extraction complete");
    } catch (error) {
      toast.error("Document extraction failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsExtractingDocs(false);
    }
  };

  const canProceed = (hasImages ? visionResult !== null : true) && (hasDocs ? docResult !== null : true);

  return (
    <Card className="p-8 max-w-3xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Run Analysis</h2>
          <p className="text-muted-foreground">
            Analyze uploaded images and extract document data
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Image Analysis */}
          <Card className={`p-6 ${!hasImages ? 'opacity-50' : ''}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Scan className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Image Analysis</h3>
                  <p className="text-xs text-muted-foreground">AI damage detection</p>
                </div>
              </div>

              {visionResult ? (
                <div className="space-y-2 bg-success/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Analysis Complete</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Severity:</span>
                      <p className="font-medium text-foreground">{visionResult.damageSeverity}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Zone:</span>
                      <p className="font-medium text-foreground">{visionResult.damageZone}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Confidence:</span>
                      <Badge variant="secondary" className="ml-2">
                        {(visionResult.confidence * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleAnalyzeImages}
                  disabled={!hasImages || isAnalyzingImages}
                  className="w-full"
                >
                  {isAnalyzingImages ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4 mr-2" />
                      Analyze Images
                    </>
                  )}
                </Button>
              )}

              {!hasImages && (
                <p className="text-xs text-muted-foreground text-center">
                  No images uploaded
                </p>
              )}
            </div>
          </Card>

          {/* Document Extraction */}
          <Card className={`p-6 ${!hasDocs ? 'opacity-50' : ''}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileSearch className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Document Extraction</h3>
                  <p className="text-xs text-muted-foreground">OCR & data extraction</p>
                </div>
              </div>

              {docResult ? (
                <div className="space-y-2 bg-success/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Extraction Complete</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {docResult.policyNumber && (
                      <div>
                        <span className="text-muted-foreground">Policy:</span>
                        <span className="font-medium text-foreground ml-2">{docResult.policyNumber}</span>
                      </div>
                    )}
                    {docResult.claimAmount && (
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium text-foreground ml-2">₹{docResult.claimAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {docResult.documentType && (
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-foreground ml-2">{docResult.documentType}</span>
                      </div>
                    )}
                    {docResult.extractedText && (
                      <div className="mt-2">
                        <span className="text-muted-foreground">Extracted Text:</span>
                        <p className="text-xs text-foreground mt-1 bg-muted p-2 rounded max-h-20 overflow-y-auto">
                          {docResult.extractedText.slice(0, 200)}...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleExtractDocs}
                  disabled={!hasDocs || isExtractingDocs}
                  className="w-full"
                >
                  {isExtractingDocs ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 mr-2" />
                      Extract Document Data
                    </>
                  )}
                </Button>
              )}

              {!hasDocs && (
                <p className="text-xs text-muted-foreground text-center">
                  No documents uploaded
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Continue Button */}
        <Button
          onClick={() => onComplete(visionResult, docResult)}
          disabled={!canProceed}
          className="w-full"
          size="lg"
        >
          {canProceed ? (
            <>
              Continue to Decision
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Complete analysis to continue
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
