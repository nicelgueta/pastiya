export const DAY_MS = 24 * 60 * 60 * 1000;

export type DoseState = 'never' | 'blocked' | 'ok';

export interface DoseStatus {
  lastTakenAt: number | null;
  elapsedMs: number | null;
  state: DoseState;
  /** Timestamp from which the next dose is allowed; null if never taken. */
  availableAt: number | null;
}

export interface DoseRules {
  minIntervalMs: number;
  maxDosesPer24h: number;
}

/**
 * Computes the state of a medication from its own logs (all of them; filter by
 * medicationId before calling). Always derived from timestamps.
 */
export function computeDoseStatus(
  takenTimes: readonly number[],
  rules: DoseRules,
  now: number,
): DoseStatus {
  if (takenTimes.length === 0) {
    return { lastTakenAt: null, elapsedMs: null, state: 'never', availableAt: null };
  }
  const sorted = [...takenTimes].sort((a, b) => a - b);
  const lastTakenAt = sorted[sorted.length - 1];
  const intervalOkAt = lastTakenAt + rules.minIntervalMs;

  const recent = sorted.filter((t) => t > now - DAY_MS);
  let capOkAt = -Infinity;
  if (recent.length >= rules.maxDosesPer24h) {
    const anchor = recent[recent.length - rules.maxDosesPer24h];
    capOkAt = anchor + DAY_MS;
  }

  const availableAt = Math.max(intervalOkAt, capOkAt);
  return {
    lastTakenAt,
    elapsedMs: Math.max(0, now - lastTakenAt),
    state: now < availableAt ? 'blocked' : 'ok',
    availableAt,
  };
}
