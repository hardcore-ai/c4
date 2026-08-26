# Deployment Architecture — Frontend

## Build Pipeline
```
Next.js source → vercel --prod → Vercel Edge Network
```

## Deployment Steps
1. `vercel env add NEXT_PUBLIC_API_URL production` → `https://abc123xyz0.execute-api.us-east-1.amazonaws.com`
2. `vercel env add NEXT_PUBLIC_SESSION_CODE production` → `LATAM2026` (use `printf` not `echo`)
3. `vercel --yes --prod` from `/frontend` directory

## Static Output
```
Route (app)
├ ○ /           (static)
├ ○ /_not-found (static)
└ ○ /wall       (static)
```

## Key Decisions
- **printf for env vars**: `echo` adds trailing newline that gets baked into the JS bundle. Use `printf 'value'` when piping to `vercel env add`.
- **Redeploy after env changes**: `NEXT_PUBLIC_*` vars are build-time only. Changing them requires a new deployment.
