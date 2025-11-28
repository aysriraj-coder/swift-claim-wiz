import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Copy,
  Image as ImageIcon,
} from "lucide-react";
import { uploadFile, UploadResult, API_BASE, isCorsError, getCorsErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { MismatchModal } from "./MismatchModal";
import { DynamicEnginePanel } from "./DynamicEnginePanel";

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  preview?: string;
  result?: UploadResult;
  error?: string;
}

interface FileUploadStepProps {
  claimId: string;
  damageDescription?: string;
  onComplete: (results: UploadResult[]) => void;
  onMismatchResolved?: (confirmedZone: string) => void;
}

export function FileUploadStep({
  claimId,
  damageDescription,
  onComplete,
  onMismatchResolved,
}: FileUploadStepProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [mismatchInfo, setMismatchInfo] = useState<{ claimed: string; detected: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = selectedFiles.map((file) => ({
      file,
      status: "pending",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview!);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const retryUpload = async (index: number) => {
    const updatedFiles = [...files];
    updatedFiles[index].status = "uploading";
    updatedFiles[index].error = undefined;
    setFiles(updatedFiles);

    try {
      const result = await uploadFile(claimId, updatedFiles[index].file);
      updatedFiles[index].status = "done";
      updatedFiles[index].result = result;
      checkForMismatches(result);
    } catch (error) {
      updatedFiles[index].status = "error";
      updatedFiles[index].error = error instanceof Error ? error.message : "Upload failed";
    }
    setFiles([...updatedFiles]);
  };

  const checkForMismatches = (result: UploadResult) => {
    const detectedZone = result.metadata?.detector?.damage_zone;
    if (detectedZone && damageDescription) {
      const descLower = damageDescription.toLowerCase();
      const zoneLower = detectedZone.toLowerCase();
      if (!descLower.includes(zoneLower) && !zoneLower.includes(descLower)) {
        setMismatchInfo({ claimed: damageDescription, detected: detectedZone });
        setShowMismatchModal(true);
      }
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    const updatedFiles = [...files];

    try {
      // Upload files concurrently
      const uploadPromises = updatedFiles.map(async (f, i) => {
        if (f.status === "done") return;

        updatedFiles[i].status = "uploading";
        setFiles([...updatedFiles]);

        try {
          const result = await uploadFile(claimId, f.file);
          updatedFiles[i].status = "done";
          updatedFiles[i].result = result;
          checkForMismatches(result);
        } catch (error) {
          updatedFiles[i].status = "error";
          updatedFiles[i].error = error instanceof Error ? error.message : "Upload failed";
          
          if (isCorsError(error)) {
            toast.error("Connection Error", {
              description: getCorsErrorMessage(),
              duration: 10000,
            });
          }
        }
        setFiles([...updatedFiles]);
      });

      await Promise.all(uploadPromises);

      const successCount = updatedFiles.filter((f) => f.status === "done").length;
      if (successCount > 0) {
        toast.success(`${successCount} files uploaded successfully`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const copyBackendUrl = () => {
    navigator.clipboard.writeText(API_BASE);
    toast.success("Backend URL copied to clipboard");
  };

  const handleMismatchUploadNew = () => {
    fileInputRef.current?.click();
  };

  const handleMismatchConfirmDetected = () => {
    if (mismatchInfo) {
      onMismatchResolved?.(mismatchInfo.detected);
      toast.success(`Confirmed damage zone: ${mismatchInfo.detected}`);
    }
  };

  const handleMismatchRequestReview = () => {
    toast.info("Request for human review submitted");
  };

  const allUploaded = files.length > 0 && files.every((f) => f.status === "done");
  const hasErrors = files.some((f) => f.status === "error");
  const successResults = files.filter((f) => f.result).map((f) => f.result!);
  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <>
      <Card className="p-8 max-w-[900px] mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Upload Images & Documents</h2>
            <p className="text-muted-foreground">
              Upload damage photos and supporting documents for your claim
            </p>
          </div>

          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload files</p>
            <p className="text-xs text-muted-foreground">Images (PNG, JPG) or Documents (PDF)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((f, idx) => (
                  <div key={idx} className="space-y-2">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        f.status === "error" ? "bg-destructive/10" : "bg-muted"
                      }`}
                    >
                      {isImage(f.file) && f.preview ? (
                        <img src={f.preview} alt="" className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                          {isImage(f.file) ? (
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(f.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {f.error && <p className="text-xs text-destructive mt-1">{f.error}</p>}
                      </div>
                      <Badge
                        variant={
                          f.status === "done"
                            ? "default"
                            : f.status === "error"
                            ? "destructive"
                            : f.status === "uploading"
                            ? "secondary"
                            : "outline"
                        }
                        className={f.status === "done" ? "bg-success text-success-foreground" : ""}
                      >
                        {f.status === "uploading" && (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        )}
                        {f.status === "done" && <CheckCircle className="w-3 h-3 mr-1" />}
                        {f.status}
                      </Badge>
                      {f.status === "error" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => retryUpload(idx)}
                          className="h-8 w-8"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      {f.status !== "uploading" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(idx)}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Show analysis results from backend */}
                    {f.result?.metadata && (
                      <div className="ml-14 p-3 bg-muted/50 rounded-lg text-sm space-y-1 border-l-2 border-primary">
                        {f.result.metadata.detector && (
                          <>
                            <p>
                              <span className="font-medium text-foreground">Damage Zone:</span>{" "}
                              <span className="text-muted-foreground">
                                {f.result.metadata.detector.damage_zone || "Unknown"}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium text-foreground">Severity:</span>{" "}
                              <span className="text-muted-foreground">
                                {f.result.metadata.detector.damage_severity || "Unknown"}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium text-foreground">Confidence:</span>{" "}
                              <span className="text-muted-foreground">
                                {f.result.metadata.detector.confidence
                                  ? `${(f.result.metadata.detector.confidence * 100).toFixed(1)}%`
                                  : "N/A"}
                              </span>
                            </p>
                          </>
                        )}
                        {f.result.metadata.extract && (
                          <>
                            {f.result.metadata.extract.documentType && (
                              <p>
                                <span className="font-medium text-foreground">Document Type:</span>{" "}
                                <span className="text-muted-foreground">
                                  {f.result.metadata.extract.documentType}
                                </span>
                              </p>
                            )}
                            {f.result.metadata.extract.claimAmount && (
                              <p>
                                <span className="font-medium text-foreground">Claim Amount:</span>{" "}
                                <span className="text-success">
                                  ₹{f.result.metadata.extract.claimAmount.toLocaleString()}
                                </span>
                              </p>
                            )}
                            {f.result.metadata.extract.policyNumber && (
                              <p>
                                <span className="font-medium text-foreground">Policy Number:</span>{" "}
                                <span className="text-muted-foreground">
                                  {f.result.metadata.extract.policyNumber}
                                </span>
                              </p>
                            )}
                            {f.result.metadata.extract.vehicle && (
                              <p>
                                <span className="font-medium text-foreground">Vehicle:</span>{" "}
                                <span className="text-muted-foreground">
                                  {f.result.metadata.extract.vehicle}
                                </span>
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CORS Error Helper */}
          {hasErrors && files.some((f) => f.error?.includes("CORS")) && (
            <Card className="p-4 bg-destructive/10 border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Connection Error</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Request blocked by browser. Verify backend URL or enable CORS.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-background px-2 py-1 rounded flex-1 overflow-x-auto">
                      {API_BASE}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyBackendUrl}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Dynamic Engine Panel */}
          {successResults.length > 0 && (
            <DynamicEnginePanel
              uploadResults={successResults}
              damageDescription={damageDescription}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!allUploaded && (
              <Button
                onClick={uploadAllFiles}
                disabled={files.length === 0 || isUploading}
                className="flex-1"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload All Files
                  </>
                )}
              </Button>
            )}

            {allUploaded && (
              <Button onClick={() => onComplete(successResults)} className="flex-1" size="lg">
                Continue to Check
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Status Summary */}
          {allUploaded && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All files uploaded successfully</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Mismatch Modal */}
      {mismatchInfo && (
        <MismatchModal
          open={showMismatchModal}
          onOpenChange={setShowMismatchModal}
          claimedZone={mismatchInfo.claimed}
          detectedZone={mismatchInfo.detected}
          onUploadNew={handleMismatchUploadNew}
          onConfirmDetected={handleMismatchConfirmDetected}
          onRequestReview={handleMismatchRequestReview}
        />
      )}
    </>
  );
}
