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
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch (error) {
        console.warn('Backend health check failed:', error);
        setBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, [setBackendOnline]);
}
