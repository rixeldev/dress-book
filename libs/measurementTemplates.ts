import type { FullBodyMeasurements } from "@/interfaces/FullBodyMeasurements"

export const emptyClothesMeasurements: FullBodyMeasurements = {
  headAndNeck: { headCircumference: undefined, neckCircumference: undefined, neckHeight: undefined },
  upperTorso: {
    shoulderWidth: undefined,
    chestWidth: undefined,
    shoulderLength: undefined,
    bustCircumference: undefined,
    underbustCircumference: undefined,
    bustSpan: undefined,
    bustHeight: undefined,
  },
  midTorso: {
    waistCircumference: undefined,
    frontWaistLength: undefined,
    backWaistLength: undefined,
    sideSeamLength: undefined,
  },
  arms: {
    armholeCircumference: undefined,
    sleeveLength: undefined,
    elbowLength: undefined,
    bicepCircumference: undefined,
    elbowCircumference: undefined,
    wristCircumference: undefined,
    handCircumference: undefined,
  },
  hipsAndPelvis: {
    highHipCircumference: undefined,
    lowHipCircumference: undefined,
    hipHeight: undefined,
    totalCrotchLength: undefined,
    seatedCrotchDepth: undefined,
  },
  legs: {
    outseam: undefined,
    inseam: undefined,
    thighCircumference: undefined,
    kneeCircumference: undefined,
    kneeHeight: undefined,
    calfCircumference: undefined,
    ankleCircumference: undefined,
  },
  feet: {
    footLength: undefined,
    footWidth: undefined,
    instepCircumference: undefined,
  },
} as FullBodyMeasurements

export const emptyCurtainMeasurements: FullBodyMeasurements = {
  dimensions: { width: undefined, height: undefined, dropLength: undefined },
  details: {
    headerType: undefined,
    hemAllowance: undefined,
    sideHemAllowance: undefined,
    fullness: undefined,
    numberOfPanels: undefined,
  },
  hardware: { rodWidth: undefined, rodHeight: undefined, bracketProjection: undefined },
} as FullBodyMeasurements

export const emptyOtherMeasurements: FullBodyMeasurements = {
  general: {
    length: undefined,
    width: undefined,
    height: undefined,
    depth: undefined,
    circumference: undefined,
    diameter: undefined,
  },
  custom: {
    measurement1: undefined,
    measurement2: undefined,
    measurement3: undefined,
    measurement4: undefined,
    measurement5: undefined,
  },
} as FullBodyMeasurements

export function getEmptyMeasurements(type: "Clothes" | "Curtains" | "Others"): FullBodyMeasurements {
  switch (type) {
    case "Clothes":
      return structuredClone(emptyClothesMeasurements)
    case "Curtains":
      return structuredClone(emptyCurtainMeasurements)
    case "Others":
    default:
      return structuredClone(emptyOtherMeasurements)
  }
}

export function toCamelCaseLabel(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase()
}
