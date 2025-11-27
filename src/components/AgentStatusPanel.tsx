import { Eye, FileText, Brain, Bot, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClaimStatus } from "@/lib/customerExperienceAgent";

interface AgentStatusPanelProps {
  status: ClaimStatus;
}

type AgentState = "idle" | "running" | "completed" | "escalated";

interface Agent {
  name: string;
  icon: React.ReactNode;
  getState: (status: ClaimStatus) => AgentState;
}

const agents: Agent[] = [
  {
    name: "Vision",
    icon: <Eye className="w-4 h-4" />,
    getState: (status) => {
      if (status === "idle") return "idle";
      if (status === "analyzing_image") return "running";
      return "completed";
    }
  },
  {
    name: "Document",
    icon: <FileText className="w-4 h-4" />,
    getState: (status) => {
      if (["idle", "analyzing_image", "image_analyzed"].includes(status)) return "idle";
      if (status === "extracting_documents") return "running";
      return "completed";
    }
  },
  {
    name: "Decision",
    icon: <Brain className="w-4 h-4" />,
    getState: (status) => {
      if (["idle", "analyzing_image", "image_analyzed", "extracting_documents", "documents_extracted"].includes(status)) return "idle";
      if (status === "making_decision") return "running";
      if (status === "claim_flagged") return "escalated";
      return "completed";
    }
  },
  {
    name: "RPA",
    icon: <Bot className="w-4 h-4" />,
    getState: (status) => {
      if (["idle", "analyzing_image", "image_analyzed", "extracting_documents", "documents_extracted", "making_decision", "decision_made"].includes(status)) return "idle";
      if (status === "executing_rpa") return "running";
      if (status === "claim_flagged") return "escalated";
      return "completed";
    }
  },
  {
    name: "CX",
    icon: <Users className="w-4 h-4" />,
    getState: (status) => {
      if (["claim_approved", "claim_review", "claim_flagged"].includes(status)) {
        return status === "claim_flagged" ? "escalated" : "completed";
      }
      if (status === "rpa_completed") return "running";
      return "idle";
    }
  }
];

const stateStyles: Record<AgentState, string> = {
  idle: "bg-muted text-muted-foreground border-border",
  running: "bg-primary/10 text-primary border-primary/30 animate-pulse",
  completed: "bg-success/10 text-success border-success/30",
  escalated: "bg-destructive/10 text-destructive border-destructive/30"
};

export function AgentStatusPanel({ status }: AgentStatusPanelProps) {
  return (
    <Card className="fixed top-24 right-6 p-4 shadow-[var(--shadow-medium)] w-48 animate-fade-in">
      <h4 className="text-sm font-semibold text-foreground mb-3">Agent Status</h4>
      <div className="space-y-2">
        {agents.map((agent) => {
          const state = agent.getState(status);
          return (
            <div
              key={agent.name}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all",
                stateStyles[state]
              )}
            >
              {agent.icon}
              <span className="font-medium">{agent.name}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
