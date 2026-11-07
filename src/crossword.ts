import type { Entry, Stage } from './types';

export interface Cell {
  row: number;
  col: number;
  answer: string;
  /** Clue number printed in the corner, if an entry starts here. */
  number?: number;
  /** Indexes into Puzzle.entries of the entries passing through this cell. */
  entryIds: number[];
}

export interface PuzzleEntry extends Entry {
  index: number;
  number: number;
  cells: Array<[number, number]>;
}

export interface Puzzle {
  rows: number;
  cols: number;
  cells: (Cell | null)[][];
  entries: PuzzleEntry[];
}

export function entryCells(e: Pick<Entry, 'row' | 'col' | 'dir' | 'answer'>): Array<[number, number]> {
  const dr = e.dir === 'down' ? 1 : 0;
  const dc = e.dir === 'across' ? 1 : 0;
  return Array.from({ length: e.answer.length }, (_, i) => [e.row + dr * i, e.col + dc * i]);
}

export function buildPuzzle(stage: Stage): Puzzle {
  const rows = stage.grid.length;
  const cols = Math.max(...stage.grid.map((r) => r.length));
  const cells: (Cell | null)[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const ch = stage.grid[r][c];
      return ch && ch !== '.' ? { row: r, col: c, answer: ch, entryIds: [] } : null;
    }),
  );

  // Standard crossword numbering: reading order over cells where any entry starts.
  const starts = [...new Set(stage.entries.map((e) => e.row * cols + e.col))].sort((a, b) => a - b);
  const numberAt = new Map(starts.map((pos, i) => [pos, i + 1]));

  const entries: PuzzleEntry[] = stage.entries
    .map((e) => ({ ...e, number: numberAt.get(e.row * cols + e.col)!, cells: entryCells(e) }))
    .sort((a, b) => a.number - b.number || (a.dir === 'across' ? -1 : 1))
    .map((e, index) => ({ ...e, index }));

  for (const e of entries) {
    const first = cells[e.row]?.[e.col];
    if (first) first.number = e.number;
    for (const [r, c] of e.cells) cells[r]?.[c]?.entryIds.push(e.index);
  }
  return { rows, cols, cells, entries };
}

/** Returns a list of problems with a hand-authored stage; empty means valid. */
export function validateStage(stage: Stage): string[] {
  const errors: string[] = [];
  const rows = stage.grid.length;
  const cols = Math.max(...stage.grid.map((r) => r.length));
  const covered = new Set<string>();
  for (const e of stage.entries) {
    if (!/^[A-Z]+$/.test(e.answer)) errors.push(`${e.answer}: answer must be A-Z`);
    if (!e.ko.trim()) errors.push(`${e.answer}: missing ko`);
    if (!new RegExp(`\\b${e.answer}\\b`, 'i').test(e.example)) errors.push(`${e.answer}: example must contain the word`);
    entryCells(e).forEach(([r, c], i) => {
      covered.add(`${r},${c}`);
      const ch = stage.grid[r]?.[c];
      if (ch !== e.answer[i]) errors.push(`${e.answer}: letter ${i} expects ${e.answer[i]} at ${r},${c} but grid has ${ch ?? 'nothing'}`);
    });
    const [lr, lc] = entryCells(e)[e.answer.length - 1];
    const dr = e.dir === 'down' ? 1 : 0;
    const dc = 1 - dr;
    const before = stage.grid[e.row - dr]?.[e.col - dc];
    const after = stage.grid[lr + dr]?.[lc + dc];
    if ((before && before !== '.') || (after && after !== '.')) errors.push(`${e.answer}: word runs into another letter`);
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const ch = stage.grid[r][c];
      if (ch && ch !== '.' && !covered.has(`${r},${c}`)) errors.push(`grid letter ${ch} at ${r},${c} belongs to no entry`);
    }
  // All entries must form one connected puzzle.
  if (stage.entries.length > 1) {
    const seen = new Set([0]);
    const queue = [0];
    const cellSets = stage.entries.map((e) => new Set(entryCells(e).map(([r, c]) => `${r},${c}`)));
    while (queue.length) {
      const i = queue.pop()!;
      cellSets.forEach((s, j) => {
        if (!seen.has(j) && [...s].some((k) => cellSets[i].has(k))) {
          seen.add(j);
          queue.push(j);
        }
      });
    }
    if (seen.size !== stage.entries.length) errors.push('entries are not all connected');
  }
  return errors;
}

/** 0 mistakes → 3 stars, 1–2 → 2 stars, more → 1 star. */
export function starsFor(mistakes: number): number {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}

/** Example sentence with the answer blanked out, for the hint. */
export function blankExample(e: Pick<Entry, 'answer' | 'example'>): string {
  return e.example.replace(new RegExp(`\\b${e.answer}\\b`, 'gi'), '_'.repeat(e.answer.length));
}
