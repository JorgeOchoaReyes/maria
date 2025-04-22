import { create } from "zustand";
import { devtools, persist } from "zustand/middleware"; 

interface AutStorage {
  refreshToken: string | null;
  accessToken: string | null;
  setRefreshToken: (token: string | null) => void;
  setAccessToken: (token: string | null) => void;
  clearTokens: () => void;
  timestamp: number | null;
  setTimestamp: (timestamp: number | null) => void;
}

export const useAuthStorage = create<AutStorage>()(
  devtools(
    persist(
      (set) => ({ 
        refreshToken: null,
        accessToken: null,
        timestamp: null,
        setRefreshToken: (token) => set({ refreshToken: token }),
        setAccessToken: (token) => set({ accessToken: token }),
        clearTokens: () => set({ refreshToken: null, accessToken: null, timestamp: null }),
        setTimestamp: (timestamp) => set({ timestamp }),
      }),
      {
        name: "maria-local-storage",
      },
    ),
  ),
);