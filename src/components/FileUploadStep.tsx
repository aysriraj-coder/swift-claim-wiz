import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Image as ImageIcon, FileText, X, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  type: "image" | "document";
  status: "pending" | "uploading" | "done" | "error";
  preview?: string;
}

interface FileUploadStepProps {
  claimId: string;
  onComplete: (imageCount: number, docCount: number) => void;
}

export function FileUploadStep({ claimId, onComplete }: FileUploadStepProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "document") => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      file,
      type,
      status: "pending",
      preview: type === "image" ? URL.createObjectURL(file) : undefined
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
          await uploadFile(claimId, updatedFiles[i].file, updatedFiles[i].type);
          updatedFiles[i].status = "done";
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

  const imageFiles = files.filter(f => f.type === "image");
  const docFiles = files.filter(f => f.type === "document");
  const allUploaded = files.length > 0 && files.every(f => f.status === "done");
  const hasImages = imageFiles.some(f => f.status === "done");
  const hasDocs = docFiles.some(f => f.status === "done");

  return (
    <Card className="p-8 max-w-3xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Files</h2>
          <p className="text-muted-foreground">
            Upload damage photos and supporting documents for your claim
          </p>
        </div>

        {/* Upload Areas */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Image Upload */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Damage Photos
            </h3>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById("image-input")?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload images</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, "image")}
              className="hidden"
            />
          </div>

          {/* Document Upload */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documents
            </h3>
            <div
              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById("doc-input")?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload documents</p>
              <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
            </div>
            <input
              id="doc-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileSelect(e, "document")}
              className="hidden"
            />
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Selected Files ({files.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  {f.type === "image" && f.preview ? (
                    <img src={f.preview} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(f.file.size / 1024 / 1024).toFixed(2)} MB • {f.type}
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
            <Button
              onClick={() => onComplete(
                imageFiles.filter(f => f.status === "done").length,
                docFiles.filter(f => f.status === "done").length
              )}
              className="flex-1"
              size="lg"
            >
              Continue to Analysis
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
            <p className="text-sm text-muted-foreground mt-1">
              {hasImages && `${imageFiles.filter(f => f.status === "done").length} images`}
              {hasImages && hasDocs && ", "}
              {hasDocs && `${docFiles.filter(f => f.status === "done").length} documents`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
