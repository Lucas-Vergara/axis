import { create } from "zustand";

interface SimulationState {
  progress: number; // 0 to 100
  isPlaying: boolean;
  speed: number; // 1, 0.5, 0.25
  weight: number; // in kg, default is 60 kg (standard bar + plates)
  setProgress: (progress: number | ((prev: number) => number)) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSpeed: (speed: number) => void;
  setWeight: (weight: number) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  progress: 0,
  isPlaying: false,
  speed: 1,
  weight: 60, // Default to 60 kg
  setProgress: (progress) =>
    set((state) => {
      const nextVal = typeof progress === "function" ? progress(state.progress) : progress;
      return { progress: Math.min(100, Math.max(0, nextVal)) };
    }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSpeed: (speed) => set({ speed }),
  setWeight: (weight) => set({ weight: Math.max(20, weight) }), // Minimum 20 kg (empty barbell)
  reset: () => set({ progress: 0, isPlaying: false, speed: 1, weight: 60 }),
}));
