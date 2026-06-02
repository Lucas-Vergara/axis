import React from "react";
import KinematicScene from "@/components/KinematicScene";
import TensionPanel from "@/components/TensionPanel";
import PlaybackControls from "@/components/PlaybackControls";
import { Brain, Sparkles, BookOpen, GitMerge, Info } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      {/* 1. Header Area */}
      <header className="w-full py-4 px-6 border-b border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-950/50 border border-blue-800/60 rounded-xl shadow-lg shadow-blue-500/5 flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase text-zinc-100 flex items-center gap-1.5">
                LISS <span className="text-xs font-normal tracking-wide lowercase text-blue-500 px-2 py-0.5 rounded-full border border-blue-950 bg-blue-950/20">v3.0 MVP</span>
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                Simulador Interactivo de Biomecánica Aplicada
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/60 px-3 py-1.5 rounded-xl shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Press de Banca Sagital
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main content Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Intro Banner */}
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 p-5 rounded-2xl border border-zinc-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Análisis Anatómico de Gestos Deportivos
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Esta herramienta educativa desglosa de manera dinámica los vectores de fuerza, brazos de momento de las articulaciones (hombro y codo) y curvas de activación del **Pectoral Mayor**, **Tríceps Braquial** y **Deltoides Anterior** durante un Press de Banca Plano.
            </p>
          </div>
          <div className="flex items-center gap-3 self-stretch md:self-auto border-t border-zinc-800 md:border-t-0 pt-3 md:pt-0">
            <div className="flex flex-col items-center justify-center bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold block">Modelo</span>
              <span className="text-xs font-bold text-zinc-300">Marioneta 2D</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-zinc-900/80 border border-zinc-800 px-4 py-2.5 rounded-xl">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold block">Fidelidad</span>
              <span className="text-xs font-bold text-zinc-300">Trayectoria J-Curve</span>
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Visual Scene + Controls (Span 7) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <KinematicScene />
            <PlaybackControls />
          </div>

          {/* Right Column: Biomechanics and Activation Matrix (Span 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <TensionPanel />

            {/* Quick Educational Glossary Card */}
            <div className="p-5 bg-zinc-950/40 rounded-2xl border border-zinc-800/60 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" />
                Glosario de Conceptos Biomecánicos
              </h3>
              
              <div className="flex flex-col gap-3 text-xs leading-normal">
                <div className="border-l-2 border-blue-500 pl-3">
                  <h4 className="font-bold text-zinc-200 text-xs mb-0.5">Brazo de Momento</h4>
                  <p className="text-[11px] text-zinc-500">
                    Es la distancia horizontal perpendicular que separa la línea de acción de la carga (barra) del eje articular (hombro/codo). A mayor brazo de momento, mayor es el torque requerido y la tensión sobre dicho músculo.
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500 pl-3">
                  <h4 className="font-bold text-zinc-200 text-xs mb-0.5">Trayectoria Parabólica en J</h4>
                  <p className="text-[11px] text-zinc-500">
                    La barra no desciende en una línea perfectamente recta vertical en levantadores expertos. Describe una curva en forma de "J", iniciando alineada con el hombro para mayor estabilidad y aterrizando en el esternón bajo.
                  </p>
                </div>

                <div className="border-l-2 border-purple-500 pl-3">
                  <h4 className="font-bold text-zinc-200 text-xs mb-0.5">Ventaja Mecánica</h4>
                  <p className="text-[11px] text-zinc-500">
                    Relación entre la fuerza aplicada y la carga. En la parte baja del press, el hombro tiene una desventaja mecánica extrema (gran brazo de momento), exigiendo la máxima fuerza del Pectoral Mayor para arrancar la carga.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="w-full py-6 px-6 mt-auto border-t border-zinc-800/80 bg-zinc-950/30 text-center text-xs text-zinc-500 leading-normal">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1">
            <GitMerge className="w-3.5 h-3.5 text-zinc-600" />
            Liss Biomechanics Lab — Desarrollado en Next.js, Tailwind CSS y Zustand.
          </p>
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">
            Educación Profesional para Ciencias del Deporte
          </p>
        </div>
      </footer>
    </div>
  );
}
