export type Direction = 'across' | 'down';

export interface Entry {
  answer: string;
  /** Korean meaning — this is the clue the player sees. */
  ko: string;
  /** Short English example sentence containing the answer. */
  example: string;
  row: number;
  col: number;
  dir: Direction;
}

export interface Stage {
  id: string;
  title: string;
  type: 'crossword' | 'wordsearch';
  /** Rows of the solved grid; '.' marks a blank square. */
  grid: string[];
  entries: Entry[];
}

export interface Theme {
  id: string;
  theme: string;
  themeKo: string;
  stages: Stage[];
}
