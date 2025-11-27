import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Loader2, Play } from "lucide-react";
import { simulateRPA, RPAResult } from "@/lib/rpaAgent";
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
      // Simulate step progression for visual effect
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);

      const rpaResult = await simulateRPA(claimId);
      
      clearInterval(stepInterval);
      setCurrentStep(rpaResult.steps.length);
      setResult(rpaResult);
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
          <h2 className="text-2xl font-bold text-foreground mb-2">RPA Simulation</h2>
          <p className="text-muted-foreground">
            Simulate the robotic process automation workflow
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

            {/* Steps */}
            <div className="space-y-3">
              {result.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Step {step.step}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Success Message */}
            {result.message && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-foreground font-medium">{result.message}</p>
              </div>
            )}

            <Button
              onClick={() => onComplete(result)}
              className="w-full"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Workflow
            </Button>
          </div>
        ) : isSimulating ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
            <p className="text-center text-muted-foreground">
              Running RPA simulation... Step {currentStep + 1}
            </p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
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
