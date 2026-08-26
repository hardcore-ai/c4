# User Stories — SkillWall Live

## Functional Stories

---

### US-01: Gestión de sesión (Admin)
**Como** admin de sesión,
**quiero** crear y eliminar sesiones via API,
**para** preparar el evento y limpiar datos al finalizar.

**Persona**: Admin

**Acceptance Criteria:**

```gherkin
Feature: Session Management

  Scenario: Create a new session
    Given the admin has a valid adminToken
    When the admin sends POST /admin/sessions with sessionCode "LATAM2026" and adminToken
    Then the system creates the session
    And returns sessionCode and createdAt
    And logs event SESSION_CREATED

  Scenario: Create session with invalid token
    Given the admin sends POST /admin/sessions with an invalid adminToken
    Then the system returns 401 Unauthorized

  Scenario: Delete a session and all its data
    Given session "LATAM2026" exists with participants and votes
    When the admin sends DELETE /admin/sessions/LATAM2026 with valid adminToken
    Then the system deletes all participants, votes, and session metadata
    And returns { ok: true }
    And logs event SESSION_DELETED

  Scenario: Delete non-existent session
    Given session "INVALID" does not exist
    When the admin sends DELETE /admin/sessions/INVALID with valid adminToken
    Then the system returns 404 Not Found
```

---

### US-02: Upload de foto
**Como** participante,
**quiero** subir mi foto antes de registrarme,
**para** que aparezca en el muro junto a mi perfil.

**Persona**: Participante

**Acceptance Criteria:**

```gherkin
Feature: Photo Upload

  Scenario: Get pre-signed upload URL
    Given the participant wants to upload a photo
    When they send POST /upload-url
    Then the system returns uploadUrl and objectKey
    And the objectKey has a non-predictable name with session prefix

  Scenario: Upload photo to S3
    Given the participant has a valid uploadUrl
    When they upload a JPEG image under 2MB
    Then S3 accepts the upload

  Scenario: Reject oversized photo
    Given the participant has a valid uploadUrl
    When they upload an image over 2MB
    Then S3 rejects the upload

  Scenario: Reject invalid file type (SVG)
    Given the participant has a valid uploadUrl
    When they upload an SVG file
    Then S3 rejects the upload

  Scenario: Fallback to default avatar
    Given the photo upload fails
    When the participant proceeds with join
    Then the system uses a default avatar photo
```

---

### US-03: Registro de participante (Join)
**Como** participante,
**quiero** registrarme en la sesión con mi nombre, foto y skills,
**para** aparecer en el muro y poder votar por skills de otros.

**Persona**: Participante

**Acceptance Criteria:**

```gherkin
Feature: Participant Registration

  Scenario: Successful join
    Given session "LATAM2026" exists
    When the participant sends POST /join with displayName "Ana", 3 valid skills, and a valid objectKey
    Then the system creates the participant
    And returns participantId, displayName, photoUrl, and skills
    And the participantId is stored in localStorage
    And logs event JOIN_CREATED

  Scenario: Join with invalid skill count (less than 3)
    Given session "LATAM2026" exists
    When the participant sends POST /join with only 2 skills
    Then the system returns 400 Bad Request with validation error

  Scenario: Join with invalid skill count (more than 5)
    Given session "LATAM2026" exists
    When the participant sends POST /join with 6 skills
    Then the system returns 400 Bad Request with validation error

  Scenario: Join with skill not in catalog
    Given session "LATAM2026" exists
    When the participant sends POST /join with skill "Blockchain"
    Then the system returns 400 Bad Request with validation error

  Scenario: Join with empty displayName
    When the participant sends POST /join with empty displayName
    Then the system returns 400 Bad Request with validation error

  Scenario: Join with invalid sessionCode
    When the participant sends POST /join with sessionCode "INVALID"
    Then the system returns 404 Not Found
```

---

### US-04: Muro de participantes (Wall)
**Como** participante,
**quiero** ver el muro con todos los participantes de la sesión,
**para** descubrir quiénes participan y qué skills tienen.

**Persona**: Participante

**Acceptance Criteria:**

```gherkin
Feature: Participant Wall

  Scenario: View wall sorted by newest
    Given session "LATAM2026" has 5 participants
    When the participant requests GET /wall?sessionCode=LATAM2026&sort=new
    Then the system returns all 5 participants sorted by createdAt descending
    And each item includes photo, displayName, skills with likeCount

  Scenario: View wall sorted by top likes
    Given session "LATAM2026" has participants with varying totalLikes
    When the participant requests GET /wall?sessionCode=LATAM2026&sort=top
    Then the system returns all participants sorted by totalLikes descending

  Scenario: Wall auto-refreshes via polling
    Given the participant is viewing the wall
    When 2 seconds elapse
    Then the frontend polls GET /wall again and updates the view

  Scenario: Wall with no participants
    Given session "LATAM2026" has no participants
    When requesting GET /wall?sessionCode=LATAM2026
    Then the system returns an empty items array
```

---

### US-05: Likes por skill
**Como** participante registrado,
**quiero** dar like a un skill específico de otro participante,
**para** reconocer su expertise en ese tema.

**Persona**: Participante

**Acceptance Criteria:**

```gherkin
Feature: Skill Likes

  Scenario: Cast a like on a skill
    Given participant "Ana" is registered in session "LATAM2026"
    And participant "Carlos" has skill "Cloud Architect"
    When Ana sends POST /like with targetParticipantId=Carlos, skillId="cloud-architect", voterId=Ana's participantId
    Then the system increments likeCount for that skill
    And returns the new likeCount
    And logs event LIKE_CAST

  Scenario: Idempotent like (duplicate vote)
    Given Ana already liked Carlos's "Cloud Architect" skill
    When Ana sends the same like request again
    Then the system returns the current likeCount without incrementing
    And no duplicate vote is recorded

  Scenario: Like with invalid participantId (voter not registered)
    Given voterId "invalid-uuid" is not a registered participant
    When sending POST /like with that voterId
    Then the system returns 403 Forbidden

  Scenario: Like own skill (self-vote)
    Given participant "Ana" has skill "Backend Engineer"
    When Ana sends POST /like targeting her own participantId and skillId
    Then the system returns 400 Bad Request (cannot self-vote)
```

---

### US-06: Leaderboard
**Como** participante,
**quiero** ver el leaderboard con los top participantes y top skills,
**para** saber quién y qué skills son más populares.

**Persona**: Participante

**Acceptance Criteria:**

```gherkin
Feature: Leaderboard

  Scenario: View top participants
    Given session "LATAM2026" has participants with likes
    When requesting GET /leaderboard?sessionCode=LATAM2026
    Then the response includes topParticipants sorted by totalLikes descending

  Scenario: View top skills
    Given session "LATAM2026" has likes across various skills
    When requesting GET /leaderboard?sessionCode=LATAM2026
    Then the response includes topSkills sorted by aggregated likes descending

  Scenario: Leaderboard updates with wall polling
    Given the participant is viewing the leaderboard
    When 2 seconds elapse
    Then the frontend polls the leaderboard endpoint and updates the view
```

---

### US-07: Health check
**Como** operador,
**quiero** verificar el estado del sistema via health endpoint,
**para** confirmar que Lambda y DynamoDB están operativos.

**Persona**: Admin

**Acceptance Criteria:**

```gherkin
Feature: Health Check

  Scenario: All services healthy
    When requesting GET /health
    Then the system returns { status: "ok" } with 200
    And verifies Lambda is running and DynamoDB is accessible

  Scenario: DynamoDB unreachable
    Given DynamoDB is not accessible
    When requesting GET /health
    Then the system returns degraded status with details
```

---

## Technical Stories

---

### TS-01: Infraestructura AWS con Terraform
**Como** operador,
**quiero** que toda la infraestructura AWS esté declarada en Terraform,
**para** tener despliegues reproducibles y versionados.

**Persona**: Admin

**Acceptance Criteria:**

```gherkin
Feature: Infrastructure as Code

  Scenario: Terraform provisions all resources
    Given the Terraform configuration in /infra
    When running terraform apply
    Then it creates: HTTP API Gateway, Lambda function, DynamoDB table, S3 bucket, IAM roles, CloudWatch log groups
    And all resources are tagged with environment (dev/demo/prod)

  Scenario: Lambda code deployment
    Given the backend code is built with esbuild
    When running the deploy script (bash + AWS CLI)
    Then it builds, zips, and updates Lambda function code
```

---

### TS-02: Observabilidad E2E con OpenTelemetry
**Como** operador,
**quiero** trazabilidad end-to-end con OpenTelemetry,
**para** diagnosticar problemas y demostrar observabilidad en la demo.

**Persona**: Admin

**Acceptance Criteria:**

```gherkin
Feature: End-to-End Observability

  Scenario: Backend traces exported to New Relic
    Given a request hits the Lambda
    When the request is processed
    Then a trace span is created with request details
    And exported via OTLP/HTTP to New Relic
    And includes traceId in structured logs

  Scenario: Frontend propagates trace context
    Given the frontend SDK OTel is initialized
    When the frontend makes an API request
    Then it includes W3C traceparent header
    And the backend uses it as parent context

  Scenario: Frontend exports telemetry
    Given the frontend OTel SDK is configured
    Then it captures fetch/XHR auto-instrumentation
    And records custom spans
    And reports web vitals
    And exports to New Relic

  Scenario: RED metrics available
    Given requests are being processed
    Then rate, error, and duration metrics are recorded
    And available in New Relic dashboard

  Scenario: API Gateway access logs
    Given API Gateway is configured with access logging
    Then access logs are written to CloudWatch
```

---

### TS-03: Seguridad runtime y pipeline
**Como** operador,
**quiero** controles de seguridad en runtime y pipeline,
**para** demostrar prácticas de seguridad en la demo.

**Persona**: Admin

**Acceptance Criteria:**

```gherkin
Feature: Security Controls

  Scenario: CORS restricts origins
    Given the API is configured with CORS
    When a request comes from an unauthorized origin
    Then the API rejects it

  Scenario: Rate limiting on join and like
    Given API Gateway throttling is set to 5 TPS per IP
    When a client exceeds 5 requests per second on POST /join or POST /like
    Then the API returns 429 Too Many Requests
    And logs event RATE_LIMITED

  Scenario: Input validation
    Given a request with invalid payload
    When processed by the Lambda
    Then the system validates lengths, enumerations, and payload size
    And returns 400 for invalid inputs

  Scenario: Upload security
    Given a pre-signed URL is generated
    Then it restricts to max 2MB, types jpeg/png/webp, denies SVG
    And objectKey is non-predictable with session prefix

  Scenario: Frontend security headers
    Given the frontend is deployed on Vercel
    Then it includes CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy

  Scenario: Pipeline security checks
    Given the CI pipeline runs
    Then it executes gitleaks (secret scanning), npm audit (SCA), and OWASP ZAP baseline (DAST)
    And generates reports in ./reports
```

---

## Story-Persona Map

| Story | Participante | Admin |
|---|---|---|
| US-01 Session Management | | ✅ |
| US-02 Photo Upload | ✅ | |
| US-03 Join | ✅ | |
| US-04 Wall | ✅ | |
| US-05 Likes | ✅ | |
| US-06 Leaderboard | ✅ | |
| US-07 Health Check | | ✅ |
| TS-01 Infrastructure | | ✅ |
| TS-02 Observability | | ✅ |
| TS-03 Security | | ✅ |

---

## INVEST Validation

| Story | Independent | Negotiable | Valuable | Estimable | Small | Testable |
|---|---|---|---|---|---|---|
| US-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| US-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| US-03 | ✅ (depends on US-01 session) | ✅ | ✅ | ✅ | ✅ | ✅ |
| US-04 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| US-05 | ✅ (depends on US-03 join) | ✅ | ✅ | ✅ | ✅ | ✅ |
| US-06 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| US-07 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TS-01 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TS-02 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TS-03 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
