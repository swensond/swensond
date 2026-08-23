export function getWeeksRemaining(releaseDate: string) {
  const now = new Date();

  const release = new Date(releaseDate);

  const diff = release.getTime() - now.getTime();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
}
