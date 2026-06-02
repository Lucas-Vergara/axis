"use client";

import React from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { calculateBiomechanics, getMuscleColor } from "@/utils/biomechanics";
import { Activity, Dumbbell, ShieldAlert, Award, Compass } from "lucide-react";

export default function TensionPanel() {
  const progress = useSimulationStore((state) => state.progress);
  const metrics = calculateBiomechanics(progress);
  
  const {
    shoulderAngle,
    elbowAngle,
    shoulderMomentArm,
    elbowMomentArm,
    pectoralTension,
    tricepsTension,
    deltoidTension,
  } = metrics;

  // Determine active phase for descriptive UI
  // Lowering is progress > 5 && progress < 98, and we can assume movement direction or simply detail progress thresholds
  const isNearChest = progress > 70;
  const isNearLockout = progress < 30;
  
  // Custom descriptions based on position
  const getPhaseText = () => {
    if (progress === 100) return { name: "Punto de Transición Máxima", desc: "Barra en contacto con el esternón. Máximo estiramiento de fibras pectorales.", color: "text-red-400 border-red-950 bg-red-950/20" };
    if (progress === 0) return { name: "Bloqueo Articular Completo", desc: "Hombros y codos totalmente alineados bajo la carga. Mínima tensión muscular voluntaria.", color: "text-blue-400 border-blue-950 bg-blue-950/20" };
    if (progress > 50) return { name: "Fase Excéntrica Profunda", desc: "Descenso controlado de la barra. Gran brazo de momento para el hombro.", color: "text-amber-400 border-amber-950 bg-amber-950/20" };
    return { name: "Fase Concéntrica Inicial / Aceleración", desc: "Empuje vertical activo. Transición de tensión de pectorales a tríceps.", color: "text-emerald-400 border-emerald-950 bg-emerald-950/20" };
  };

  const currentPhase = getPhaseText();

  // Muscle card helper data
  const muscles = [
    {
      name: "Pectoral Mayor",
      role: "Motor Primario (Adducción Horizontal)",
      tension: pectoralTension,
      color: getMuscleColor(pectoralTension),
      bgGlow: "rgba(239, 68, 68, 0.1)",
      eccentricDesc: "Incremento progresivo de tensión al descender, alcanzando el 100% de estiramiento y fuerza pasiva.",
      concentricDesc: "Disminución progresiva de tensión a medida que se reduce la distancia horizontal barra-hombro.",
      currentAction: isNearChest 
        ? "Carga mecánica máxima por brazo de momento extendido." 
        : "Asistencia activa decreciente en el bloqueo superior.",
      icon: Dumbbell,
    },
    {
      name: "Tríceps Braquial",
      role: "Motor Primario (Extensión de Codo)",
      tension: tricepsTension,
      color: getMuscleColor(tricepsTension),
      bgGlow: "rgba(59, 130, 246, 0.1)",
      eccentricDesc: "Tensión moderada de control (35%) para ralentizar de forma excéntrica la flexión del codo.",
      concentricDesc: "Incremento crítico y masivo hasta 100% de fuerza explosiva para lograr el bloqueo articular.",
      currentAction: isNearLockout 
        ? "Activación crítica al 100% para consolidar la extensión total." 
        : "Contracción excéntrica ligera estabilizando la barra.",
      icon: Activity,
    },
    {
      name: "Deltoides Anterior",
      role: "Sinergista (Flexión Glenohumeral)",
      tension: deltoidTension,
      color: getMuscleColor(deltoidTension),
      bgGlow: "rgba(168, 85, 247, 0.1)",
      eccentricDesc: "Tensión sinérgica progresiva hasta el 95% acompañando al pectoral en la adducción del brazo.",
      concentricDesc: "Asistencia constante de empuje durante toda la fase de flexión anterior del hombro.",
      currentAction: isNearChest 
        ? "Sinergia activa máxima para estabilizar la articulación glenohumeral." 
        : "Estabilización estática ligera en la parte alta del rango.",
      icon: Award,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5 p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-emerald-400">
          Análisis Biomecánico Dinámico
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Compass className="w-3.5 h-3.5 animate-spin-slow text-zinc-500" />
          Módulo de Press Plano
        </span>
      </div>

      {/* Real-time Moment Arms Dashboard */}
      <div className="grid grid-cols-2 gap-4">
        {/* Shoulder Moment Arm Card */}
        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60 shadow-md">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
            B. Momento Hombro
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-blue-400">
              {shoulderMomentArm}
            </span>
            <span className="text-xs text-zinc-400">cm</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
            Distancia horizontal desde la barra al hombro. Determina la carga del Pectoral.
          </p>
        </div>

        {/* Elbow Moment Arm Card */}
        <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/60 shadow-md">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-1">
            B. Momento Codo
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {elbowMomentArm}
            </span>
            <span className="text-xs text-zinc-400">cm</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
            Distancia horizontal desde la barra al codo. Regula la demanda sobre el Tríceps.
          </p>
        </div>
      </div>

      {/* Phase Info Box */}
      <div className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all duration-200 ${currentPhase.color}`}>
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span className="font-extrabold uppercase tracking-wide text-[10px]">{currentPhase.name}</span>
        </div>
        <p className="text-zinc-300 text-[11px] font-medium leading-relaxed">
          {currentPhase.desc}
        </p>
      </div>

      {/* Muscle List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
          Matriz de Activación en Tiempo Real
        </h3>
        
        {muscles.map((muscle, idx) => {
          const Icon = muscle.icon;
          return (
            <div
              key={idx}
              className="bg-zinc-950/30 p-4 rounded-xl border border-zinc-800/70 hover:border-zinc-700/60 transition-all duration-200"
              style={{ boxShadow: `inset 0 0 12px ${muscle.bgGlow}` }}
            >
              {/* Muscle Title and Icon */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-zinc-400" style={{ color: muscle.color }} />
                    {muscle.name}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-semibold">{muscle.role}</span>
                </div>
                <span
                  className="font-mono text-xs font-black px-2 py-0.5 rounded-md border"
                  style={{ color: muscle.color, borderColor: `${muscle.color}22`, backgroundColor: `${muscle.color}11` }}
                >
                  {muscle.tension}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden mb-3 border border-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${muscle.tension}%`,
                    backgroundColor: muscle.color,
                    boxShadow: `0 0 8px ${muscle.color}`,
                  }}
                />
              </div>

              {/* Dynamic Info */}
              <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-900 leading-normal">
                <div>
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wide block mb-0.5">Excéntrico</span>
                  {muscle.eccentricDesc}
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wide block mb-0.5">Concéntrico</span>
                  {muscle.concentricDesc}
                </div>
              </div>

              {/* Current Action Banner */}
              <div className="mt-3 bg-zinc-900/60 p-2 rounded-lg text-[10px] text-zinc-300 font-medium border border-zinc-800/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse flex-shrink-0" style={{ backgroundColor: muscle.color }} />
                <span><strong className="text-zinc-400 font-semibold">Estado actual:</strong> {muscle.currentAction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
