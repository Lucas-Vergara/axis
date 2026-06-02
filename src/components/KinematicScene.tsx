"use client";

import React from "react";
import { useSimulationStore } from "@/store/useSimulationStore";
import { calculateBiomechanics, getMuscleColor } from "@/utils/biomechanics";

export default function KinematicScene() {
  const progress = useSimulationStore((state) => state.progress);
  
  // Calculate all biomechanical coordinates and angles
  const metrics = calculateBiomechanics(progress);
  const {
    jointPositions: { shoulder, elbow, wrist, barbell },
    shoulderAngle,
    elbowAngle,
    shoulderMomentArm,
    elbowMomentArm,
    pectoralTension,
    tricepsTension,
    deltoidTension,
  } = metrics;

  // Muscle color codes
  const pectoralColor = getMuscleColor(pectoralTension);
  const tricepsColor = getMuscleColor(tricepsTension);
  const deltoidColor = getMuscleColor(deltoidTension);

  // Derive points for muscle geometry
  // Pectoral Mayor: Sternum (on chest) to Humerus (upper arm mid)
  const pectoralSternum = { x: 325, y: 295 };
  const upperArmMid = {
    x: shoulder.x + 0.45 * (elbow.x - shoulder.x),
    y: shoulder.y + 0.45 * (elbow.y - shoulder.y),
  };

  // Deltoides Anterior: Clavicle/Shoulder top to Humerus mid
  const deltoidOrigin = { x: 265, y: 300 };

  // Tríceps: Back of upper arm, from shoulder-blade area to elbow
  const tricepsOrigin = { x: 270, y: 332 };
  const upperArmMidBack = {
    x: shoulder.x + 0.5 * (elbow.x - shoulder.x) - 8,
    y: shoulder.y + 0.5 * (elbow.y - shoulder.y) + 4,
  };

  // Calculate angles for rendering bone geometries in local coordinate systems
  const humerusAngle = Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x) * (180 / Math.PI);
  const humerusLength = Math.sqrt(
    Math.pow(elbow.x - shoulder.x, 2) + Math.pow(elbow.y - shoulder.y, 2)
  );

  const forearmAngle = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * (180 / Math.PI);
  const forearmLength = Math.sqrt(
    Math.pow(wrist.x - elbow.x, 2) + Math.pow(wrist.y - elbow.y, 2)
  );

  // Pre-calculate clean variable values to avoid division operator parsing issues in Turbopack JSX
  const tricepsFiberOpacity = 0.3 + 0.3 * (tricepsTension / 100);
  const pectoralFillOpacity = 0.75 + 0.2 * (pectoralTension / 100);
  const pectoralFiberOpacity = 0.2 + 0.3 * (pectoralTension / 100);
  const deltoidFillOpacity = 0.75 + 0.2 * (deltoidTension / 100);

  // Moment arm label coordinates calculated outside JSX
  const shoulderLabelX = Math.min(shoulder.x, barbell.x) + Math.abs(shoulder.x - barbell.x) / 2;
  const shoulderRectX = shoulderLabelX - 32;

  const elbowLabelX = Math.min(elbow.x, barbell.x) + Math.abs(elbow.x - barbell.x) / 2;
  const elbowRectX = elbowLabelX - 32;

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 shadow-2xl backdrop-blur-md">
      <div className="w-full flex items-center justify-between mb-3 border-b border-zinc-800 pb-3">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-blue-400">
          Escenario Cinemático (Vista Sagital)
        </h2>
        <span className="text-xs bg-zinc-850 text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-800 font-mono">
          Escala: 1px = 0.3 cm
        </span>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        viewBox="0 0 600 500"
        className="w-full max-w-[550px] aspect-square rounded-xl bg-zinc-950/60 border border-zinc-900 shadow-inner select-none"
      >
        {/* SVG definitions for patterns, markers and glow filters */}
        <defs>
          <radialGradient id="shoulderGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="benchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2e2e30" />
            <stop offset="100%" stopColor="#1a1a1c" />
          </linearGradient>
          <filter id="vectorGlow" x="-20%" y="-20%" width="140%" height="140%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Floor & Grid Background (Technical look) */}
        <line x1="20" y1="460" x2="580" y2="460" stroke="#27272a" strokeWidth="2" />
        <g stroke="#18181b" strokeWidth="1" strokeDasharray="3,3">
          <line x1="100" y1="50" x2="100" y2="460" />
          <line x1="200" y1="50" x2="200" y2="460" />
          <line x1="300" y1="50" x2="300" y2="460" />
          <line x1="400" y1="50" x2="400" y2="460" />
          <line x1="500" y1="50" x2="500" y2="460" />
          <line x1="20" y1="150" x2="580" y2="150" />
          <line x1="20" y1="250" x2="580" y2="250" />
          <line x1="20" y1="350" x2="580" y2="350" />
        </g>

        {/* 2. Flat Bench Press Bench */}
        {/* Bench Legs */}
        <rect x="140" y="340" width="30" height="120" fill="url(#benchGrad)" stroke="#3f3f46" strokeWidth="1" />
        <rect x="360" y="340" width="30" height="120" fill="url(#benchGrad)" stroke="#3f3f46" strokeWidth="1" />
        {/* Bench Support base */}
        <rect x="100" y="450" width="320" height="10" rx="3" fill="#27272a" />
        {/* Bench Padding (where human lies) */}
        <rect x="100" y="335" width="310" height="12" rx="4" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />

        {/* 3. Barbell Rack Support (Background layer) */}
        <path d="M 230,340 L 230,170 L 220,170 L 220,150 L 245,150 L 245,170 L 235,170 L 235,340 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />

        {/* 4. Human Body Silhouette (Lying position, sagittal view) */}
        {/* Spine / Vertebrae (Anatomical Detail) */}
        <g stroke="#4338ca" strokeWidth="1.5" fill="none" opacity={0.35}>
          {Array.from({ length: 13 }).map((_, i) => (
            <rect
              key={i}
              x={185 + i * 16}
              y={324}
              width="10"
              height="6"
              rx="1.5"
              stroke="#6366f1"
              fill="#1e1b4b"
            />
          ))}
        </g>

        {/* Detailed Ribcage (Anatomical Detail) */}
        <g stroke="#818cf8" strokeWidth="1.2" fill="none" opacity={0.3}>
          <path d="M 260,324 Q 275,295 265,310" />
          <path d="M 275,324 Q 292,290 280,307" />
          <path d="M 290,324 Q 308,285 295,302" />
          <path d="M 305,324 Q 325,282 310,299" />
          <path d="M 320,324 Q 340,285 325,303" />
          <path d="M 335,324 Q 355,290 340,308" />
        </g>

        {/* Torso Clavicle & Ribcage Fill Layer */}
        <path
          d="M 210,322 Q 245,315 280,312 Q 305,278 330,289 Q 360,305 390,325 L 390,332 L 210,332 Z"
          fill="#1e1b4b"
          opacity={0.25}
        />

        {/* Head with skull contours */}
        <circle cx="170" cy="305" r="24" fill="#1e1b4b" stroke="#4338ca" strokeWidth="2" opacity={0.85} />
        <path d="M 160,317 Q 165,327 172,327 L 180,327 Z" fill="#1e1b4b" stroke="#4338ca" strokeWidth="2" opacity={0.85} /> {/* Jawline */}
        
        {/* Neck */}
        <path d="M 188,310 L 205,318 L 200,330 L 182,324 Z" fill="#1e1b4b" stroke="#4338ca" strokeWidth="2" opacity="0.85" />
        
        {/* Hips and Pelvis */}
        <ellipse cx="390" cy="325" rx="30" ry="20" fill="#1e1b4b" stroke="#4338ca" strokeWidth="2" opacity="0.85" />
        
        {/* Thigh (leg segment 1) */}
        <line x1="390" y1="325" x2="440" y2="385" stroke="#4338ca" strokeWidth="12" strokeLinecap="round" opacity={0.7} />
        <line x1="390" y1="325" x2="440" y2="385" stroke="#1e1b4b" strokeWidth="8" strokeLinecap="round" />
        
        {/* Calf (leg segment 2) to floor */}
        <line x1="440" y1="385" x2="455" y2="460" stroke="#4338ca" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
        <line x1="440" y1="385" x2="455" y2="460" stroke="#1e1b4b" strokeWidth="6" strokeLinecap="round" />
        <rect x="445" y="455" width="22" height="7" rx="2" fill="#4338ca" opacity={0.8} />

        {/* Torso Profile Outline (Chest Profile where bar touches) */}
        <path
          d="M 210,322 Q 245,315 280,312 Q 305,278 330,289 Q 360,305 390,325"
          fill="none"
          stroke="#4338ca"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* 5. ANATOMICAL MUSCLES LAYER (Dynamic color/glow) */}
        {/* TRÍCEPS BRAQUIAL */}
        <path
          d={`M ${tricepsOrigin.x},${tricepsOrigin.y} Q ${upperArmMidBack.x},${upperArmMidBack.y} ${elbow.x},${elbow.y}`}
          fill="none"
          stroke={tricepsColor}
          strokeWidth="15"
          strokeLinecap="round"
          className="transition-colors duration-150 ease-out cursor-pointer"
        >
          <title>{`Tríceps: ${tricepsTension}%`}</title>
        </path>
        {/* Triceps inner dynamic fibers */}
        <path
          d={`M ${tricepsOrigin.x},${tricepsOrigin.y} Q ${upperArmMidBack.x},${upperArmMidBack.y} ${elbow.x},${elbow.y}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeDasharray="4,6"
          opacity={tricepsFiberOpacity}
        />

        {/* PECTORAL MAYOR */}
        <path
          d={`M ${shoulder.x},${shoulder.y} Q ${pectoralSternum.x},${pectoralSternum.y} ${upperArmMid.x},${upperArmMid.y} Z`}
          fill={pectoralColor}
          stroke={pectoralColor}
          strokeWidth="2"
          fillOpacity={pectoralFillOpacity}
          className="transition-colors duration-150 ease-out cursor-pointer"
        >
          <title>{`Pectoral Mayor: ${pectoralTension}%`}</title>
        </path>
        {/* Pectoral Fiber details */}
        <line x1="305" y1="307" x2={upperArmMid.x} y2={upperArmMid.y} stroke="#ffffff" strokeWidth="1" opacity={pectoralFiberOpacity} />
        <line x1="318" y1="302" x2={upperArmMid.x} y2={upperArmMid.y} stroke="#ffffff" strokeWidth="1" opacity={pectoralFiberOpacity} />
        <line x1="285" y1="312" x2={upperArmMid.x} y2={upperArmMid.y} stroke="#ffffff" strokeWidth="1" opacity={pectoralFiberOpacity} />

        {/* DELTOIDES ANTERIOR */}
        <path
          d={`M ${deltoidOrigin.x},${deltoidOrigin.y} Q ${shoulder.x - 6},${shoulder.y - 10} ${upperArmMid.x},${upperArmMid.y} Z`}
          fill={deltoidColor}
          stroke={deltoidColor}
          strokeWidth="2"
          fillOpacity={deltoidFillOpacity}
          className="transition-colors duration-150 ease-out cursor-pointer"
        >
          <title>{`Deltoides Anterior: ${deltoidTension}%`}</title>
        </path>

        {/* 6. DETAILED BONES & JOINTS LAYER (Anatomical Bone Silhouettes) */}
        {/* Upper Arm Bone (Humerus) - Rotates and scales dynamically */}
        <g transform={`translate(${shoulder.x}, ${shoulder.y}) rotate(${humerusAngle})`}>
          {/* Humerus silhouette with epicondyle flared ends */}
          <path
            d={`M 0,0 C 5,8 10,4 12,2 L ${humerusLength - 10},2 C ${humerusLength - 8},3 ${humerusLength - 4},6 ${humerusLength},4 L ${humerusLength},-4 C ${humerusLength - 4},-6 ${humerusLength - 8},-3 ${humerusLength - 10},-2 L 12,-2 C 10,-4 5,-8 0,0 Z`}
            fill="#e4e4e7"
            stroke="#a1a1aa"
            strokeWidth="1"
            opacity={0.9}
          />
          {/* Internal marrow cavity line */}
          <line x1="14" y1="0" x2={humerusLength - 12} y2="0" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="5,3" opacity={0.6} />
        </g>

        {/* Forearm Bones (Radius & Ulna) - Rotates and scales dynamically */}
        <g transform={`translate(${elbow.x}, ${elbow.y}) rotate(${forearmAngle})`}>
          {/* Bone 1: Radius */}
          <path
            d={`M 0,2 C 4,5 8,3 10,1.5 L ${forearmLength - 8},1 C ${forearmLength - 5},2 ${forearmLength - 2},4 ${forearmLength},2.5 L ${forearmLength},0.5 C ${forearmLength - 2},-1 ${forearmLength - 5},0 ${forearmLength - 8},-0.5 L 10,-1.5 C 8,-3 4,-5 0,2 Z`}
            fill="#d4d4d8"
            stroke="#71717a"
            strokeWidth="0.8"
            opacity={0.9}
          />
          {/* Bone 2: Ulna */}
          <path
            d={`M 0,-2 C 4,-0.5 8,-2 10,-2.5 L ${forearmLength - 8}, -3.5 C ${forearmLength - 5},-3 ${forearmLength - 2},-1 ${forearmLength},-2.5 L ${forearmLength},-4.5 C ${forearmLength - 2},-5 ${forearmLength - 5},-4.5 ${forearmLength - 8},-5.5 L 10,-4.5 C 8,-5 4,-3.5 0,-2 Z`}
            fill="#f4f4f5"
            stroke="#a1a1aa"
            strokeWidth="0.8"
            opacity={0.85}
          />
        </g>

        {/* Shoulder Joint Pin */}
        <circle cx={shoulder.x} cy={shoulder.y} r="7" fill="#18181b" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx={shoulder.x} cy={shoulder.y} r="15" fill="url(#shoulderGlow)" pointerEvents="none" />

        {/* Elbow Joint Pin */}
        <circle cx={elbow.x} cy={elbow.y} r="6" fill="#18181b" stroke="#f4f4f5" strokeWidth="2" />

        {/* Wrist Joint Pin */}
        <circle cx={wrist.x} cy={wrist.y} r="4.5" fill="#18181b" stroke="#f4f4f5" strokeWidth="1.5" />

        {/* 7. FORCE VECTORS & MOMENT ARMS (Scientific annotations) */}
        {/* Vertical Line of Force Action (Gravity passing through the bar) */}
        <line
          x1={barbell.x}
          y1="50"
          x2={barbell.x}
          y2="440"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          opacity={0.6}
        />

        {/* Shoulder Moment Arm (Blue dimension line) */}
        {shoulderMomentArm > 0 && (
          <g>
            <line
              x1={shoulder.x}
              y1={shoulder.y}
              x2={barbell.x}
              y2={shoulder.y}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="1,1"
            />
            {/* Ticks at the ends */}
            <line x1={shoulder.x} y1={shoulder.y - 6} x2={shoulder.x} y2={shoulder.y + 6} stroke="#3b82f6" strokeWidth="2" />
            <line x1={barbell.x} y1={shoulder.y - 6} x2={barbell.x} y2={shoulder.y + 6} stroke="#3b82f6" strokeWidth="2" />
            {/* Label box */}
            <rect
              x={shoulderRectX}
              y={shoulder.y - 12}
              width="64"
              height="20"
              rx="4"
              fill="#1e3a8a"
              stroke="#3b82f6"
              strokeWidth="1"
            />
            <text
              x={shoulderLabelX}
              y={shoulder.y + 2}
              fill="#93c5fd"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {shoulderMomentArm} cm
            </text>
          </g>
        )}

        {/* Elbow Moment Arm (Green/Teal dimension line) */}
        {elbowMomentArm > 0 && (
          <g>
            <line
              x1={elbow.x}
              y1={elbow.y}
              x2={barbell.x}
              y2={elbow.y}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="1,1"
            />
            {/* Ticks at the ends */}
            <line x1={elbow.x} y1={elbow.y - 6} x2={elbow.x} y2={elbow.y + 6} stroke="#10b981" strokeWidth="2" />
            <line x1={barbell.x} y1={elbow.y - 6} x2={barbell.x} y2={elbow.y + 6} stroke="#10b981" strokeWidth="2" />
            {/* Label box */}
            <rect
              x={elbowRectX}
              y={elbow.y - 12}
              width="64"
              height="20"
              rx="4"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text
              x={elbowLabelX}
              y={elbow.y + 2}
              fill="#a7f3d0"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {elbowMomentArm} cm
            </text>
          </g>
        )}

        {/* 8. BARBELL & OLYMPIC WEIGHT PLATES (Dynamic movement) */}
        <g transform={`translate(${barbell.x}, ${barbell.y})`}>
          {/* Olympic Barbell rod (Sagittal view, end of barbell represents a cylinder/circle) */}
          {/* Bar core */}
          <circle cx="0" cy="0" r="14" fill="#a1a1aa" stroke="#52525b" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="6" fill="#27272a" />
          
          {/* Bar collar */}
          <rect x="-18" y="-12" width="6" height="24" rx="1" fill="#71717a" stroke="#3f3f46" strokeWidth="1" />
          
          {/* Weight plates (seen from side: concentric circles representing stack of plates) */}
          {/* First Plate: Red (25 kg) */}
          <circle cx="0" cy="0" r="42" fill="none" stroke="#ef4444" strokeWidth="12" opacity="0.95" />
          <circle cx="0" cy="0" r="48" fill="none" stroke="#dc2626" strokeWidth="1" />
          <circle cx="0" cy="0" r="36" fill="none" stroke="#b91c1c" strokeWidth="1" />
          {/* Inner ring */}
          <circle cx="0" cy="0" r="18" fill="none" stroke="#e4e4e7" strokeWidth="2" />
          
          {/* Label text on weight plate */}
          <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle" opacity={0.9}>
            20 kg
          </text>

          {/* Bold Force Vector Arrow pointing downwards from gravity center */}
          <g transform="translate(0, 10)" filter="url(#vectorGlow)">
            <line x1="0" y1="0" x2="0" y2="45" stroke="#ef4444" strokeWidth="3" />
            <polygon points="-6,40 0,50 6,40" fill="#ef4444" />
          </g>
          <text x="14" y="45" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            F_g (Carga)
          </text>
        </g>

        {/* 9. Joint Labels */}
        <text x={shoulder.x - 20} y={shoulder.y + 24} fill="#60a5fa" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
          Hombro
        </text>
        <text x={elbow.x - 10} y={elbow.y + 20} fill="#f4f4f5" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
          Codo
        </text>
        <text x={wrist.x + 22} y={wrist.y - 10} fill="#f4f4f5" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
          Muñeca
        </text>
      </svg>

      {/* Mini real-time angle display badge */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Ángulo Hombro:</span>
          <span className="text-sm font-bold font-mono text-blue-400">{shoulderAngle}°</span>
        </div>
        <div className="bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs text-zinc-400">Ángulo Codo:</span>
          <span className="text-sm font-bold font-mono text-emerald-400">{elbowAngle}°</span>
        </div>
      </div>
    </div>
  );
}
