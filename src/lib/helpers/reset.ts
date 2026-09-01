/**
 * Date of the next Wednesday 6am ET weekly reset.
 */
export function nextWednesdayReset(): Date {
  const ET = 5 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const nowET = nowMs - ET;

  const d = new Date(nowET);

  const daysUntil = (3 - d.getUTCDay() + 7) % 7 || 7;

  const midnightET =
    nowET +
    daysUntil * 86_400_000 -
    (d.getUTCHours() * 3_600_000 +
      d.getUTCMinutes() * 60_000 +
      d.getUTCSeconds() * 1_000 +
      d.getUTCMilliseconds());

  return new Date(midnightET + 6 * 3_600_000 + ET);
}

/** "4d 12h 05m" style countdown to the given date. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0m";

  const minutes = Math.floor(ms / 60_000) % 60;
  const hours = Math.floor(ms / 3_600_000) % 24;
  const days = Math.floor(ms / 86_400_000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
