export type GraphicsQuality = "low" | "medium" | "high";

export const QUALITY_DPR: Record<GraphicsQuality, number> = {
  low: 1,
  medium: 1.25,
  high: 1.5,
};

export function lowerQuality(quality: GraphicsQuality): GraphicsQuality {
  return quality === "high" ? "medium" : "low";
}

export function raiseQuality(quality: GraphicsQuality): GraphicsQuality {
  return quality === "low" ? "medium" : "high";
}
