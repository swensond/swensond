import { persisted } from "./persistence";

export interface Settings {
  currencyFormat: string;
  showCompletedGoals: boolean;
}

export const settingsStore = persisted<Settings>(
  "la-settings",
  { currencyFormat: "en-US", showCompletedGoals: true }
);
