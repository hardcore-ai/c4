# E2E Test Instructions

## Setup
```bash
cd frontend
npm install -D @playwright/test
npx playwright install webkit
```

## Run
```bash
cd frontend && nvm use 22 && npx playwright test --reporter=list
```

## Configuration
- **Browser**: WebKit (Chromium/Firefox have intermittent segfaults on this environment)
- **Base URL**: `https://frontend-lemon-omega-93.vercel.app` (configurable via `E2E_BASE_URL`)
- **API URL**: `https://1ndf2214v2.execute-api.us-east-1.amazonaws.com` (configurable via `E2E_API_URL`)
- **Admin Token**: `demo-admin-token-2026` (configurable via `E2E_ADMIN_TOKEN`)
- **Retries**: 1 (handles intermittent browser crashes)

## Test Coverage (19 tests)

| User Story | Test | Type |
|---|---|---|
| US-07 | Health check returns ok | API |
| US-01 | Create session (valid token) | API |
| US-01 | Create session (invalid token → 401) | API |
| US-01 | Delete session (valid token) | API |
| US-01 | Delete session (missing token → 401) | API |
| US-02+03 | Join form renders elements | UI |
| US-03 | Validation: empty name error | UI |
| US-03 | Validation: <3 skills error | UI |
| US-02+03 | Successful join → navigate to /wall | UI |
| US-03 | Redirect to /wall if registered | UI |
| US-04 | Wall displays participants + controls | UI |
| US-04 | Sort toggle (new ↔ top) | UI |
| US-04 | Empty session shows waiting message | UI |
| US-05 | Cast like returns likeCount | API |
| US-05 | Idempotent like (no increment) | API |
| US-05 | Self-vote → 400 | API |
| US-05 | Invalid voter format → 400 | API |
| US-06 | Leaderboard API returns data | API |
| US-06 | Leaderboard tab renders on UI | UI |

## Key Patterns
- **`goToWall` helper**: Uses `page.addInitScript()` to set localStorage before navigation, avoiding race conditions with client-side redirects.
- **Session isolation**: API-only tests create ephemeral sessions. UI tests use the baked-in `LATAM2026` session.
- **DELETE via header**: Admin token sent as `admintoken` header (not body) to avoid Chromium segfaults with DELETE + body.
