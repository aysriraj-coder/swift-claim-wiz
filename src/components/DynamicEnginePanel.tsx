import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileQuestion, Upload, CheckCircle } from "lucide-react";
import { UploadResult } from "@/lib/api";

interface Mismatch {
  type: "image_vs_description" | "doc_mismatch" | string;
  description: string;
}

interface DynamicEnginePanelProps {
  missingFields?: string[];
  mismatches?: Mismatch[];
  requestedActions?: string[];
  uploadResults?: UploadResult[];
  damageDescription?: string;
}

export function DynamicEnginePanel({
  missingFields = [],
  mismatches = [],
  requestedActions = [],
  uploadResults = [],
  damageDescription,
}: DynamicEnginePanelProps) {
  // Compute local missing fields if not provided
  const computedMissing = missingFields.length > 0 ? missingFields : [];
  
  // Detect mismatches between description and detected zones
  const detectedMismatches: Mismatch[] = [...mismatches];
  
  if (damageDescription && uploadResults.length > 0) {
    const descLower = damageDescription.toLowerCase();
    uploadResults.forEach((result) => {
      const detectedZone = result.metadata?.detector?.damage_zone?.toLowerCase();
      if (detectedZone && descLower && !descLower.includes(detectedZone)) {
        // Check if mismatch already exists
        const exists = detectedMismatches.some(
          (m) => m.type === "image_vs_description" && m.description.includes(detectedZone)
        );
        if (!exists) {
          detectedMismatches.push({
            type: "image_vs_description",
            description: `Description mentions "${damageDescription}" but image shows "${detectedZone}" damage`,
          });
        }
      }
    });
  }

  const hasIssues = computedMissing.length > 0 || detectedMismatches.length > 0 || requestedActions.length > 0;

  if (!hasIssues) {
    return (
      <Card className="p-4 bg-success/10 border-success/20">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">All checks passed - Ready to proceed</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4 border-warning/30 bg-warning/5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <h3 className="font-semibold text-foreground">Dynamic Engine Output</h3>
      </div>

      {/* Missing Fields */}
      {computedMissing.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Missing Fields</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {computedMissing.map((field, idx) => (
              <Badge key={idx} variant="outline" className="border-warning text-warning">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Mismatches */}
      {detectedMismatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">Mismatches Detected</span>
          </div>
          <div className="space-y-2">
            {detectedMismatches.map((mismatch, idx) => (
              <div key={idx} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <Badge variant="destructive" className="mb-2 text-xs">
                  {mismatch.type.replace(/_/g, " ")}
                </Badge>
                <p className="text-sm text-foreground">{mismatch.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requested Actions */}
      {requestedActions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Requested Actions</span>
          </div>
          <ul className="space-y-1">
            {requestedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                {action.replace(/_/g, " ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
