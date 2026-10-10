import {
  dayKey,
  formatAmount,
  formatDosage,
  formatElapsed,
  formatRemaining,
  formatRemainingSpoken,
  parseDecimal,
  parseWhole,
} from '../format';

describe('formatElapsed', () => {
  it('shows placeholder when null', () => expect(formatElapsed(null)).toBe('--:--:--'));
  it('formats zero', () => expect(formatElapsed(0)).toBe('00:00:00'));
  it('formats hms', () => expect(formatElapsed((3 * 3600 + 5 * 60 + 9) * 1000)).toBe('03:05:09'));
  it('floors partial seconds', () => expect(formatElapsed(59_999)).toBe('00:00:59'));
  it('stays HH:MM:SS just below 24h', () =>
    expect(formatElapsed(24 * 3600_000 - 1000)).toBe('23:59:59'));
  it('switches to days at 24h', () => expect(formatElapsed(24 * 3600_000)).toBe('1d 00:00:00'));
  it('formats days', () =>
    expect(formatElapsed((86400 + 3 * 3600 + 12 * 60 + 45) * 1000)).toBe('1d 03:12:45'));
  it('clamps negatives', () => expect(formatElapsed(-5000)).toBe('00:00:00'));
});

describe('remaining', () => {
  it('formats hours and minutes', () => {
    expect(formatRemaining(80 * 60_000)).toBe('1h 20m');
    expect(formatRemainingSpoken(80 * 60_000)).toBe('1 hour 20 minutes');
  });
  it('omits zero parts', () => {
    expect(formatRemaining(2 * 3600_000)).toBe('2h');
    expect(formatRemaining(45 * 60_000)).toBe('45m');
    expect(formatRemainingSpoken(2 * 3600_000)).toBe('2 hours');
    expect(formatRemainingSpoken(60_000)).toBe('1 minute');
  });
  it('rounds up and has a 1 minute floor', () => {
    expect(formatRemaining(1)).toBe('1m');
    expect(formatRemaining(61_000)).toBe('2m');
  });
});

describe('dosage', () => {
  it('trims float noise', () => expect(formatAmount(0.1 + 0.2)).toBe('0.3'));
  it('formats metric units', () => expect(formatDosage(500, 'mg')).toBe('500 mg'));
  it('pluralises count units', () => {
    expect(formatDosage(1, 'tablet')).toBe('1 tablet');
    expect(formatDosage(2, 'tablet')).toBe('2 tablets');
    expect(formatDosage(0.5, 'tablet')).toBe('0.5 tablets');
  });
});

describe('parsing', () => {
  it('parses decimals', () => {
    expect(parseDecimal('1.5')).toBe(1.5);
    expect(parseDecimal('1,5')).toBe(1.5);
    expect(parseDecimal('.5')).toBe(0.5);
    expect(parseDecimal(' 10 ')).toBe(10);
  });
  it('rejects invalid decimals', () => {
    expect(parseDecimal('')).toBeNaN();
    expect(parseDecimal('abc')).toBeNaN();
    expect(parseDecimal('1.2.3')).toBeNaN();
    expect(parseDecimal('-1')).toBeNaN();
  });
  it('parses whole numbers', () => {
    expect(parseWhole('12')).toBe(12);
    expect(parseWhole('1.5')).toBeNaN();
    expect(parseWhole('')).toBeNaN();
  });
});

describe('dayKey', () => {
  it('is stable per local day', () => {
    const a = new Date(2026, 0, 5, 1, 0).getTime();
    const b = new Date(2026, 0, 5, 23, 59).getTime();
    expect(dayKey(a)).toBe(dayKey(b));
    expect(dayKey(a)).toBe('2026-01-05');
  });
});
