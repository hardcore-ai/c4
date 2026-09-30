export function nowISO(): string {
  return new Date().toISOString();
}

export function minutesSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60));
}

export function hoursSince(isoDate: string): number {
  return Math.floor(minutesSince(isoDate) / 60);
}
