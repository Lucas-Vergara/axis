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

  // Derive colors from EMG for UI elements using the logic from biomechanics
  const pecColor = getMuscleColor(pec, 20, 32);
  const deltColor = getMuscleColor(delt, 20, 30);
  const triColor = getMuscleColor(tri, 13, 20);

  return (
    <div className="w-80 flex flex-col gap-3 overflow-y-auto pr-2 pb-2 h-full">
      
      {/* Goniometría */}
      <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800 flex-shrink-0">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3 border-b border-neutral-800 pb-2">
          Goniometría
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-[#1a1a1a] p-2.5 rounded-lg border-l-4 border-[#00e5ff]">
            <span className="text-sm text-gray-300">Ángulo codo</span>
            <span className="text-base font-mono font-bold text-[#00e5ff]">{elbowAngle}°</span>
          </div>
          <div className="flex justify-between items-center bg-[#1a1a1a] p-2.5 rounded-lg border-l-4 border-[#00e5ff]">
            <span className="text-sm text-gray-300">Ángulo hombro</span>
            <span className="text-base font-mono font-bold text-[#00e5ff]">{shoulderAngle}°</span>
          </div>
        </div>
      </div>

      {/* Demanda mecánica */}
      <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800 flex-shrink-0">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1 border-b border-neutral-800 pb-2">
          Demanda mecánica <span className="text-[#3b82f6] normal-case">· varía por rango</span>
        </h3>
        <p className="text-[10px] text-gray-500 mb-2 leading-tight">
          Brazo de momento del peso. Es lo que impulsa el color del cuerpo.
        </p>
        <div className="flex flex-col gap-2">
          <div className="bg-[#1a1a1a] p-2.5 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Torque hombro</span>
              <span className="font-mono font-bold text-[#3b82f6]">{Math.round(tqHombro * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#0a0a0a] rounded">
              <div 
                className="h-full bg-[#3b82f6] rounded transition-all duration-150" 
                style={{ width: `${tqHombro * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-[#1a1a1a] p-2.5 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">Torque codo</span>
              <span className="font-mono font-bold text-[#3b82f6]">{Math.round(tqCodo * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#0a0a0a] rounded">
              <div 
                className="h-full bg-[#3b82f6] rounded transition-all duration-150" 
                style={{ width: `${tqCodo * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activación EMG & Roles */}
      <div className="bg-[#121212] p-4 rounded-xl border border-neutral-800 flex-1">
        <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1 border-b border-neutral-800 pb-2">
          Activación EMG & Roles
        </h3>
        <p className="text-[10px] text-gray-500 mb-2 leading-tight">
          %MVIC, banco plano ~60% 1RM. Rol fisiológico en las fases.
        </p>
        <div className="flex flex-col gap-2.5">
          
          {/* Pectoral Mayor */}
          <div 
            className="p-2.5 rounded-lg bg-[#1a1a1a] border-l-4 transition-colors duration-150"
            style={{ borderLeftColor: pecColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: pecColor }}>Pectoral mayor</span>
              <span className="text-base font-mono font-bold" style={{ color: pecColor }}>{Math.round(pec)}%</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 leading-tight">
              <span className="text-gray-300 font-semibold">Agonista (Motor principal):</span><br/>
              Excéntrica (frena) / Concéntrica (empuja).
            </div>
            <div className="h-1.5 bg-[#0a0a0a] rounded mt-2">
              <div 
                className="h-full rounded transition-all duration-150" 
                style={{ width: `${(pec / 32) * 100}%`, backgroundColor: pecColor }}
              />
            </div>
          </div>
          
          {/* Deltoides Anterior */}
          <div 
            className="p-2.5 rounded-lg bg-[#1a1a1a] border-l-4 transition-colors duration-150"
            style={{ borderLeftColor: deltColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: deltColor }}>Deltoides ant.</span>
              <span className="text-base font-mono font-bold" style={{ color: deltColor }}>{Math.round(delt)}%</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 leading-tight">
              <span className="text-gray-300 font-semibold">Facilitador (Sinergista):</span><br/>
              Estabiliza el húmero en ambas fases.
            </div>
            <div className="h-1.5 bg-[#0a0a0a] rounded mt-2">
              <div 
                className="h-full rounded transition-all duration-150" 
                style={{ width: `${(delt / 32) * 100}%`, backgroundColor: deltColor }}
              />
            </div>
          </div>
          
          {/* Tríceps */}
          <div 
            className="p-2.5 rounded-lg bg-[#1a1a1a] border-l-4 transition-colors duration-150"
            style={{ borderLeftColor: triColor }}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold uppercase tracking-wide" style={{ color: triColor }}>Tríceps braquial</span>
              <span className="text-base font-mono font-bold" style={{ color: triColor }}>{Math.round(tri)}%</span>
            </div>
            <div className="text-[10px] text-gray-400 mt-1 leading-tight">
              <span className="text-gray-300 font-semibold">Facilitador / Secundario:</span><br/>
              Concéntrica fuerte para el bloqueo (Lockout).
            </div>
            <div className="h-1.5 bg-[#0a0a0a] rounded mt-2">
              <div 
                className="h-full rounded transition-all duration-150" 
                style={{ width: `${(tri / 32) * 100}%`, backgroundColor: triColor }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
