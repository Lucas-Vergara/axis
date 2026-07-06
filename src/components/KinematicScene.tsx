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
  const dF1 = ""; // Removed striations for simplicity
  const dF2 = "";

  // Pectoral logic
  const c1 = { x: 230, y: 340 };
  const c2 = { x: 245, y: 375 };
  const ins = { x: S.x + ux * 24 + pnx * 5, y: S.y + uy * 24 + pny * 5 };
  const mPecPath = `M${c1.x},${c1.y} Q${(c1.x + ins.x) / 2 - 15},${(c1.y + ins.y) / 2 - 18} ${ins.x},${ins.y} Q${(c2.x + ins.x) / 2},${(c2.y + ins.y) / 2 + 10} ${c2.x},${c2.y} Q${(c1.x + c2.x) / 2 - 8},${(c1.y + c2.y) / 2} ${c1.x},${c1.y} Z`;
  const mPecHiPath = `M${c1.x},${c1.y} Q${(c1.x + ins.x) / 2 - 15},${(c1.y + ins.y) / 2 - 18} ${ins.x},${ins.y}`;
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
    <div className="w-full relative flex items-center justify-center bg-white dark:bg-[#111] rounded-2xl border border-zinc-200 dark:border-neutral-800 overflow-hidden shadow-xl transition-colors duration-300 h-[380px] md:h-[420px] lg:h-[460px]">
      <svg
        ref={svgRef}
        viewBox="90 65 580 340"
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

          <linearGradient id="metalDark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1a1a1a" />
            <stop offset="0.3" stopColor="#333" />
            <stop offset="0.7" stopColor="#222" />
            <stop offset="1" stopColor="#0a0a0a" />
          </linearGradient>
          
          <linearGradient id="metalLight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d4d4d8" />
            <stop offset="0.3" stopColor="#f4f4f5" />
            <stop offset="0.7" stopColor="#e4e4e7" />
            <stop offset="1" stopColor="#a1a1aa" />
          </linearGradient>
          
          <linearGradient id="leather" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f3f46" />
            <stop offset="0.2" stopColor="#27272a" />
            <stop offset="0.8" stopColor="#18181b" />
            <stop offset="1" stopColor="#09090b" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Volumetric Power Rack & Bench */}
        <g opacity="0.65">
          {/* Light Theme Rack & Bench */}
          <g className="dark:hidden">
            {/* Bench Legs */}
            <rect x="150" y="407" width="24" height="140" rx="3" fill="url(#metalLight)" stroke="#a1a1aa" strokeWidth="1.5" />
            <rect x="450" y="407" width="24" height="140" rx="3" fill="url(#metalLight)" stroke="#a1a1aa" strokeWidth="1.5" />
            <rect x="120" y="542" width="400" height="12" rx="4" fill="url(#metalLight)" stroke="#a1a1aa" strokeWidth="1.5" />
            {/* Rack Base & Upright */}
            <rect x="140" y="540" width="120" height="14" rx="4" fill="url(#metalLight)" stroke="#a1a1aa" strokeWidth="1.5" />
            <rect x="180" y="80" width="30" height="462" rx="3" fill="url(#metalLight)" stroke="#a1a1aa" strokeWidth="1.5" />
            {/* Rack Holes */}
            <g fill="#27272a">
              {Array.from({ length: 18 }).map((_, i) => (
                <ellipse key={i} cx="195" cy={110 + i * 20} rx="4" ry="5.5" />
              ))}
            </g>
            {/* J-Hook */}
            <path d="M 178 125 L 200 125 L 200 188 L 246 188 L 246 160 L 258 160 L 258 200 L 178 200 Z" fill="url(#metalLight)" stroke="#a1a1aa" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="200" y="185" width="46" height="6" rx="2" fill="#18181b" /> {/* J-Hook Rubber */}
            {/* Bench Pad */}
            <rect x="85" y="392" width="450" height="18" rx="8" fill="url(#leather)" stroke="#09090b" strokeWidth="2" />
          </g>

          {/* Dark Theme Rack & Bench */}
          <g className="hidden dark:block">
            {/* Bench Legs */}
            <rect x="150" y="407" width="24" height="140" rx="3" fill="url(#metalDark)" stroke="#111" strokeWidth="1.5" />
            <rect x="450" y="407" width="24" height="140" rx="3" fill="url(#metalDark)" stroke="#111" strokeWidth="1.5" />
            <rect x="120" y="542" width="400" height="12" rx="4" fill="url(#metalDark)" stroke="#111" strokeWidth="1.5" />
            {/* Rack Base & Upright */}
            <rect x="140" y="540" width="120" height="14" rx="4" fill="url(#metalDark)" stroke="#111" strokeWidth="1.5" />
            <rect x="180" y="80" width="30" height="462" rx="3" fill="url(#metalDark)" stroke="#111" strokeWidth="1.5" />
            {/* Rack Holes */}
            <g fill="#09090b">
              {Array.from({ length: 18 }).map((_, i) => (
                <ellipse key={i} cx="195" cy={110 + i * 20} rx="4" ry="5.5" />
              ))}
            </g>
            {/* J-Hook */}
            <path d="M 178 125 L 200 125 L 200 188 L 246 188 L 246 160 L 258 160 L 258 200 L 178 200 Z" fill="url(#metalDark)" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="200" y="185" width="46" height="6" rx="2" fill="#09090b" />
            {/* Bench Pad */}
            <rect x="85" y="392" width="450" height="18" rx="8" fill="url(#leather)" stroke="#000" strokeWidth="2" />
          </g>
        </g>

        {/* Skin Silhouettes */}
        <g className="dark:hidden">
          <path d="M 262,332 Q 332,340 402,350 Q 452,356 470,365 Q 530,375 540,460 Q 540,500 520,530 L 540,535 L 540,542 L 485,542 L 490,530 Q 490,490 510,460 Q 470,410 460,392 Q 402,399 300,397 Q 222,397 188,388 Q 180,380 175,380 Q 150,392 135,385 Q 115,370 120,350 Q 125,325 155,335 Q 170,340 175,355 Q 185,365 200,355 Q 230,340 262,332 Z" fill="url(#skinLight)" opacity=".7" stroke="#bda28b" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        <g className="hidden dark:block">
          <path d="M 262,332 Q 332,340 402,350 Q 452,356 470,365 Q 530,375 540,460 Q 540,500 520,530 L 540,535 L 540,542 L 485,542 L 490,530 Q 490,490 510,460 Q 470,410 460,392 Q 402,399 300,397 Q 222,397 188,388 Q 180,380 175,380 Q 150,392 135,385 Q 115,370 120,350 Q 125,325 155,335 Q 170,340 175,355 Q 185,365 200,355 Q 230,340 262,332 Z" fill="url(#skin)" opacity=".6" stroke="#2a211e" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        
        {/* Bones background (Abstract & Clean) */}
        <g opacity=".85">
          {/* Ribcage */}
          <path d="M260,342 Q300,356 300,388" fill="none" stroke="url(#boneGrad)" strokeWidth="3" strokeLinecap="round" opacity=".55" />
          <path d="M285,344 Q325,358 325,390" fill="none" stroke="url(#boneGrad)" strokeWidth="3" strokeLinecap="round" opacity=".55" />
          <path d="M310,347 Q350,361 350,392" fill="none" stroke="url(#boneGrad)" strokeWidth="3" strokeLinecap="round" opacity=".55" />
          <path d="M335,350 Q375,364 375,392" fill="none" stroke="url(#boneGrad)" strokeWidth="3" strokeLinecap="round" opacity=".55" />
          
          {/* Clavicle / Sternum connections (Abstract) */}
          <line x1={S.x} y1={S.y} x2="260" y2="345" stroke="url(#boneGrad)" strokeWidth="4" strokeLinecap="round" opacity=".6" />
          <line x1="250" y1="340" x2="280" y2="348" stroke="url(#boneGrad)" strokeWidth="5" strokeLinecap="round" opacity=".6" />
          
          {/* Scapula Abstract */}
          <path d={`M${S.x - 5},${S.y + 5} L250,380 L230,385 Z`} fill="url(#boneGrad)" opacity=".4" />
          
          {/* Pelvis Abstract */}
          <path d="M420,368 Q442,370 446,386 L428,390 Q418,378 420,368 Z" fill="url(#boneGrad)" opacity=".45" />
          
          {/* Leg Bones */}
          <line x1="435" y1="380" x2="525" y2="455" stroke="url(#boneGrad)" strokeWidth="6" strokeLinecap="round" opacity=".55" />
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
          {/* Deltoid Fibers Removed */}
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
        <line x1={S.x} y1={S.y} x2={S.x} y2="305" strokeWidth="1.5" strokeDasharray="4,4" opacity={maLblOpacity} className="stroke-blue-400/50" />
        <g strokeWidth="2" opacity=".75" className="stroke-blue-500 dark:stroke-blue-400">
          <line x1={S.x} y1="300" x2={Wx} y2="300" />
          <line x1={S.x} y1="294" x2={S.x} y2="306" />
          <line x1={Wx} y1="294" x2={Wx} y2="306" />
        </g>
        <text x={(S.x + Wx) / 2} y="290" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity={maLblOpacity} className="fill-blue-600 dark:fill-blue-400">
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

        {/* Legend */}
        <g transform="translate(350,85)">
          <text x="0" y="-6" fontSize="10" fontFamily="monospace" className="fill-zinc-500 dark:fill-[#777]">COLOR DEL CUERPO = DEMANDA / CONTRIBUCIÓN RELATIVA</text>
          <rect x="0" y="0" width="150" height="8" rx="2" fill="url(#legendGrad)" />
          <text x="0" y="22" fontSize="9" fontFamily="monospace" className="fill-zinc-500 dark:fill-[#666]">menor</text>
          <text x="150" y="22" fontSize="9" fontFamily="monospace" textAnchor="end" className="fill-zinc-500 dark:fill-[#666]">mayor</text>
        </g>
      </svg>
    </div>
  );
}
