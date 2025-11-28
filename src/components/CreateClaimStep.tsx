import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowRight, AlertCircle } from "lucide-react";
import { createClaim, CreateClaimPayload, isCorsError, getCorsErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface CreateClaimStepProps {
  onComplete: (claimId: string, claimInfo: CreateClaimPayload) => void;
}

interface FieldError {
  policyNumber?: string;
  claimAmount?: string;
  damageDescription?: string;
}

export function CreateClaimStep({ onComplete }: CreateClaimStepProps) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});

  const validateFields = (): boolean => {
    const newErrors: FieldError = {};

    if (!policyNumber.trim()) {
      newErrors.policyNumber = "Policy number is required";
    }

    if (!damageDescription.trim()) {
      newErrors.damageDescription = "Damage description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateClaimPayload = {
        company_id: "demo",
        policyNumber: policyNumber.trim(),
        damageDescription: damageDescription.trim(),
        ...(claimAmount && { claimAmount: parseFloat(claimAmount) }),
      };

      const claimId = await createClaim(payload);
      toast.success("Claim created successfully", {
        description: `Claim ID: ${claimId}`
      });
      onComplete(claimId, payload);
    } catch (error) {
      if (isCorsError(error)) {
        toast.error("Connection Error", {
          description: getCorsErrorMessage(),
          duration: 10000,
        });
      } else {
        toast.error("Failed to create claim", {
          description: error instanceof Error ? error.message : "Unknown error"
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-8 max-w-[900px] mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Claim</h2>
          <p className="text-muted-foreground">
            Start a new insurance claim. Fields marked with <span className="text-destructive">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="policyNumber" className="flex items-center gap-1">
              Policy Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="policyNumber"
              placeholder="e.g., POL-2024-001234"
              value={policyNumber}
              onChange={(e) => {
                setPolicyNumber(e.target.value);
                if (errors.policyNumber) setErrors(prev => ({ ...prev, policyNumber: undefined }));
              }}
              className={errors.policyNumber ? "border-destructive" : ""}
            />
            {errors.policyNumber && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.policyNumber}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimAmount">Claim Amount (Optional)</Label>
            <Input
              id="claimAmount"
              type="number"
              placeholder="e.g., 5000"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="damageDescription" className="flex items-center gap-1">
              Damage Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="damageDescription"
              placeholder="Describe the damage in detail..."
              value={damageDescription}
              onChange={(e) => {
                setDamageDescription(e.target.value);
                if (errors.damageDescription) setErrors(prev => ({ ...prev, damageDescription: undefined }));
              }}
              rows={4}
              className={errors.damageDescription ? "border-destructive" : ""}
            />
            {errors.damageDescription && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.damageDescription}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Creating Claim...
              </>
            ) : (
              <>
                Start Claim
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
