import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                    isCompleted && "bg-success text-success-foreground shadow-md",
                    isCurrent && "bg-primary text-primary-foreground shadow-lg scale-110",
                    !isCompleted && !isCurrent && "bg-secondary text-secondary-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "text-xs mt-2 font-medium transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && "text-success",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded transition-all duration-300",
                    isCompleted ? "bg-success" : "bg-secondary"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
