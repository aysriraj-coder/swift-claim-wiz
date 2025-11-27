import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, FileText, X, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { uploadFile, UploadResult } from "@/lib/api";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  preview?: string;
  result?: UploadResult;
}

interface FileUploadStepProps {
  claimId: string;
  onComplete: (results: UploadResult[]) => void;
}

export function FileUploadStep({ claimId, onComplete }: FileUploadStepProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      file,
      status: "pending",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = [...prev];
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview!);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    const updatedFiles = [...files];

    try {
      for (let i = 0; i < updatedFiles.length; i++) {
        if (updatedFiles[i].status === "done") continue;

        updatedFiles[i].status = "uploading";
        setFiles([...updatedFiles]);

        try {
          const result = await uploadFile(claimId, updatedFiles[i].file);
          updatedFiles[i].status = "done";
          updatedFiles[i].result = result;
        } catch (error) {
          updatedFiles[i].status = "error";
          toast.error(`Failed to upload ${updatedFiles[i].file.name}`);
        }
        setFiles([...updatedFiles]);
      }

      const successCount = updatedFiles.filter(f => f.status === "done").length;
      if (successCount > 0) {
        toast.success(`${successCount} files uploaded successfully`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const allUploaded = files.length > 0 && files.every(f => f.status === "done");
  const successResults = files.filter(f => f.result).map(f => f.result!);
  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <Card className="p-8 max-w-3xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Images & Documents</h2>
          <p className="text-muted-foreground">
            Upload damage photos and supporting documents for your claim
          </p>
        </div>

        {/* Upload Area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Click to upload files</p>
          <p className="text-xs text-muted-foreground">Images (PNG, JPG) or Documents (PDF)</p>
        </div>
        <input
          id="file-input"
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
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {files.map((f, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    {isImage(f.file) && f.preview ? (
                      <img src={f.preview} alt="" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(f.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge
                      variant={
                        f.status === "done" ? "default" :
                        f.status === "error" ? "destructive" :
                        f.status === "uploading" ? "secondary" : "outline"
                      }
                      className={f.status === "done" ? "bg-success text-success-foreground" : ""}
                    >
                      {f.status === "uploading" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      {f.status === "done" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {f.status}
                    </Badge>
                    {f.status !== "uploading" && (
                      <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Show analysis results from backend */}
                  {f.result?.metadata && (
                    <div className="ml-12 p-3 bg-muted/50 rounded-lg text-sm space-y-1 border-l-2 border-primary">
                      {f.result.metadata.detector && (
                        <>
                          <p><span className="font-medium text-foreground">Damage Severity:</span> <span className="text-muted-foreground">{f.result.metadata.detector.damage_severity}</span></p>
                          <p><span className="font-medium text-foreground">Damage Zone:</span> <span className="text-muted-foreground">{f.result.metadata.detector.damage_zone}</span></p>
                          <p><span className="font-medium text-foreground">Confidence:</span> <span className="text-muted-foreground">{((f.result.metadata.detector.confidence || 0) * 100).toFixed(1)}%</span></p>
                        </>
                      )}
                      {f.result.metadata.extract && (
                        <>
                          {f.result.metadata.extract.documentType && (
                            <p><span className="font-medium text-foreground">Document Type:</span> <span className="text-muted-foreground">{f.result.metadata.extract.documentType}</span></p>
                          )}
                          {f.result.metadata.extract.claimAmount && (
                            <p><span className="font-medium text-foreground">Claim Amount:</span> <span className="text-muted-foreground">₹{f.result.metadata.extract.claimAmount.toLocaleString()}</span></p>
                          )}
                          {f.result.metadata.extract.policyNumber && (
                            <p><span className="font-medium text-foreground">Policy Number:</span> <span className="text-muted-foreground">{f.result.metadata.extract.policyNumber}</span></p>
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
  );
}
