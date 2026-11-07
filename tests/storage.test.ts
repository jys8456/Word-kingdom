import { beforeEach, describe, expect, it } from 'vitest';
import { isUnlocked, loadProgress, saveStageResult } from '../src/storage';

const mem = new Map<string, string>();
beforeEach(() => {
  mem.clear();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
  };
});

describe('progress', () => {
  const ids = ['a', 'b', 'c'];

  it('unlocks stages one at a time', () => {
    expect(isUnlocked(ids, 0, {})).toBe(true);
    expect(isUnlocked(ids, 1, {})).toBe(false);
    saveStageResult('a', { stars: 2, completed: true });
    expect(isUnlocked(ids, 1, loadProgress())).toBe(true);
    expect(isUnlocked(ids, 2, loadProgress())).toBe(false);
  });

  it('skipping unlocks the next stage without stars', () => {
    saveStageResult('a', { stars: 0, completed: false, skipped: true });
    const p = loadProgress();
    expect(isUnlocked(ids, 1, p)).toBe(true);
    expect(p.a.stars).toBe(0);
  });

  it('keeps the best star count across replays', () => {
    saveStageResult('a', { stars: 3, completed: true });
    saveStageResult('a', { stars: 1, completed: true });
    expect(loadProgress().a).toMatchObject({ stars: 3, completed: true, plays: 2 });
  });

  it('survives storage that throws', () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() => saveStageResult('a', { stars: 3, completed: true })).not.toThrow();
    expect(loadProgress()).toEqual({});
  });
});
