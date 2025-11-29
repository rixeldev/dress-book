// Clothes measurements (body measurements)
export interface ClothesMeasurements {
  headAndNeck: {
    headCircumference?: number;
    neckCircumference?: number;
    neckHeight?: number;
  };
  upperTorso: {
    shoulderWidth?: number;
    chestWidth?: number;
    shoulderLength?: number;
    bustCircumference?: number;
    underbustCircumference?: number;
    bustSpan?: number;
    bustHeight?: number;
  };
  midTorso: {
    waistCircumference?: number;
    frontWaistLength?: number;
    backWaistLength?: number;
    sideSeamLength?: number;
  };
  arms: {
    armholeCircumference?: number;
    sleeveLength?: number;
    elbowLength?: number;
    bicepCircumference?: number;
    elbowCircumference?: number;
    wristCircumference?: number;
    handCircumference?: number;
  };
  hipsAndPelvis: {
    highHipCircumference?: number;
    lowHipCircumference?: number;
    hipHeight?: number;
    totalCrotchLength?: number;
    seatedCrotchDepth?: number;
  };
  legs: {
    outseam?: number;
    inseam?: number;
    thighCircumference?: number;
    kneeCircumference?: number;
    kneeHeight?: number;
    calfCircumference?: number;
    ankleCircumference?: number;
  };
  feet: {
    footLength?: number;
    footWidth?: number;
    instepCircumference?: number;
  };
}

// Curtain measurements
export interface CurtainMeasurements {
  dimensions: {
    width?: number;
    height?: number;
    dropLength?: number;
  };
  details: {
    headerType?: number;
    hemAllowance?: number;
    sideHemAllowance?: number;
    fullness?: number;
    numberOfPanels?: number;
  };
  hardware: {
    rodWidth?: number;
    rodHeight?: number;
    bracketProjection?: number;
  };
}

// Other/Generic measurements
export interface OtherMeasurements {
  general: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    circumference?: number;
    diameter?: number;
  };
  custom: {
    measurement1?: number;
    measurement2?: number;
    measurement3?: number;
    measurement4?: number;
    measurement5?: number;
  };
}

// Union type for all measurements
export type FullBodyMeasurements = ClothesMeasurements | CurtainMeasurements | OtherMeasurements;

// Type guards
export function isClothesMeasurements(m: FullBodyMeasurements): m is ClothesMeasurements {
  return 'headAndNeck' in m || 'upperTorso' in m || 'arms' in m;
}

export function isCurtainMeasurements(m: FullBodyMeasurements): m is CurtainMeasurements {
  return 'dimensions' in m || 'hardware' in m;
}

export function isOtherMeasurements(m: FullBodyMeasurements): m is OtherMeasurements {
  return 'general' in m || 'custom' in m;
}
