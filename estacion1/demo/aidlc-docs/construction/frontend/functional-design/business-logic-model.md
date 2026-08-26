# Business Logic Model — Frontend

## Overview
Next.js 16 App Router SPA with two pages. All state is client-side (React state + localStorage). API calls go directly to API Gateway.

## Pages

### `/` — Join Page
1. Check localStorage for `skillwall_participantId` + `skillwall_sessionCode`
2. If both exist → redirect to `/wall`
3. Otherwise → render JoinForm

### `/wall` — Wall + Leaderboard Page
1. Check localStorage — if missing → redirect to `/`
2. Poll `GET /wall` + `GET /leaderboard` every 2 seconds
3. Display participant cards with like buttons
4. Tab toggle between Wall and Leaderboard views

## User Flows

### Registration Flow
```
User fills name → selects 3-5 skills → (optional) uploads photo →
  → POST /upload-url → PUT to S3 pre-signed URL →
  → POST /join → store participantId in localStorage → navigate to /wall
```

### Like Flow
```
User clicks skill chip on another participant's card →
  → POST /like (voterId from localStorage) → refresh wall data
```

### Polling Flow
```
Every 2s: GET /wall + GET /leaderboard → update React state → re-render
```

## API Client (`lib/api.ts`)
- Base URL from `NEXT_PUBLIC_API_URL` (build-time inlined, trailing slash stripped)
- All requests include `Content-Type: application/json` + W3C `traceparent` header
- Error handling: parse `{ error }` from response body, throw as Error
