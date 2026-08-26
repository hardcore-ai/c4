# Unit Test Execution

## Backend Unit Tests

### Run
```bash
cd backend
nvm use 22
npx jest --verbose
```

### Expected Results
- **Total**: 35 tests across 4 suites
- **Pass**: 35
- **Failures**: 0
- **Suites**: handlers/join, handlers/like, handlers/wall, integration/api

### Test Setup Notes
- `tests/integration/setup.ts` must be imported BEFORE handler (sets `process.env`)
- `@aws-sdk/s3-request-presigner` is mocked via `jest.mock()` (Node 22 dynamic import issue)
- AWS SDK clients mocked with `aws-sdk-client-mock`

## Frontend
No unit tests — frontend is covered by E2E tests (see `e2e-test-instructions.md`).
