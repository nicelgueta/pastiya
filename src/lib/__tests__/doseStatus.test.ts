import { computeDoseStatus, DAY_MS } from '../doseStatus';

const H = 3600_000;
const NOW = 1_800_000_000_000;
const rules = (hours: number, max: number) => ({ minIntervalMs: hours * H, maxDosesPer24h: max });

describe('computeDoseStatus', () => {
  it('never taken', () => {
    expect(computeDoseStatus([], rules(4, 3), NOW)).toEqual({
      lastTakenAt: null,
      elapsedMs: null,
      state: 'never',
      availableAt: null,
    });
  });

  it('blocked inside the interval', () => {
    const s = computeDoseStatus([NOW - 1 * H], rules(4, 10), NOW);
    expect(s.state).toBe('blocked');
    expect(s.availableAt).toBe(NOW + 3 * H);
    expect(s.elapsedMs).toBe(H);
    expect(s.lastTakenAt).toBe(NOW - H);
  });

  it('ok exactly at and after the interval', () => {
    expect(computeDoseStatus([NOW - 4 * H], rules(4, 10), NOW).state).toBe('ok');
    expect(computeDoseStatus([NOW - 5 * H], rules(4, 10), NOW).state).toBe('ok');
    expect(computeDoseStatus([NOW - 4 * H + 1], rules(4, 10), NOW).state).toBe('blocked');
  });

  it('is blocked by the cap even when the interval has passed', () => {
    const logs = [NOW - 10 * H, NOW - 8 * H, NOW - 6 * H];
    const s = computeDoseStatus(logs, rules(2, 3), NOW);
    expect(s.state).toBe('blocked');
    expect(s.availableAt).toBe(NOW - 10 * H + DAY_MS);
  });

  it('is ok below the cap', () => {
    const logs = [NOW - 10 * H, NOW - 8 * H];
    expect(computeDoseStatus(logs, rules(2, 3), NOW).state).toBe('ok');
  });

  it('cap expires once the anchor is older than 24h', () => {
    const logs = [NOW - 25 * H, NOW - 8 * H, NOW - 6 * H];
    const s = computeDoseStatus(logs, rules(2, 3), NOW);
    expect(s.state).toBe('ok');
  });

  it('cap expires exactly at anchor + 24h', () => {
    const anchor = NOW - DAY_MS;
    // anchor itself is not "> now - 24h", so it no longer counts
    const logs = [anchor, NOW - 8 * H, NOW - 6 * H];
    expect(computeDoseStatus(logs, rules(2, 3), NOW).state).toBe('ok');
    const justInside = computeDoseStatus([anchor + 1, NOW - 8 * H, NOW - 6 * H], rules(2, 3), NOW);
    expect(justInside.state).toBe('blocked');
    expect(justInside.availableAt).toBe(anchor + 1 + DAY_MS);
  });

  it('uses the first of the latest max doses as anchor', () => {
    const logs = [NOW - 20 * H, NOW - 15 * H, NOW - 9 * H, NOW - 3 * H];
    // max 2: recent has 4, anchor = recent[2] = 9h ago
    const s = computeDoseStatus(logs, rules(1, 2), NOW);
    expect(s.availableAt).toBe(NOW - 9 * H + DAY_MS);
    expect(s.state).toBe('blocked');
  });

  it('cap wins when it is later than the interval', () => {
    const logs = [NOW - 23 * H, NOW - 1 * H];
    const s = computeDoseStatus(logs, rules(2, 2), NOW);
    expect(s.availableAt).toBe(NOW - 23 * H + DAY_MS); // +1h from now
    expect(s.availableAt).toBeGreaterThan(NOW - H + 2 * H - 1);
    expect(s.availableAt).toBe(NOW + 1 * H);
  });

  it('interval wins when it is later than the cap', () => {
    const logs = [NOW - 23 * H, NOW - 1 * H];
    const s = computeDoseStatus(logs, rules(6, 2), NOW);
    expect(s.availableAt).toBe(NOW + 5 * H);
  });

  it('maxDoses = 1 means one dose per 24h', () => {
    const s = computeDoseStatus([NOW - 2 * H], rules(1, 1), NOW);
    expect(s.state).toBe('blocked');
    expect(s.availableAt).toBe(NOW - 2 * H + DAY_MS);
    expect(computeDoseStatus([NOW - 24 * H - 1], rules(1, 1), NOW).state).toBe('ok');
  });

  it('does not depend on log order', () => {
    const a = computeDoseStatus([NOW - 6 * H, NOW - 10 * H, NOW - 8 * H], rules(2, 3), NOW);
    const b = computeDoseStatus([NOW - 10 * H, NOW - 8 * H, NOW - 6 * H], rules(2, 3), NOW);
    expect(a).toEqual(b);
  });

  it('elapsed is never negative', () => {
    expect(computeDoseStatus([NOW + 1000], rules(1, 5), NOW).elapsedMs).toBe(0);
  });
});
