import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Clock, FileText, Upload, Gavel, Bot, MessageCircle } from "lucide-react";

interface AuditEntry {
  timestamp: string;
  action: string;
  details?: string;
  type: "create" | "upload" | "decision" | "rpa" | "cx_agent" | "check";
}

interface AuditTrailProps {
  entries: AuditEntry[];
  backendAudit?: Array<{ step: string; result: string; timestamp?: string }>;
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  create: FileText,
  upload: Upload,
  decision: Gavel,
  rpa: Bot,
  cx_agent: MessageCircle,
  check: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  create: "bg-primary/10 text-primary",
  upload: "bg-accent/10 text-accent",
  decision: "bg-warning/10 text-warning",
  rpa: "bg-success/10 text-success",
  cx_agent: "bg-muted text-muted-foreground",
  check: "bg-secondary text-secondary-foreground",
};

export function AuditTrail({ entries, backendAudit }: AuditTrailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Merge backend audit with client entries
  const allEntries: AuditEntry[] = [
    ...entries,
    ...(backendAudit?.map((item) => ({
      timestamp: item.timestamp || new Date().toISOString(),
      action: item.step,
      details: item.result,
      type: "decision" as const,
    })) || []),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (allEntries.length === 0) {
    return null;
  }

  const displayEntries = isExpanded ? allEntries : allEntries.slice(0, 3);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Audit Trail</h3>
          <Badge variant="outline">{allEntries.length} events</Badge>
        </div>
        {allEntries.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show All
              </>
            )}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {displayEntries.map((entry, idx) => {
          const Icon = TYPE_ICONS[entry.type] || FileText;
          const colorClass = TYPE_COLORS[entry.type] || "bg-muted text-muted-foreground";

          return (
            <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{entry.action}</p>
                {entry.details && (
                  <p className="text-xs text-muted-foreground truncate">{entry.details}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Helper to create audit entries
export function createAuditEntry(
  action: string,
  type: AuditEntry["type"],
  details?: string
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    action,
    details,
    type,
  };
}
