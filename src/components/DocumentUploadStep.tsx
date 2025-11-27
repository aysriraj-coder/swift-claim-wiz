import { useState } from "react";
import { useBackendStore } from "@/lib/backendStore";
import { FileText, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractDocuments, ExtractedDocumentData } from "@/lib/documentAgent";
import { toast } from "sonner";

interface DocumentUploadStepProps {
  claimId: string;
  onComplete: (data: ExtractedDocumentData, docName?: string) => void;
}

export function DocumentUploadStep({ claimId, onComplete }: DocumentUploadStepProps) {
  const backendOnline = useBackendStore((state) => state.backendOnline);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedData(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const result = await extractDocuments(claimId, selectedFile);
      setExtractedData(result);
      toast.success("Documents processed successfully");
    } catch (error) {
      toast.error("Extraction failed", {
        description: error instanceof Error ? error.message : "Failed to extract document data"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    if (extractedData && selectedFile) {
      onComplete(extractedData, selectedFile.name);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Claim Documents</h2>
          <p className="text-muted-foreground">
            Upload your policy document or claim form (PDF or Excel)
          </p>
        </div>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById("doc-input")?.click()}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-foreground font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-foreground font-medium">Click to upload document</p>
                  <p className="text-sm text-muted-foreground">PDF or Excel files accepted</p>
                </div>
              )}
            </div>
            <input
              id="doc-input"
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Extracted Data Display */}
          {extractedData && (
            <Card className="p-4 bg-success/10 border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <h4 className="font-semibold text-foreground">Document Agent - Extracted Data</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Policy Number:</span>
                  <p className="font-medium text-foreground">{extractedData.policyNumber || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Claim Amount:</span>
                  <p className="font-medium text-foreground">₹{extractedData.claimAmount?.toLocaleString() ?? 'N/A'}</p>
                </div>
                {extractedData.extracted && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Extracted Info:</span>
                    <p className="font-medium text-foreground text-xs mt-1">
                      {JSON.stringify(extractedData.extracted, null, 2)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {selectedFile && !extractedData && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-foreground font-medium mb-2">Will extract:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Policy number and details</li>
                <li>• Vehicle information</li>
                <li>• Claimant details</li>
                <li>• Damage notes and claim amount</li>
              </ul>
            </div>
          )}
        </div>

        {extractedData ? (
          <Button
            onClick={handleContinue}
            className="w-full"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Continue to Decision
          </Button>
        ) : (
          <Button
            onClick={handleExtract}
            disabled={!selectedFile || isProcessing || !backendOnline}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Processing Documents...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Extract Information
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
