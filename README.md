# Meme’d — Campaign Payout Tracker

**A full-stack creator-marketing platform for launching campaigns, submitting social-media posts, simulating view growth, and tracking milestone-based creator rewards.**

Built for the **WLDD SDE-I Take-Home Assignment**, Meme’d demonstrates secure Brand/Creator workflows, milestone payout accounting, campaign budget protection, concurrency handling, persistent view-spike auditing, and cloud deployment.

## Live Application & Resources

| Resource | Link |
|---|---|
| **Live application** | [Launch Meme’d](https://memed-campaign-payout-tracker-vert.vercel.app/) |
| **Backend API** | [Render deployment](https://memed-campaign-payout-tracker-xemv.onrender.com/) |
| **Source code** | [GitHub repository](https://github.com/sayankhan313/memed-campaign-payout-tracker) |
| **Figma UI/UX design** | [Explore Meme’d design](https://www.figma.com/design/CwhntV90jDRCmMShrJjdvE/meme-d?node-id=0-1) |

> **Demo:** Register one **Brand** account and one **Creator** account. Use a regular browser window for one role and an Incognito/private window for the other, since cookies are shared across tabs in the same browser profile. The Render backend may take extra time to respond after inactivity.

---

## 1. Overview

Meme’d connects **Brands**, who create Instagram/YouTube campaigns with defined budgets and reward milestones, with **Creators**, who submit post links and earn simulated rewards according to post views.

### End-to-end workflow

1. A Brand creates an account and configures a campaign: name, platform, budget, and milestone ladder.
2. A Creator discovers an available campaign and submits an Instagram or YouTube post URL.
3. A controlled simulation updates the post's view count.
4. The backend identifies the **highest eligible milestone** and calculates only the **additional reward** due.
5. Transactional database operations protect campaign budgets and prevent duplicate rewards.
6. The Creator sees updated earnings; the Brand monitors campaign performance and flagged view spikes.

The core engineering focus is **correct payout calculation, budget consistency, and safety under concurrent requests**.

## 2. Features

### Brand

- JWT-based signup/login and role-restricted access.
- Create and manage campaigns with platform, budget, and milestone reward settings.
- View budget spent versus remaining, submissions, and campaign performance.
- Monitor unusual view increases through Brand-facing spike analytics.

### Creator

- Signup/login and discovery of available campaigns.
- Submit social-media post links to campaigns.
- Track submissions, simulated views, and accumulated milestone earnings.
- Run a controlled demo view simulator to demonstrate milestone progression.

### Engineering

- Modular Express + TypeScript REST API with validation, authentication, and ownership checks.
- MongoDB/Mongoose persistence with transactions for payout-sensitive writes.
- Incremental payout accounting, budget caps, concurrency protection, and repeated-update safety.
- Persistent audit records for suspicious view spikes.
- Redis-based campaign-list caching with fallback to MongoDB when the cache is unavailable.
- Jest/Supertest automated tests, Docker Compose, and Vercel/Render deployment.

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript |
| Database / ODM | MongoDB Atlas, Mongoose |
| Authentication | JWT; HTTP-only cookies in the web app |
| Cache | Redis (Render Key Value; Redis locally) |
| Testing | Jest, Supertest |
| Infrastructure | Docker, Docker Compose |
| Deployment | Vercel (frontend), Render (backend/cache), MongoDB Atlas |
| Design | Figma |

## 4. System Architecture

![Meme’d System Architecture](docs/testing/screenshots/system%20architecture%20diagram/Meme%E2%80%99d%20Campaign%20Payout%20Tracker%20Architecture.png)

*Figure 1. Meme’d Campaign Payout Tracker — System Architecture.*

The current application uses a **modular monolith**: distinct backend modules for authentication, campaigns, submissions, payouts, and spike monitoring, deployed together as one API. This makes testing and transactions simpler for the assignment scope.

```mermaid
flowchart TD
    U["Brand / Creator Browser"] --> N["Next.js Web App — Vercel"]
    N --> R["Next.js Server Routes"]
    R --> A["Express API — Render"]
    A --> AUTH["Authentication & Authorisation"]
    A --> CAMP["Campaign Management"]
    A --> SUB["Submissions"]
    A --> PAY["Payout Processing"]
    A --> SPIKE["Spike Monitoring"]
    AUTH --> DB[("MongoDB Atlas")]
    CAMP --> DB
    SUB --> DB
    PAY --> DB
    SPIKE --> DB
    CAMP <--> CACHE[("Redis Cache")]
```

**Typical backend request path:** HTTP request → Route → Authentication/validation → Controller → Service/business rules → Mongoose → MongoDB → JSON response.

## 5. Payout Logic & Budget Protection

Creator rewards correspond to the **highest milestone reached**, rather than the sum of rewards at all lower milestones.

| Views | Total eligible reward | Additional payout |
|---:|---:|---:|
| 10,000 | ₹500 | ₹500 |
| 50,000 | ₹2,000 | ₹1,500 |
| 100,000 | ₹4,000 | ₹2,000 |
| 100,000 repeated | ₹4,000 | ₹0 |

```text
Target payout       = highest milestone reward reached
Additional payout   = max(0, target payout - already recorded payout)
Remaining budget    = campaign total budget - recorded spending
```

Business rules include non-decreasing view counts, no duplicate milestone payouts, enforcement of the campaign's remaining budget, and safe handling of simultaneous view updates. **MongoDB transactions and conditional budget checks** protect consistency when requests compete for the same campaign balance.

## 6. View-Spike Monitoring

A single update increasing a submission's views by **100,000 or more** is flagged as unusual. The backend records an audit entry with the submission/campaign/creator references, previous and new view totals, view difference, and detection context. Brands can review the resulting spike analytics.

**Implemented behaviour: spike detection, MongoDB audit records, and Brand alerts.**

**Not implemented: automatic payout holding, suspension, reversal, or a manual approval/rejection workflow.** Monitoring is separate from payout enforcement in this submitted version.

## 7. Authentication & Security

- JWT-based authentication for **Brand** and **Creator** roles.
- HTTP-only authentication cookies in the Next.js web application.
- Role-based restrictions and resource-ownership checks for protected operations.
- Backend-side request validation and error handling.
- Environment variables for sensitive configuration.
- Transactional safeguards for payout and campaign budget updates.

The demo view simulator is for reproducible testing; it is not independent verification of real Instagram/YouTube engagement.

## 8. Local Installation

### Prerequisites

- Node.js and npm, and Git.
- MongoDB Atlas or another MongoDB environment that supports transactions.
- Docker Desktop if using Docker Compose.
- Redis for local caching (optional for core database functionality).

### Clone the repository

```bash
git clone https://github.com/sayankhan313/memed-campaign-payout-tracker.git
cd memed-campaign-payout-tracker
```

### Configure environment variables

Create `backend/.env` using the project's example/configuration as a guide. Illustrative values:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/DATABASE
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
ENABLE_DEMO_VIEW_SIMULATOR=true
MONGODB_TEST_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/SEPARATE_TEST_DATABASE
```

Create `frontend/.env.local`:

```dotenv
BACKEND_URL=http://127.0.0.1:5000
ENABLE_DEMO_VIEW_SIMULATOR=true
```

**Note:** These are examples, not actual credentials or a guaranteed exhaustive list of configuration variables. Match the API port and frontend URL to your environment. Keep production and test databases separate; never commit `.env` files or secrets.

### Run without Docker

In one terminal:

```bash
cd backend
npm ci
npm run dev
```

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:3000**.

### Run with Docker Compose

From the repository root:

```bash
docker compose up --build -d
docker compose ps
```

The configured Compose setup runs frontend, backend, and Redis, with MongoDB Atlas external to Docker. The local Docker frontend is mapped to **http://localhost:3001** in the project's current configuration.

Stop containers without deleting volumes:

```bash
docker compose down
```

## 9. API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/signup` | Create Brand/Creator account |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/campaigns` | Create campaign |
| `GET` | `/api/campaigns/live` | Discover live campaigns (Creator)  |
| `GET` | `/api/campaigns/mine` | List own Brand campaigns |
| `POST` | `/api/submissions` | Submit Creator post |
| `GET` | `/api/submissions/mine` | List own submissions |
| `PATCH` | `/api/submissions/:id/views` | Simulate view update |
| `GET` | `/api/earnings/me` | Get Creator earnings |
| `GET` | `/api/campaigns/:id/submissions` | View campaign submissions |
| `GET` | `/api/campaigns/brand/spike-analytics` | Brand spike analytics |

Refer to `backend/src/modules/` and `backend/tests/integration/` for the authoritative route definitions, request validation, and reproducible API examples.

## 10. Testing

The backend test suite covers authentication, access control, campaign lifecycle, submissions, payout calculation, budget caps, concurrent updates, repeat-update safety, spike auditing, and cross-role workflows.

```bash
cd backend
npm ci
npm run build
npm test
```

**Verified stable baseline:**

```text
Test Suites: 9 passed, 9 total
Tests:       92 passed, 92 total
Snapshots:   0 total
```

Frontend production build:

```bash
cd frontend
npm ci
npm run build
```

The stable frontend passed the Next.js production build and TypeScript checks. Manual testing also verified separate Chrome/Incognito Brand and Creator sessions, campaign creation/discovery, post submission, view simulation, milestone rewards, and Brand spike analytics.

Where available, testing evidence and screenshots are maintained under `docs/testing/`.

## 11. UI/UX Design

**[Explore the Meme’d Figma Design](https://www.figma.com/design/CwhntV90jDRCmMShrJjdvE/meme-d?node-id=0-1)**

The design explores the landing page, role-based registration, creator-marketing visual identity, campaign information hierarchy, and reward presentation. Figma is a **design reference**; the deployed Next.js application is the working implementation.

## 12. Screenshots & Evidence

The application includes Brand dashboard, campaign creation/management, spike analytics, Creator discovery, post submission, earnings, and the demo simulator. Supporting test artefacts and screenshots are available in the repository's documentation folders where included.

To inspect the working interface, use the **[live application](https://memed-campaign-payout-tracker-vert.vercel.app/)**. Screenshot links have intentionally not been hardcoded here where their final repository paths have not been verified.

## 13. Assumptions & Limitations

1. **Simulated payouts:** Rewards are application accounting records, not actual bank or payment-provider transfers.
2. **Simulated views:** Views are supplied through controlled updates, not live social-platform verification.
3. **Highest milestone:** The highest achieved reward is the total eligible amount; lower milestones are not summed.
4. **Incremental accounting:** New rewards subtract previously recorded payouts.
5. **Budget constraint:** Campaign spending must not exceed available funds.
6. **Spike monitoring only:** Suspicious updates are audited and surfaced to Brands; payouts are not automatically frozen.
7. **Demo access:** The simulator is intended for controlled demonstration, not unrestricted real-world engagement processing.
8. **Hosting:** Free-tier services may experience cold starts and resource limits.

## 14. Scaling to 10,000+ Creators

The current modular monolith is appropriate for the assignment. If scale increases, an incremental evolution is preferable to rewriting the application prematurely:

- **Horizontal scaling:** Run multiple stateless Express API instances behind a load balancer.
- **Asynchronous processing:** Use a Redis-backed queue (e.g., BullMQ) for high-volume view ingestion, retries, scheduled updates, and notifications.
- **Database efficiency:** Add/optimise MongoDB indexes for campaigns, submissions, creator lookups, payout data, and audits; use pagination, aggregation, and connection pooling.
- **Caching:** Expand Redis caching for read-heavy campaign lists and appropriate analytics, with clear expiration and invalidation rules.
- **Payout reliability:** Retain idempotency and atomic budget safeguards for concurrent or retried jobs.
- **Observability:** Introduce structured logs, request metrics, tracing, rate limiting, and alerts.

### Possible Future Microservices

| Candidate service | Responsibility |
|---|---|
| Authentication | Identity and access control |
| Campaigns | Campaign creation, discovery, and configuration |
| Submissions | Creator posts and submission metadata |
| View processing | View ingestion, verification, and anomaly detection |
| Payouts | Milestone calculation, accounting, and budget enforcement |
| Notifications | Creator and Brand alerts |

Independent services could communicate through APIs and asynchronous events where useful. **Microservices are a future architectural option, not part of the current deployment**: they introduce distributed transactions, network failure modes, operational overhead, and data-consistency complexity. Service extraction should follow measurable traffic and organisational needs.

## 15. Future Improvements

### Suspicious Payout Holding & Review

The current implementation **detects spikes, stores audit records, and exposes Brand analytics**, but it does not automatically place payouts on hold.

A future trust-and-safety flow could be:

```text
Suspicious view update
        ↓
Hold additional eligible reward
        ↓
Authorised manual review
       / \
  Approve  Reject
     ↓       ↓
  Release  Do not release
       \   /
    Record audit decision
```

This would require explicit payout states, authorised review permissions, idempotent release/rejection operations, correct campaign-budget handling, and full audit history. It was **deferred to prioritise a stable, tested end-to-end submission**.

Other potential enhancements:

- Supported Instagram/YouTube APIs for verified view updates.
- Real payment-provider disbursements, reconciliation, and compliance controls.
- Milestone and anomaly notifications.
- Historical analytics and Creator performance reporting.
- CI/CD with automated tests, dependency checks, and deployment verification.

**All items in this section are proposals, not features claimed as implemented.**

## 16. Deployment

| Component | Provider |
|---|---|
| Next.js frontend | [Vercel](https://memed-campaign-payout-tracker-vert.vercel.app/) |
| Express API | [Render](https://memed-campaign-payout-tracker-xemv.onrender.com/) |
| Database | MongoDB Atlas |
| Cache | Render Key Value (Redis-compatible) |
| Local environment | Docker Compose |

Configuration and credentials are supplied through environment variables and should not be stored in the public repository.

## 17. Engineering Decisions

- **Modular monolith:** Straightforward development, deployment, debugging, and transactional boundaries for the assignment.
- **MongoDB transactions:** Keep related campaign-spending and submission-payout updates consistent.
- **Incremental payouts:** Avoid repeated rewards when the same milestone is updated more than once.
- **Redis:** Reduce repeated reads while retaining MongoDB as the persistent source of truth.
- **Simulated views:** Reproduce milestone, budget, concurrency, and spike scenarios without third-party API dependencies.
- **Deferred payout holding:** Avoid an incomplete trust-and-safety workflow; prioritise tested accounting and deployment instead.

---

**WLDD SDE-I Take-Home Assignment — Meme’d Campaign Payout Tracker**
