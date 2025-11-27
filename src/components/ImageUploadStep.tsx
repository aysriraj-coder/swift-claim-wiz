import { useState } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { analyzeImage, VisionAnalysisResult } from "@/lib/visionAgent";
import { toast } from "sonner";

interface ImageUploadStepProps {
  onComplete: (result: VisionAnalysisResult) => void;
}

export function ImageUploadStep({ onComplete }: ImageUploadStepProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(selectedImage, description || undefined);
      
      if (result.requires_more_images) {
        toast.warning("More images required", {
          description: "Please upload additional images of the damage"
        });
      }
      
      if (result.escalate_to_siu) {
        toast.error("Manual review required", {
          description: "This claim requires special investigation"
        });
      }
      
      onComplete(result);
    } catch (error) {
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Failed to analyze image"
      });
    } finally {
      setIsAnalyzing(false);
    }
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
            <Label htmlFor="description">Damage Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the damage (e.g., 'Front bumper collision')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>

          {selectedImage && (
            <div className="bg-muted rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">
                Our AI will analyze the damage area, assess severity, and verify consistency with your description
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
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
      </div>
    </Card>
  );
}
