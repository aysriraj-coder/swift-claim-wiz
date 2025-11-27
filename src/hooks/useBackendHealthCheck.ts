import { useEffect } from 'react';
import { useBackendStore } from '@/lib/backendStore';
import { API_BASE } from '@/lib/api';

export function useBackendHealthCheck() {
  const setBackendOnline = useBackendStore((state) => state.setBackendOnline);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/ping`, {
          method: 'GET',
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          try {
            const data = await response.json();
            setBackendOnline(data.status === 'ok');
          } catch {
            // If JSON parse fails but response was ok, assume backend is up
            setBackendOnline(true);
          }
        } else {
          setBackendOnline(false);
        }
      } catch (error) {
        console.warn('Backend health check failed:', error);
        setBackendOnline(false);
      }
    };

    // Check immediately on mount
    checkHealth();

    // Check every 10 seconds (reduced frequency)
    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);
  }, [setBackendOnline]);
}
