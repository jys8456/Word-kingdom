# WORD KINGDOM — 비용 계획 (최대한 무료, 필요할 때만 저렴하게)

| 항목 | 내용 |
|---|---|
| 문서 버전 | v0.1 (검토 요청용 초안) |
| 작성일 | 2026-11-07 |
| 상태 | 🟡 검토 대기 |
| 기준 | 2026년 11월 공개 자료 기준, **환율 $1 = ₩1,400 가정**. 요금은 수시로 바뀌므로 각 계정을 만들 때 공식 요금표로 다시 확인합니다. |

---

## 1. 결론 요약

| 단계 | 반드시 드는 돈 | 비고 |
|---|---|---|
| **기획 · 디자인 · 개발 · 웹 사용자 테스트** | **₩0** | 전부 무료 플랜으로 가능 |
| **Android 출시** | **$25 (약 ₩35,000) 1회** | Google Play 개발자 등록비 |
| **iOS 출시** | **$99/년 (약 ₩139,000/년)** | Apple Developer Program. **Mac 구매 불필요** (§3 참고) |
| 정식 출시 후, 사용자가 늘면 | 서버 $25/월 (약 ₩35,000/월) | Supabase Pro — 필요해질 때만 |
| 선택 | 도메인 연 약 ₩15,000~20,000 | 없어도 무료 주소로 운영 가능 |

**→ 첫 1년 최소 비용: 약 ₩174,000 (Android + iOS 등록비만).** 서버는 사용자가 늘 때까지 무료로 버팁니다.

---

## 2. 항목별 상세

### 2.1 개발 도구 — 전부 무료
| 도구 | 비용 | 비고 |
|---|---|---|
| VS Code, Node.js, pnpm, Turborepo | 무료 | 오픈소스 |
| React, Vite, TypeScript, Zustand, Capacitor 및 플러그인 | 무료 | 오픈소스 (MIT 등) |
| TanStack, React Hook Form, Zod, Recharts, dnd-kit | 무료 | 오픈소스 |
| Vitest, Playwright, ESLint, Prettier | 무료 | 오픈소스 |
| Android Studio | 무료 | 에뮬레이터 포함 |
| Pretendard 글꼴 | 무료 | OFL 라이선스, 앱 내장 가능 |
| 효과음 | 무료 | CC0(저작권 없음) 효과음 사용 — 출처 목록을 `docs/credits.md`에 기록 |

### 2.2 소스 관리 · 자동화 — 무료
| 서비스 | 무료 범위 | 우리 사용량 예상 | 비용 |
|---|---|---|---|
| GitHub (저장소·이슈·Projects) | 개인 무료 | 충분 | ₩0 |
| GitHub Actions (CI) | 비공개 저장소 월 2,000분 | PR당 3~5분 → 월 100~200분 | ₩0 |
| Dependabot | 무료 | – | ₩0 |

### 2.3 웹 배포 (게임 웹 · 관리자 웹) — 무료 ⚠️ 계획 변경
| 서비스 | 무료 플랜 | 판단 |
|---|---|---|
| ~~Vercel Hobby~~ | **비상업적 개인 용도로만 허용**, 상업 용도는 Pro($20/사용자/월) 필요 | ❌ 나중에 앱을 출시하면 상업 용도가 되므로 제외 |
| **Cloudflare Pages** ✅ | 월 500회 빌드, 정적 파일 트래픽 무제한, 무료 주소 `*.pages.dev` | **채택.** 무료 플랜의 상업 이용 제한이 확인되지 않음 (계정 생성 시 약관 재확인) |

→ PR마다 미리보기 주소도 Cloudflare Pages가 무료로 만들어 줍니다. 월 500회 빌드면 충분합니다.

### 2.4 서버 (Supabase) — 무료로 시작
| 항목 | 무료 플랜 | 우리 사용량 예상 (테마 3개, 테스터 20명) |
|---|---|---|
| 데이터베이스 | 500MB | 단어·퍼즐 수 MB + 이벤트 로그 수만 건(수 MB) → 충분 |
| 파일 저장 | 약 1GB (자료마다 500MB~1GB로 다름) | 음성 파일 약 300개 × 20KB = 약 6MB |
| 월간 활성 사용자(인증) | 50,000 | 관리자 몇 명만 로그인 → 충분 |
| 무료 프로젝트 수 | **최대 2개** (오너가 이미 다른 프로젝트에서 사용 중 → §2.4.1) | **WORD KINGDOM은 클라우드 프로젝트 1개만 사용**, 개발용 DB는 내 컴퓨터(로컬)에서 실행 |

#### 2.4.1 오너의 기존 Supabase 프로젝트와 함께 쓸 때 (오너 확인 반영)
| 확인 사항 | 내용 |
|---|---|
| 무료 프로젝트 한도 | 공식 요금표: "활성 프로젝트 2개". 조직(organization)별 한도인지 **사용자 계정 전체 한도인지는 자료마다 다름** → 오너 대시보드에서 확인 필요 (Q26) |
| 우리 계획 | 클라우드는 **운영 프로젝트 1개만** 생성. 개발·테스트용 DB는 Supabase CLI로 **로컬에서 무료 실행** → 무료 슬롯 1개만 사용 |
| 경우 ① 기존 프로젝트가 1개 | ✅ 남은 1개로 WORD KINGDOM 운영 가능 — 계속 무료 |
| 경우 ② 기존 프로젝트가 이미 2개 | ❌ 무료 슬롯 없음 → (가) 기존 프로젝트 하나를 일시 정지·정리 (나) WORD KINGDOM을 Pro로 시작 ($25/월) 중 선택 |
| 서로 영향 | 프로젝트끼리 DB·한도(500MB 등)는 **프로젝트별로 따로** 계산 — 기존 프로젝트에 영향 없음 |
| 유료 전환 시 | Pro는 **조직 단위 $25/월**이고 프로젝트 1개분 컴퓨팅($10)이 포함. 같은 Pro 조직에 프로젝트를 더 두면 프로젝트당 약 $10/월 추가 → **WORD KINGDOM은 별도 조직**으로 만들어 기존 프로젝트 요금과 섞이지 않게 권장 |

**결론:** 기존 프로젝트가 1개라면 출시 전까지 **추가 비용 ₩0**으로 가능. 정식 출시 후 실사용자가 생기면 WORD KINGDOM 조직만 Pro($25/월)로 올림.

**⚠️ 주의 1 — 7일 동안 사용이 없으면 일시 정지됩니다.** 데이터는 남지만 복구할 때까지 응답하지 않습니다.
- 대응: ① 게임은 **오프라인 우선**이라 서버가 멈춰도 플레이 가능 (콘텐츠 앱 내장) ② 테스트 기간엔 GitHub Actions로 하루 1회 접속 신호를 보내 정지 방지 (무료) ③ 정식 출시 후에는 Pro로 전환
- 무료 플랜 정책상 이런 방식이 계속 허용되는지 시점마다 확인합니다.

**⚠️ 주의 2 — 무료 플랜은 자동 백업이 없습니다.** 대응: 주 1회 콘텐츠·DB를 내보내 GitHub에 저장 (GitHub Actions, 무료).

| 전환 시점 | 플랜 | 비용 |
|---|---|---|
| 정식 출시 후 실사용자 발생, 또는 정지·백업 문제가 부담될 때 | Pro (DB 8GB, 정지 없음, 일일 백업) | $25/월 (약 ₩35,000) |

### 2.5 분석 · 오류 수집 — 무료
| 서비스 | 무료 범위 | 판단 |
|---|---|---|
| **이벤트 분석: Supabase에 직접 저장** ✅ | Supabase 무료 범위 안 | MVP는 이걸로. 도구가 하나 줄어 관리 부담 감소 |
| PostHog (선택) | 월 이벤트 100만 건 무료 | 출시 후 분석이 복잡해지면 그때 추가 |
| **Sentry** ✅ | 월 오류 5,000건, 사용자 1명 | 1인 개발에 충분. 넘치면 Team 약 $26/월 |

### 2.6 발음 음성 — 사실상 무료
| 방식 | 비용 | 판단 |
|---|---|---|
| 웹 테스트: 브라우저 내장 발음 | 무료 | P3~P5 |
| **Google Cloud TTS로 미리 생성해 앱에 내장** ✅ | 표준·WaveNet 음성 월 400만 글자 무료 (Neural2 등 고급 음성은 월 100만 글자 무료) | 우리 콘텐츠: 테마당 단어+예문 약 2,000글자 → 테마 3개 = 약 6,000글자. **무료 범위의 0.2% 수준** |
| 사람 녹음 | 성우 비용 발생 | 지금은 불필요 |

- Google Cloud 가입 시 결제 카드 등록이 필요할 수 있습니다. 무료 범위 안에서는 청구되지 않지만, **예산 알림(예: ₩1,000)을 설정**해 둡니다.
- 생성한 음성을 앱에 넣어 배포해도 되는지는 생성 전 Google 서비스 약관에서 확인하고 `docs/credits.md`에 기록합니다.

### 2.7 디자인 — 무료
| 도구 | 비용 | 판단 |
|---|---|---|
| **HTML 클릭 시안 (Claude 제작)** ✅ | 무료 | Q3 결정. Cloudflare Pages에 무료로 올려 휴대폰에서 확인 |
| Figma | 사용 안 함 | 나중에 외부 디자이너가 합류하면 그때 검토 (Professional $16/월) |

### 2.8 앱 빌드 · 스토어
| 항목 | 비용 | 비고 |
|---|---|---|
| **Google Play 개발자 등록** | **$25 1회** (약 ₩35,000) | 개인사업자 명의 **조직 계정** 권장 → 12명×14일 테스트 의무 없음. D-U-N-S 번호 필요 (무료) |
| **Apple Developer Program** | **$99/년** (약 ₩139,000) | 매년 갱신. 개인사업자는 Apple 기준 **개인 자격**으로 가입 (판매자명 = 본인 이름, D-U-N-S 불필요) |
| D-U-N-S 번호 | ₩0 | Google 조직 계정용, 무료 발급 |
| iOS 빌드용 Mac | **₩0** | **Codemagic**: 개인 계정 macOS 빌드 월 500분 무료 (1회 빌드 약 10~15분 → 월 30회 이상 가능). 초과분은 분당 약 $0.095 |
| Android 빌드 | ₩0 | 내 PC의 Android Studio 또는 GitHub Actions |
| 테스트 기기 | ₩0 | 본인·지인 휴대폰 + Android 에뮬레이터 + Codemagic/TestFlight |

> Mac이 있으면 더 편하지만 필수는 아닙니다. 심사에서 iOS 고유 문제가 반복되면 그때 중고 Mac mini 구매를 검토합니다.

### 2.9 도메인 · 기타 — 선택
| 항목 | 비용 | 판단 |
|---|---|---|
| 도메인 (`.com`) | 연 약 ₩15,000~20,000 | **선택.** 무료 주소 `*.pages.dev`로 개인정보 처리방침·관리자 운영 가능. 앱 이름 확정(D7) 후 구매 권장 |
| 개인정보 처리방침 페이지 | ₩0 | Cloudflare Pages에 게시 |
| 실시간 앱 업데이트 (Capgo 등) | 유료 | **사용 안 함.** 콘텐츠·설정 변경은 우리 서버로 무료 처리, 코드 변경은 스토어 업데이트 |
| 이메일 알림 | ₩0 | Sentry·Supabase·GitHub 기본 알림 |

---

## 3. 단계별 비용 일정

| 단계 | 시기 (예정) | 지출 | 누적 |
|---|---|---|---|
| P0~P4 기획·디자인·개발·관리자 | ~11/27 | ₩0 | ₩0 |
| D-U-N-S 발급 후 (~12/1 전) | 11월 중 | Google Play $25 (조직 계정) | 약 ₩35,000 |
| iOS 준비 | 2027 1분기 (Q11) | Apple $99 | 약 ₩174,000 |
| 정식 출시 후 | 사용자 증가 시 | Supabase Pro $25/월 | + ₩35,000/월 |
| 선택 | 이름 확정 후 | 도메인 | + ₩15,000~20,000/년 |

### 출시 후 1년 운영 예상
| 시나리오 | 연간 비용 |
|---|---|
| 최소 (서버 무료 유지) | Apple ₩139,000 ≈ **연 약 ₩14만** (Google은 첫해 1회만) |
| 권장 (서버 Pro, 도메인) | Apple ₩139,000 + Supabase ₩420,000 + 도메인 ₩20,000 ≈ **연 약 ₩58만** |

---

## 4. 비용 폭주 방지 장치
- 모든 유료 가능 서비스에 **예산·사용량 알림** 설정 (Google Cloud, Supabase, Codemagic)
- Supabase 유료 전환 시에도 **사용량 상한(Spend Cap)** 켜 두기
- 신용카드는 결제 한도가 낮은 카드 1장으로 통일
- 매월 1일 사용량 점검 (OPERATIONS.md §4 월간 점검에 포함)

---

## 5. 수익화에 따른 추가 비용 (Q1: 수익 내는 서비스 → 출시 전 준비 필요)
- 앱 내 결제: 스토어 수수료 (보통 15~30%)
- 사업자 등록 · 통신판매업 신고 (유료 판매 시) — 세무 상담 권장
- 광고 SDK 도입 시 개인정보 라벨·연령 등급 재검토

---

## 6. 참고 자료 (요금 확인 출처)
- Supabase 무료 플랜 (500MB DB, 7일 미사용 시 정지, 활성 프로젝트 2개, Pro $25·컴퓨팅 크레딧 $10): [supabase.com/pricing](https://supabase.com/pricing), [jetadmin.io 2](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/)
- Supabase 1차 자료: [makerkit.dev](https://makerkit.dev/blog/saas/supabase-pricing), [jetadmin.io](https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/)
- Vercel Hobby 비상업 용도 제한: [Vercel 공정 사용 정책](https://vercel.com/docs/limits/fair-use-guidelines)
- Cloudflare Pages 무료 한도: [Cloudflare 공식 문서](https://developers.cloudflare.com/pages/platform/limits)
- Sentry Developer 무료 5,000 오류: [activepieces.com](https://www.activepieces.com/blog/sentry-pricing-2026-developer-team-business-plans)
- PostHog 월 100만 이벤트 무료: [posthog.com/pricing](https://posthog.com/pricing)
- Codemagic 월 500분 무료 (macOS): [Codemagic 공식 문서](https://docs.codemagic.io/billing/pricing/)
- Google Cloud TTS 무료 범위: [Google Cloud 요금 페이지](https://cloud.google.com/text-to-speech/pricing)
- Figma Starter·Professional: [banani.co](https://www.banani.co/blog/figma-pricing-and-credits)
- Apple Developer Program($99/년), Google Play 등록비($25)는 각 공식 개발자 사이트 기준
