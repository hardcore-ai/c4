# Infrastructure Design — Frontend

## Hosting
- **Vercel** — automatic Next.js 16 deployment
- Production URL: `https://frontend-lemon-omega-93.vercel.app`
- Serverless functions for SSR (though current pages are static)

## Build
- **Next.js 16.1.6** with Turbopack
- **Tailwind CSS 4.2.1** (CSS-first config, no `tailwind.config.ts`)
- **Node.js ≥22** required for `@tailwindcss/oxide` native binding

## Environment Variables (Vercel, build-time)
| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://abc123xyz0.execute-api.us-east-1.amazonaws.com` | Inlined at build time |
| `NEXT_PUBLIC_SESSION_CODE` | `LATAM2026` | Inlined at build time |

## Key Decisions
- **Static pages**: Both `/` and `/wall` are prerendered as static content. All data fetching is client-side.
- **No SSR data fetching**: All API calls happen in `useEffect` hooks on the client.
- **NEXT_PUBLIC_* build-time**: Values are inlined by Next.js during build. Must use `vercel env add` (not `-e` flag) and redeploy after changes.
- **Trailing slash sanitization**: API URL stripped of trailing slash in `api.ts` to prevent double-slash in paths.
