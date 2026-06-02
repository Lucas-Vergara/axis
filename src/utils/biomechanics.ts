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
}

// Fixed dimensions for the 2D sagittal biomechanical model
export const SHOULDER_POS: Point = { x: 280, y: 320 }; // Fixed shoulder joint
export const L_ARM = 125; // Length of upper arm (shoulder to elbow)
export const L_FOREARM = 115; // Length of forearm (elbow to wrist)
export const PX_TO_CM = 0.3; // Scale factor for moment arms (pixels to cm)

/**
 * Calculates the barbell position along the parabolic J-curve trajectory.
 * @param progress 0 (lockout, top) to 100 (chest, bottom)
 */
export function getBarbellPosition(progress: number): Point {
  const p = progress / 100;
  
  // Starting point (lockout directly above shoulder)
  const xStart = 280;
  const yStart = 100;
  
  // Ending point (chest, slightly forward/downwards from shoulder)
  const xEnd = 345;
  const yEnd = 300;
  
  // Parabolic "J-curve" calculation
  // The bar curves slightly towards the head (left, negative X) early in the press,
  // then curves down and forward towards the sternum (right, positive X)
  const y = yStart + (yEnd - yStart) * p;
  
  // Add a sine wave component to produce the J-parabola bend
  const x = xStart + (xEnd - xStart) * Math.pow(p, 1.5) + 12 * Math.sin(p * Math.PI);
  
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
 * Computes all biomechanical metrics based on simulation progress
 */
export function calculateBiomechanics(progress: number): BiomechanicalMetrics {
  const barbell = getBarbellPosition(progress);
  const wrist = { ...barbell }; // Wrist holds the barbell
  
  const shoulder = { ...SHOULDER_POS };
  const elbow = solveElbowPosition(shoulder, wrist, L_ARM, L_FOREARM);
  
  // Calculate joint angles in degrees
  // 1. Shoulder joint angle relative to vertical (pointing down)
  // Lockout is straight up, which is 90 degrees relative to horizontal.
  const armAngleRad = Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x);
  const shoulderAngle = Math.round(90 - (armAngleRad - Math.PI / 2) * (180 / Math.PI));
  
  // 2. Elbow joint angle: angle between upper arm (shoulder to elbow) and forearm (wrist to elbow)
  // 180 degrees is fully extended (straight arm), ~35 degrees is fully bent.
  const v1 = { x: shoulder.x - elbow.x, y: shoulder.y - elbow.y };
  const v2 = { x: wrist.x - elbow.x, y: wrist.y - elbow.y };
  
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const cosTheta = Math.max(-1, Math.min(1, dotProduct / (len1 * len2)));
  const elbowAngle = Math.round(Math.acos(cosTheta) * (180 / Math.PI));
  
  // Calculate Moment Arms (horizontal distance from joint to force vector)
  // Force vector of gravity is a vertical line passing through the barbell (X = barbell.x)
  const shoulderMomentArmPx = Math.abs(barbell.x - shoulder.x);
  const elbowMomentArmPx = Math.abs(barbell.x - elbow.x);
  
  const shoulderMomentArm = parseFloat((shoulderMomentArmPx * PX_TO_CM).toFixed(1));
  const elbowMomentArm = parseFloat((elbowMomentArmPx * PX_TO_CM).toFixed(1));
  
  // Calculate Muscle Tensions according to activation matrix
  // Pectoral Mayor: increases to 100% at chest touch (progress 100), decreases to 10% at lockout (progress 0)
  const pectoralTension = Math.round(10 + 90 * (progress / 100));
  
  // Triceps Braquial: 100% active at lockout (progress 0), drops to 35% at chest (progress 100)
  const tricepsTension = Math.round(100 - 65 * (progress / 100));
  
  // Deltoides Anterior: sinergist, increases to 95% at chest touch, decreases to 10% at lockout
  const deltoidTension = Math.round(10 + 85 * (progress / 100));
  
  return {
    jointPositions: { shoulder, elbow, wrist, barbell },
    shoulderAngle,
    elbowAngle,
    shoulderMomentArm,
    elbowMomentArm,
    pectoralTension,
    tricepsTension,
    deltoidTension,
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
