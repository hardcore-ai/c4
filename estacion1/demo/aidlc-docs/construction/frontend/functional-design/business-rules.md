# Business Rules — Frontend

## Validation Rules (Client-Side)
| Field | Rule | Error Message |
|---|---|---|
| displayName | Non-empty after trim | "Ingresa tu nombre" |
| skills | 3-5 selected | "Selecciona al menos 3 skills" |
| photo size | ≤ 2MB | "Foto máximo 2MB" |
| photo type | jpeg, png, webp | "Solo JPEG, PNG o WebP" |

## UI Rules
1. **Skill selection cap**: Max 5 skills. Once 5 selected, remaining chips show `opacity-40 cursor-not-allowed`
2. **Self-like disabled**: Participant's own card has like buttons disabled (`isSelf` prop)
3. **Default avatar**: If no photo uploaded or photo URL empty, show `/default-avatar.png`. On image error, fallback to same.
4. **Privacy notice**: Always visible on join form: "No subas información sensible; contenido puede ser removido."
5. **Session code**: Read from `NEXT_PUBLIC_SESSION_CODE` env var (build-time). Default: `LATAM2026`

## State Management
- **No global state library** — React `useState` + `useCallback` per page
- **localStorage keys**: `skillwall_participantId`, `skillwall_sessionCode`
- **Polling**: `setInterval` at 2000ms, cleared on unmount

## Security Headers (next.config.ts)
- `Content-Security-Policy`: restrict connect-src to API Gateway + S3 + New Relic
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`: deny camera, microphone, geolocation
