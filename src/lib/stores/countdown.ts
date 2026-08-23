import { derived } from "svelte/store";
import { persisted } from "./persistence";

export const releaseDateStore = persisted<string>(
  "la-release-date",
  "",
);

export const weeksRemainingStore = derived(
  releaseDateStore,
  ($releaseDate) => {
    if (!$releaseDate) return 0;

    const now = new Date();

    const release = new Date($releaseDate);

    const diff = release.getTime() - now.getTime();

    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
  }
);
