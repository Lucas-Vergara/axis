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
  shoulderMomentArm: number; // in cm
  elbowMomentArm: number; // in cm
  pectoralTension: number; // 0 to 100
  tricepsTension: number; // 0 to 100
  deltoidTension: number; // 0 to 100
  barbellForce: number; // in Newtons (N)
  shoulderTorque: number; // in Newton-meters (N-m)
  elbowTorque: number; // in Newton-meters (N-m)
}

// Fixed dimensions for the 2D sagittal biomechanical model
export const SHOULDER_POS: Point = { x: 280, y: 320 }; // Fixed shoulder joint
export const L_ARM = 95; // Upper arm length
export const L_FOREARM = 85; // Forearm length
export const PX_TO_CM = 0.3; // Scale factor for moment arms (pixels to cm)

/**
 * Calculates the barbell position along the parabolic J-curve trajectory.
 * @param progress 0 (lockout, top) to 100 (chest, bottom)
 */
export function getBarbellPosition(progress: number): Point {
  const p = progress / 100;
  
  // Starting point (lockout directly above shoulder, aligned vertically)
  const xStart = 280;
  const yStart = 140; // Lockout at Y=140 is exactly L_ARM + L_FOREARM (95+85=180px) from shoulder
  
  // Ending point (chest touch, slightly forward and down)
  const xEnd = 330; 
  const yEnd = 290; // Higher chest peak at Y=290
  
  // Parabolic "J-curve" calculation
  const y = yStart + (yEnd - yStart) * p;
  
  // Curved J-parabola path
  const x = xStart + (xEnd - xStart) * Math.pow(p, 1.5) + 10 * Math.sin(p * Math.PI);
  
  return { x, y };
}

/**
 * Solve Inverse Kinematics for the elbow position given shoulder and wrist.
 * We select the solution where the elbow points downwards (higher y).
 */
export function solveElbowPosition(shoulder: Point, wrist: Point, r1: number, r2: number): Point {
  const dx = wrist.x - shoulder.x;
  const dy = wrist.y - shoulder.y;
  let d = Math.sqrt(dx * dx + dy * dy);
  
  // Safeguards to prevent NaN in arccos calculations if the wrist goes out of reach
  const maxReach = r1 + r2;
  const minReach = Math.abs(r1 - r2);
  if (d > maxReach) d = maxReach;
  if (d < minReach) d = minReach;
  
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  
  const x0 = shoulder.x + (a * dx) / d;
  const y0 = shoulder.y + (a * dy) / d;
  
  // Two possible intersection points
  const p1 = {
    x: x0 + (h * dy) / d,
    y: y0 - (h * dx) / d
  };
  const p2 = {
    x: x0 - (h * dy) / d,
    y: y0 + (h * dx) / d
  };
  
  // We want the elbow pointing downwards (higher y coordinate)
  return p1.y > p2.y ? p1 : p2;
}

/**
 * Computes all biomechanical metrics based on simulation progress and load weight
 */
export function calculateBiomechanics(progress: number, weight: number = 60): BiomechanicalMetrics {
  const barbell = getBarbellPosition(progress);
  const wrist = { ...barbell }; // Wrist holds the barbell
  
  const shoulder = { ...SHOULDER_POS };
  const elbow = solveElbowPosition(shoulder, wrist, L_ARM, L_FOREARM);
  
  // Calculate joint angles in degrees
  const armAngleRad = Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x);
  const shoulderAngle = Math.round(90 - (armAngleRad - Math.PI / 2) * (180 / Math.PI));
  
  const v1 = { x: shoulder.x - elbow.x, y: shoulder.y - elbow.y };
  const v2 = { x: wrist.x - elbow.x, y: wrist.y - elbow.y };
  
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const cosTheta = Math.max(-1, Math.min(1, dotProduct / (len1 * len2)));
  const elbowAngle = Math.round(Math.acos(cosTheta) * (180 / Math.PI));
  
  // Calculate Moment Arms (horizontal distance from joint to force vector)
  const shoulderMomentArmPx = Math.abs(barbell.x - shoulder.x);
  const elbowMomentArmPx = Math.abs(barbell.x - elbow.x);
  
  const shoulderMomentArm = parseFloat((shoulderMomentArmPx * PX_TO_CM).toFixed(1));
  const elbowMomentArm = parseFloat((elbowMomentArmPx * PX_TO_CM).toFixed(1));
  
  // Real Physics calculations:
  // Force of barbell: Mass * Gravity
  const barbellForce = parseFloat((weight * 9.81).toFixed(1)); // in Newtons
  
  // Torques: Force * Moment Arm (convert cm to meters)
  const shoulderTorque = parseFloat((barbellForce * (shoulderMomentArm / 100)).toFixed(1)); // N-m
  const elbowTorque = parseFloat((barbellForce * (elbowMomentArm / 100)).toFixed(1)); // N-m

  // Calculate Muscle Tensions scale based on weight (referenced to standard 60 kg)
  // Heavier load leads to higher activation/tension. An empty bar (20kg) has very low tension.
  const loadFactor = weight / 60;
  
  const pectoralTension = Math.round(Math.min(100, Math.max(5, (10 + 90 * (progress / 100)) * loadFactor)));
  const tricepsTension = Math.round(Math.min(100, Math.max(5, (100 - 65 * (progress / 100)) * loadFactor)));
  const deltoidTension = Math.round(Math.min(100, Math.max(5, (10 + 85 * (progress / 100)) * loadFactor)));
  
  return {
    jointPositions: { shoulder, elbow, wrist, barbell },
    shoulderAngle,
    elbowAngle,
    shoulderMomentArm,
    elbowMomentArm,
    pectoralTension,
    tricepsTension,
    deltoidTension,
    barbellForce,
    shoulderTorque,
    elbowTorque,
  };
}

/**
 * Interpolates HSL colors between blue (rest, 0% tension) and red (effort, 100% tension)
 * @param tension 0 to 100
 */
export function getMuscleColor(tension: number): string {
  const t = tension / 100;
  // HSL values:
  // Blue (rest): hue = 220, sat = 80%, light = 60%
  // Red (effort): hue = 0, sat = 85%, light = 50%
  const hue = 220 - 220 * t;
  const sat = 80 + 5 * t;
  const light = 60 - 10 * t;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}
