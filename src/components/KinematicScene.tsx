"use client";

import React, { useRef } from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { calculateBiomechanics, getMuscleColor, SHOULDER_POS, L_ARM } from "@/utils/biomechanics";

export default function KinematicScene() {
  const progress = useSimulationStore((state) => state.progress);
  const setProgress = useSimulationStore((state) => state.setProgress);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const setIsPlaying = useSimulationStore((state) => state.setIsPlaying);

  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // Calculate all biomechanical coordinates and angles
  const metrics = calculateBiomechanics(progress);
  const {
    jointPositions: { shoulder, elbow, wrist, barbell },
    shoulderAngle,
    elbowAngle,
    tqHombro,
    tqCodo,
    pec,
    delt,
    tri,
  } = metrics;

  // Drag handlers for direct screen scrubbing
  const handleStart = (clientY: number) => {
    isDragging.current = true;
    if (isPlaying) {
      setIsPlaying(false);
    }
    handleMove(clientY);
  };

  const handleMove = (clientY: number) => {
    if (!isDragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    
    // Scale clientY to SVG viewBox coordinates (viewBox height is 600)
    const clickY = ((clientY - rect.top) / rect.height) * 600;
    
    // Y range for barbell from racked/unracked (148/145) to chest (320)
    // Approximate mapping for user drag UX
    const newProgress = ((clickY - 145) / (320 - 145)) * 100;
    setProgress(Math.max(-30, Math.min(100, newProgress)));
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  // Muscle color codes
  const pecColor = getMuscleColor(pec, 20, 32);
  const deltColor = getMuscleColor(delt, 20, 30);
  const triColor = getMuscleColor(tri, 13, 20);

  // Vectors for muscles (Same logic as Liss HTML script)
  const S = shoulder;
  const Ex = elbow.x;
  const Ey = elbow.y;
  const Wx = wrist.x;
  const Wy = wrist.y;
  
  const hx = Ex - S.x;
  const hy = Ey - S.y;
  const hl = Math.hypot(hx, hy) || 1;
  const ux = hx / hl;
  const uy = hy / hl;
  const pnx = uy;
  const pny = -ux;
  const bnx = -uy;
  const bny = ux;

  // Triceps logic
  const ta = { x: S.x + bnx * 9, y: S.y + bny * 9 };
  const tb = { x: Ex + bnx * 7, y: Ey + bny * 7 };
  const tm = { x: (ta.x + tb.x) / 2 + bnx * 11, y: (ta.y + tb.y) / 2 + bny * 11 };
  const ti = { x: (ta.x + tb.x) / 2 + bnx * 1, y: (ta.y + tb.y) / 2 + bny * 1 };
  const mTriPath = `M${ta.x},${ta.y} Q${tm.x},${tm.y} ${tb.x},${tb.y} Q${ti.x},${ti.y} ${ta.x},${ta.y} Z`;
  const mTriHiPath = `M${ta.x},${ta.y} Q${tm.x},${tm.y} ${tb.x},${tb.y}`;

  // Deltoid logic
  const dcx = S.x + ux * 4 + pnx * 3;
  const dcy = S.y + uy * 4 + pny * 3;
  const deltRot = Math.atan2(uy, ux) * 180 / Math.PI;

  // Pectoral logic
  const c1 = { x: 236, y: 334 };
  const c2 = { x: 250, y: 362 };
  const ins = { x: S.x + ux * 24 + pnx * 5, y: S.y + uy * 24 + pny * 5 };
  const mPecPath = `M${c1.x},${c1.y} Q${(c1.x + ins.x) / 2 - 6},${(c1.y + ins.y) / 2 - 8} ${ins.x},${ins.y} Q${(c2.x + ins.x) / 2},${(c2.y + ins.y) / 2 + 4} ${c2.x},${c2.y} Q${(c1.x + c2.x) / 2 - 4},${(c1.y + c2.y) / 2} ${c1.x},${c1.y} Z`;
  const mPecHiPath = `M${c1.x},${c1.y} Q${(c1.x + ins.x) / 2 - 6},${(c1.y + ins.y) / 2 - 8} ${ins.x},${ins.y}`;

  // Math variables outside JSX to prevent Turbopack parsing issues
  const gravLineOpacity = 0.5;
  const maLblOpacity = Math.abs(Wx - S.x) > 34 ? 0.85 : 0;
  const isLateralView = true;

  return (
    <div className="w-full flex-1 relative flex items-center justify-center bg-[#111] rounded-xl border border-neutral-800 overflow-hidden shadow-2xl h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientY); }}
        onMouseMove={(e) => { e.preventDefault(); handleMove(e.clientY); }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => { handleStart(e.touches[0].clientY); }}
        onTouchMove={(e) => { handleMove(e.touches[0].clientY); }}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        className="w-full h-full select-none cursor-row-resize touch-none"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1f1f1f" strokeWidth="1" strokeDasharray="4,4" />
          </pattern>
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a4a44" />
            <stop offset="1" stopColor="#3a2f2c" />
          </linearGradient>
          <linearGradient id="boneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efe7d4" />
            <stop offset="1" stopColor="#c9bda2" />
          </linearGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="legendGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgb(43,108,176)" />
            <stop offset=".5" stopColor="rgb(224,165,46)" />
            <stop offset="1" stopColor="rgb(224,72,58)" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <g id="powerRack" opacity="0.95">
          <rect x="140" y="540" width="120" height="11" fill="#121212" stroke="#222" strokeWidth="2" rx="2" />
          <rect x="180" y="80" width="28" height="462" fill="#151515" stroke="#222" strokeWidth="2" />
          <rect x="198" y="82" width="4" height="458" fill="#1f1f1f" />
          <g fill="#080808">
            {Array.from({ length: 18 }).map((_, i) => (
              <circle key={i} cx="194" cy={110 + i * 20} r="3.5" />
            ))}
          </g>
          <path d="M 180 320 L 380 320 L 380 336 L 180 336 Z" fill="#151515" stroke="#262626" strokeWidth="2" />
          <rect x="208" y="318" width="168" height="4" fill="#050505" />
          <path d="M 180 125 L 200 125 L 200 187 L 246 187 L 246 160 L 256 160 L 256 197 L 180 197 Z" fill="#151515" stroke="#262626" strokeWidth="2" />
          <path d="M 198 125 L 202 125 L 202 185 L 244 185 L 244 160 L 248 160 L 248 189 L 198 189 Z" fill="#050505" />
        </g>

        <rect x="90" y="392" width="440" height="15" fill="#1c1c1c" rx="5" stroke="#2a2a2a" strokeWidth="2" />
        <rect x="150" y="407" width="30" height="140" fill="#151515" />
        <rect x="450" y="407" width="30" height="140" fill="#151515" />
        <rect x="120" y="542" width="400" height="9" fill="#1a1a1a" rx="3" />

        {/* Skin Silhouettes */}
        <path d="M188,356 Q214,322 262,332 Q332,340 402,350 Q452,356 470,365 Q530,375 540,460 Q540,500 520,530 L540,535 L540,542 L485,542 L490,530 Q490,490 510,460 Q470,410 460,392 Q402,399 300,397 Q222,397 188,388 Z" fill="url(#skin)" opacity=".55" stroke="#2a211e" strokeWidth="1.5" />
        <path d="M175,356 Q168,326 142,330 Q118,336 122,360 Q126,384 156,384 Q178,382 188,368 Z" fill="url(#skin)" opacity=".6" stroke="#2a211e" strokeWidth="1.5" />
        
        {/* Bones background */}
        <g opacity=".8">
          <path d="M262,338 Q300,352 300,384" fill="none" stroke="url(#boneGrad)" strokeWidth="3" opacity=".55" />
          <path d="M288,340 Q326,354 326,386" fill="none" stroke="url(#boneGrad)" strokeWidth="3" opacity=".55" />
          <path d="M316,344 Q352,358 352,388" fill="none" stroke="url(#boneGrad)" strokeWidth="3" opacity=".55" />
          <path d="M344,347 Q378,360 378,388" fill="none" stroke="url(#boneGrad)" strokeWidth="3" opacity=".55" />
          <line x1="252" y1="335" x2="300" y2="346" stroke="url(#boneGrad)" strokeWidth="5" strokeLinecap="round" />
          <line x1="248" y1="336" x2="270" y2="344" stroke="url(#boneGrad)" strokeWidth="5" strokeLinecap="round" />
          <path d="M272,352 L300,360 L286,376 Z" fill="url(#boneGrad)" opacity=".5" />
          <path d="M440,366 Q462,368 466,384 L448,388 Q438,376 440,366 Z" fill="url(#boneGrad)" opacity=".45" />
          <line x1="455" y1="378" x2="525" y2="455" stroke="url(#boneGrad)" strokeWidth="6" strokeLinecap="round" opacity=".55" />
          <line x1="525" y1="455" x2="505" y2="532" stroke="url(#boneGrad)" strokeWidth="5" strokeLinecap="round" opacity=".55" />
          <line x1="505" y1="532" x2="528" y2="538" stroke="url(#boneGrad)" strokeWidth="4" strokeLinecap="round" opacity=".55" />
        </g>

        {/* Dynamic Arm Bones */}
        <line x1={S.x} y1={S.y} x2={Ex} y2={Ey} stroke="url(#boneGrad)" strokeWidth="7" strokeLinecap="round" />
        <line x1={Ex} y1={Ey} x2={Wx} y2={Wy} stroke="url(#boneGrad)" strokeWidth="6" strokeLinecap="round" />
        
        {/* Dynamic Muscles */}
        <path d={mTriPath} fill={triColor} filter="url(#soft)" stroke="#00000030" strokeWidth="1" className="transition-colors duration-150" />
        <path d={mPecPath} fill={pecColor} filter="url(#soft)" stroke="#00000030" strokeWidth="1" className="transition-colors duration-150" />
        <ellipse cx={dcx} cy={dcy} rx={18} ry={15} transform={`rotate(${deltRot} ${dcx} ${dcy})`} fill={deltColor} filter="url(#soft)" stroke="#00000030" strokeWidth="1" className="transition-colors duration-150" />
        
        {/* Muscle Highlights */}
        <path d={mTriHiPath} fill="none" stroke="#fff" strokeWidth="2" opacity=".12" />
        <path d={mPecHiPath} fill="none" stroke="#fff" strokeWidth="2" opacity=".12" />

        {/* Force & Moment Arm Guidelines */}
        <line x1={Wx} y1="0" x2={Wx} y2="600" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,5" opacity={gravLineOpacity} />
        <g stroke="#3b82f6" strokeWidth="2" opacity=".75">
          <line x1={S.x} y1="352" x2={Wx} y2="352" />
          <line x1={S.x} y1="346" x2={S.x} y2="358" />
          <line x1={Wx} y1="346" x2={Wx} y2="358" />
        </g>
        <text x={(S.x + Wx) / 2} y="372" fill="#60a5fa" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity={maLblOpacity}>
          brazo de momento
        </text>

        {/* Barbell Assembly */}
        <g transform={`translate(${Wx}, ${Wy})`}>
          <circle r="66" fill="rgba(37,99,235,.16)" stroke="#3b82f6" strokeWidth="6" />
          <circle r="49" fill="none" stroke="#2563eb" strokeWidth="2" opacity=".5" />
          <circle r="22" fill="#1a1a1a" stroke="#555" strokeWidth="3" />
          <circle r="7" fill="#e0e0e0" />
        </g>

        {/* Joints and Data Labels */}
        <circle cx={S.x} cy={S.y} r="7" fill="#111" stroke="#fff" strokeWidth="2" opacity=".9" />
        <circle cx={Ex} cy={Ey} r="6" fill="#111" stroke="#fff" strokeWidth="2" />
        <circle cx={Wx} cy={Wy} r="5" fill="#111" stroke="#00e5ff" strokeWidth="2" />
        
        <text x={Ex + 14} y={Ey + 4} fill="#00e5ff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="start">
          {elbowAngle}°
        </text>
        <text x={S.x} y={S.y - 14} fill="#00e5ff" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {shoulderAngle}°
        </text>
        
        <text x={c1.x - 8} y={c1.y + 2} fill="#e8e8e8" fontSize="12" fontWeight="bold" textAnchor="end">Pectoral mayor</text>
        <text x={dcx} y={dcy - 22} fill="#e8e8e8" fontSize="12" fontWeight="bold" textAnchor="middle">Deltoides ant.</text>
        <text x={tm.x + bnx * 6 + 8} y={tm.y + bny * 6} fill="#e8e8e8" fontSize="12" fontWeight="bold" textAnchor="start">Tríceps</text>

        {/* Legend */}
        <g transform="translate(30,548)">
          <text x="0" y="-6" fill="#777" fontSize="10" fontFamily="monospace">COLOR DEL CUERPO = DEMANDA / CONTRIBUCIÓN RELATIVA</text>
          <rect x="0" y="0" width="150" height="8" rx="2" fill="url(#legendGrad)" />
          <text x="0" y="22" fill="#666" fontSize="9" fontFamily="monospace">menor</text>
          <text x="150" y="22" fill="#666" fontSize="9" fontFamily="monospace" textAnchor="end">mayor</text>
        </g>
      </svg>
    </div>
  );
}
