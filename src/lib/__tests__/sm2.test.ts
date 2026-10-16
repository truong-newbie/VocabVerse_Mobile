import {
  applySm2,
  nextDueAt,
  qualityFor,
  SM2_DEFAULT,
  SM2_MAPPING,
  SM2_MIN_EASE,
} from '@/lib/sm2';

describe('applySm2', () => {
  it('first "Good" reviews on a new card: reps=1, interval=1 day, ease preserved', () => {
    const r = applySm2(SM2_DEFAULT, 'GOOD');
    expect(r.repetitions).toBe(1);
    expect(r.intervalDays).toBe(1);
    expect(r.easeFactor).toBeCloseTo(2.5, 5);
  });

  it('second "Good" jumps the interval to 6 days', () => {
    const r1 = applySm2(SM2_DEFAULT, 'GOOD');
    const r2 = applySm2(r1, 'GOOD');
    expect(r2.repetitions).toBe(2);
    expect(r2.intervalDays).toBe(6);
  });

  it('third "Good" multiplies the previous interval by ease factor', () => {
    let s = SM2_DEFAULT;
    s = applySm2(s, 'GOOD');
    s = applySm2(s, 'GOOD');
    const r = applySm2(s, 'GOOD');
    expect(r.repetitions).toBe(3);
    // interval was 6, ease stays close to 2.5 -> ~15 days
    expect(r.intervalDays).toBe(15);
  });

  it('"Easy" increases ease factor; "Hard" decreases it', () => {
    const easy = applySm2(SM2_DEFAULT, 'EASY');
    const hard = applySm2(SM2_DEFAULT, 'HARD');
    expect(easy.easeFactor).toBeGreaterThan(SM2_DEFAULT.easeFactor);
    expect(hard.easeFactor).toBeLessThan(SM2_DEFAULT.easeFactor);
  });

  it('"Again" resets repetitions to 0 and re-shows the card within a day', () => {
    let s = applySm2(applySm2(applySm2(SM2_DEFAULT, 'GOOD'), 'GOOD'), 'GOOD');
    expect(s.repetitions).toBe(3);
    const r = applySm2(s, 'AGAIN');
    expect(r.repetitions).toBe(0);
    expect(r.intervalDays).toBe(1);
  });

  it('ease factor never drops below 1.3', () => {
    let s = SM2_DEFAULT;
    for (let i = 0; i < 50; i++) s = applySm2(s, 0);
    expect(s.easeFactor).toBeGreaterThanOrEqual(SM2_MIN_EASE);
    expect(s.easeFactor).toBeCloseTo(SM2_MIN_EASE, 5);
  });

  it('numeric quality is accepted', () => {
    const r = applySm2(SM2_DEFAULT, 4);
    expect(r.repetitions).toBe(1);
  });

  it('rejects out-of-range quality', () => {
    expect(() => applySm2(SM2_DEFAULT, 6)).toThrow();
    expect(() => applySm2(SM2_DEFAULT, -1)).toThrow();
  });

  it('long streak with all "Good" produces a comfortably large interval', () => {
    let s = SM2_DEFAULT;
    for (let i = 0; i < 6; i++) s = applySm2(s, 'GOOD');
    expect(s.intervalDays).toBeGreaterThan(30);
  });
});

describe('nextDueAt', () => {
  it('adds days in milliseconds from `now`', () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const next = nextDueAt(7, now);
    expect(next).toBe('2025-01-08T00:00:00.000Z');
  });
});

describe('qualityFor', () => {
  it('mirrors SM2_MAPPING', () => {
    expect(qualityFor('AGAIN')).toBe(SM2_MAPPING.AGAIN);
    expect(qualityFor('HARD')).toBe(SM2_MAPPING.HARD);
    expect(qualityFor('GOOD')).toBe(SM2_MAPPING.GOOD);
    expect(qualityFor('EASY')).toBe(SM2_MAPPING.EASY);
  });
});
