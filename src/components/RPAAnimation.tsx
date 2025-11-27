import { useEffect, useState, useRef } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { simulateRPA, RPAResult } from "@/lib/rpaAgent";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RPAAnimationProps {
  claimId: string;
  claimData: any;
  onComplete: (result: RPAResult) => void;
}

const RPA_STEPS = [
  "Logging into legacy system",
  "Creating claim record",
  "Setting reserve amounts",
  "Updating claim status"
];

export function RPAAnimation({ claimId, claimData, onComplete }: RPAAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasRun.current) return;
    hasRun.current = true;

    const runRPA = async () => {
      try {
        // Simulate step-by-step progression (900ms each)
        for (let i = 0; i < RPA_STEPS.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 900));
          setCurrentStep(i + 1);
        }

        // Call actual RPA backend ONCE with claimId only
        const result = await simulateRPA(claimId);
        
        setIsComplete(true);
        
        // Call onComplete exactly once with the result
        setTimeout(() => {
          onComplete(result);
        }, 1000);
      } catch (error) {
        console.error("RPA failed:", error);
        toast.error("RPA simulation failed", {
          description: error instanceof Error ? error.message : "Failed to run RPA"
        });
        // Still complete with a fallback result
        const fallbackResult: RPAResult = {
          status: "failed",
          steps: RPA_STEPS.map((desc, i) => ({
            step: i + 1,
            description: desc
          }))
        };
        setIsComplete(true);
        setTimeout(() => {
          onComplete(fallbackResult);
        }, 1000);
      }
    };

    runRPA();
  }, []); // Empty dependency array - runs only once on mount

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isComplete ? "Processing Complete" : "Automating System Updates"}
          </h2>
          <p className="text-muted-foreground">
            {isComplete 
              ? "All systems have been updated successfully" 
              : "Please wait while we process your claim"}
          </p>
        </div>

        <div className="space-y-4">
          {RPA_STEPS.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep - 1;

            return (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300",
                  isCompleted && "bg-success/10 border-success/20",
                  isCurrent && "bg-primary/10 border-primary/20",
                  !isCompleted && !isCurrent && "bg-muted border-border"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : isCurrent ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-medium transition-colors",
                      isCompleted && "text-success",
                      isCurrent && "text-primary",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center animate-fade-in">
            <p className="text-success font-medium">
              ✓ Claim successfully processed and logged
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
