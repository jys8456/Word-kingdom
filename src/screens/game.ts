import type { Route } from '../main';
import type { Theme } from '../types';
import { h } from '../dom';
import { blankExample, buildPuzzle, starsFor, type PuzzleEntry } from '../crossword';
import { speak } from '../speech';
import { getFlag, logEvent, markWordsSeen, recordWrongWord, saveStageResult, setFlag } from '../storage';

interface Tile {
  id: number;
  letter: string;
  decoy: boolean;
  used: boolean;
}

const DECOY_POOL = 'AEIOURSTLNDCMPBGHK';
const key = (r: number, c: number) => `${r},${c}`;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function renderGame(root: HTMLElement, theme: Theme, index: number, go: (r: Route) => void): () => void {
  const stage = theme.stages[index];
  const puzzle = buildPuzzle(stage);
  const startedAt = Date.now();

  // ---- game state ----
  const locked = new Set<string>(); // cells whose correct letter is fixed
  const solved = new Set<number>(); // entry indexes
  let pending: Array<{ cell: string; tileId: number }> = [];
  let tiles: Tile[] = [];
  let active = 0;
  let mistakes = 0;
  let hints = 0;
  let combo = 0;
  let busy = false; // during wrong-answer shake or while a card is open
  let finished = false;
  const hintLevel = new Map<number, number>();
  const wrongWords = new Set<string>();
  const cardQueue: Array<{ entry: PuzzleEntry; combo: number }> = [];

  logEvent('stage_start', { stageId: stage.id });

  const screen = h('div', { class: 'screen game-screen' });
  root.append(screen);

  // ---- helpers ----
  const entry = () => puzzle.entries[active];
  const openCells = (e: PuzzleEntry) => e.cells.filter(([r, c]) => !locked.has(key(r, c)));
  const letterAt = (k: string) => {
    if (locked.has(k)) {
      const [r, c] = k.split(',').map(Number);
      return puzzle.cells[r][c]!.answer;
    }
    const p = pending.find((x) => x.cell === k);
    return p ? tiles.find((t) => t.id === p.tileId)!.letter : '';
  };

  function dealTiles(): void {
    const e = entry();
    const needed = openCells(e).map(([r, c]) => puzzle.cells[r][c]!.answer);
    const decoyCount = (hintLevel.get(active) ?? 0) >= 3 ? 0 : needed.length <= 3 ? 1 : 2;
    const decoys = shuffle([...DECOY_POOL].filter((l) => !needed.includes(l))).slice(0, decoyCount);
    let id = 0;
    tiles = shuffle([
      ...needed.map((letter) => ({ id: id++, letter, decoy: false, used: false })),
      ...decoys.map((letter) => ({ id: id++, letter, decoy: true, used: false })),
    ]);
    pending = [];
  }

  function select(i: number): void {
    if (busy || i < 0 || i === active) return;
    active = i;
    dealTiles();
    render();
  }

  function nextUnsolved(from: number, dir: 1 | -1 = 1): number {
    const n = puzzle.entries.length;
    for (let step = 1; step <= n; step++) {
      const i = (((from + dir * step) % n) + n) % n;
      if (!solved.has(i)) return i;
    }
    return -1;
  }

  /** Marks every entry whose cells are now all locked as solved and queues its card. */
  function collectSolved(): void {
    for (const e of puzzle.entries) {
      if (solved.has(e.index) || openCells(e).length) continue;
      solved.add(e.index);
      markWordsSeen([e.answer]);
      cardQueue.push({ entry: e, combo });
    }
  }

  function afterSolve(): void {
    if (solved.size === puzzle.entries.length) finished = true;
    else if (solved.has(active)) {
      active = nextUnsolved(active);
      dealTiles();
    } else dealTiles();
    render();
    showNextCard();
  }

  // ---- input ----
  function placeTile(tile: Tile): void {
    if (busy || tile.used) return;
    const target = openCells(entry()).find(([r, c]) => !pending.some((p) => p.cell === key(r, c)));
    if (!target) return;
    tile.used = true;
    pending.push({ cell: key(...target), tileId: tile.id });
    if (pending.length === openCells(entry()).length) check();
    else render();
  }

  function backspace(): void {
    if (busy) return;
    const last = pending.pop();
    if (!last) return;
    tiles.find((t) => t.id === last.tileId)!.used = false;
    render();
  }

  function check(): void {
    const e = entry();
    const correct = pending.every((p) => {
      const [r, c] = p.cell.split(',').map(Number);
      return letterAt(p.cell) === puzzle.cells[r][c]!.answer;
    });
    if (correct) {
      combo++;
      logEvent('word_correct', { stageId: stage.id, word: e.answer, combo });
      pending.forEach((p) => locked.add(p.cell));
      pending = [];
      collectSolved();
      afterSolve();
      return;
    }
    mistakes++;
    combo = 0;
    wrongWords.add(e.answer);
    recordWrongWord(e.answer, stage.id);
    logEvent('word_wrong', { stageId: stage.id, word: e.answer, attempt: pending.map((p) => letterAt(p.cell)).join('') });
    busy = true;
    render();
    screen.querySelector('.grid')?.classList.add('shake');
    setTimeout(() => {
      busy = false;
      pending = [];
      tiles.forEach((t) => (t.used = false));
      render();
    }, 650);
  }

  function useHint(): void {
    if (busy) return;
    const level = (hintLevel.get(active) ?? 0) + 1;
    if (level > 3) return;
    hintLevel.set(active, level);
    hints++;
    logEvent('hint', { stageId: stage.id, word: entry().answer, level });
    if (level === 1) {
      // Reveal the first letter still missing.
      const [r, c] = openCells(entry())[0];
      locked.add(key(r, c));
      collectSolved();
      if (solved.has(active)) {
        afterSolve();
        return;
      }
    }
    // New tiles: one fewer letter after a reveal, no decoys after level 3.
    if (level === 1 || level === 3) dealTiles();
    render();
  }

  // ---- word card ----
  function showNextCard(): void {
    const item = cardQueue.shift();
    if (!item) {
      busy = false;
      if (finished) finish();
      return;
    }
    busy = true;
    const { entry: e } = item;
    const parts = e.example.split(new RegExp(`(\\b${e.answer}\\b)`, 'i'));
    const close = () => {
      overlay.remove();
      showNextCard();
    };
    const overlay = h(
      'div',
      { class: 'overlay', onclick: (ev: Event) => ev.target === overlay && close() },
      h(
        'div',
        { class: 'word-card', role: 'dialog', 'aria-label': `${e.answer} 단어 카드` },
        item.combo >= 2 ? h('p', { class: 'combo' }, `콤보 ×${item.combo}`) : null,
        h(
          'div',
          { class: 'card-word' },
          h('b', {}, e.answer.toLowerCase()),
          h('button', { class: 'say-btn', 'aria-label': '발음 듣기', onclick: () => speak(e.answer, true) }, '🔊'),
        ),
        h('p', { class: 'card-ko' }, e.ko),
        h(
          'p',
          { class: 'card-example' },
          parts.map((part, i) => (i % 2 ? h('mark', {}, part) : part)),
          ' ',
          h('button', { class: 'say-btn small', 'aria-label': '예문 듣기', onclick: () => speak(e.example, true) }, '🔊'),
        ),
        h('button', { class: 'primary-btn', onclick: close, autofocus: true }, finished && !cardQueue.length ? '결과 보기' : '계속'),
      ),
    );
    screen.append(overlay);
    (overlay.querySelector('.primary-btn') as HTMLButtonElement).focus();
    speak(e.answer);
  }

  function finish(): void {
    const stars = starsFor(mistakes);
    saveStageResult(stage.id, { stars, completed: true });
    logEvent('stage_complete', { stageId: stage.id, stars, mistakes, hints, durationMs: Date.now() - startedAt });
    go({
      name: 'recap',
      recap: { index, stars, mistakes, hints, words: stage.entries, wrongWords: [...wrongWords] },
    });
  }

  // ---- exit / skip ----
  function quit(): void {
    if (!finished) logEvent('stage_quit', { stageId: stage.id, solved: solved.size, total: puzzle.entries.length, durationMs: Date.now() - startedAt });
    go({ name: 'map' });
  }

  let skipArmed = false;
  let skipTimer = 0;
  function skip(btn: HTMLButtonElement): void {
    if (!skipArmed) {
      skipArmed = true;
      btn.textContent = '정말 건너뛸까요?';
      btn.classList.add('armed');
      skipTimer = window.setTimeout(() => {
        skipArmed = false;
        btn.textContent = '건너뛰기';
        btn.classList.remove('armed');
      }, 3000);
      return;
    }
    saveStageResult(stage.id, { stars: 0, completed: false, skipped: true });
    logEvent('stage_skip', { stageId: stage.id, solved: solved.size, total: puzzle.entries.length });
    go({ name: 'map' });
  }

  // ---- render ----
  function render(): void {
    const e = entry();
    const activeCells = new Set(e.cells.map(([r, c]) => key(r, c)));
    const cursor = openCells(e).find(([r, c]) => !pending.some((p) => p.cell === key(r, c)));
    const cursorKey = cursor ? key(...cursor) : '';
    const level = hintLevel.get(active) ?? 0;
    const previewStars = starsFor(mistakes);

    const grid = h(
      'div',
      { class: 'grid', style: { '--cols': String(puzzle.cols), '--rows': String(puzzle.rows) } },
      puzzle.cells.flatMap((row) =>
        row.map((cell) => {
          if (!cell) return h('div', { class: 'cell blank', 'aria-hidden': 'true' });
          const k = key(cell.row, cell.col);
          const cls = ['cell'];
          if (locked.has(k)) cls.push('locked');
          if (activeCells.has(k)) cls.push('active');
          if (k === cursorKey && !busy) cls.push('cursor');
          return h(
            'button',
            {
              class: cls.join(' '),
              'aria-label': `${cell.row + 1}행 ${cell.col + 1}열`,
              onclick: () => {
                const ids = cell.entryIds;
                const other = ids.find((i) => i !== active && !solved.has(i));
                if (ids.includes(active) && other !== undefined) select(other);
                else if (!ids.includes(active)) select(ids.find((i) => !solved.has(i)) ?? ids[0]);
              },
            },
            cell.number ? h('span', { class: 'num' }, String(cell.number)) : null,
            h('span', { class: 'letter' }, letterAt(k)),
          );
        }),
      ),
    );

    const clue = h(
      'div',
      { class: `clue-bar${solved.has(active) ? ' solved' : ''}` },
      h('button', { class: 'icon-btn', 'aria-label': '이전 단어', onclick: () => select(nextUnsolved(active, -1)) }, '‹'),
      h(
        'div',
        { class: 'clue-text' },
        h('span', { class: 'clue-tag' }, `${e.number} ${e.dir === 'across' ? '가로' : '세로'} · ${e.answer.length}글자`),
        h('p', { class: 'clue-ko' }, e.ko),
        level >= 2 ? h('p', { class: 'clue-example' }, blankExample(e)) : null,
      ),
      h('button', { class: 'icon-btn', 'aria-label': '다음 단어', onclick: () => select(nextUnsolved(active)) }, '›'),
    );

    const hintLabels = ['힌트: 첫 글자', '힌트: 예문', '힌트: 가짜 글자 빼기', '힌트 모두 사용'];
    const tileRow = h(
      'div',
      { class: 'tiles' },
      tiles.map((t) =>
        h('button', { class: `tile${t.used ? ' used' : ''}`, disabled: t.used || busy, onclick: () => placeTile(t) }, t.letter),
      ),
    );

    const skipBtn = h('button', { class: 'text-btn' }, '건너뛰기') as HTMLButtonElement;
    skipBtn.addEventListener('click', () => skip(skipBtn));

    screen.replaceChildren(
      h(
        'header',
        { class: 'game-header' },
        h('button', { class: 'icon-btn', 'aria-label': '나가기', onclick: quit }, '✕'),
        h(
          'div',
          { class: 'game-title' },
          h('b', {}, `${index + 1}. ${stage.title}`),
          h('span', { class: 'game-progress' }, `${solved.size}/${puzzle.entries.length} 단어`),
        ),
        h(
          'div',
          { class: 'header-right' },
          h('span', { class: 'preview-stars', 'aria-label': `현재 별 ${previewStars}개` }, '★'.repeat(previewStars) + '☆'.repeat(3 - previewStars)),
          skipBtn,
        ),
      ),
      h('div', { class: 'board' }, grid),
      clue,
      h(
        'div',
        { class: 'input-area' },
        tileRow,
        h(
          'div',
          { class: 'controls' },
          h('button', { class: 'secondary-btn', disabled: level >= 3 || busy, onclick: useHint }, `💡 ${hintLabels[level]}`),
          h('button', { class: 'secondary-btn', 'aria-label': '지우기', disabled: !pending.length || busy, onclick: backspace }, '⌫'),
        ),
      ),
      ...[...screen.querySelectorAll('.overlay')],
    );
    if (skipArmed) {
      skipBtn.textContent = '정말 건너뛸까요?';
      skipBtn.classList.add('armed');
    }
  }

  // ---- keyboard (desktop convenience) ----
  function onKey(ev: KeyboardEvent): void {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (/^[a-z]$/i.test(ev.key)) {
      const t = tiles.find((x) => !x.used && x.letter === ev.key.toUpperCase());
      if (t) placeTile(t);
    } else if (ev.key === 'Backspace') {
      ev.preventDefault();
      backspace();
    }
  }
  document.addEventListener('keydown', onKey);

  // ---- start ----
  dealTiles();
  render();
  if (!getFlag('tutorial:crossword')) showTutorial();

  function showTutorial(): void {
    busy = true;
    const overlay = h(
      'div',
      { class: 'overlay' },
      h(
        'div',
        { class: 'word-card tutorial' },
        h('h2', {}, '미니 크로스워드'),
        h(
          'ol',
          {},
          h('li', {}, '파란 줄이 지금 풀 단어예요. ', h('b', {}, '한국어 뜻'), '을 보고 영어 단어를 떠올려 보세요.'),
          h('li', {}, '아래 ', h('b', {}, '글자 타일'), '을 순서대로 누르면 칸이 채워져요. 가짜 글자도 섞여 있어요!'),
          h('li', {}, '틀리면 별이 줄어요. 막히면 ', h('b', {}, '💡 힌트'), '는 언제나 무료예요.'),
          h('li', {}, '다른 칸을 누르면 다른 단어로 바꿀 수 있어요.'),
        ),
        h(
          'button',
          {
            class: 'primary-btn',
            onclick: () => {
              setFlag('tutorial:crossword', true);
              overlay.remove();
              busy = false;
              render();
            },
          },
          '시작하기',
        ),
      ),
    );
    screen.append(overlay);
  }

  return () => {
    document.removeEventListener('keydown', onKey);
    clearTimeout(skipTimer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  };
}
