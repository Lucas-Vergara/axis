import { create } from "zustand";

interface SimulationState {
  progress: number; // 0 to 100
  isPlaying: boolean;
  speed: number; // 1, 0.5, 0.25
  setProgress: (progress: number | ((prev: number) => number)) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  progress: 0,
  isPlaying: false,
  speed: 1,
  setProgress: (progress) =>
    set((state) => {
      const nextVal = typeof progress === "function" ? progress(state.progress) : progress;
      return { progress: Math.min(100, Math.max(0, nextVal)) };
    }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  reset: () => set({ progress: 0, isPlaying: false, speed: 1 }),
}));
