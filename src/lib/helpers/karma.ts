import { karmaCosts } from "$lib/data/karma";

export function calculateKarmaCost(current: number, target: number) {
  return karmaCosts
    .filter((step) => step.from >= current && step.to <= target)
    .reduce((sum, step) => sum + step.gold, 0);
}
