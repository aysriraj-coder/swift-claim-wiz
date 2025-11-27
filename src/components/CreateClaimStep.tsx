import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowRight } from "lucide-react";
import { createClaim, CreateClaimPayload } from "@/lib/api";
import { toast } from "sonner";

interface CreateClaimStepProps {
  onComplete: (claimId: string, claimInfo: CreateClaimPayload) => void;
}

export function CreateClaimStep({ onComplete }: CreateClaimStepProps) {
  const [policyNumber, setPolicyNumber] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [damageDescription, setDamageDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsCreating(true);
    try {
      const payload: CreateClaimPayload = {
        company_id: "demo",
        ...(policyNumber.trim() && { policyNumber: policyNumber.trim() }),
        ...(claimAmount && { claimAmount: parseFloat(claimAmount) }),
        ...(damageDescription.trim() && { damageDescription: damageDescription.trim() }),
      };

      const claimId = await createClaim(payload);
      toast.success("Claim created successfully", {
        description: `Claim ID: ${claimId}`
      });
      onComplete(claimId, payload);
    } catch (error) {
      toast.error("Failed to create claim", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-8 max-w-lg mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Claim</h2>
          <p className="text-muted-foreground">
            Start a new claim. Fill in optional details or just click Start Claim.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number (Optional)</Label>
            <Input
              id="policyNumber"
              placeholder="e.g., POL-2024-001234"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
            />
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
            <Label htmlFor="damageDescription">Damage Description (Optional)</Label>
            <Textarea
              id="damageDescription"
              placeholder="Describe the damage..."
              value={damageDescription}
              onChange={(e) => setDamageDescription(e.target.value)}
              rows={3}
            />
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
