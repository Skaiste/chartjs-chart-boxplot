import { describe, expect, test } from 'vitest';
import { asRaincloudStats, defaultRaincloudOptions, raincloudStats } from './data';

describe('raincloud data', () => {
  test('computes raincloud stats from arrays', () => {
    const stats = raincloudStats([1, 2, 3, 4, 5, 11], defaultRaincloudOptions)!;

    expect(stats).toBeDefined();
    expect(stats.coords.length).toBeGreaterThan(1);
    expect(stats.maxEstimate).toBeGreaterThan(0);
    expect(stats.items).toEqual([1, 2, 3, 4, 5, 11]);
    expect(stats.outliers).toEqual([11]);
    expect(stats.whiskerMin).toBe(1);
    expect(stats.whiskerMax).toBe(5);
  });

  test('accepts precomputed raincloud objects', () => {
    const input = {
      min: 1,
      q1: 2,
      median: 3,
      q3: 4,
      max: 5,
      mean: 3,
      whiskerMin: 1,
      whiskerMax: 5,
      items: [1, 2, 3, 4, 5],
      outliers: [],
      maxEstimate: 10,
      coords: [
        { v: 1, estimate: 0 },
        { v: 3, estimate: 10 },
        { v: 5, estimate: 0 },
      ],
    };

    expect(asRaincloudStats(input, defaultRaincloudOptions)).toBe(input);
  });

  test('computes missing whiskers from precomputed items', () => {
    const input = {
      min: 1,
      q1: 2,
      median: 3,
      q3: 4,
      max: 11,
      mean: 4.33,
      items: [1, 2, 3, 4, 5, 11],
      outliers: [11],
      maxEstimate: 10,
      coords: [
        { v: 1, estimate: 0 },
        { v: 3, estimate: 10 },
        { v: 11, estimate: 0 },
      ],
    };

    const stats = asRaincloudStats(input, defaultRaincloudOptions)!;

    expect(stats.whiskerMin).toBe(1);
    expect(stats.whiskerMax).toBe(5);
  });

  test('defaults side to before when omitted', () => {
    expect(defaultRaincloudOptions.side).toBe('before');
  });
});
