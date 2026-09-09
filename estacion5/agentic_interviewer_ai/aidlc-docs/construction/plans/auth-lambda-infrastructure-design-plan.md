# Infrastructure Design Plan — Unit 6: auth-lambda

**Generated**: 2026-03-10
**Unit**: Unit 6 — auth-lambda (`entrevista-auth`)
**Stage**: CONSTRUCTION — Infrastructure Design
**Cloud Provider**: AWS

---

## Execution Checklist

- [x] Step 1: Analyze design artifacts (done)
- [x] Step 2: Generate infrastructure questions and await answers
- [x] Step 3: Generate infrastructure-design.md
- [x] Step 4: Generate deployment-architecture.md
- [x] Step 5: Present completion message and await approval

---

## Infrastructure Questions

Three decisions remain open with infrastructure impact.

---

**INFRA-AUTH-01** — MongoDB Atlas connectivity: How should auth-lambda connect to MongoDB Atlas?

> Context: Lambda runs outside VPC by default. VPC peering with Atlas requires placing Lambda in a VPC + NAT Gateway (adds ~$35/month and increases cold start by ~200ms). Without VPC, Atlas must allow Lambda via IP allowlist (but Lambda IPs are dynamic — Atlas must allow a wide CIDR or use PrivateLink).

A. **VPC + VPC Peering** — Lambda in private VPC subnet; Atlas peered to VPC; NAT Gateway for outbound; most secure
B. **Atlas Private Endpoint (AWS PrivateLink)** — Lambda in VPC; connects to Atlas via PrivateLink; no NAT needed for Atlas; recommended for production
C. **Public Atlas endpoint + IP allowlist** — No VPC; Atlas allows `0.0.0.0/0` or Lambda's managed prefix list; simpler but less secure
D. **Public Atlas endpoint + Lambda in VPC** — Lambda in VPC with NAT Gateway; Atlas public endpoint; mixed approach

[Answer]:B

---

**INFRA-AUTH-02** — API Gateway type for auth-lambda:

A. **HTTP API** — lower cost (~70% cheaper than REST API), lower latency, supports JWT authorizer; sufficient for all auth-lambda needs
B. **REST API** — more features (usage plans, WAF integration at gateway level, resource policies); higher cost
C. **Function URL** — direct Lambda invocation URL; no API Gateway at all; cheapest; no throttling, no WAF, no access logging at gateway level

[Answer]:A

---

**INFRA-AUTH-03** — AWS WAF (Web Application Firewall): Should WAF be attached to the API Gateway?

> Context: WAF provides managed rule groups (OWASP Top 10, known bad inputs, IP reputation lists). Adds ~$5/month base + usage. Relevant for a public login endpoint.

A. Yes — attach AWS WAF with Core rule set (CRS) + IP reputation managed rule groups
B. No — API Gateway throttling + Lambda-level brute-force protection is sufficient for MVP; add WAF later
C. Defer — specify WAF requirement but implement in a future iteration

[Answer]:A

---

*End of auth-lambda-infrastructure-design-plan.md*
