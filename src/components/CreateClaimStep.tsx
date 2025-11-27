import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ArrowRight } from "lucide-react";
import { createClaim, CreateClaimPayload } from "@/lib/api";
import { toast } from "sonner";

interface CreateClaimStepProps {
  onComplete: (claimId: string, claimInfo: CreateClaimPayload) => void;
}

const INSURANCE_COMPANIES = [
  "ICICI Lombard",
  "HDFC Ergo",
  "Bajaj Allianz",
  "Tata AIG",
  "New India Assurance",
  "United India Insurance",
  "Oriental Insurance",
  "National Insurance",
  "Other"
];

export function CreateClaimStep({ onComplete }: CreateClaimStepProps) {
  const [customerName, setCustomerName] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [company, setCompany] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !policyNumber.trim() || !company) {
      toast.error("Please fill all fields");
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateClaimPayload = {
        customerName: customerName.trim(),
        policyNumber: policyNumber.trim(),
        company
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Create New Claim</h2>
          <p className="text-muted-foreground">
            Enter the customer and policy details to start a new claim
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policyNumber">Policy Number *</Label>
            <Input
              id="policyNumber"
              placeholder="e.g., POL-2024-001234"
              value={policyNumber}
              onChange={(e) => setPolicyNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Insurance Company *</Label>
            <Select value={company} onValueChange={setCompany} required>
              <SelectTrigger>
                <SelectValue placeholder="Select insurance company" />
              </SelectTrigger>
              <SelectContent>
                {INSURANCE_COMPANIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isCreating || !customerName.trim() || !policyNumber.trim() || !company}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Creating Claim...
              </>
            ) : (
              <>
                Create Claim
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
