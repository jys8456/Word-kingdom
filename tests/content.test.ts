import { describe, expect, it } from 'vitest';
import theme from '../src/data/deck-of-cards.json';
import type { Theme } from '../src/types';
import { blankExample, buildPuzzle, starsFor, validateStage } from '../src/crossword';

const data = theme as Theme;

describe('Deck of Cards content', () => {
  it('has 10 stages with unique ids', () => {
    expect(data.stages).toHaveLength(10);
    expect(new Set(data.stages.map((s) => s.id)).size).toBe(10);
  });

  it('never repeats a word within the theme', () => {
    const words = data.stages.flatMap((s) => s.entries.map((e) => e.answer));
    expect(new Set(words).size).toBe(words.length);
  });

  for (const stage of data.stages) {
    it(`${stage.id} grid matches its entries`, () => {
      expect(validateStage(stage)).toEqual([]);
    });
    it(`${stage.id} fits a phone screen`, () => {
      const p = buildPuzzle(stage);
      expect(p.cols).toBeLessThanOrEqual(7);
      expect(p.rows).toBeLessThanOrEqual(8);
    });
  }
});

describe('crossword engine', () => {
  const stage = data.stages[0];

  it('numbers clues in reading order', () => {
    const p = buildPuzzle(stage);
    expect(p.entries.map((e) => [e.answer, e.number])).toEqual([
      ['CARD', 1],
      ['ACE', 2],
      ['DECK', 3],
    ]);
    expect(p.cells[0][0]?.number).toBe(1);
    expect(p.cells[0][1]?.entryIds).toEqual([0, 1]);
  });

  it('catches a letter that disagrees with the grid', () => {
    const broken = { ...stage, grid: ['CARD', '.X..', 'DECK'] };
    expect(validateStage(broken).join()).toMatch(/ACE/);
  });

  it('catches disconnected entries', () => {
    const broken = {
      ...stage,
      grid: ['ACE..', '.....', '..DOG'],
      entries: [
        { ...stage.entries[1], answer: 'ACE', row: 0, col: 0, dir: 'across' as const, example: 'an ace' },
        { ...stage.entries[1], answer: 'DOG', row: 2, col: 2, dir: 'across' as const, example: 'a dog' },
      ],
    };
    expect(validateStage(broken)).toContain('entries are not all connected');
  });

  it('scores stars from mistakes', () => {
    expect([0, 1, 2, 3, 9].map(starsFor)).toEqual([3, 2, 2, 1, 1]);
  });

  it('blanks the answer in the example sentence', () => {
    expect(blankExample({ answer: 'SHUFFLE', example: 'Please shuffle the cards before we play.' })).toBe(
      'Please _______ the cards before we play.',
    );
  });
});
