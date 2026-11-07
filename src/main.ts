import './style.css';
import theme from './data/deck-of-cards.json';
import type { Theme } from './types';
import { recordVisit } from './storage';
import { renderMap } from './screens/map';
import { renderGame } from './screens/game';
import { renderRecap, type RecapData } from './screens/recap';

const data = theme as Theme;
const app = document.getElementById('app')!;

export type Route = { name: 'map' } | { name: 'game'; index: number } | { name: 'recap'; recap: RecapData };

let cleanup: (() => void) | void;

export function go(route: Route): void {
  cleanup?.();
  cleanup = undefined;
  app.replaceChildren();
  window.scrollTo(0, 0);
  if (route.name === 'map') cleanup = renderMap(app, data, go);
  else if (route.name === 'game') cleanup = renderGame(app, data, route.index, go);
  else cleanup = renderRecap(app, data, route.recap, go);
}

recordVisit();
go({ name: 'map' });
