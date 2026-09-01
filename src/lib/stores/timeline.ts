import { derived } from "svelte/store";
import { persisted } from "./persistence";

export interface TimelineItem {
  id: string;
  name: string;
  cost: number;
  completed: boolean;
  priority: number;
}

export const timelineStore = persisted<TimelineItem[]>(
  "la-timeline",
  []
);

export const timelineCostStore = derived(
  timelineStore,
  ($timeline) => $timeline
    .filter((x) => !x.completed)
    .reduce((sum, item) => sum + item.cost, 0)
);
