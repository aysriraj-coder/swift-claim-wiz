import { AlertCircle, CheckCircle } from "lucide-react";
import { useBackendStore } from "@/lib/backendStore";

export function BackendStatusBanner() {
  const backendOnline = useBackendStore((state) => state.backendOnline);

  if (backendOnline) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-2 shadow-[var(--shadow-soft)] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-sm font-medium text-success">Connected to backend ✓</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-fade-in">
      <div className="bg-destructive/95 backdrop-blur-sm border-b border-destructive/20 px-6 py-4 shadow-[var(--shadow-strong)]">
        <div className="container mx-auto flex items-center justify-center gap-3">
          <AlertCircle className="w-5 h-5 text-white" />
          <p className="text-white font-semibold">
            🚨 Backend offline — please go to Replit and press RUN
          </p>
        </div>
      </div>
    </div>
  );
}
