"use client";

import React, { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

export default function PlaybackControls() {
  const { progress, isPlaying, speed, setProgress, setIsPlaying, setSpeed, reset } =
    useSimulationStore();

  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1); // 1 = down (0 to 100), -1 = up (100 to 0)
  const lastTimeRef = useRef<number>(0);

  // Synchronize dynamic loops with requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Base: a full rep (0 to 100 to 0) takes 3000ms at 1x speed.
      // That is 200 units of progress per 3000ms, or 0.067 units/ms.
      const unitsPerMs = 0.067 * speed;
      const progressDelta = deltaTime * unitsPerMs;

      setProgress((prevProgress) => {
        let nextProgress = prevProgress + directionRef.current * progressDelta;

        // Bounce at boundaries to create a continuous fluid cycle
        if (nextProgress >= 100) {
          nextProgress = 100;
          directionRef.current = -1; // reverse to up
        } else if (nextProgress <= 0) {
          nextProgress = 0;
          directionRef.current = 1; // reverse to down
        }

        return nextProgress;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, setProgress]);

  // Handle Play/Pause toggle
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle slider change manually
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    // Pause on manual scrub for fine-grained inspection
    if (isPlaying) setIsPlaying(false);
  };

  const getPhaseName = () => {
    if (progress === 0) return "Bloqueo Inicial";
    if (progress === 100) return "Contacto Esternal";
    return directionRef.current === 1 ? "Fase Excéntrica (Bajada)" : "Fase Concéntrica (Subida)";
  };

  return (
    <div className="w-full p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-md flex flex-col gap-4">
      {/* Slider Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {getPhaseName()}
          </span>
          <span className="font-mono text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
            Progreso: {Math.round(progress)}%
          </span>
        </div>

        <div className="relative group flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-zinc-950 rounded-lg appearance-none cursor-pointer border border-zinc-800 outline-none accent-blue-500 hover:accent-blue-400 transition-colors"
            style={{
              background: `linear-gradient(to right, #3b82f644 0%, #3b82f6 ${progress}%, #09090b ${progress}%, #09090b 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-zinc-500 font-bold tracking-widest px-1 uppercase">
          <span>0% Lockout</span>
          <span>50% Mitad</span>
          <span>100% Pecho</span>
        </div>
      </div>

      {/* Control Buttons and Speed Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800/60">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-md select-none border ${
              isPlaying
                ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80 border-zinc-700 hover:border-zinc-600"
                : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.03] active:scale-[0.98] border-blue-500 hover:shadow-blue-500/10"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Simular
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              reset();
              directionRef.current = 1;
            }}
            className="flex items-center justify-center p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all duration-150 cursor-pointer"
            title="Reiniciar Simulación"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Slow Motion Selector */}
        <div className="flex items-center gap-2.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold pl-2 flex items-center gap-1">
            <FastForward className="w-3 h-3 text-zinc-500" />
            Velocidad
          </span>
          <div className="flex items-center gap-1">
            {[1.0, 0.5, 0.25].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide font-mono transition-all duration-150 cursor-pointer ${
                  speed === s
                    ? "bg-blue-950 text-blue-400 border border-blue-800/80 shadow-md"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                {s === 1.0 ? "1x" : s === 0.5 ? "0.5x" : "0.25x"}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
