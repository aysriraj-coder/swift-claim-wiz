import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Upload, CheckCircle, UserCheck } from "lucide-react";

interface MismatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimedZone: string;
  detectedZone: string;
  onUploadNew: () => void;
  onConfirmDetected: () => void;
  onRequestReview: () => void;
}

export function MismatchModal({
  open,
  onOpenChange,
  claimedZone,
  detectedZone,
  onUploadNew,
  onConfirmDetected,
  onRequestReview,
}: MismatchModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: () => void) => {
    setIsProcessing(true);
    try {
      action();
    } finally {
      setIsProcessing(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning mb-2">
            <AlertTriangle className="w-6 h-6" />
            <DialogTitle>Zone Mismatch Detected</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            We detected a mismatch between your description and the uploaded photo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Description Claims</p>
              <Badge variant="outline" className="text-sm">
                {claimedZone || "Not specified"}
              </Badge>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Photo Shows</p>
              <Badge variant="secondary" className="text-sm bg-primary/10 text-primary">
                {detectedZone || "Unknown"}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Please upload a photo showing the <strong>{claimedZone}</strong> area, 
            or confirm that the detected zone (<strong>{detectedZone}</strong>) is correct.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={() => handleAction(onUploadNew)}
            disabled={isProcessing}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New Photo
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAction(onConfirmDetected)}
            disabled={isProcessing}
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Detected Zone ({detectedZone})
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAction(onRequestReview)}
            disabled={isProcessing}
            className="w-full"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Request Human Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
