// All persistence goes through here. localStorage can throw (private mode,
// blocked storage), so every access is guarded and the app works without it.

const PREFIX = 'wk:';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable — keep playing */
  }
}

// ---------- progress ----------

export interface StageResult {
  stars: number;
  completed: boolean;
  skipped?: boolean;
  plays: number;
}

export type Progress = Record<string, StageResult>;

export function loadProgress(): Progress {
  return read<Progress>('progress', {});
}

export function saveStageResult(stageId: string, result: { stars: number; completed: boolean; skipped?: boolean }): void {
  const progress = loadProgress();
  const prev = progress[stageId];
  progress[stageId] = {
    stars: Math.max(prev?.stars ?? 0, result.stars),
    completed: (prev?.completed ?? false) || result.completed,
    skipped: result.completed ? false : (prev?.skipped ?? false) || !!result.skipped,
    plays: (prev?.plays ?? 0) + 1,
  };
  write('progress', progress);
}

/** A stage is open if it is the first one, or the previous one was cleared or skipped. */
export function isUnlocked(stageIds: string[], index: number, progress: Progress): boolean {
  if (index === 0) return true;
  const prev = progress[stageIds[index - 1]];
  return !!prev && (prev.completed || !!prev.skipped);
}

// ---------- words the player got wrong (feeds the future review stage) ----------

export interface WrongWord {
  answer: string;
  stageId: string;
  count: number;
  lastWrongAt: number;
}

export function recordWrongWord(answer: string, stageId: string): void {
  const list = read<WrongWord[]>('wrong', []);
  const found = list.find((w) => w.answer === answer);
  if (found) {
    found.count++;
    found.lastWrongAt = Date.now();
  } else list.push({ answer, stageId, count: 1, lastWrongAt: Date.now() });
  write('wrong', list);
}

export function loadWrongWords(): WrongWord[] {
  return read<WrongWord[]>('wrong', []);
}

// ---------- word collection (도감) ----------

export function markWordsSeen(answers: string[]): void {
  const seen = new Set(read<string[]>('seen', []));
  answers.forEach((a) => seen.add(a));
  write('seen', [...seen]);
}

export function loadSeenWords(): string[] {
  return read<string[]>('seen', []);
}

// ---------- settings / flags ----------

export function getFlag(name: string): boolean {
  return read<boolean>('flag:' + name, false);
}

export function setFlag(name: string, value: boolean): void {
  write('flag:' + name, value);
}

// ---------- event log ----------

export type EventType =
  | 'session_start'
  | 'stage_start'
  | 'stage_quit'
  | 'stage_skip'
  | 'stage_complete'
  | 'next_stage'
  | 'hint'
  | 'word_correct'
  | 'word_wrong';

export interface LogEvent {
  t: number;
  type: EventType;
  [k: string]: unknown;
}

const MAX_EVENTS = 5000;

export function logEvent(type: EventType, data: Record<string, unknown> = {}): void {
  const events = read<LogEvent[]>('log', []);
  events.push({ t: Date.now(), type, ...data });
  write('log', events.slice(-MAX_EVENTS));
}

export function loadEvents(): LogEvent[] {
  return read<LogEvent[]>('log', []);
}

/** Records a visit; returns the number of whole days since the very first visit. */
export function recordVisit(): number {
  const now = Date.now();
  let first = read<number>('firstVisit', 0);
  if (!first) {
    first = now;
    write('firstVisit', first);
  }
  const day = Math.floor((now - first) / 86_400_000);
  logEvent('session_start', { day });
  return day;
}

export function exportData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      firstVisit: read<number>('firstVisit', 0),
      progress: loadProgress(),
      wrongWords: loadWrongWords(),
      seenWords: loadSeenWords(),
      events: loadEvents(),
    },
    null,
    2,
  );
}
