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
  const directionRef = useRef<number>(1); // 1 = down (-30 to 100), -1 = up (100 to -30)
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

      // Base: a full rep (-30 to 100) takes approx 3000ms at 1x speed.
      const unitsPerMs = 0.067 * speed;
      const progressDelta = deltaTime * unitsPerMs;

      setProgress((prevProgress) => {
        let nextProgress = prevProgress + directionRef.current * progressDelta;

        // Bounce at boundaries to create a continuous fluid cycle
        if (nextProgress >= 100) {
          nextProgress = 100;
          directionRef.current = -1; // reverse to up
        } else if (nextProgress <= -30) {
          nextProgress = -30;
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
    if (progress === -30) return "Soporte (Racked)";
    if (progress < 0) return "Unrack (Fase Concéntrica)";
    if (progress === 0) return "Lockout (Inicio Excéntrica)";
    return `Descenso Excéntrico (${Math.round(progress)}%)`;
  };

  // Compute slider background gradient percentage (since it starts at -30)
  const sliderPercentage = ((progress + 30) / 130) * 100;

  return (
    <div className="w-full p-5 bg-[#121212] rounded-xl border border-neutral-800 flex flex-col gap-4">
      {/* Slider Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef5350] animate-pulse" />
            Fase actual: <span className="text-gray-300">{getPhaseName()}</span>
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
            className="w-full h-2.5 bg-[#0a0a0a] rounded-lg appearance-none cursor-pointer border border-[#222] outline-none accent-[#ef5350] hover:accent-red-400 transition-colors"
            style={{
              background: `linear-gradient(to right, #ef535044 0%, #ef5350 ${sliderPercentage}%, #0a0a0a ${sliderPercentage}%, #0a0a0a 100%)`,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-500 font-bold tracking-widest px-1 uppercase">
          <span>Soporte</span>
          <span>Lockout</span>
          <span>Pecho</span>
        </div>
      </div>

      {/* Control Buttons and Speed Panel */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800">
        
        {/* Playback Buttons */}
        <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-start">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 cursor-pointer shadow-md select-none border ${
                isPlaying
                  ? "bg-neutral-800 text-gray-100 hover:bg-neutral-700 border-neutral-700"
                  : "bg-[#00e5ff] text-[#0a0a0a] hover:bg-cyan-400 hover:scale-[1.03] active:scale-[0.98] border-[#00e5ff] hover:shadow-cyan-500/20 shadow-cyan-500/10"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#0a0a0a]" />
                  Simular
                </>
              )}
            </button>

            <button
              onClick={() => {
                reset();
                directionRef.current = 1;
              }}
              className="flex items-center justify-center p-2.5 rounded-xl bg-[#0a0a0a] hover:bg-[#151515] border border-[#222] hover:border-[#333] text-gray-400 hover:text-gray-200 transition-all duration-150 cursor-pointer"
              title="Reiniciar Simulación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slow Motion Selector */}
        <div className="flex items-center justify-between xl:justify-start gap-2.5 bg-[#0a0a0a] p-1.5 rounded-xl border border-[#222] w-full xl:w-auto">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold pl-2 flex items-center gap-1">
            <FastForward className="w-3 h-3 text-gray-500" />
            Velocidad
          </span>
          <div className="flex items-center gap-1">
            {[1.0, 0.5, 0.25].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide font-mono transition-all duration-150 cursor-pointer ${
                  speed === s
                    ? "bg-[#151515] text-[#00e5ff] border border-[#00e5ff]/30 shadow-md"
                    : "text-gray-500 hover:text-gray-300 border border-transparent hover:bg-[#151515]"
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
