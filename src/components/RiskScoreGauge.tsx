import { useMemo } from "react";

interface RiskScoreGaugeProps {
  score: number;
  thresholds?: {
    approve?: number;
    autoApprove?: number;
    manualReview?: number;
    manual_review?: number;
    siuFlag?: number;
    deny?: number;
  };
}

export function RiskScoreGauge({ score, thresholds }: RiskScoreGaugeProps) {
  const approveThreshold = thresholds?.approve ?? thresholds?.autoApprove ?? 30;
  const reviewThreshold = thresholds?.manualReview ?? thresholds?.manual_review ?? 60;

  const { color, label, bgClass } = useMemo(() => {
    if (score <= approveThreshold) {
      return { color: "hsl(var(--success))", label: "Low Risk", bgClass: "bg-success" };
    }
    if (score <= reviewThreshold) {
      return { color: "hsl(var(--warning))", label: "Medium Risk", bgClass: "bg-warning" };
    }
    return { color: "hsl(var(--destructive))", label: "High Risk", bgClass: "bg-destructive" };
  }, [score, approveThreshold, reviewThreshold]);

  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Risk Score</span>
        <span className="text-2xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        {/* Threshold markers */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
          style={{ left: `${approveThreshold}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
          style={{ left: `${reviewThreshold}%` }}
        />

        {/* Background gradient */}
        <div className="absolute inset-0 flex">
          <div className="bg-success/30" style={{ width: `${approveThreshold}%` }} />
          <div className="bg-warning/30" style={{ width: `${reviewThreshold - approveThreshold}%` }} />
          <div className="bg-destructive/30" style={{ width: `${100 - reviewThreshold}%` }} />
        </div>

        {/* Score indicator */}
        <div
          className={`absolute top-0 bottom-0 ${bgClass} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span className="flex flex-col items-center">
          <span>{approveThreshold}</span>
          <span className="text-success">Auto-Approve</span>
        </span>
        <span className="flex flex-col items-center">
          <span>{reviewThreshold}</span>
          <span className="text-warning">Review</span>
        </span>
        <span>100</span>
      </div>

      {/* Risk label */}
      <div className="text-center">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgClass} text-white`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
