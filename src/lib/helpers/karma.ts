import { karmaCosts } from "$lib/data/karma";


export function getTrackCosts(current: number, target: number) {
  return karmaCosts.filter((c) => c.from >= current && c.to <= target);
}

export function getTrackTotal(current: number, target: number) {
  return getTrackCosts(current, target).reduce((sum, c) => sum + c.gold, 0);
}
