import {
  formatDate,
  formatDateTime,
  formatDurationMs,
  formatNumberVN,
  formatPercent,
  formatTimeAgo,
  pluralizeVN,
} from '@/lib/format';

describe('format helpers', () => {
  it('formatDate returns — for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  it('formatDate renders vi-VN day-month-year', () => {
    const out = formatDate(new Date('2025-01-09T00:00:00Z'));
    expect(out).toMatch(/09\/01\/2025/);
  });

  it('formatDateTime includes time', () => {
    const out = formatDateTime(new Date('2025-01-09T15:30:00Z'));
    expect(out).toMatch(/15:30/);
  });

  it('formatTimeAgo returns Vừa xong for sub-minute deltas', () => {
    const out = formatTimeAgo(new Date(Date.now() - 10_000));
    expect(out).toBe('Vừa xong');
  });

  it('formatTimeAgo returns minutes for sub-hour deltas', () => {
    const out = formatTimeAgo(new Date(Date.now() - 5 * 60_000));
    expect(out).toBe('5 phút trước');
  });

  it('formatDurationMs formats mm:ss with zero-padded seconds', () => {
    expect(formatDurationMs(0)).toBe('0:00');
    expect(formatDurationMs(65_000)).toBe('1:05');
    expect(formatDurationMs(3_600_000)).toBe('60:00');
    expect(formatDurationMs(null)).toBe('—');
  });

  it('formatPercent multiplies by 100', () => {
    expect(formatPercent(0.5)).toBe('50%');
    expect(formatPercent(0.123, 1)).toBe('12.3%');
  });

  it('formatNumberVN uses vi-VN grouping', () => {
    expect(formatNumberVN(1234567)).toBe('1.234.567');
  });

  it('pluralizeVN handles singular and plural', () => {
    expect(pluralizeVN(1, 'từ')).toBe('1 từ');
    expect(pluralizeVN(5, 'từ')).toBe('5 từ');
    expect(pluralizeVN(5, 'từ', 'từ vựng')).toBe('5 từ vựng');
  });
});
