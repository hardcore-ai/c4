# Tech Stack Decisions — auth-lambda

**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Generated**: 2026-03-10

---

## Runtime & Framework

| Component | Decision | Version | Rationale |
|-----------|----------|---------|-----------|
| Runtime | Python | 3.12 | Latest stable; Lambda arm64 support |
| Web Framework | FastAPI | >=0.111.0 | Async-native, Pydantic v2, Mangum compatible |
| Lambda Adapter | Mangum | >=0.17.0 | ASGI-to-Lambda bridge; well-maintained |
| Package Manager | uv | latest | Fast resolver; `pyproject.toml` based |

---

## Security Libraries

| Component | Decision | Version | Rationale |
|-----------|----------|---------|-----------|
| Password Hashing | `argon2-cffi` | >=23.1.0 | Industry-standard argon2id; no wrapper overhead vs passlib |
| JWT | `PyJWT` | >=2.8.0 | Lightweight; excellent RS256 support; well-maintained; no extra crypto overhead |
| Cryptography backend | `cryptography` | >=42.0.0 | Required by PyJWT for RS256; FIPS-compatible builds available |

**argon2id parameters** (OWASP-recommended for interactive logins):
```
time_cost=3       # 3 iterations
memory_cost=65536 # 64 MB
parallelism=4     # 4 threads
hash_len=32
salt_len=16
```

---

## Database

| Component | Decision | Version | Rationale |
|-----------|----------|---------|-----------|
| MongoDB Driver | `motor` | >=3.4.0 | Native async; connection pool reused across warm Lambda invocations; FastAPI-native |
| MongoDB | MongoDB Atlas | 7.x (cloud-managed) | Managed; TLS enforced; VPC peering available |

**Connection pool configuration** (Lambda-optimized):
```python
MAX_POOL_SIZE = 10          # max connections per Lambda instance
MIN_POOL_SIZE = 1           # keep 1 connection ready
SERVER_SELECTION_TIMEOUT = 5000  # ms — fail fast before retry logic kicks in
CONNECT_TIMEOUT = 5000           # ms
SOCKET_TIMEOUT = 10000           # ms
```

**MongoDB collections**:
| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `operators` | Operator accounts | `{ tenant_id, email }` unique; `{ tenant_id }` |
| `refresh_tokens` | Refresh token store | `{ jti }` unique; `{ operator_id }`; TTL on `expires_at` |
| `revoked_tokens` | Access token deny-list | `{ jti }` unique; TTL on `expires_at` |
| `login_attempts` | Brute-force tracking | `{ email, tenant_id, attempted_at }`; TTL on `attempted_at` (30 min) |
| `mfa_pending` | Email OTP MFA sessions | `{ operator_id }` unique; TTL on `expires_at` (10 min) |

---

## Email (MFA OTP)

| Component | Decision | Notes |
|-----------|----------|-------|
| Email Service | AWS SES (Simple Email Service) | Consistent with AWS stack; requires domain verification |
| Python Client | `boto3` | AWS SDK; already available in Lambda environment |
| Sender address | Configured via `SES_SENDER_EMAIL` env var | e.g., `noreply@entrevista.ai` |
| OTP format | 6-digit numeric code | Generated with `secrets.randbelow(1_000_000)` zero-padded |
| OTP hashing | SHA-256 | Stored hashed; plaintext discarded after SES send |

---

## Observability

| Component | Decision | Version | Rationale |
|-----------|----------|---------|-----------|
| Structured Logging | `structlog` | >=24.1.0 | JSON output; CloudWatch Insights compatible; context binding |
| Tracing | AWS X-Ray | (via `aws-xray-sdk`) | End-to-end distributed tracing; X-Ray subsegments for MongoDB + SES |
| Metrics | CloudWatch Metrics (via Lambda native) | — | Lambda auto-publishes invocations, errors, duration |

**Log format** (all fields required on every record):
```json
{
  "timestamp": "2026-03-10T00:00:00.000Z",
  "level": "info",
  "request_id": "abc123",
  "operator_id": "op_xyz",
  "tenant_id": "tenant_abc",
  "event": "login_success",
  "message": "Operator authenticated"
}
```

---

## Secrets Management

| Secret | Store | Access Pattern |
|--------|-------|----------------|
| RS256 Private Key (JWT signing) | AWS Secrets Manager | Loaded at Lambda cold start; cached in memory |
| RS256 Public Key (JWT validation) | Environment variable | Read-only; safe to set as env var |
| MongoDB Atlas connection string | AWS Secrets Manager | Loaded at cold start; cached |
| SES sender email | Environment variable | Non-sensitive configuration |
| ALLOWED_ORIGIN (CORS) | Environment variable | Non-sensitive configuration |

---

## Python Dependencies (`pyproject.toml`)

```toml
[project]
name = "entrevista-auth"
version = "0.1.0"
requires-python = ">=3.12"

dependencies = [
  "fastapi>=0.111.0",
  "mangum>=0.17.0",
  "motor>=3.4.0",
  "PyJWT>=2.8.0",
  "cryptography>=42.0.0",
  "argon2-cffi>=23.1.0",
  "structlog>=24.1.0",
  "boto3>=1.34.0",
  "aws-xray-sdk>=2.13.0",
  "pydantic>=2.7.0",
  "pydantic-settings>=2.2.0",
]

[project.optional-dependencies]
dev = [
  "pytest>=8.0.0",
  "pytest-asyncio>=0.23.0",
  "httpx>=0.27.0",        # For FastAPI TestClient async
  "mongomock-motor>=0.0.21",  # MongoDB mock for unit tests
  "moto[ses]>=5.0.0",     # AWS SES mock for unit tests
]
```

---

## Build Artifact

| Artifact | Format | Target size |
|----------|--------|-------------|
| Lambda package | `.zip` via `make build` | < 50 MB (no ML libraries) |
| Lambda architecture | `arm64` (Graviton2) | ~20% cheaper than x86_64 |
| Lambda memory | 512 MB | Balances argon2id CPU cost vs Lambda pricing |
| Lambda timeout | 30 seconds | Covers: 3x DB retry + argon2 hash + SES send |

---

*End of tech-stack-decisions.md*
