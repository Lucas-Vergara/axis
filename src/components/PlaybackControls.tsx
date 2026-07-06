"use client";

import React, { useEffect, useRef } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { Play, Pause, RotateCcw, FastForward } from "lucide-react";

export default function PlaybackControls() {
  const {
    progress,
    isPlaying,
    speed,
    setProgress,
    setIsPlaying,
    setSpeed,
    reset,
  } = useSimulationStore();

  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<number>(1); 
  const lastTimeRef = useRef<number>(0);

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

      const unitsPerMs = 0.067 * speed;
      const progressDelta = deltaTime * unitsPerMs;

      setProgress((prevProgress) => {
        let nextProgress = prevProgress + directionRef.current * progressDelta;

        if (nextProgress >= 100) {
          nextProgress = 100;
          directionRef.current = -1; 
        } else if (nextProgress <= -30) {
          nextProgress = -30;
          directionRef.current = 1; 
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

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (isPlaying) setIsPlaying(false);
  };

  const getPhaseName = () => {
    if (progress === -30) return "Soporte (Racked)";
    if (progress < 0) return "Unrack (Fase Concéntrica)";
    if (progress === 0) return "Lockout (Inicio Excéntrica)";
    return `Descenso Excéntrico (${Math.round(progress)}%)`;
  };

  const sliderPercentage = ((progress + 30) / 130) * 100;

  return (
    <div className="w-full p-5 bg-white dark:bg-[#121212] rounded-xl border border-zinc-200 dark:border-neutral-800 flex flex-col gap-4 shadow-xl transition-colors duration-300">
      {/* Slider Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-gray-400 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef5350] animate-pulse" />
            Fase actual: <span className="text-zinc-800 dark:text-gray-300">{getPhaseName()}</span>
          </span>
          <span className="font-mono text-[#ef5350] font-bold">
            {progress < 0 ? Math.round(progress) + "%" : "+" + Math.round(progress) + "%"}
          </span>
        </div>

        <div className="relative group flex items-center">
          <input
            type="range"
            min="-30"
            max="100"
            step="1"
            value={progress}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-zinc-200 dark:bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer border border-zinc-300 dark:border-[#222] outline-none accent-[#ef5350] hover:accent-red-400 transition-colors"
            style={{
              background: `linear-gradient(to right, #ef535044 0%, #ef5350 ${sliderPercentage}%, var(--color-track, transparent) ${sliderPercentage}%, var(--color-track, transparent) 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-zinc-500 dark:text-gray-500 font-bold tracking-widest px-1 uppercase">
          <span>Soporte</span>
          <span>Lockout</span>
          <span>Pecho</span>
        </div>
      </div>

      {/* Control Buttons and Speed Panel */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-neutral-800">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-md select-none border ${
                isPlaying
                  ? "bg-zinc-100 dark:bg-neutral-800 text-zinc-900 dark:text-gray-100 hover:bg-zinc-200 dark:hover:bg-neutral-700 border-zinc-300 dark:border-neutral-700"
                  : "bg-blue-500 dark:bg-[#00e5ff] text-white dark:text-[#0a0a0a] hover:bg-blue-600 dark:hover:bg-cyan-400 hover:scale-[1.03] active:scale-[0.98] border-blue-500 dark:border-[#00e5ff] hover:shadow-blue-500/20 dark:hover:shadow-cyan-500/20 shadow-blue-500/10 dark:shadow-cyan-500/10"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className={`w-4 h-4 ${isPlaying ? '' : 'fill-white dark:fill-[#0a0a0a]'}`} />
                  Simular
                </>
              )}
            </button>

            <button
              onClick={() => {
                reset();
                directionRef.current = 1;
              }}
              className="flex items-center justify-center p-2.5 rounded-xl bg-zinc-100 dark:bg-[#0a0a0a] hover:bg-zinc-200 dark:hover:bg-[#151515] border border-zinc-300 dark:border-[#222] text-zinc-600 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-gray-200 transition-all duration-150 cursor-pointer"
              title="Reiniciar Simulación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slow Motion Selector */}
        <div className="flex items-center justify-between xl:justify-start gap-2.5 bg-zinc-100 dark:bg-[#0a0a0a] p-1.5 rounded-xl border border-zinc-200 dark:border-[#222] w-full xl:w-auto">
          <span className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase tracking-widest font-extrabold pl-2 flex items-center gap-1">
            <FastForward className="w-3 h-3 text-zinc-500 dark:text-gray-500" />
            Velocidad
          </span>
          <div className="flex items-center gap-1">
            {[1.0, 0.5, 0.25].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide font-mono transition-all duration-150 cursor-pointer ${
                  speed === s
                    ? "bg-white dark:bg-[#151515] text-blue-600 dark:text-[#00e5ff] border border-blue-200 dark:border-[#00e5ff]/30 shadow-md"
                    : "text-zinc-500 dark:text-gray-500 hover:text-zinc-900 dark:hover:text-gray-300 border border-transparent hover:bg-white dark:hover:bg-[#151515]"
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
