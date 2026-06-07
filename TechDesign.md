#Technical Design Document  
**NBFC‑Python Multi‑Loan Lending Application**  

*Prepared for: XYZ NBFC*  
*Date: 2025‑12‑03*  

---

## 1. Problem Statement  

XYZ NBFC wants to replace its legacy paper‑based and siloed loan‑processing system with a **single, cloud‑native, Python‑based platform** that can:

* **Onboard** borrowers digitally (KYC, document verification, e‑signature).  
* **Originate** multiple loan products (personal, micro‑loan, SME, vehicle, education) with configurable terms, interest types (flat, reducing‑balance, annuity), and fees.  
* **Disburse** funds to borrowers’ bank accounts or digital wallets in real‑time.  
* **Collect** repayments through auto‑debit, UPI, NEFT, or manual cash‑collection and manage delinquency.  
* **Report** to regulators (RBI) and internal stakeholders with real‑time dashboards, audit trails, and statutory returns.  

The solution must be **scalable** (10 k–50 k loan applications per day), **highly available** (99.9 % uptime), **secure** (PCI‑DSS, RBI data‑localisation, encryption), and **maintainable** through automated CI/CD and observability.

---

## 2. Goals and Non‑Goals  

### 2.1 Goals  

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | **Digital onboarding** – end‑to‑end KYC, document upload, e‑signature, and account creation via a web/mobile UI. | 95 % of new applications completed without manual intervention. |
| G2 | **Multi‑product loan engine** – support at least 5 loan products with configurable interest calculation, tenures, and fees. | Ability to launch a new product in < 2 weeks via admin UI. |
| G3 | **Real‑time disbursement** – funds transferred within 5 minutes of approval. | 99 % of disbursements completed ≤ 5 min. |
| G4 | **Robust collections** – auto‑debit, reminder workflows, and delinquency handling. | Collections recovery ratio ≥ 90 % for loans < 12 months. |
| G5 | **Regulatory compliance** – RBI‑compliant reporting, data localisation, audit logs. | Zero compliance findings in quarterly audit. |
| G6 | **Scalability & reliability** – handle peak load of 50 k transactions/day with ≤ 2 s UI latency. | 99.9 % SLA, 99.9 % uptime, 95th‑percentile API latency ≤ 2 s. |
| G7 | **Developer productivity** – clear API contracts, automated testing, CI/CD pipeline. | 80 % test coverage, 1‑click deploy to staging/production. |

### 2.2 Non‑Goals  

| # | Non‑Goal | Reason |
|---|----------|--------|
| NG1 | Mobile‑native app for iOS/Android (beyond progressive web app). | Out of scope; focus on responsive web UI first. |
| NG2 | Integration with third‑party credit bureaus beyond a single API (e.g., CIBIL). | Will be added later as a plug‑in. |
| NG3 | Full‑blown AI credit‑scoring model (ML). | Use rule‑based scoring for MVP; ML can be added later. |
| NG4 | On‑premise deployment (only cloud‑first). | Cloud provides elasticity and easier compliance. |

---

## 3. Architecture  

### 3.1 High‑Level Diagram (ASCII)

```
+---------------------------------------------------------------+
|                       CLIENT LAYER                            |
|  - Next.js (React) SPA (Web)                                 |
|  - Responsive Web UI (mobile‑friendly)                       |
|  - Auth: OAuth2/OIDC (Auth0 / custom)                        |
+--------------------------+------------------------------------+
                           |
                           v
+---------------------------------------------------------------+
|                       API GATEWAY (Kong)                      |
|  - TLS termination, rate limiting, JWT validation           |
|  - Request routing → micro‑services                         |
|  - Central logging & tracing (OpenTelemetry)                |
+--------------------------+------------------------------------+
                           |
        +------------------+------------------+------------------+
        |                  |                  |                  |
        v                  v                  v                  v
+-----+-----+   +-----+-----+   +-----+-----+   +-----+-----+
| Auth    |   | Customer|   | Loan    |   | Payment   |
| Service   |   | Service |   | Origination|   | Service   |
| (Keycloak|   | (FastAPI) |   | (Temporal) |   | (Razorpay)|
+-----+-----+   +-----+-----+   +-----+-----+   +-----+-----+
        |                  |                  |                  |
        +--------+---------+----------+---------+----------+--------+
                 |                  |                  |
                 v                  v                  v
        +-------------------------------------------------------------+
        |                     SERVICE MESH (Istio)                    |
        |  - mTLS between services                                    |
        |  - Traffic shaping, retries, circuit‑breaker                |
        +-------------------------------------------------------------+
                           |
                 +----------------+-------------------+
                 |                  |                  |
                 v                  v                  v
        +----------------+   +----------------+   +----------------+
        |  PostgreSQL    |   |  MongoDB       |   |  Redis         |
        | (Citus shard)  |   | (KYC docs)    |   | (Cache, rate‑)|
        +----------------+   +----------------+   +----------------+
                 |                  |                  |
                 +----------+----------+----------+--------+
                            |                  |
                +-----------+-----------+-----------+
                |               |               |
                v               v               v
        +----------------+   +----------------+   +----------------+
        |  Elasticsearch |   |  S3 (object)   |   |  Kafka (events)|
        | (search & agg) |   | (KYC docs,     |   | (audit,       |
        |                |   |  PDFs)         |   |  domain)      |
        +----------------+   +----------------+   +----------------+

```

### 3.2 Component Overview  

| Layer | Component | Tech | Responsibility |
|-------|-----------|------|----------------|
| **Presentation** | **Web UI** | Next.js (React) + TypeScript + Material‑UI | UI for borrower onboarding, loan application, dashboard. |
| | **Auth** | Auth0 (OIDC) + JWT | User login, MFA, token issuance. |
| **Edge** | **API Gateway** | Kong (Docker) + Kong‑JWT plugin | Route requests, enforce auth, rate‑limit, TLS termination. |
| **Service** | **Auth Service** | FastAPI + Keycloak (user store) | Manage users, roles, token revocation. |
| | **Customer Service** | FastAPI + SQLModel (PostgreSQL) | CRUD for borrower profile, KYC status, risk score. |
| | **Loan Origination Service** | Python (FastAPI) + Temporal (workflow) | Orchestrates application capture, document verification, underwriting, status transitions. |
| | **Underwriting Service** | Scikit‑learn model + rule engine (Drools) | Compute credit score, decide approve/reject. |
| | **Disbursement Service** | FastAPI + Razorpay SDK | Initiate bank transfer, track status, handle retries. |
| | **Repayment Service** | FastAPI + Celery (worker) | Generate schedule, process payments, handle auto‑debit. |
| | **Collections Service** | FastAPI + Twilio (SMS/WhatsApp) | Dunning workflow, payment plan negotiation. |
| | **Portfolio & Risk Service** | Pandas + PostgreSQL + Elasticsearch | Compute NPA, provisioning, generate regulator reports. |
| | **Audit & Logging Service** | Fluent Bit → Elasticsearch + Logstash | Immutable audit trail, before/after snapshots. |
| **Data** | **PostgreSQL (Citus)** | Multi‑tenant sharding on `customer_id` | Core ledger, transactional consistency. |
| | **MongoDB** | Document store | KYC PDFs, e‑signatures, versioned docs. |
| | **Redis** | Cluster mode | Session store, rate‑limit counters, quick lookups. |
| | **Elasticsearch** | Search & analytics | Fast search on transaction notes, dashboards. |
| | **Kafka** | Confluent Cloud | Event bus for loan lifecycle, audit, notifications. |
| **Infra** | **Kubernetes (EKS)** | Helm charts, ArgoCD | Container orchestration, blue‑green deployments. |
| | **CI/CD** | GitHub Actions → Docker → ECR → Helm → ArgoCD | Automated build, test, security scan, deploy. |
| | **Observability** | Prometheus + Grafana, Loki, Jaeger | Metrics, logs, traces, alerts. |
| | **Secrets** | HashiCorp Vault + AWS Secrets Manager | Secure storage of DB passwords, API keys. |
| | **Backup/DR** | RDS automated snapshots, S3 versioned bucket, cross‑region replica | Point‑in‑time recovery, 7‑year retention. |

---

## 4. Technical Requirements  

### 4.1 Functional Requirements  

| ID | Requirement | Description |
|----|-------------|-------------|
| FR‑001 | **User Registration & KYC** | Customer creates account → uploads ID proof, PAN, address proof → e‑KYC via Aadhaar API → status = *Verified* or *Pending*. |
| FR‑002 | **Loan Product Catalog** | Admin UI to define products (name, interest type, flat/annual, min/max tenure, fees, eligibility). |
| FR‑003 | **Application Capture** | Front‑end form → POST `/api/v1/loans` → stores draft, triggers KYC verification workflow. |
| FR‑004 | **Underwriting Decision** | Calls Underwriting Service → returns *APPROVE* / *REJECT* with rationale. |
| FR‑005 | **Loan Disbursement** | On approval → Disbursement Service triggers Razorpay API → funds credited to borrower’s bank account; status = *DISBURSED*. |
| FR‑006 | **Repayment Schedule Generation** | On disbursement → generate amortization table (principal, interest, due dates). |
| FR‑007 | **Repayment Processing** | Auto‑debit (NACH), UPI, NEFT, cash; updates `transactions` table; marks loan *CLOSED* on full repayment. |
| FR‑008 | **Delinquency & Collections** | If payment > 30 days → create collection task → send SMS/Email → flag NPA. |
| FR‑009 | **Regulatory Reporting** | Monthly RBI return (MIS‑1, Capital Adequacy) auto‑generated from ledger; PDF/JSON export. |
| FR‑010 | **Audit Trail** | Every state‑changing event (create, approve, disburse, repay) writes immutable log entry with user, timestamp, before/after data. |
| FR‑011 | **Role‑Based Access Control** | Admin, Branch‑Manager, Loan‑Officer, Collections, Auditor – each with scoped permissions. |
| FR‑012 | **Notification Engine** | Event‑driven: on KYC pending → SMS; on repayment due → push notification; on overdue → email + call. |
| FR‑013 | **Search & Reporting** | UI dashboards (PowerBI/Metabase) consume Elasticsearch indices; API endpoints for CSV/Excel export. |

### 4.2 Non‑Functional Requirements  

| Category | Requirement | Detail |
|----------|-------------|--------|
| **Performance** | UI latency ≤ 2 s (first paint) | Next.js code‑splitting, CDN caching. |
| | API 95th‑percentile latency ≤ 2 s | Autoscaling, Redis cache, async tasks. |
| **Scalability** | Horizontal scaling of stateless services | K8s HPA based on CPU & custom `request_queue_length` metric. |
| | Support 10× traffic growth without code change | Sharding via Citus, Kafka partitions. |
| **Reliability** | 99.9 % uptime (max 8.76 h/year) | Multi‑AZ deployment, pod disruption budgets, automated failover. |
| **Security** | Data at rest encrypted (AES‑256) | KMS‑managed keys for RDS, S3, EBS. |
| | TLS 1.3 for all in‑flight traffic | Enforced via Kong/Ingress. |
| | PCI‑DSS compliance for payment data | Tokenisation via Razorpay; no card data stored. |
| | RBI data‑localisation (India region) | All production DBs in `ap‑south‑1`. |
| **Observability** | Centralised metrics (Prometheus) | Request latency, error rate, queue depth. |
| | Centralised logs (ELK) | Structured JSON logs with `request_id`. |
| | Distributed tracing (OpenTelemetry) | End‑to‑end trace from UI → API GW → services. |
| **Maintainability** | CI/CD pipeline with automated tests | Unit, integration, contract (Pact), e2e (Cypress). |
| | 80 %+ test coverage | Unit (pytest), integration (Testcontainers), contract. |
| **Compliance** | 7‑year audit log retention | Immutable logs in Elasticsearch with WORM policy. |
| | Consent management UI for data usage | GDPR‑style consent receipt stored in MongoDB. |

---

## 5. Data Model  

### 5.1 Core Entities (simplified ER diagram)

```
Customer ──< Account >── Transaction
   │                │
   │                └── LoanApplication >─ LoanSchedule >─ Repayment
   │
   └── Document (KYC, e‑signature)
   └── AuditLog (immutable)

LoanProduct ──< LoanOffer >── LoanApplication
```

### 5.3 Key Tables (PostgreSQL)  

| Table | Primary Key | Important Columns | Notes |
|-------|-------------|-------------------|-------|
| **customers** | `customer_id` (UUID) | `name`, `dob`, `mobile`, `email`, `address`, `kyc_status`, `risk_score` | One‑to‑many `accounts`. |
| **accounts** | `account_id` (UUID) | `customer_id`, `product_id`, `balance`, `currency`, `status` | Sharded by `customer_id` (Citus). |
| **transactions** | `txn_id` (UUID) | `account_id`, `type` (debit/credit), `amount`, `posted_at`, `status` | Immutable; audit log references this row. |
| **loans** | `loan_id` (UUID) | `application_id`, `product_id`, `amount`, `tenure_months`, `interest_rate`, `status`, `disbursement_date` | One‑to‑many `loan_schedules`. |
| **loan_schedules** | `schedule_id` (UUID) | `loan_id`, `installment_no`, `due_date`, `principal`, `interest`, `total_payment` | JSONB for flexible schema. |
| **loan_applications** | `application_id` (UUID) | `customer_id`, `product_id`, `requested_amount`, `status`, `submitted_at`, `underwriting_status` | Temporal workflow state stored here. |
| **documents** | `doc_id` (UUID) | `customer_id`, `type` (id, address, DSC), `s3_url`, `uploaded_at`, `expiry` | MongoDB collection for large binary files. |
| **audit_log** | `log_id` (UUID) | `entity_type`, `entity_id`, `action`, `performed_by`, `timestamp`, `before_data`, `after_data` | Append‑only, indexed on `entity_id`. |

### 5.4 Example JSON Document (MongoDB)  

```json
{
  "_id": ObjectId("65f1c2a7b5e4..."),
  "customer_id": "c12345",
  "type": "ID_PROOF",
  "s3_url": "s3://nbfc-kyc/c12345/id_proof.pdf",
  "uploaded_at": "2025-11-02T14:20:00Z",
  "expiry": "2030-12-31",
  "verified": true,
  "verification_result": {
    "aadhaar_valid": true,
    "pan_valid": true,
    "score": 78
  }
}
```

---

## 6. API Design  

All APIs are **RESTful** (JSON over HTTPS) and versioned under `/api/v1`.  

### 6.1 Authentication  

* **Endpoint**: `POST /api/v1/auth/login`  
  *Request*: `{ "username": "...", "password": "...", "mfa_code": "123456" }`  
  *Response*: `{ "access_token": "...", "refresh_token": "...", "expires_in": 900 }`  

* **Security**: JWT signed with RS256, short‑lived (15 min) + refresh token flow.  

### 6.2 Core Endpoints  

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| **POST** | `/api/v1/customers` | Register new borrower (creates `Customer` record, returns `customer_id`). | `{ "name": "...", "dob": "...", "mobile": "...", "email": "...", "address": "..." }` | `201 Created` → `{ "customer_id": "...", "kyc_status": "PENDING" }` |
| **POST** | `/api/v1/customers/{id}/kyc` | Upload KYC documents, trigger verification. | `multipart/form-data` (files) + JWT | `202 Accepted` → `{ "status": "PROCESSING" }` |
| **GET** | `/api/v1/loans/{loan_id}` | Retrieve loan details (status, schedule). | – | `{ "loan_id": "...", "status": "APPROVED", "schedule": [...] }` |
| **POST** | `/api/v1/loans` | Submit loan application (draft). | `{ "customer_id": "...", "product_id": "...", "amount": 50000, "tenure": 12 }` | `202 Accepted` → `{ "application_id": "...", "status": "SUBMITTED" }` |
| **POST** | `/api/v1/loans/{id}/underwrite` | Trigger underwriting, return decision. | – | `{ "decision": "APPROVE", "score": 85 }` |
| **POST** | `/api/v1/loans/{id}/disburse` | Initiate fund transfer. | `{ "bank_account": "IN1234567890", "reference": "LOAN-12345" }` | `202 Accepted` → `{ "disbursement_id": "...", "status": "PENDING" }` |
| **GET** | `/api/v1/loans/{id}/schedule` | Get repayment schedule (amortization). | – | `{ "schedule": [ { "due_date":"2025-12-01","principal":1000,"interest":30,"total":1030 }, … ] }` |
| **POST** | `/api/v1/payments` | Record a repayment (auto‑debit webhook or manual). | `{ "loan_id": "...", "amount": 5000, "method": "auto_debit", "timestamp":"2025-11-03T08:15:00Z" }` | `200 OK` → `{ "status":"SUCCESS" }` |
| **GET** | `/api/v1/reports/regulatory` | Generate RBI return (XML/JSON). | Query params: `year=2025`, `quarter=Q3` | `200 OK` → file download or JSON. |
| **GET** | `/api/v1/metrics/portfolio` | Portfolio health metrics (NPA, provisioning). | – | `{ "total_loan_book": 1250000000, "npa_ratio": 2.3 }` |

*All endpoints require a valid JWT with appropriate `scope` claim (e.g., `loan:create`, `loan:disburse`).*

---

## 7. Security Considerations  

| Area | Controls |
|------|----------|
| **Authentication** | OAuth2 /OIDC via Auth0; MFA (SMS/OTP) for privileged users; JWT with short TTL. |
| **Authorization** | RBAC + ABAC – scopes (`loan:create`, `loan:collect`) enforced in each service; policies stored in DB and cached in Redis. |
| **Transport Security** | TLS 1.3 everywhere; mutual TLS between services (Istio). |
| **Data Protection** | • At‑rest encryption (KMS‑managed keys) for RDS, Aurora, S3, EBS. <br>• Field‑level encryption for PAN/Aadhaar (application‑level). |
| **Input Validation** | Pydantic (FastAPI) models + server‑side validation; client‑side validation in Next.js. |
| **Input Sanitization** | Escape HTML in responses, sanitize file names, limit upload size (max 10 MB). |
| **Rate Limiting** | Kong plugin: 100 requests/min per API‑key / user; burst up to 20. |
| **Secrets Management** | All DB credentials, API keys stored in HashiCorp Vault; injected as env vars at container start. |
| **Audit & Logging** | Every state change emits an event to Kafka → Audit Service writes immutable log to Elasticsearch (WORM). |
| **Pen‑Testing** | Quarterly external pen‑test; internal static analysis (Bandit, Snyk). |
| **Compliance** | RBI data localisation – all production DBs in India region; audit logs retained 7 years; consent records stored with timestamps. |

---

## 8. Error Handling  

### 8.1 Standard Error Response Format  

```json
{
  "code": "ERR_001",          // application‑specific error code
  "message": "Invalid request payload",
  "details": {
    "field": "amount",
    "reason": "must be a positive number"
  },
  "timestamp": "2025-11-02T14:32:10Z",
  "request_id": "a1b2c3d4e5f6"
}
```

*HTTP status codes:*  

| Code | Meaning |
|------|---------|
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient scope) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate application) |
| 429 | Too many requests (rate limit) |
| 500 | Internal server error |
| 502/503 | Service unavailable (upstream failure) |

### 8.2 Logging Strategy  

* **Structured JSON logs** include `request_id`, `user_id`, `service_name`, `event` (CREATE/UPDATE/DELETE), `payload_hash`.  
* **Centralised** via Fluent Bit → Elasticsearch → Kibana dashboards.  
* **Sensitive data** (PAN, passwords) are masked (`***`) before logging.  

### 8.3 Retry Logic  

* **Transient errors** (502, 503, network timeouts) → exponential back‑off (max 5 attempts).  
* **Idempotent operations** (payment, disbursement) use idempotency keys (`Idempotency-Key` header).  

---

## 9. Testing Strategy  

| Test Type | Scope | Tools |
|-----------|-------|-------|
| **Unit Tests** | Individual functions, business logic (interest calc, validation). | pytest, unittest, mocking. |
| **Integration Tests** | Service‑to‑service (e.g., Loan Service ↔ Underwriting). | Testcontainers (PostgreSQL, MongoDB, Kafka), pytest‑asyncio. |
| **Contract Tests** | API contract compatibility (request/response). | Pact or Schemathesis. |
| **Contract Testing (Consumer Driven)** | Ensure front‑end contracts match backend. | Postman/Newman collection. |
| **End‑to‑End Tests** | Full flow: UI → API → DB → external payment gateway. | Cypress (Web), Playwright, or Karate. |
| **Performance Tests** | Load 10 k, 25 k, 50 k RPS; latency, error rate. | k6, Gatling, Locust. |
| **Security Tests** | OWASP Top 10, token leakage, injection. | ZAP, OWASP ZAP, Snyk. |
| **Chaos Engineering** | Simulate pod failures, network partitions. | Chaos Mesh, Gremlin. |
| **Compliance Checks** | Verify audit log entries, data residency. | Custom scripts, audit‑log queries. |

All tests are executed in the CI pipeline; a **gate** prevents merge if coverage < 80 % or any critical test fails.

---

## 10. Deployment  

### 10.1 Build Process  

1. **Source** → GitHub repo.  
2. **GitHub Actions** workflow:  
   * `build` – Docker image built (`Dockerfile` uses `python:3.11-slim`).  
   * `test` – run unit, integration, security scans (Snyk).  
   * `push` – push image to Amazon ECR (private).  
   * `helm_upgrade` – ArgoCD watches the `helm/` chart; on new image tag, performs a **blue‑green** rollout.  

### 10.2 Environment Configuration  

* **Configuration** is externalised (environment variables) – e.g., DB connection string, Kafka broker list, feature flags.  
* **Secrets** are fetched from Vault at container start (side‑car).  

### 10.3 Monitoring & Observability  

* **Prometheus** scrapes metrics from each service (`/metrics` endpoint).  
* **Grafana** dashboards: request latency, error rates, queue depths, loan‑book size.  
* **Loki** aggregates logs; **Jaeger** visualises traces.  
* **Alertmanager** triggers Slack/PagerDuty alerts on:  
  * API latency > 2 s for 5 min.  
  * Error rate > 0.5 %.  
  * Kafka consumer lag > 5 min.  

### 10.4 Backup & Disaster Recovery  

| Component | Backup Method | Retention |
|-----------|---------------|-----------|
| PostgreSQL (Citus) | Automated snapshots (daily) + WAL archiving | 35 days (PITR) |
| MongoDB | `mongodump` → S3 versioned bucket | 30 days |
| Elasticsearch | Snapshot repository on S3 | 90 days |
| Application code & Helm values | Git repo + artifact repo | Indefinite (Git history) |
| **DR** | Cross‑region read replica of RDS; DNS cut‑over; S3 bucket replication. | RPO ≤ 5 min, RTO ≤ 30 min. |

---

## 11. Open Questions  

| # | Question | Impact | Possible Resolution |
|---|----------|--------|---------------------|
| O1 | **Which payment gateway(s) to support** (Razorpay only vs. multiple)? | Impacts disbursement latency, compliance (PCI). | Start with Razorpay; design abstraction layer to add others later. |
| O2 | **Choice of workflow engine** – Temporal vs. Camunda vs. custom state machine. | Affects durability, learning curve, licensing. | Evaluate PoC: Temporal offers strong durability and easy UI; Camunda provides BPMN familiarity. |
| O3 | **Data residency** – will any data ever need to leave India (e.g., for analytics)? | Regulatory compliance. | Keep all PII in India; anonymised analytics can be sent to a separate region under strict controls. |
| O4 | **Scaling strategy for document store** (MongoDB) – sharding vs. single node. | Cost & performance at scale. | Start with single‑node; evaluate sharding once > 10 M docs. |
| O5 | **Regulatory reporting frequency** – monthly vs. real‑time. | Architecture of reporting service. | Begin with monthly batch; design real‑time pipeline as optional extension. |
| O6 | **Multi‑currency support** – will we need INR + USD/EUR? | Currency handling in ledger and APIs. | Design monetary values as `numeric(18,2)` with currency code; support conversion rates via external service. |
| O7 | **Future AI credit scoring** – will we need a separate ML service? | Architecture for model serving. | Keep scoring logic in separate micro‑service (FastAPI) that can be swapped with an ML model later. |

---

## 12. Summary  

The proposed **NBFC‑Python Multi‑Loan Lending Application** leverages a **micro‑service architecture** built on **Python (FastAPI)** for business logic, **Temporal** for reliable workflow orchestration, **PostgreSQL (Citus)** for ACID‑critical ledger data, **MongoDB** for flexible KYC document storage, and **Kafka** for event‑driven communication.  

* The **Next.js** front‑end delivers a modern, responsive experience for borrowers and staff.  
* **Kong API Gateway** provides a secure, rate‑limited entry point with JWT validation and central logging.  
* **Istio** service mesh ensures mTLS, traffic management, and observability across services.  
* **Kubernetes (EKS)** with Helm and ArgoCD gives us a cloud‑native, highly available deployment pipeline with blue‑green releases and automated rollbacks.  

The design satisfies all functional goals (digital onboarding, multi‑product loan lifecycle, real‑time disbursement, collections) and non‑functional requirements (scalability, reliability, security, compliance). The open questions are documented and can be resolved during detailed design and prototyping phases.

---  

*End of Document*