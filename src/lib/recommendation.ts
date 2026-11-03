import type { Recommendation } from "@/types/event";

export function recommendationLabel(recommendation: Recommendation | undefined): string | null {
  if (recommendation === "highlyRecommend") return "Highly Recommend";
  if (recommendation === "recommend") return "Recommend";
  return null;
}
