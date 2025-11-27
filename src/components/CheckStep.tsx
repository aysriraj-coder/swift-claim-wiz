import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle, ClipboardList, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { checkClaim, CheckResult } from "@/lib/api";

interface CheckStepProps {
  claimId: string;
  onComplete: (checkResult: CheckResult) => void;
}

export function CheckStep({ claimId, onComplete }: CheckStepProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [missingValues, setMissingValues] = useState<Record<string, string>>({});

  useEffect(() => {
    runCheck();
  }, [claimId]);

  const runCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkClaim(claimId);
      setCheckResult(result);
      if (result.status === "ok") {
        toast.success("All information complete!");
      } else if (result.missing) {
        const initial: Record<string, string> = {};
        result.missing.forEach((field) => (initial[field] = ""));
        setMissingValues(initial);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Check failed");
      // Default to ok if check fails
      setCheckResult({ status: "ok" });
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = () => {
    if (checkResult) {
      onComplete(checkResult);
    }
  };

  const allFieldsFilled = checkResult?.missing
    ? checkResult.missing.every((field) => missingValues[field]?.trim())
    : true;

  if (isChecking) {
    return (
      <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Checking claim information...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Missing Information Check</h2>
          <p className="text-muted-foreground">
            Verify all required information is complete
          </p>
        </div>

        {checkResult?.status === "ok" ? (
          <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success/20">
            <CheckCircle className="h-6 w-6 text-success" />
            <div>
              <p className="font-medium text-foreground">All Information Complete</p>
              <p className="text-sm text-muted-foreground">
                Your claim has all required information.
              </p>
            </div>
          </div>
        ) : checkResult?.status === "needs_info" && checkResult.missing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg border border-warning/20">
              <AlertCircle className="h-6 w-6 text-warning" />
              <div>
                <p className="font-medium text-foreground">Missing Information</p>
                <p className="text-sm text-muted-foreground">
                  Please provide the following details.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {checkResult.missing.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  {field === "damageDescription" ? (
                    <Textarea
                      id={field}
                      value={missingValues[field] || ""}
                      onChange={(e) =>
                        setMissingValues((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id={field}
                      type={field === "claimAmount" ? "number" : "text"}
                      value={missingValues[field] || ""}
                      onChange={(e) =>
                        setMissingValues((prev) => ({
                          ...prev,
                          [field]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Note: These values are for reference. The decision will be based on uploaded documents.
            </p>
          </div>
        ) : null}

        <Button
          onClick={handleContinue}
          disabled={checkResult?.status === "needs_info" && !allFieldsFilled}
          className="w-full"
          size="lg"
        >
          Continue to Decision
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  );
}
