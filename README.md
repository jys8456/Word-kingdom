# WORD KINGDOM

한국인 초중급 영어 학습자를 위한 **테마별 영어 단어 퍼즐 스테이지 게임** (웹 프로토타입, 모바일 브라우저 우선).

힌트는 한국어 뜻, 답은 영어 철자 — 모든 퍼즐이 '회상 연습'이 되도록 설계했습니다.

## 📋 기획 문서 (검토 대기 중)

| 문서 | 내용 |
|---|---|
| [docs/PRD.md](docs/PRD.md) | 제품 요구사항 — 목표·지표, 기능별 인수 조건, **승인 요청 사항(§13)** |
| [docs/UX_SPEC.md](docs/UX_SPEC.md) | UX 설계 — 정보 구조, 사용자 흐름, 화면 명세, 디자인 시스템 |
| [docs/DEV_PLAN.md](docs/DEV_PLAN.md) | 개발 계획 — 기술 스택, 승인 게이트, 일정, 앱스토어 출시 계획 |
| [docs/HANDOFF.md](docs/HANDOFF.md) | 기획 대화 인계 브리프 (원본) |

> ⚠️ 아래 코드는 PRD 승인 전에 만든 **기술 검증용 시안(Prototype v0)** 입니다.
> 정식 개발은 문서 승인(G0) 후 [개발 계획서](docs/DEV_PLAN.md) §3.1에 따라 새로 구성합니다.

## 실행

```bash
npm install
npm run dev        # 개발 서버 (같은 Wi-Fi의 휴대폰에서 접속 가능하도록 --host)
npm test           # 콘텐츠 검증 + 엔진/저장 테스트
npm run build      # dist/ 에 정적 파일 생성 (아무 정적 호스팅에 올리면 됨)
```

## Prototype v0에 들어 있는 것

- **테마 1개 × 10스테이지** — `src/data/deck-of-cards.json` ("카드 한 벌", 46단어)
- **미니 크로스워드** — 한국어 뜻 힌트, 글자 타일 입력(가짜 글자 1~2개 섞임), 칸을 눌러 단어 전환, 데스크톱은 키보드 입력도 가능
- **실수 = 별·콤보 감소** (0번 ★3, 1~2번 ★2, 그 이상 ★1). 목숨제 없음
- **무료 힌트 3단계** — 첫 글자 공개 → 빈칸 예문 → 가짜 글자 제거
- **정답 단어 카드** — 영어 단어 · 한국어 뜻 · 예문(단어 강조) · 🔊 자동 발음 (`speechSynthesis`, en-US)
- **완료 리캡** — 별, 실수/힌트 수, 이번 판 단어 목록 + 🔊, 틀렸던 단어에 '복습' 표시
- **스테이지 지도** — 순서대로 해금, 별 표시, 건너뛰기한 스테이지 표시
- **언제든 나가기 / 건너뛰기** (건너뛰기는 두 번 눌러 확인, 다음 스테이지 해금)
- **첫 진입 미니 튜토리얼**
- **저장 (localStorage, 실패해도 게임은 계속)** — 진행/별, 틀린 단어(복습 스테이지용), 본 단어(도감용), 이벤트 로그
- **이벤트 로그 내보내기** — 지도 하단 "학습 기록 내보내기" → JSON 다운로드
  - `session_start`(첫 방문 후 며칠째인지 = D1/D3 재방문), `stage_start`, `stage_quit`, `stage_skip`, `stage_complete`, `next_stage`(다음 스테이지 자발 진입), `hint`, `word_correct`, `word_wrong`

## 콘텐츠 형식

```jsonc
{
  "id": "deck-of-cards", "theme": "Deck of Cards", "themeKo": "카드 한 벌",
  "stages": [{
    "id": "cards-01", "title": "카드 첫걸음", "type": "crossword",
    "grid": ["CARD", ".C..", "DECK"],           // '.' = 빈칸
    "entries": [{ "answer": "ACE", "ko": "에이스 (카드의 1)",
                  "example": "She has an ace in her hand.",
                  "row": 0, "col": 1, "dir": "down" }]
  }]
}
```

퍼즐은 손으로 배치합니다. `npm test`가 모든 스테이지를 검사합니다:
격자와 정답 글자 일치, 단어 끝이 다른 글자에 붙지 않음, 모든 단어가 하나로 연결됨,
예문에 정답 단어 포함, 테마 내 중복 단어 없음, 폰 화면 크기(최대 7×8).

## 코드 구조

```
src/
  main.ts            화면 전환 (지도 → 게임 → 리캡)
  crossword.ts       격자 모델, 번호 매기기, 스테이지 검증, 별 계산 (순수 로직)
  storage.ts         진행 / 틀린 단어 / 도감 / 이벤트 로그 (localStorage, try/catch)
  speech.ts          발음 (Web Speech API), 자동 발음 끄기
  screens/map.ts     스테이지 지도
  screens/game.ts    크로스워드 플레이, 단어 카드, 튜토리얼
  screens/recap.ts   완료 화면
  data/              테마 JSON
tests/               vitest
```

## 다음 작업 후보 (MVP 나머지)

- 한국어 뜻 목록형 워드서치 (보조 모드, `type: "wordsearch"`)
- 복습 스테이지 — `wk:wrong`에 쌓인 틀린 단어를 2~3일 뒤 재출제, 그 칸에 수집품 숨기기
- 단어 도감 화면 (`wk:seen` 사용)
- 테마 2, 3 콘텐츠
- 학습 실험: 노출만 vs 회상 문제 단어 나누기 → 5~7일 뒤 힌트 없는 테스트
