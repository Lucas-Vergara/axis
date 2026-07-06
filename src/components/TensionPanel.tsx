"use client";

import React from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { calculateBiomechanics, getMuscleColor } from "@/utils/biomechanics";

export default function TensionPanel() {
  const progress = useSimulationStore((state) => state.progress);
  const metrics = calculateBiomechanics(progress);
  
  const {
    shoulderAngle,
    elbowAngle,
    tqHombro,
    tqCodo,
    pec,
    delt,
    tri
  } = metrics;

  const pecColor = getMuscleColor(pec, 20, 32);
  const deltColor = getMuscleColor(delt, 20, 30);
  const triColor = getMuscleColor(tri, 13, 20);

  return (
    <div className="w-full flex flex-col gap-4 overflow-y-auto pr-1 h-full">
      
      {/* Goniometría */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-zinc-200 dark:border-neutral-800 flex-shrink-0 shadow-xl transition-colors duration-300">
        <h3 className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider mb-3 border-b border-zinc-100 dark:border-neutral-800 pb-2">
          Goniometría
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#1a1a1a] p-3 rounded-xl border-l-4 border-blue-500 dark:border-[#00e5ff] transition-colors duration-300">
            <span className="text-sm font-semibold text-zinc-700 dark:text-gray-300">Ángulo codo</span>
            <span className="text-base font-mono font-bold text-blue-600 dark:text-[#00e5ff]">{elbowAngle}°</span>
          </div>
          <div className="flex justify-between items-center bg-zinc-50 dark:bg-[#1a1a1a] p-3 rounded-xl border-l-4 border-blue-500 dark:border-[#00e5ff] transition-colors duration-300">
            <span className="text-sm font-semibold text-zinc-700 dark:text-gray-300">Ángulo hombro</span>
            <span className="text-base font-mono font-bold text-blue-600 dark:text-[#00e5ff]">{shoulderAngle}°</span>
          </div>
        </div>
      </div>

      {/* Demanda mecánica */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-zinc-200 dark:border-neutral-800 flex-shrink-0 shadow-xl transition-colors duration-300">
        <h3 className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider mb-1 border-b border-zinc-100 dark:border-neutral-800 pb-2">
          Demanda mecánica <span className="text-blue-500 dark:text-[#3b82f6] normal-case font-semibold">· varía por rango</span>
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-gray-500 mb-3 leading-tight mt-2">
          Brazo de momento del peso. Es lo que impulsa el color del cuerpo.
        </p>
        <div className="flex flex-col gap-3">
          <div className="bg-zinc-50 dark:bg-[#1a1a1a] p-3 rounded-xl transition-colors duration-300">
            <div className="flex justify-between text-sm mb-1.5 font-semibold">
              <span className="text-zinc-700 dark:text-gray-300">Torque hombro</span>
              <span className="font-mono font-bold text-blue-600 dark:text-[#3b82f6]">{Math.round(tqHombro * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 dark:bg-[#3b82f6] rounded-full transition-all duration-150" 
                style={{ width: `${tqHombro * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-[#1a1a1a] p-3 rounded-xl transition-colors duration-300">
            <div className="flex justify-between text-sm mb-1.5 font-semibold">
              <span className="text-zinc-700 dark:text-gray-300">Torque codo</span>
              <span className="font-mono font-bold text-blue-600 dark:text-[#3b82f6]">{Math.round(tqCodo * 100)}%</span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-[#0a0a0a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 dark:bg-[#3b82f6] rounded-full transition-all duration-150" 
                style={{ width: `${tqCodo * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activación EMG & Roles */}
      <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-zinc-200 dark:border-neutral-800 flex-1 shadow-xl transition-colors duration-300">
        <h3 className="text-xs text-zinc-500 dark:text-gray-400 uppercase tracking-wider mb-1 border-b border-zinc-100 dark:border-neutral-800 pb-2">
          Activación EMG & Roles
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-gray-500 mb-3 leading-tight mt-2">
          %MVIC, banco plano ~60% 1RM. Rol fisiológico en las fases.
        </p>
        <div className="flex flex-col gap-3">
          
          {/* Pectoral Mayor */}
          <div 
            className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border-l-4 transition-colors duration-150 shadow-sm dark:shadow-none"
            style={{ borderLeftColor: pecColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-wide" style={{ color: pecColor }}>Pectoral mayor</span>
              <span className="text-base font-mono font-bold" style={{ color: pecColor }}>{Math.round(pec)}%</span>
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-gray-400 mt-1 leading-tight">
              <span className="text-zinc-800 dark:text-gray-300 font-bold">Agonista (Motor principal):</span><br/>
              Excéntrica (frena) / Concéntrica (empuja).
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-[#0a0a0a] rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-150" 
                style={{ width: `${(pec / 32) * 100}%`, backgroundColor: pecColor }}
              />
            </div>
          </div>
          
          {/* Deltoides Anterior */}
          <div 
            className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border-l-4 transition-colors duration-150 shadow-sm dark:shadow-none"
            style={{ borderLeftColor: deltColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-wide" style={{ color: deltColor }}>Deltoides ant.</span>
              <span className="text-base font-mono font-bold" style={{ color: deltColor }}>{Math.round(delt)}%</span>
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-gray-400 mt-1 leading-tight">
              <span className="text-zinc-800 dark:text-gray-300 font-bold">Facilitador (Sinergista):</span><br/>
              Estabiliza el húmero en ambas fases.
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-[#0a0a0a] rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-150" 
                style={{ width: `${(delt / 32) * 100}%`, backgroundColor: deltColor }}
              />
            </div>
          </div>
          
          {/* Tríceps */}
          <div 
            className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1a1a1a] border-l-4 transition-colors duration-150 shadow-sm dark:shadow-none"
            style={{ borderLeftColor: triColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-black uppercase tracking-wide" style={{ color: triColor }}>Tríceps braquial</span>
              <span className="text-base font-mono font-bold" style={{ color: triColor }}>{Math.round(tri)}%</span>
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-gray-400 mt-1 leading-tight">
              <span className="text-zinc-800 dark:text-gray-300 font-bold">Facilitador / Secundario:</span><br/>
              Concéntrica fuerte para el bloqueo (Lockout).
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-[#0a0a0a] rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-150" 
                style={{ width: `${(tri / 32) * 100}%`, backgroundColor: triColor }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
