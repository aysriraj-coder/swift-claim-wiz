import { create } from 'zustand';

interface BackendStore {
  backendOnline: boolean;
  claimId: string | null;
  setBackendOnline: (status: boolean) => void;
  setClaimId: (id: string) => void;
  resetClaim: () => void;
}

export const useBackendStore = create<BackendStore>((set) => ({
  backendOnline: true,
  claimId: null,
  setBackendOnline: (status) => set({ backendOnline: status }),
  setClaimId: (id) => set({ claimId: id }),
  resetClaim: () => set({ claimId: null }),
}));
