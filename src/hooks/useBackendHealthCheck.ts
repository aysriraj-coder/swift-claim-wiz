import { useEffect } from 'react';
import { useBackendStore } from '@/lib/backendStore';

const API_BASE = "https://4e948ef7-1668-4c39-85db-342a63b048e3-00-124qj2yd3st31.sisko.replit.dev:8000";

export function useBackendHealthCheck() {
  const setBackendOnline = useBackendStore((state) => state.setBackendOnline);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/ping`, {
          method: 'GET',
        });
        
        if (response.ok) {
          const data = await response.json();
          setBackendOnline(data.status === 'ok');
        } else {
          setBackendOnline(false);
        }
      } catch (error) {
        setBackendOnline(false);
      }
    };

    // Check immediately on mount
    checkHealth();

    // Check every 4 seconds
    const interval = setInterval(checkHealth, 4000);

    return () => clearInterval(interval);
  }, [setBackendOnline]);
}
