import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

const listeners = new Set<() => void>();
let current = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;
let appStateSub: { remove: () => void } | null = null;
const INTERVAL_MS = 1000;

function tick() {
  current = Date.now();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    current = Date.now();
    timer = setInterval(tick, INTERVAL_MS);
    appStateSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') tick();
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      appStateSub?.remove();
      timer = null;
      appStateSub = null;
    }
  };
}

const getSnapshot = () => current;

/**
 * Returns the current time (ms), refreshed by ONE shared interval no matter how
 * many components use it (fixed at 1000ms; the argument documents intent). Refreshes
 * immediately when the app returns to the foreground.
 */
export function useNow(_ms: number = INTERVAL_MS): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
