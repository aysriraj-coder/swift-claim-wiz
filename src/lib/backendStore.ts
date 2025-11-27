import { create } from 'zustand';

interface BackendStore {
  backendOnline: boolean;
  setBackendOnline: (status: boolean) => void;
}

export const useBackendStore = create<BackendStore>((set) => ({
  backendOnline: true,
  setBackendOnline: (status) => set({ backendOnline: status }),
}));
