import type { Route } from '../main';
import type { Theme } from '../types';
import { h } from '../dom';
import { exportData, isUnlocked, loadProgress, loadSeenWords } from '../storage';
import { isMuted, setMuted } from '../speech';

export function renderMap(root: HTMLElement, theme: Theme, go: (r: Route) => void): void {
  const progress = loadProgress();
  const ids = theme.stages.map((s) => s.id);
  const totalStars = ids.reduce((sum, id) => sum + (progress[id]?.stars ?? 0), 0);
  const totalWords = theme.stages.reduce((n, s) => n + s.entries.length, 0);
  const seen = loadSeenWords().length;
  // The "current" stage is the first unlocked one that hasn't been cleared.
  const current = ids.findIndex((id, i) => isUnlocked(ids, i, progress) && !progress[id]?.completed);

  const soundBtn = h('button', { class: 'icon-btn', 'aria-label': '자동 발음 켜기/끄기' }, isMuted() ? '🔇' : '🔊');
  soundBtn.addEventListener('click', () => {
    setMuted(!isMuted());
    soundBtn.textContent = isMuted() ? '🔇' : '🔊';
  });

  const nodes = theme.stages.map((stage, i) => {
    const result = progress[stage.id];
    const open = isUnlocked(ids, i, progress);
    const state = !open ? 'locked' : result?.completed ? 'done' : i === current ? 'current' : 'open';
    return h(
      'li',
      { class: `stage-node ${state}`, style: { '--i': String(i) } },
      h(
        'button',
        {
          disabled: !open,
          'aria-label': `스테이지 ${i + 1} ${stage.title}${open ? '' : ' (잠김)'}`,
          onclick: () => go({ name: 'game', index: i }),
        },
        h('span', { class: 'node-num' }, open ? String(i + 1) : '🔒'),
      ),
      h(
        'div',
        { class: 'node-label' },
        h('span', { class: 'node-title' }, stage.title),
        result?.completed
          ? h('span', { class: 'node-stars' }, '★'.repeat(result.stars) + '☆'.repeat(3 - result.stars))
          : result?.skipped
            ? h('span', { class: 'node-stars muted' }, '건너뜀')
            : null,
      ),
    );
  });

  const exportBtn = h('button', { class: 'link-btn' }, '학습 기록 내보내기');
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: `word-kingdom-log-${Date.now()}.json` });
    document.body.append(a);
    a.click();
    a.remove();
  });

  root.append(
    h(
      'div',
      { class: 'screen map-screen' },
      h(
        'header',
        { class: 'map-header' },
        h('div', {}, h('p', { class: 'eyebrow' }, 'WORD KINGDOM'), h('h1', {}, theme.themeKo), h('p', { class: 'sub' }, theme.theme)),
        soundBtn,
      ),
      h(
        'div',
        { class: 'map-stats' },
        h('div', { class: 'stat' }, h('b', {}, `★ ${totalStars}`), h('span', {}, `/ ${ids.length * 3}`)),
        h('div', { class: 'stat' }, h('b', {}, `📖 ${seen}`), h('span', {}, `/ ${totalWords} 단어`)),
      ),
      h('ol', { class: 'stage-path' }, nodes),
      h('footer', { class: 'map-footer' }, exportBtn),
    ),
  );
  root.querySelector('.stage-node.current')?.scrollIntoView({ block: 'center' });
}
