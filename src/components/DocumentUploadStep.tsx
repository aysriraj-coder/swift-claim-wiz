import { useState } from "react";
import { useBackendStore } from "@/lib/backendStore";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { extractDocuments, ExtractedDocumentData } from "@/lib/documentAgent";
import { toast } from "sonner";

interface DocumentUploadStepProps {
  onComplete: (data: ExtractedDocumentData) => void;
}

export function DocumentUploadStep({ onComplete }: DocumentUploadStepProps) {
  const backendOnline = useBackendStore((state) => state.backendOnline);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const result = await extractDocuments(selectedFile);
      toast.success("Documents processed successfully");
      onComplete(result);
    } catch (error) {
      toast.error("Extraction failed", {
        description: error instanceof Error ? error.message : "Failed to extract document data"
      });
    } finally {
      setIsProcessing(false);
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

          {selectedFile && (
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
      </div>
    </Card>
  );
}
