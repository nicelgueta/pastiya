import type { Unit } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** HH:MM:SS, or `1d 03:12:45` once 24h or more has passed. */
export function formatElapsed(ms: number | null): string {
  if (ms === null) return '--:--:--';
  const total = Math.floor(Math.max(0, ms) / 1000);
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const hms = `${pad(h)}:${pad(m)}:${pad(s)}`;
  return days > 0 ? `${days}d ${hms}` : hms;
}

function splitMinutes(ms: number) {
  // Round up so we never say "available" earlier than we are.
  const totalMin = Math.max(1, Math.ceil(ms / 60000));
  return { h: Math.floor(totalMin / 60), m: totalMin % 60 };
}

/** Short form, e.g. "1h 20m", "45m", "2h". */
export function formatRemaining(ms: number): string {
  const { h, m } = splitMinutes(ms);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ');
}

/** Spoken form, e.g. "1 hour 20 minutes". */
export function formatRemainingSpoken(ms: number): string {
  const { h, m } = splitMinutes(ms);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
  return parts.join(' ');
}

export function formatAmount(amount: number): string {
  return String(Math.round(amount * 1000) / 1000);
}

const COUNT_UNITS: readonly Unit[] = ['tablet', 'capsule', 'drop', 'puff', 'unit'];

/** e.g. "500 mg", "1 tablet", "2 tablets". */
export function formatDosage(amount: number, unit: Unit): string {
  const plural = COUNT_UNITS.includes(unit) && amount !== 1 ? 's' : '';
  return `${formatAmount(amount)} ${unit}${plural}`;
}

/** Parses "1.5" or "1,5"; returns NaN when invalid. */
export function parseDecimal(text: string): number {
  const t = text.trim().replace(',', '.');
  if (t === '' || !/^\d*\.?\d+$|^\d+\.$/.test(t)) return NaN;
  return Number(t);
}

/** Parses a whole non-negative number; returns NaN when invalid. */
export function parseWhole(text: string): number {
  const t = text.trim();
  return /^\d+$/.test(t) ? Number(t) : NaN;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDayTitle(ts: number, now: number = Date.now()): string {
  const d = new Date(ts);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(new Date(now)) - startOf(d)) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
