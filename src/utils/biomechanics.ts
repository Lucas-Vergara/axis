export interface Point {
  x: number;
  y: number;
}

export interface JointPositions {
  shoulder: Point;
  elbow: Point;
  wrist: Point;
  barbell: Point;
}

export interface BiomechanicalMetrics {
  jointPositions: JointPositions;
  shoulderAngle: number;
  elbowAngle: number;
  tqHombro: number;
  tqCodo: number;
  pec: number;
  delt: number;
  tri: number;
}

// Fixed dimensions based on Liss's design
export const SHOULDER_POS: Point = { x: 255, y: 352 }; // Fixed shoulder joint
export const L_ARM = 112; // Upper arm length
export const L_FORE = 98; // Forearm length

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpA = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(lerp(v, b[i], t)));
const rgb = (a: number[]) => `rgb(${a[0]}, ${a[1]}, ${a[2]})`;

export function scale3(t: number): string {
  t = clamp(t, 0, 1);
  const A = [43, 108, 176], B = [224, 165, 46], C = [224, 72, 58];
  return rgb(t < 0.5 ? lerpA(A, B, t / 0.5) : lerpA(B, C, (t - 0.5) / 0.5));
}

export function getMuscleColor(tensionValue: number, minTension: number, maxTension: number): string {
  // Normalize tension to 0-1 range for the scale3 function
  const t = clamp((tensionValue - minTension) / (maxTension - minTension), 0, 1);
  return scale3(t);
}

/**
 * Computes all biomechanical metrics based on simulation progress
 * Progress goes from -30 (racked) to 100 (chest)
 */
export function calculateBiomechanics(p: number): BiomechanicalMetrics {
  let Wx = 0, Wy = 0, Ex = 0, Ey = 0;
  const S = SHOULDER_POS;

  // KINEMATICS IN PHASES (Unrack vs Descent)
  if (p < 0) {
      if (p < -15) {
          // Phase 1: Lift off from rack
          const t = (p + 30) / 15;
          Wx = 220;
          Wy = lerp(165, 148, t);
      } else {
          // Phase 2: Horizontal pull to Lockout
          const t = (p + 15) / 15; 
          Wx = lerp(220, 280.7, t);
          Wy = lerp(148, 145, t);
      }
      let dist = Math.hypot(Wx - S.x, Wy - S.y);
      dist = clamp(dist, 0.1, L_ARM + L_FORE - 0.1);
      const a1 = Math.acos((Math.pow(L_ARM, 2) + Math.pow(dist, 2) - Math.pow(L_FORE, 2)) / (2 * L_ARM * dist));
      const angBar = Math.atan2(Wy - S.y, Wx - S.x);
      Ex = S.x + L_ARM * Math.cos(angBar + a1);
      Ey = S.y + L_ARM * Math.sin(angBar + a1);
  } else {
      // Phase 3: Descent (J-Curve)
      const fase = p / 100;
      Wy = 145 + 175 * fase;
      Ey = Wy + L_FORE;
      const dy = Ey - S.y;
      Ex = S.x + Math.sqrt(Math.max(0, Math.pow(L_ARM, 2) - Math.pow(dy, 2)));
      Wx = Ex;
  }

  // Model mechanics
  const f = Math.max(0, p / 100);
  const tqHombro = f;
  const tqCodo = 1 - Math.sin(Math.PI * f) * 0.7;
  
  // EMG values based on literature (Liss's design)
  const pec = clamp(27 + tqHombro * 4 - 2, 20, 32);
  const delt = clamp(26 + tqHombro * 3 - 1.5, 20, 30);
  const tri = clamp(13 + tqCodo * 7, 13, 20);

  // Joint Angles
  const hx = Ex - S.x;
  const hy = Ey - S.y;
  const hl = Math.hypot(hx, hy) || 1;
  
  const aCodo = Math.round(Math.acos(clamp(((S.x - Ex) * (Wx - Ex) + (S.y - Ey) * (Wy - Ey)) / ((Math.hypot(S.x - Ex, S.y - Ey) || 1) * (Math.hypot(Wx - Ex, Wy - Ey) || 1)), -1, 1)) * 180 / Math.PI);
  const aHom = Math.round(Math.acos(clamp(-hx / hl, -1, 1)) * 180 / Math.PI);

  return {
    jointPositions: { 
      shoulder: S, 
      elbow: { x: Ex, y: Ey }, 
      wrist: { x: Wx, y: Wy }, 
      barbell: { x: Wx, y: Wy } 
    },
    shoulderAngle: aHom,
    elbowAngle: aCodo,
    tqHombro,
    tqCodo,
    pec,
    delt,
    tri
  };
}
