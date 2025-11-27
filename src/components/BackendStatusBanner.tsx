import { AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useBackendStore } from "@/lib/backendStore";
import { useState } from "react";
import { API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";

export function BackendStatusBanner() {
  const backendOnline = useBackendStore((state) => state.backendOnline);
  const setBackendOnline = useBackendStore((state) => state.setBackendOnline);
  const [isChecking, setIsChecking] = useState(false);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${API_BASE}/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      setBackendOnline(response.ok);
    } catch {
      setBackendOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      {/* Compact status indicator - always visible */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleManualCheck}
          disabled={isChecking}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg transition-all duration-300 hover:scale-105",
            backendOnline 
              ? "bg-success/20 text-success border border-success/30" 
              : "bg-destructive/20 text-destructive border border-destructive/30"
          )}
        >
          {isChecking ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : backendOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>{backendOnline ? "Backend Online" : "Backend Offline"}</span>
          <span className={cn(
            "w-2 h-2 rounded-full",
            backendOnline ? "bg-success animate-pulse" : "bg-destructive"
          )} />
        </button>
      </div>

      {/* Full banner when offline */}
      {!backendOnline && (
        <div className="fixed top-0 left-0 right-0 z-40 animate-fade-in">
          <div className="bg-destructive/95 backdrop-blur-sm border-b border-destructive/20 px-6 py-3 shadow-[var(--shadow-strong)]">
            <div className="container mx-auto flex items-center justify-center gap-3">
              <AlertCircle className="w-5 h-5 text-white" />
              <p className="text-white font-medium text-sm">
                Backend offline — Start your Replit server at {API_BASE}
              </p>
              <button
                onClick={handleManualCheck}
                disabled={isChecking}
                className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-xs font-medium transition-colors"
              >
                {isChecking ? "Checking..." : "Retry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
