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

  const handleStart = (clientX: number) => {
    isDragging.current = true;
    if (isPlaying) {
      setIsPlaying(false);
    }
    handleMove(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * 800;
    const newProgress = ((clickX / 800) * 130) - 30;
    setProgress(Math.max(-30, Math.min(100, newProgress)));
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  // Active muscle colors
  const pecColor = getMuscleColor(pec, 20, 32);
  const deltColor = getMuscleColor(delt, 20, 30);
  const triColor = getMuscleColor(tri, 13, 20);
  
  // Relaxed muscle color for antagonist/neutral (Biceps, Forearm)
  const relaxedColor = getMuscleColor(0, 0, 100); 

  const S = shoulder;
  const Ex = elbow.x;
  const Ey = elbow.y;
  const Wx = wrist.x;
  const Wy = wrist.y;
  
  // Humerus vectors
  const hx = Ex - S.x;
  const hy = Ey - S.y;
  const hl = Math.hypot(hx, hy) || 1;
  const ux = hx / hl;
  const uy = hy / hl;
  const pnx = uy;
  const pny = -ux;
  const bnx = -uy;
  const bny = ux;

  // Forearm vectors
  const fx = Wx - Ex;
  const fy = Wy - Ey;
  const fl = Math.hypot(fx, fy) || 1;
  const fux = fx / fl;
  const fuy = fy / fl;
  const fbnx = -fuy;
  const fbny = fux;

  // ----------------------------------------------------
  // MUSCLE PATHS AND VOLUMETRIC STRIATIONS (FIBERS)
  // ----------------------------------------------------

  // Triceps
  const ta = { x: S.x + bnx * 9, y: S.y + bny * 9 };
  const tb = { x: Ex + bnx * 8, y: Ey + bny * 8 };
  const tm = { x: (ta.x + tb.x) / 2 + bnx * 12, y: (ta.y + tb.y) / 2 + bny * 12 };
  const ti = { x: (ta.x + tb.x) / 2 + bnx * 1, y: (ta.y + tb.y) / 2 + bny * 1 };
  const mTriPath = `M${ta.x},${ta.y} Q${tm.x},${tm.y} ${tb.x},${tb.y} Q${ti.x},${ti.y} ${ta.x},${ta.y} Z`;
  const mTriHiPath = `M${ta.x},${ta.y} Q${tm.x},${tm.y} ${tb.x},${tb.y}`;
  const triF1 = `M${ta.x - ux*10},${ta.y - uy*10} Q${tm.x - bnx*3.5},${tm.y - bny*3.5} ${tb.x - ux*5},${tb.y - uy*5}`; // Inter-head sulcus

  // Biceps (Anterior)
  const biC1 = { x: S.x - bnx * 6, y: S.y - bny * 6 };
  const biC2 = { x: Ex - bnx * 7, y: Ey - bny * 7 };
  const biMid = { x: (biC1.x + biC2.x) / 2 - bnx * 16, y: (biC1.y + biC2.y) / 2 - bny * 16 };
  const biIns = { x: (biC1.x + biC2.x) / 2 - bnx * 1, y: (biC1.y + biC2.y) / 2 - bny * 1 };
  const mBicepsPath = `M${biC1.x},${biC1.y} Q${biMid.x},${biMid.y} ${biC2.x},${biC2.y} Q${biIns.x},${biIns.y} ${biC1.x},${biC1.y} Z`;
  const mBicepsHiPath = `M${biC1.x},${biC1.y} Q${biMid.x},${biMid.y} ${biC2.x},${biC2.y}`;
  const biF1 = `M${biC1.x + ux*10},${biC1.y + uy*10} Q${biMid.x + bnx*5},${biMid.y + bny*5} ${biC2.x - ux*10},${biC2.y - uy*10}`; // Short vs Long head sulcus

  // Forearm Volume (Brachioradialis & Flexors)
  const fTopC = { x: Ex - fbnx * 12, y: Ey - fbny * 12 };
  const fBotC = { x: Ex + fbnx * 8, y: Ey + fbny * 8 };
  const fTopW = { x: Wx - fbnx * 5, y: Wy - fbny * 5 };
  const fBotW = { x: Wx + fbnx * 4, y: Wy + fbny * 4 };
  const fMidT = { x: (fTopC.x + fTopW.x) / 2 - fbnx * 7, y: (fTopC.y + fTopW.y) / 2 - fbny * 7 };
  const fMidB = { x: (fBotC.x + fBotW.x) / 2 + fbnx * 4, y: (fBotC.y + fBotW.y) / 2 + fbny * 4 };
  const mForearmPath = `M${fTopC.x},${fTopC.y} Q${fMidT.x},${fMidT.y} ${fTopW.x},${fTopW.y} L${fBotW.x},${fBotW.y} Q${fMidB.x},${fMidB.y} ${fBotC.x},${fBotC.y} Z`;
  const mForearmHiPath = `M${fTopC.x},${fTopC.y} Q${fMidT.x},${fMidT.y} ${fTopW.x},${fTopW.y}`;
  const foreF1 = `M${Ex - fbnx*6 + fux*10},${Ey - fbny*6 + fuy*10} Q${fMidT.x + fbnx*4},${fMidT.y + fbny*4} ${Wx - fux*10},${Wy - fuy*10}`; // Brachioradialis separation

  // Deltoid (Teardrop shape)
  const dOrigin1 = { x: S.x + pnx * 14, y: S.y + pny * 14 }; // clavicle side
  const dOrigin2 = { x: S.x - ux * 16 - pnx * 2, y: S.y - uy * 16 - pny * 2 }; // acromion side
  const dIns = { x: S.x + ux * 36 + pnx * 7, y: S.y + uy * 36 + pny * 7 }; // deltoid tuberosity
  const mDeltPath = `M${dOrigin1.x},${dOrigin1.y} Q${S.x + pnx*28 - ux*10},${S.y + pny*28 - uy*10} ${dOrigin2.x},${dOrigin2.y} Q${S.x + ux*15 - pnx*6},${S.y + uy*15 - pny*6} ${dIns.x},${dIns.y} Q${S.x + ux*20 + pnx*22},${S.y + uy*20 + pny*22} ${dOrigin1.x},${dOrigin1.y} Z`;
  const dF1 = `M${dOrigin2.x + ux*8},${dOrigin2.y + uy*8} Q${S.x + ux*20 + pnx*6},${S.y + uy*20 + pny*6} ${dIns.x - ux*4},${dIns.y - uy*4}`; // Ant/Lat head separator
  const dF2 = `M${(dOrigin1.x + dOrigin2.x)/2 + ux*5},${(dOrigin1.y + dOrigin2.y)/2 + uy*5} Q${S.x + ux*18 + pnx*16},${S.y + uy*18 + pny*16} ${dIns.x - ux*6},${dIns.y - uy*6}`;

  // Pectoral logic
  const c1 = { x: 236, y: 334 };
  const c2 = { x: 250, y: 362 };
  const ins = { x: S.x + ux * 24 + pnx * 5, y: S.y + uy * 24 + pny * 5 };
  const mPecPath = `M${c1.x},${c1.y} Q${(c1.x + ins.x) / 2 - 6},${(c1.y + ins.y) / 2 - 8} ${ins.x},${ins.y} Q${(c2.x + ins.x) / 2},${(c2.y + ins.y) / 2 + 4} ${c2.x},${c2.y} Q${(c1.x + c2.x) / 2 - 4},${(c1.y + c2.y) / 2} ${c1.x},${c1.y} Z`;
  const mPecHiPath = `M${c1.x},${c1.y} Q${(c1.x + ins.x) / 2 - 6},${(c1.y + ins.y) / 2 - 8} ${ins.x},${ins.y}`;
  const pF1 = `M${ins.x - ux*4},${ins.y - uy*4} Q${(c1.x + ins.x)/2 + 2},${(c1.y + ins.y)/2 - 8} ${c1.x + 8},${c1.y + 6}`; // Clavicular fibers
  const pF2 = `M${ins.x - ux*4},${ins.y - uy*4} Q${(c1.x + ins.x)/2 + 8},${(c1.y + ins.y)/2 - 1} ${c1.x + 11},${c1.y + 14}`; // Sternal fibers
  const pF3 = `M${ins.x - ux*4},${ins.y - uy*4} Q${(c2.x + ins.x)/2 - 2},${(c2.y + ins.y)/2} ${c2.x - 4},${c2.y - 6}`; // Costal fibers

  // Condyle Bones styling
  const humerusPath = `
    M${S.x - bnx * 4},${S.y - bny * 4} 
    L${Ex - bnx * 3},${Ey - bny * 3}
    A4,4 0 0,0 ${Ex + bnx * 3},${Ey + bny * 3}
    L${S.x + bnx * 4},${S.y + bny * 4}
    A4,4 0 0,0 ${S.x - bnx * 4},${S.y - bny * 4} Z
  `;
  const radiusPath = `
    M${Ex - fbnx * 3.5},${Ey - fbny * 3.5} 
    L${Wx - fbnx * 2.5},${Wy - fbny * 2.5}
    A3,3 0 0,0 ${Wx + fbnx * 2.5},${Wy + fbny * 2.5}
    L${Ex + fbnx * 3.5},${Ey + fbny * 3.5}
    A4,4 0 0,0 ${Ex - fbnx * 3.5},${Ey - fbny * 3.5} Z
  `;

  const gravLineOpacity = 0.5;
  const maLblOpacity = Math.abs(Wx - S.x) > 34 ? 0.85 : 0;

  return (
    <div className="w-full flex-1 relative flex items-center justify-center bg-white dark:bg-[#111] rounded-2xl border border-zinc-200 dark:border-neutral-800 overflow-hidden shadow-xl h-full transition-colors duration-300">
      <svg
        ref={svgRef}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={(e) => { e.preventDefault(); handleStart(e.clientX); }}
        onMouseMove={(e) => { e.preventDefault(); handleMove(e.clientX); }}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => { handleStart(e.touches[0].clientX); }}
        onTouchMove={(e) => { handleMove(e.touches[0].clientX); }}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        className="w-full h-full select-none cursor-pointer touch-none"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="1" strokeDasharray="4,4" className="stroke-zinc-100 dark:stroke-[#1f1f1f]" />
          </pattern>
          <linearGradient id="skinLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e5d4c8" />
            <stop offset="1" stopColor="#d1bea9" />
          </linearGradient>
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a4a44" />
            <stop offset="1" stopColor="#3a2f2c" />
          </linearGradient>
          <linearGradient id="boneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#efe7d4" />
            <stop offset="1" stopColor="#c9bda2" />
          </linearGradient>
          
          {/* Base muscle blur */}
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Drop shadow for 3D Muscle Volumes */}
          <filter id="muscleVol" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" result="shadow" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="softEdge" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="softEdge" />
            </feMerge>
          </filter>

          <linearGradient id="legendGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgb(43,108,176)" />
            <stop offset=".5" stopColor="rgb(224,165,46)" />
            <stop offset="1" stopColor="rgb(224,72,58)" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Power Rack */}
        <g id="powerRack" opacity="0.95">
          <rect x="140" y="540" width="120" height="11" strokeWidth="2" rx="2" className="fill-zinc-200 dark:fill-[#121212] stroke-zinc-300 dark:stroke-[#222]" />
          <rect x="180" y="80" width="28" height="462" strokeWidth="2" className="fill-zinc-100 dark:fill-[#151515] stroke-zinc-300 dark:stroke-[#222]" />
          <rect x="198" y="82" width="4" height="458" className="fill-zinc-200 dark:fill-[#1f1f1f]" />
          <g className="fill-zinc-400 dark:fill-[#080808]">
            {Array.from({ length: 18 }).map((_, i) => (
              <circle key={i} cx="194" cy={110 + i * 20} r="3.5" />
            ))}
          </g>
          <path d="M 180 320 L 380 320 L 380 336 L 180 336 Z" strokeWidth="2" className="fill-zinc-100 dark:fill-[#151515] stroke-zinc-300 dark:stroke-[#262626]" />
          <rect x="208" y="318" width="168" height="4" className="fill-zinc-300 dark:fill-[#050505]" />
          <path d="M 180 125 L 200 125 L 200 187 L 246 187 L 246 160 L 256 160 L 256 197 L 180 197 Z" strokeWidth="2" className="fill-zinc-100 dark:fill-[#151515] stroke-zinc-300 dark:stroke-[#262626]" />
          <path d="M 198 125 L 202 125 L 202 185 L 244 185 L 244 160 L 248 160 L 248 189 L 198 189 Z" className="fill-zinc-300 dark:fill-[#050505]" />
        </g>

        {/* Bench Elements */}
        <rect x="90" y="392" width="440" height="15" rx="5" strokeWidth="2" className="fill-zinc-100 dark:fill-[#1c1c1c] stroke-zinc-300 dark:stroke-[#2a2a2a]" />
        <rect x="150" y="407" width="30" height="140" className="fill-zinc-200 dark:fill-[#151515]" />
        <rect x="450" y="407" width="30" height="140" className="fill-zinc-200 dark:fill-[#151515]" />
        <rect x="120" y="542" width="400" height="9" rx="3" className="fill-zinc-200 dark:fill-[#1a1a1a]" />

        {/* Skin Silhouettes */}
        <g className="dark:hidden">
          <path d="M188,356 Q214,322 262,332 Q332,340 402,350 Q452,356 470,365 Q530,375 540,460 Q540,500 520,530 L540,535 L540,542 L485,542 L490,530 Q490,490 510,460 Q470,410 460,392 Q402,399 300,397 Q222,397 188,388 Z" fill="url(#skinLight)" opacity=".7" stroke="#bda28b" strokeWidth="1.5" />
          <path d="M175,356 Q168,326 142,330 Q118,336 122,360 Q126,384 156,384 Q178,382 188,368 Z" fill="url(#skinLight)" opacity=".7" stroke="#bda28b" strokeWidth="1.5" />
        </g>
        <g className="hidden dark:block">
          <path d="M188,356 Q214,322 262,332 Q332,340 402,350 Q452,356 470,365 Q530,375 540,460 Q540,500 520,530 L540,535 L540,542 L485,542 L490,530 Q490,490 510,460 Q470,410 460,392 Q402,399 300,397 Q222,397 188,388 Z" fill="url(#skin)" opacity=".55" stroke="#2a211e" strokeWidth="1.5" />
          <path d="M175,356 Q168,326 142,330 Q118,336 122,360 Q126,384 156,384 Q178,382 188,368 Z" fill="url(#skin)" opacity=".6" stroke="#2a211e" strokeWidth="1.5" />
        </g>
        
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

        {/* Dynamic Arm Bones (Realistic Shapes) */}
        <path d={humerusPath} fill="url(#boneGrad)" stroke="#a1947b" strokeWidth="1.5" opacity=".9" />
        <path d={radiusPath} fill="url(#boneGrad)" stroke="#a1947b" strokeWidth="1.5" opacity=".9" />
        
        {/* Dynamic Muscles (With Shadows for Volume) */}
        <path d={mForearmPath} fill={relaxedColor} filter="url(#muscleVol)" strokeWidth="1" className="stroke-black/10 dark:stroke-black/30 transition-colors duration-150" />
        <path d={mBicepsPath} fill={relaxedColor} filter="url(#muscleVol)" strokeWidth="1" className="stroke-black/10 dark:stroke-black/30 transition-colors duration-150" />
        <path d={mTriPath} fill={triColor} filter="url(#muscleVol)" strokeWidth="1" className="stroke-black/10 dark:stroke-black/30 transition-colors duration-150" />
        <path d={mPecPath} fill={pecColor} filter="url(#muscleVol)" strokeWidth="1" className="stroke-black/10 dark:stroke-black/30 transition-colors duration-150" />
        <path d={mDeltPath} fill={deltColor} filter="url(#muscleVol)" strokeWidth="1" className="stroke-black/10 dark:stroke-black/30 transition-colors duration-150" />
        
        {/* Muscle Fibers & Striations (Dark Sulcus) */}
        <g fill="none" strokeWidth="2.5" className="stroke-black/25 dark:stroke-black/40" filter="url(#soft)">
          {/* Forearm Striation */}
          <path d={foreF1} />
          {/* Biceps Striation */}
          <path d={biF1} />
          {/* Triceps Striation */}
          <path d={triF1} />
          {/* Pectoral Fibers */}
          <path d={pF1} />
          <path d={pF2} />
          <path d={pF3} />
          {/* Deltoid Fibers */}
          <path d={dF1} />
          <path d={dF2} />
        </g>
        
        {/* Muscle Light Highlights */}
        <g fill="none" strokeWidth="2" opacity=".12" className="stroke-white">
          <path d={mForearmHiPath} />
          <path d={mBicepsHiPath} />
          <path d={mTriHiPath} />
          <path d={mPecHiPath} />
        </g>

        {/* Force & Moment Arm Guidelines */}
        <line x1={Wx} y1="0" x2={Wx} y2="600" strokeWidth="1.5" strokeDasharray="5,5" opacity={gravLineOpacity} className="stroke-red-400 dark:stroke-red-500" />
        <g strokeWidth="2" opacity=".75" className="stroke-blue-500 dark:stroke-blue-400">
          <line x1={S.x} y1="352" x2={Wx} y2="352" />
          <line x1={S.x} y1="346" x2={S.x} y2="358" />
          <line x1={Wx} y1="346" x2={Wx} y2="358" />
        </g>
        <text x={(S.x + Wx) / 2} y="372" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity={maLblOpacity} className="fill-blue-600 dark:fill-blue-400">
          brazo de momento
        </text>

        {/* Barbell Assembly */}
        <g transform={`translate(${Wx}, ${Wy})`}>
          <circle r="66" strokeWidth="6" className="fill-blue-500/10 dark:fill-blue-500/20 stroke-blue-400 dark:stroke-blue-600" />
          <circle r="49" fill="none" strokeWidth="2" opacity=".5" className="stroke-blue-400 dark:stroke-blue-600" />
          <circle r="22" strokeWidth="3" className="fill-zinc-800 dark:fill-[#1a1a1a] stroke-zinc-600 dark:stroke-[#555]" />
          <circle r="7" className="fill-zinc-200 dark:fill-[#e0e0e0]" />
        </g>

        {/* Joints and Data Labels */}
        <circle cx={S.x} cy={S.y} r="7" strokeWidth="2" opacity=".9" className="fill-zinc-800 dark:fill-[#111] stroke-white" />
        <circle cx={Ex} cy={Ey} r="6" strokeWidth="2" className="fill-zinc-800 dark:fill-[#111] stroke-white" />
        <circle cx={Wx} cy={Wy} r="5" strokeWidth="2" className="fill-zinc-800 dark:fill-[#111] stroke-blue-400 dark:stroke-[#00e5ff]" />
        
        <text x={Ex + 14} y={Ey + 4} fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="start" className="fill-blue-700 dark:fill-[#00e5ff]">
          {elbowAngle}°
        </text>
        <text x={S.x} y={S.y - 14} fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="fill-blue-700 dark:fill-[#00e5ff]">
          {shoulderAngle}°
        </text>
        
        <text x={c1.x - 8} y={c1.y + 2} fontSize="12" fontWeight="bold" textAnchor="end" className="fill-zinc-700 dark:fill-[#e8e8e8]">Pectoral mayor</text>
        <text x={dOrigin2.x - 12} y={dOrigin2.y - 22} fontSize="12" fontWeight="bold" textAnchor="middle" className="fill-zinc-700 dark:fill-[#e8e8e8]">Deltoides ant.</text>
        <text x={tm.x + bnx * 6 + 8} y={tm.y + bny * 6} fontSize="12" fontWeight="bold" textAnchor="start" className="fill-zinc-700 dark:fill-[#e8e8e8]">Tríceps</text>

        {/* Legend */}
        <g transform="translate(30,548)">
          <text x="0" y="-6" fontSize="10" fontFamily="monospace" className="fill-zinc-500 dark:fill-[#777]">COLOR DEL CUERPO = DEMANDA / CONTRIBUCIÓN RELATIVA</text>
          <rect x="0" y="0" width="150" height="8" rx="2" fill="url(#legendGrad)" />
          <text x="0" y="22" fontSize="9" fontFamily="monospace" className="fill-zinc-500 dark:fill-[#666]">menor</text>
          <text x="150" y="22" fontSize="9" fontFamily="monospace" textAnchor="end" className="fill-zinc-500 dark:fill-[#666]">mayor</text>
        </g>
      </svg>
    </div>
  );
}
