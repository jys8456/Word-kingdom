import { getFlag, setFlag } from './storage';

let voice: SpeechSynthesisVoice | null = null;

function pickVoice(): void {
  if (!('speechSynthesis' in window)) return;
  const voices = speechSynthesis.getVoices();
  voice =
    voices.find((v) => v.lang === 'en-US' && /google|samantha|natural/i.test(v.name)) ??
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function isMuted(): boolean {
  return getFlag('muted');
}

export function setMuted(muted: boolean): void {
  setFlag('muted', muted);
  if (muted && 'speechSynthesis' in window) speechSynthesis.cancel();
}

/** Speak English text. `force` plays even when auto-play is muted (🔊 buttons). */
export function speak(text: string, force = false): void {
  if (!('speechSynthesis' in window)) return;
  if (!force && isMuted()) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.toLowerCase());
    u.lang = 'en-US';
    u.rate = 0.85;
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  } catch {
    /* no audio — the card still shows the word */
  }
}
