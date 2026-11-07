import type { Route } from '../main';
import type { Entry, Theme } from '../types';
import { h } from '../dom';
import { speak } from '../speech';
import { logEvent } from '../storage';

export interface RecapData {
  index: number;
  stars: number;
  mistakes: number;
  hints: number;
  words: Entry[];
  wrongWords: string[];
}

export function renderRecap(root: HTMLElement, theme: Theme, recap: RecapData, go: (r: Route) => void): void {
  const stage = theme.stages[recap.index];
  const hasNext = recap.index + 1 < theme.stages.length;
  const wrong = new Set(recap.wrongWords);

  const words = recap.words.map((w) =>
    h(
      'li',
      { class: `recap-word${wrong.has(w.answer) ? ' was-wrong' : ''}` },
      h('button', { class: 'say-btn', 'aria-label': `${w.answer} 발음 듣기`, onclick: () => speak(w.answer, true) }, '🔊'),
      h('div', {}, h('b', {}, w.answer.toLowerCase()), h('span', {}, w.ko)),
      wrong.has(w.answer) ? h('span', { class: 'tag' }, '복습') : null,
    ),
  );

  root.append(
    h(
      'div',
      { class: 'screen recap-screen' },
      h('p', { class: 'eyebrow' }, `STAGE ${recap.index + 1} 클리어`),
      h('h1', {}, stage.title),
      h(
        'div',
        { class: 'big-stars', 'aria-label': `별 ${recap.stars}개` },
        [0, 1, 2].map((i) => h('span', { class: i < recap.stars ? 'on' : '', style: { '--d': `${i * 0.15}s` } }, '★')),
      ),
      h('p', { class: 'recap-meta' }, `실수 ${recap.mistakes}번 · 힌트 ${recap.hints}번`),
      h('h2', {}, '이번 판 단어'),
      h('ul', { class: 'recap-list' }, words),
      h(
        'div',
        { class: 'recap-actions' },
        hasNext
          ? h(
              'button',
              {
                class: 'primary-btn',
                onclick: () => {
                  logEvent('next_stage', { stageId: theme.stages[recap.index + 1].id, from: stage.id });
                  go({ name: 'game', index: recap.index + 1 });
                },
              },
              '다음 스테이지 ▶',
            )
          : h('p', { class: 'theme-done' }, '🎉 이 테마의 모든 스테이지를 깼어요!'),
        h('button', { class: 'secondary-btn', onclick: () => go({ name: 'map' }) }, '지도로'),
      ),
    ),
  );
}
