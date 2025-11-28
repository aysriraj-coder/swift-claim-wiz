import { CheckCircle, FileText, Eye, Cog, Gavel, Bot } from "lucide-react";

interface TriagePathStepperProps {
  path: string[];
  currentStep?: string;
}

const STEP_ICONS: Record<string, typeof FileText> = {
  DocumentExtraction: FileText,
  DamageDetector: Eye,
  Detector: Eye,
  RuleEngine: Cog,
  Decision: Gavel,
  RPA: Bot,
  ManualReview: Gavel,
};

const STEP_LABELS: Record<string, string> = {
  DocumentExtraction: "Document Extraction",
  DamageDetector: "Damage Detection",
  Detector: "Damage Detection",
  RuleEngine: "Rule Engine",
  Decision: "Decision",
  RPA: "RPA Execution",
  ManualReview: "Manual Review",
};

export function TriagePathStepper({ path, currentStep }: TriagePathStepperProps) {
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Triage Path</h4>
      <div className="flex items-center justify-between overflow-x-auto pb-2">
        {path.map((step, idx) => {
          const Icon = STEP_ICONS[step] || Cog;
          const label = STEP_LABELS[step] || step;
          const isActive = currentStep === step;
          const isCompleted = !currentStep || path.indexOf(currentStep) > idx;

          return (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center min-w-[80px]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${
                    isCompleted || isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {idx < path.length - 1 && (
                <div
                  className={`h-0.5 w-8 mx-1 ${
                    isCompleted ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
