# Unit of Work — Story Map — SkillWall Live

## Story to Unit Mapping

| Story | infra | backend | frontend | Notes |
|---|---|---|---|---|
| US-01 Session Management | ✅ DynamoDB, API GW routes | ✅ admin-create, admin-delete handlers | | Admin via curl |
| US-02 Photo Upload | ✅ S3 bucket | ✅ upload-url handler | ✅ Upload flow, camera/file | |
| US-03 Join | ✅ DynamoDB | ✅ join handler, validation | ✅ Join form, localStorage | |
| US-04 Wall | ✅ DynamoDB | ✅ wall handler | ✅ Wall view, polling, cards | |
| US-05 Likes | ✅ DynamoDB | ✅ like handler, TransactWrite | ✅ Like button, idempotency UX | |
| US-06 Leaderboard | ✅ DynamoDB | ✅ leaderboard handler | ✅ Leaderboard view, polling | |
| US-07 Health Check | ✅ API GW route | ✅ health handler | | |
| TS-01 Infrastructure | ✅ All Terraform | | | Primary unit |
| TS-02 Observability | ✅ CloudWatch logs | ✅ OTel SDK, OTLP export | ✅ OTel browser SDK, traceparent | Cross-unit |
| TS-03 Security | ✅ API GW throttling, CORS | ✅ Input validation, audit logs | ✅ Security headers, CSP | Cross-unit |

## Coverage Summary

- **All 10 stories** are mapped to at least one unit
- **Cross-unit stories** (TS-02 Observability, TS-03 Security) touch all 3 units
- **infra** participates in all stories (provides underlying resources)
- **backend** participates in all functional stories (US-01 through US-07)
- **frontend** participates in user-facing stories (US-02 through US-06)

## Per-Unit Story Count

| Unit | Functional Stories | Technical Stories | Total |
|---|---|---|---|
| infra | 7 | 3 | 10 |
| backend | 7 | 2 | 9 |
| frontend | 5 | 2 | 7 |
