import { useState } from "react";
import { useBackendStore } from "@/lib/backendStore";
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { analyzeImage, VisionAnalysisResult } from "@/lib/visionAgent";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadStepProps {
  onComplete: (result: VisionAnalysisResult) => void;
}

export function ImageUploadStep({ onComplete }: ImageUploadStepProps) {
  const backendOnline = useBackendStore((state) => state.backendOnline);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionAnalysisResult | null>(null);
  const [requiresReupload, setRequiresReupload] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setAnalysisResult(null);
      setRequiresReupload(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    
    // Description is mandatory
    if (!description.trim()) {
      toast.error("Description required", {
        description: "Please describe the damage before analyzing"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(selectedImage, description);
      setAnalysisResult(result);
      
      // Handle mismatch flow - request additional images
      if (result.requires_more_images) {
        setRequiresReupload(true);
        toast.warning("Additional image required", {
          description: "Please upload a clearer or different angle image of the damage"
        });
        return;
      }
      
      // Only escalate when explicitly flagged
      if (result.escalate_to_siu) {
        toast.error("Manual review required", {
          description: "This claim requires special investigation"
        });
      }
      
      // Proceed to next step
      onComplete(result);
    } catch (error) {
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Failed to analyze image"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReupload = () => {
    setSelectedImage(null);
    setImagePreview("");
    setAnalysisResult(null);
    setRequiresReupload(false);
    document.getElementById("image-input")?.click();
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload Damage Image</h2>
          <p className="text-muted-foreground">
            Upload a clear photo of the vehicle damage for AI analysis
          </p>
        </div>

        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => document.getElementById("image-input")?.click()}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-[var(--shadow-soft)]"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-medium">Click to upload image</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                </div>
              </div>
            )}
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

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

          {/* Vision Agent Result Card */}
          {analysisResult && (
            <Card className={cn(
              "p-4 border",
              analysisResult.mismatch_detected 
                ? "bg-warning/10 border-warning/20" 
                : "bg-success/10 border-success/20"
            )}>
              <div className="flex items-center gap-2 mb-3">
                {analysisResult.mismatch_detected ? (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
                <h4 className="font-semibold text-foreground">Vision Agent Analysis</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Damage Area:</span>
                  <p className="font-medium text-foreground">{analysisResult.damage_area}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence:</span>
                  <p className="font-medium text-foreground">{(analysisResult.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mismatch:</span>
                  <Badge variant={analysisResult.mismatch_detected ? "destructive" : "secondary"}>
                    {analysisResult.mismatch_detected ? "Detected" : "None"}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">More Images:</span>
                  <Badge variant={analysisResult.requires_more_images ? "outline" : "secondary"}>
                    {analysisResult.requires_more_images ? "Required" : "Not needed"}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {selectedImage && !analysisResult && (
            <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Our AI will analyze the damage area, assess severity, and verify consistency with your description
              </p>
            </div>
          )}
        </div>

        {requiresReupload ? (
          <Button
            onClick={handleReupload}
            className="w-full"
            size="lg"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Different Image
          </Button>
        ) : (
          <Button
            onClick={handleAnalyze}
            disabled={!selectedImage || !description.trim() || isAnalyzing || !backendOnline}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing Image...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Analyze Damage
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
