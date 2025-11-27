import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Loader2, Play, Circle } from "lucide-react";
import { simulateRPA, RPAResult } from "@/lib/api";
import { toast } from "sonner";

interface RPAStepProps {
  claimId: string;
  onComplete: (result: RPAResult) => void;
}

export function RPAStep({ claimId, onComplete }: RPAStepProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<RPAResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setCurrentStep(0);

    try {
      const rpaResult = await simulateRPA(claimId);
      setResult(rpaResult);

      // Animate through steps
      for (let i = 0; i < rpaResult.steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCurrentStep(i + 1);
      }

      toast.success("RPA simulation complete");
    } catch (error) {
      toast.error("RPA simulation failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Simulated RPA Execution</h2>
          <p className="text-muted-foreground">
            Automated workflow simulation for claim processing
          </p>
        </div>

        {result ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="default" className="bg-success text-success-foreground text-lg px-4 py-1">
                {result.status}
              </Badge>
            </div>

            {/* Animated Timeline */}
            <div className="relative pl-8 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted" />

              {result.steps.map((step, idx) => {
                const isCompleted = idx < currentStep;

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step indicator */}
                    <div
                      className={`absolute -left-5 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-success text-success-foreground"
                          : "bg-muted border-2 border-muted-foreground/20"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </div>

                    {/* Step content */}
                    <div
                      className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                        isCompleted
                          ? "bg-success/10 border border-success/20"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Step {step.step}</span>
                        {step.status && (
                          <Badge
                            variant={step.status === "completed" ? "default" : "secondary"}
                            className={`text-xs ${step.status === "completed" ? "bg-success" : ""}`}
                          >
                            {step.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Button */}
            {currentStep >= result.steps.length && (
              <div className="pt-4">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center mb-4">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-medium text-foreground">Workflow Complete</p>
                  <p className="text-sm text-muted-foreground">All RPA steps executed successfully</p>
                </div>
                <Button onClick={() => onComplete(result)} className="w-full" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Final Summary
                </Button>
              </div>
            )}
          </div>
        ) : isSimulating ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <p className="text-center text-muted-foreground">
              Running RPA simulation...
            </p>
          </div>
        ) : (
          <Button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Simulate RPA Workflow
          </Button>
        )}
      </div>
    </Card>
  );
}
