# Code Summary — Frontend

## Files Generated (14 source + 1 test + 3 config)

### Source (`/frontend/src/`)
| File | Purpose | Stories |
|---|---|---|
| `app/layout.tsx` | Root layout, security headers, OTel init | TS-03 |
| `app/page.tsx` | Join page (redirect if registered) | US-03 |
| `app/wall/page.tsx` | Wall + Leaderboard with 2s polling | US-04, US-06 |
| `app/globals.css` | Tailwind v4 import | — |
| `app/favicon.ico` | App favicon | — |
| `components/join-form.tsx` | Registration form (name, photo, skills) | US-02, US-03 |
| `components/participant-card.tsx` | Wall card with photo, name, skills | US-04 |
| `components/skill-chip.tsx` | Skill badge with like button | US-04, US-05 |
| `components/leaderboard.tsx` | Top participants + top skills | US-06 |
| `lib/api.ts` | API client with traceparent propagation | All |
| `lib/storage.ts` | localStorage helpers | US-03 |
| `constants/skills.ts` | 15-skill catalog (synced with backend) | US-03 |
| `types/index.ts` | TypeScript interfaces (synced with backend) | All |

### Tests (`/frontend/tests/`)
| File | Tests | Status |
|---|---|---|
| `e2e/skillwall.spec.ts` | 19 E2E tests (Playwright, webkit) | 19 pass |

### Config
| File | Purpose |
|---|---|
| `package.json` | Next.js 16, Tailwind 4, Playwright |
| `next.config.ts` | Security headers, CSP |
| `postcss.config.js` | Tailwind v4 PostCSS plugin |
| `tsconfig.json` | TypeScript config |
| `playwright.config.ts` | E2E test config (webkit, Vercel URL) |
| `.env.example` | Template for env vars |
| `.env.local` | Actual env vars (gitignored) |
