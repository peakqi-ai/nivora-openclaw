export type MaterialType = "pla" | "abs" | "polyjet" | "sla" | "sls" | "slm";

export interface MaterialInfo {
  label: string;
  pricePerCm3: number; // NT$ per cm³
  roughness: number;
  metalness: number;
  color: string; // display color for UI dot
  description: string;
}

export const MATERIALS: Record<MaterialType, MaterialInfo> = {
  pla: {
    label: "PLA",
    pricePerCm3: 8,
    roughness: 0.7,
    metalness: 0,
    color: "#4CAF50",
    description: "經濟實惠",
  },
  abs: {
    label: "ABS",
    pricePerCm3: 10,
    roughness: 0.5,
    metalness: 0,
    color: "#2196F3",
    description: "工程塑料",
  },
  polyjet: {
    label: "PolyJet",
    pricePerCm3: 20,
    roughness: 0.1,
    metalness: 0,
    color: "#FF9800",
    description: "全彩高精",
  },
  sla: {
    label: "SLA",
    pricePerCm3: 16,
    roughness: 0.15,
    metalness: 0,
    color: "#9C27B0",
    description: "光固化",
  },
  sls: {
    label: "SLS",
    pricePerCm3: 24,
    roughness: 0.6,
    metalness: 0,
    color: "#FF5722",
    description: "工業級",
  },
  slm: {
    label: "SLM",
    pricePerCm3: 64,
    roughness: 0.2,
    metalness: 0.95,
    color: "#607D8B",
    description: "金屬列印",
  },
};

export const SERVICE_FEE = 200; // NT$
export const PROCESS_COST_RATIO = 0.6; // 60% of material cost

export interface PriceBreakdown {
  materialCost: number;
  processCost: number;
  serviceFee: number;
  total: number;
}

/**
 * Calculate the price breakdown for a given material and size.
 * @param material - Material type key
 * @param sizeMm - Size in millimeters (longest edge)
 * @returns Price breakdown in NT$
 */
export function calculatePrice(
  material: MaterialType,
  sizeMm: number
): PriceBreakdown {
  const sizeM = sizeMm / 10; // convert mm to cm
  const volume = sizeM * sizeM * sizeM; // rough cubic volume in cm³
  const materialCost = Math.round(volume * MATERIALS[material].pricePerCm3);
  const processCost = Math.round(materialCost * PROCESS_COST_RATIO);
  const serviceFee = SERVICE_FEE;
  const total = materialCost + processCost + serviceFee;

  return { materialCost, processCost, serviceFee, total };
}

/**
 * Generate a unique order number.
 * Format: PF-YYYY-XXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `PF-${year}-${rand}`;
}

/**
 * Convert a total price (NT$ integer) to display string.
 */
export function formatPrice(amount: number): string {
  return `NT$ ${amount.toLocaleString()}`;
}
