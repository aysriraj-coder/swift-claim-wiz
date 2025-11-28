import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, Loader2, Play, Circle, XCircle, AlertTriangle, Copy } from "lucide-react";
import { executeRPA, RPAResult, API_BASE, isCorsError, getCorsErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface RPAStepProps {
  claimId: string;
  onComplete: (result: RPAResult) => void;
}

export function RPAStep({ claimId, onComplete }: RPAStepProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<RPAResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setCurrentStep(0);
    setError(null);

    try {
      const rpaResult = await executeRPA(claimId);
      setResult(rpaResult);

      // Animate through steps
      for (let i = 0; i < rpaResult.steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setCurrentStep(i + 1);
      }

      if (rpaResult.status === "success") {
        toast.success("RPA execution complete");
      } else {
        toast.warning("RPA completed with issues", {
          description: rpaResult.error || "Some steps may have failed"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      
      if (isCorsError(err)) {
        toast.error("Connection Error", {
          description: getCorsErrorMessage(),
          duration: 10000,
        });
      } else {
        toast.error("RPA execution failed", {
          description: errorMessage
        });
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const copyBackendUrl = () => {
    navigator.clipboard.writeText(API_BASE);
    toast.success("Backend URL copied to clipboard");
  };

  const getStepIcon = (step: { status?: string; error?: string }, isCompleted: boolean) => {
    if (step.error || step.status === "failed") {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (isCompleted) {
      return <CheckCircle className="h-4 w-4" />;
    }
    return <Circle className="h-4 w-4" />;
  };

  const getStepStyle = (step: { status?: string; error?: string }, isCompleted: boolean) => {
    if (step.error || step.status === "failed") {
      return "bg-destructive text-destructive-foreground";
    }
    if (isCompleted) {
      return "bg-success text-success-foreground";
    }
    return "bg-muted border-2 border-muted-foreground/20";
  };

  return (
    <Card className="p-8 max-w-[900px] mx-auto animate-fade-in shadow-[var(--shadow-medium)]">
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">RPA Execution</h2>
          <p className="text-muted-foreground">
            Automated workflow execution for claim processing
          </p>
        </div>

        {/* Error State */}
        {error && !result && (
          <Card className="p-6 bg-destructive/10 border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">RPA Execution Failed</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                
                {error.includes("CORS") && (
                  <div className="bg-background/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Backend URL:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                        {API_BASE}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyBackendUrl}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button onClick={handleSimulate} variant="outline">
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {result ? (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                variant="default" 
                className={`text-lg px-4 py-1 ${
                  result.status === "success" 
                    ? "bg-success text-success-foreground" 
                    : "bg-warning text-warning-foreground"
                }`}
              >
                {result.status === "success" ? "Completed Successfully" : result.status}
              </Badge>
            </div>

            {/* Animated Timeline */}
            <div className="relative pl-8 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted" />

              {result.steps.map((step, idx) => {
                const isCompleted = idx < currentStep;
                const hasFailed = step.error || step.status === "failed";

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step indicator */}
                    <div
                      className={`absolute -left-5 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ${getStepStyle(step, isCompleted)}`}
                    >
                      {getStepIcon(step, isCompleted)}
                    </div>

                    {/* Step content */}
                    <div
                      className={`flex-1 p-3 rounded-lg transition-all duration-300 ${
                        hasFailed
                          ? "bg-destructive/10 border border-destructive/20"
                          : isCompleted
                          ? "bg-success/10 border border-success/20"
                          : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Step {step.step}</span>
                        {step.status && (
                          <Badge
                            variant={
                              step.status === "completed" ? "default" : 
                              step.status === "failed" ? "destructive" : "secondary"
                            }
                            className={`text-xs ${step.status === "completed" ? "bg-success" : ""}`}
                          >
                            {step.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      {step.error && (
                        <p className="text-xs text-destructive mt-2">{step.error}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Complete Button */}
            {currentStep >= result.steps.length && (
              <div className="pt-4">
                <div className={`rounded-lg p-4 text-center mb-4 ${
                  result.status === "success" 
                    ? "bg-success/10 border border-success/20" 
                    : "bg-warning/10 border border-warning/20"
                }`}>
                  {result.status === "success" ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                      <p className="font-medium text-foreground">Workflow Complete</p>
                      <p className="text-sm text-muted-foreground">All RPA steps executed successfully</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                      <p className="font-medium text-foreground">Workflow Completed with Warnings</p>
                      <p className="text-sm text-muted-foreground">{result.error || "Some steps may require attention"}</p>
                    </>
                  )}
                </div>
                <Button onClick={() => onComplete(result)} className="w-full" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  View Final Summary
                </Button>
              </div>
            )}
          </div>
        ) : !error && (
          isSimulating ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              <p className="text-center text-muted-foreground">
                Running RPA workflow...
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
              Execute RPA Workflow
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
