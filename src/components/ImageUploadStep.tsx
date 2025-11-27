import { useState } from "react";
import { useBackendStore } from "@/lib/backendStore";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, AlertTriangle, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { analyzeImage, VisionAnalysisResult } from "@/lib/visionAgent";
import { ClaimStatus } from "@/lib/customerExperienceAgent";
import { toast } from "sonner";

export interface MultiVisionSummary {
  overall_damage_area: string;
  mismatches: number;
  needs_more_images: boolean;
  escalate_to_siu: boolean;
  individual_results: VisionAnalysisResult[];
}

interface ImageUploadStepProps {
  onComplete: (result: VisionAnalysisResult) => void;
  onStatusChange?: (status: ClaimStatus) => void;
}

interface UploadedImage {
  file: File;
  preview: string;
  result?: VisionAnalysisResult;
  status: "pending" | "analyzing" | "done";
}

export function ImageUploadStep({ onComplete, onStatusChange }: ImageUploadStepProps) {
  const backendOnline = useBackendStore((state) => state.backendOnline);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [multiSummary, setMultiSummary] = useState<MultiVisionSummary | null>(null);
  const [mismatchDetails, setMismatchDetails] = useState<string[]>([]);

  const MAX_IMAGES = 5;
  const MIN_IMAGES = 2;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalImages = images.length + files.length;
    if (totalImages > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const newImages: UploadedImage[] = files.map(file => {
      const preview = URL.createObjectURL(file);
      return { file, preview, status: "pending" as const };
    });

    setImages(prev => [...prev, ...newImages]);
    setMultiSummary(null);
    setMismatchDetails([]);
    
    onStatusChange?.("uploading_images");
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    setMultiSummary(null);
    setMismatchDetails([]);
    
    if (images.length <= 1) {
      onStatusChange?.("idle");
    }
  };

  const analyzeAllImages = async () => {
    if (images.length < MIN_IMAGES) {
      toast.error(`Please upload at least ${MIN_IMAGES} images`);
      return;
    }

    if (!description.trim()) {
      toast.error("Description required", {
        description: "Please describe the damage before analyzing"
      });
      return;
    }

    setIsAnalyzing(true);
    onStatusChange?.("analyzing_image");
    const details: string[] = [];
    const results: VisionAnalysisResult[] = [];

    try {
      const updatedImages = [...images];
      for (let i = 0; i < updatedImages.length; i++) {
        updatedImages[i].status = "analyzing";
        setImages([...updatedImages]);

        const result = await analyzeImage(updatedImages[i].file, description);
        updatedImages[i].result = result;
        updatedImages[i].status = "done";
        results.push(result);
        setImages([...updatedImages]);
      }

      const damageAreas = results.map(r => r.damage_area.toLowerCase());
      const uniqueAreas = [...new Set(damageAreas)];
      const mismatchCount = results.filter(r => r.mismatch_detected).length;
      const needsMore = results.some(r => r.requires_more_images);
      const lowConfidence = results.filter(r => r.confidence < 0.6);

      results.forEach((r, idx) => {
        if (r.mismatch_detected) {
          details.push(`Image ${idx + 1}: You said "${description}" but AI detected "${r.damage_area}"`);
        }
        if (r.confidence < 0.6) {
          details.push(`Image ${idx + 1}: Low confidence (${(r.confidence * 100).toFixed(0)}%), please reupload`);
        }
        if (r.requires_more_images) {
          details.push(`Image ${idx + 1}: Angle unclear — need clearer view`);
        }
      });

      if (uniqueAreas.length > 1) {
        details.push(`Images show different damage areas: ${uniqueAreas.join(", ")}`);
      }

      const escalate = mismatchCount >= 2 || results.some(r => r.escalate_to_siu);

      const summary: MultiVisionSummary = {
        overall_damage_area: uniqueAreas.length === 1 ? uniqueAreas[0] : uniqueAreas.join(" / "),
        mismatches: mismatchCount,
        needs_more_images: needsMore || lowConfidence.length > 0 || uniqueAreas.length > 1,
        escalate_to_siu: escalate,
        individual_results: results
      };

      setMultiSummary(summary);
      setMismatchDetails(details);

      if (summary.needs_more_images || summary.mismatches > 0) {
        onStatusChange?.("mismatch_detected");
        toast.warning("Issues detected", {
          description: "Please review the mismatch details below"
        });
      } else if (summary.escalate_to_siu) {
        onStatusChange?.("claim_flagged");
        toast.error("Manual review required");
      } else {
        onStatusChange?.("image_analyzed");
        toast.success("All checks passed!");
      }

    } catch (error) {
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Failed to analyze images"
      });
      onStatusChange?.("awaiting_correct_image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canProceed = multiSummary && 
    !multiSummary.needs_more_images && 
    multiSummary.mismatches === 0 && 
    !multiSummary.escalate_to_siu &&
    !multiSummary.individual_results.some(r => r.mismatch_detected || r.requires_more_images);

  const handleProceed = () => {
    if (!canProceed || !multiSummary) return;
    
    const combinedResult: VisionAnalysisResult = {
      damage_area: multiSummary.overall_damage_area,
      confidence: multiSummary.individual_results.reduce((sum, r) => sum + r.confidence, 0) / multiSummary.individual_results.length,
      mismatch_detected: false,
      requires_more_images: false,
      escalate_to_siu: false
    };
    
    onComplete(combinedResult);
  };

  const clearAllImages = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setMultiSummary(null);
    setMismatchDetails([]);
    onStatusChange?.("idle");
  };

  const getImageBadge = (img: UploadedImage) => {
    if (!img.result) return null;
    
    if (img.result.mismatch_detected) {
      return <Badge variant="destructive" className="absolute top-2 right-2">Mismatch</Badge>;
    }
    if (img.result.confidence < 0.6) {
      return <Badge variant="outline" className="absolute top-2 right-2 bg-warning/20 text-warning border-warning">Low Confidence</Badge>;
    }
    return <Badge variant="secondary" className="absolute top-2 right-2 bg-success/20 text-success border-success">Match</Badge>;
  };

  return (
    <Card className="p-8 max-w-3xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Damage Images</h2>
          <p className="text-muted-foreground">
            Upload 2-5 clear photos of the vehicle damage for AI analysis
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-border bg-muted">
                <img
                  src={img.preview}
                  alt={`Damage photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {img.status === "analyzing" && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {getImageBadge(img)}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {img.result && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {img.result.damage_area} ({(img.result.confidence * 100).toFixed(0)}%)
                </p>
              )}
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <div
              onClick={() => document.getElementById("image-input")?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors bg-muted/50"
            >
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Image</span>
            </div>
          )}
        </div>

        {images.length === 0 && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById("image-input")?.click()}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-medium">Click to upload images</p>
                <p className="text-sm text-muted-foreground">Upload 2-5 photos (PNG, JPG up to 10MB each)</p>
              </div>
            </div>
          </div>
        )}

        <input
          id="image-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        <div className="space-y-2">
          <Label htmlFor="description">
            Damage Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the damage (e.g., 'Front bumper collision with scratches')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24"
          />
          <p className="text-xs text-muted-foreground">
            Required: Provide a clear description of the damage location and type
          </p>
        </div>

        {mismatchDetails.length > 0 && (
          <Card className="p-4 border-warning/20 bg-warning/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h4 className="font-semibold text-foreground">Mismatch Details</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">User description:</span>
                <span className="font-medium text-foreground">{description}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                {mismatchDetails.map((detail, idx) => (
                  <p key={idx} className="text-muted-foreground py-1">• {detail}</p>
                ))}
              </div>
              {multiSummary && multiSummary.needs_more_images && (
                <div className="bg-destructive/10 rounded p-3 mt-3">
                  <p className="text-destructive font-medium text-sm">
                    Action: Please upload clearer images that match your description.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {multiSummary && mismatchDetails.length === 0 && (
          <Card className="p-4 border-success/20 bg-success/10">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <h4 className="font-semibold text-foreground">Vision Agent Summary</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Damage Area:</span>
                <p className="font-medium text-foreground">{multiSummary.overall_damage_area}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Images Analyzed:</span>
                <p className="font-medium text-foreground">{multiSummary.individual_results.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Confidence:</span>
                <p className="font-medium text-foreground">
                  {(multiSummary.individual_results.reduce((s, r) => s + r.confidence, 0) / multiSummary.individual_results.length * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary" className="bg-success/20 text-success">All Verified</Badge>
              </div>
            </div>
          </Card>
        )}

        {images.length > 0 && !multiSummary && (
          <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">
              Upload at least {MIN_IMAGES} images, then click "Analyze All" to verify damage consistency
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {images.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllImages}
              className="flex-1"
            >
              Clear All
            </Button>
          )}

          {!multiSummary || mismatchDetails.length > 0 ? (
            <Button
              onClick={analyzeAllImages}
              disabled={images.length < MIN_IMAGES || !description.trim() || isAnalyzing || !backendOnline}
              className="flex-1"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : mismatchDetails.length > 0 ? (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Re-Analyze Images
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze All Images
                </>
              )}
            </Button>
          ) : canProceed ? (
            <Button
              onClick={handleProceed}
              className="flex-1"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Documents
            </Button>
          ) : (
            <Button
              disabled
              className="flex-1"
              size="lg"
              variant="secondary"
            >
              Please upload correct images to proceed
            </Button>
          )}
        </div>

        {mismatchDetails.length > 0 && images.length < MAX_IMAGES && (
          <Button
            variant="outline"
            onClick={() => document.getElementById("image-input")?.click()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Additional Images
          </Button>
        )}
      </div>
    </Card>
  );
}
