# RefurbIQ — Component Integration Overview

> **Senior Consultant Analysis**  
> Stack: Hono v4 (TypeScript) · Cloudflare Workers/Pages · Vanilla JS SPA · Tailwind CSS (CDN) · Wrangler v3  
> Data layer: **In-memory only** (no DB yet) · Deployment: **Local dev only** (not yet in production)  
> Last updated: **2026-04-28**

---

## Component Status Table

| Status | Component | Primary Purpose | Technologies (Current → Target) | Priority | Next Action Required |
|--------|-----------|-----------------|----------------------------------|----------|----------------------|
| ✅ **Complete** | **Frontend** (UI/UX Layer) | 20-page SPA, all module screens, charts, modals, responsive sidebar | Vanilla JS · Tailwind CSS CDN · Chart.js CDN · Font Awesome 6 CDN | — | Maintain; add dark-mode polish if needed |
| ✅ **Complete** | **Backend** (Server & API Layer) | ~50 REST endpoints across all 20 modules; VAT, OPR, Fintech calculation engines | Hono v4 · TypeScript · Cloudflare Workers · Wrangler v3 | — | Expand stubs (HMRC MTD, marketplace OAuth) in Phase 6 |
| ❌ **Not Started** | **Database** (Data Persistence) | Persist all ERP data across restarts; multi-tenant `company_id` scoping | **In-memory now** → **Cloudflare D1** (SQLite) | 🔴 **#1 Critical** | `wrangler d1 create refurbiq-production` → write migration files → port `api.ts` arrays |
| ❌ **Not Started** | **Authentication** (Security & Identity) | Protect all routes; multi-tenant login; role-based access (admin vs staff vs SaaS tenant) | **None now** → **Clerk** (recommended) or JWT middleware in Hono | 🔴 **#2 Critical** | Add Hono JWT middleware; define roles (superadmin, tenant-admin, staff) |
| ❌ **Not Started** | **Hosting/Deployment** (Infrastructure) | Serve the app globally at a real URL; edge performance | Cloudflare Pages (already configured in `wrangler.jsonc`) | 🔴 **#3 Critical** | `npm run build && npx wrangler pages deploy dist --project-name refurbiq` |
| ❌ **Not Started** | **CI/CD Pipeline** (Automated Deployment) | Auto-build + deploy on git push; prevent broken deploys | **GitHub Actions** → Cloudflare Pages deploy action | 🟡 High | Create `.github/workflows/deploy.yml` after first manual deploy succeeds |
| ✅ **Complete** | **API Layer** (Frontend–Backend Communication) | All frontend pages call `/api/*` via Axios; full CRUD across all modules | Axios CDN · Hono routing · JSON responses | — | Add auth headers to all Axios calls once auth is implemented |
| ❌ **Not Started** | **Caching** (Performance Optimization) | Cache frequently-read data (device variants, VAT codes, supplier list) to reduce D1 reads | **Cloudflare KV** (native edge KV) | 🟡 Medium | Implement after D1 migration; cache `GET /vat-codes`, `GET /device-variants`, `GET /suppliers` |
| 🔄 **Partial** | **Monitoring/Logging** (System Health) | Track errors, API response times, tenant activity, audit events | Audit Log module ✅ built · **Cloudflare Analytics** (free, built-in) · **Logpush** for structured logs | 🟡 Medium | Enable Cloudflare Analytics on deploy; wire Logpush to external sink (e.g. Axiom) for persistent logs |
| ❌ **Not Started** | **File Storage** (Media & Documents) | OPR document vault (4-yr retention); RMA photos; invoice PDFs; device images | **Cloudflare R2** (S3-compatible, zero egress cost) | 🟡 Medium | `wrangler r2 bucket create refurbiq-docs`; replace in-memory OPR document stubs with R2 `put`/`get` |
| ❌ **Not Started** | **Search** (Advanced Queries) | IMEI lookup across all tenants; full-text device/order/ticket search | **Cloudflare D1 FTS** (SQLite full-text search, free) · Fallback: Algolia | 🟢 Low | Implement after D1 is live; add `FTS5` virtual table to migration files |
| 🔄 **Partial** | **Notifications** (User Communication) | In-app feed ✅ built (stub data); email alerts for INR escalations, MTD deadlines, OPR expiry | In-app: `/api/notifications` ✅ · **Email: Resend** (recommended) or Cloudflare Email Workers | 🟢 Low | Wire real trigger events to notifications after D1; add Resend for email on MTD/OPR deadlines |

---

## Progress Summary

### Overall Completion: ~42% production-ready

| Layer | Status |
|-------|--------|
| **UI / Product Logic** | ✅ ~95% — All 20 screens built, all 10 non-negotiable controls active, stubs clearly identified |
| **API Surface** | ✅ ~85% — ~50 endpoints; 7 stubs (HMRC, marketplace OAuth, AI drafts, approvals) |
| **Infrastructure** | ❌ ~5% — Nothing deployed, no database, no auth, no CI/CD |

**What's working exceptionally well:**
- The VAT engine is the standout — 8 VAT codes, full HMRC 9-box mapping, DRC threshold logic, export override, and reverse charge atomicity are all correctly modelled. This is the hardest compliance piece and it's done.
- The audit trail is complete and enforced across all override paths — this will make the D1 migration straightforward because every mutation already produces a structured record.
- The single-file SPA architecture is unconventional but disciplined — the section map in CLAUDE.md makes it navigable, and the escaping rules are correctly documented.

---

## Top 3 Immediate Priorities

### 🔴 Priority 1 — Database (Cloudflare D1)
**Why first:** Every other improvement is blocked by this. Auth needs user tables. Deployment without a DB means all data resets on every cold start. The in-memory store is a demo, not a product.

**Exact steps:**
```bash
# 1. Create production database
npx wrangler d1 create refurbiq-production
# Copy the database_id into wrangler.jsonc

# 2. Create migrations/0001_initial_schema.sql
# Tables: companies, users, devices, purchase_batches, opr_batches,
#         orders, vat_records, vat_periods, qc_records, rma, repairs,
#         investigations, tickets, fintech_advances, audit_log,
#         device_variants, notifications, tenants

# 3. Apply locally and test
npx wrangler d1 migrations apply refurbiq-production --local
npm run build && pm2 restart refurbiq

# 4. Port src/routes/api.ts: replace array.push/filter with
#    env.DB.prepare('SELECT ...').bind(...).all()
```

**Effort estimate:** 3–5 days (schema design + porting all 50 endpoints)

---

### 🔴 Priority 2 — Authentication (JWT / Clerk)
**Why second:** Without auth, deploying to a public URL exposes all tenant data to anyone with the URL. The multi-tenant `company_id` design is already in place — it just needs a gate.

**Recommended approach for this stack:**
- **Option A (simpler):** Hono JWT middleware — issue tokens on login, validate on every `/api/*` route, embed `company_id` in the token payload. No external service.
- **Option B (faster to build):** [Clerk](https://clerk.com) — handles login UI, session management, and organisation-level multi-tenancy. Has a Cloudflare Workers SDK.

**Minimum viable auth implementation:**
```typescript
// src/routes/api.ts — add to every route
import { jwt } from 'hono/jwt'
app.use('/api/*', jwt({ secret: env.JWT_SECRET }))

// Extract tenant from token
const payload = c.get('jwtPayload')
const company_id = payload.company_id  // enforce on all DB queries
```

**Effort estimate:** 1–2 days for JWT middleware; 3–4 days for full login UI + role enforcement

---

### 🔴 Priority 3 — Cloudflare Pages Deployment
**Why third:** Even before auth is complete, deploying gives you a real URL to test against, exposes any edge-runtime issues early, and unblocks CI/CD setup.

**Exact steps:**
```bash
# 1. Setup Cloudflare API key in the Deploy tab
# 2. First deploy
npm run build
npx wrangler pages project create refurbiq --production-branch main
npx wrangler pages deploy dist --project-name refurbiq

# 3. Add secrets
npx wrangler pages secret put JWT_SECRET --project-name refurbiq

# 4. Verify
curl https://refurbiq.pages.dev/api/dashboard
```

**Effort estimate:** 2–4 hours

---

## Critical Gaps

### 🚨 Gap 1 — No Authentication (Severity: CRITICAL)
**Risk:** Any user who finds the URL has full read/write access to all tenants' ERP data — devices, VAT records, HMRC submission history, fintech advances. The tenant management screen would allow anyone to suspend tenants.  
**Fix:** Block deployment behind auth. Do not make the production URL public until JWT middleware is on every `/api/*` route.

### 🚨 Gap 2 — In-Memory Database (Severity: CRITICAL)
**Risk:** Cloudflare Workers have no persistent process. Every cold start (which happens after ~30s of inactivity on the free plan) resets all data. A single restart wipes every device, order, VAT record, and audit log entry in the system.  
**Fix:** D1 migration must precede any real business use. Even internal testing should use D1 locally.

### ⚠️ Gap 3 — No Rate Limiting (Severity: HIGH)
**Risk:** The `/api/vat/evaluate`, `/api/scanner/lookup`, and `/api/opr/calculate` endpoints do significant computation. Without rate limiting, a single tenant (or an attacker) could exhaust the Cloudflare Workers CPU budget for all tenants.  
**Fix:** Add Hono rate-limit middleware or use Cloudflare's built-in rate limiting rules (available in the dashboard, no code required).

### ⚠️ Gap 4 — OPR Document Vault Is a Stub (Severity: HIGH — Compliance Risk)
**Risk:** HMRC requires OPR supporting documents to be retained for 4 years (non-negotiable control #9). The document vault UI exists but stores nothing — documents are not actually saved anywhere. If a business uses this today they may believe they are compliant when they are not.  
**Fix:** R2 bucket for document storage must be implemented before the OPR module is used in production.

### ⚠️ Gap 5 — No HMRC MTD Live Connection (Severity: HIGH — Compliance Risk)
**Risk:** The MTD submission button fires a stub. Tenants could believe they have submitted a VAT return when they have not.  
**Fix:** Either remove the Submit button from the UI until the real HMRC MTD API is wired, or replace it with a prominent "This feature is not yet live" warning. Do not leave a working-looking stub on a compliance-critical action.

---

## Technology Recommendations

All recommendations are native to the Cloudflare ecosystem — no new vendors needed unless noted.

| Need | Recommended Tool | Why It Fits |
|------|-----------------|-------------|
| **Database** | Cloudflare D1 | Already in `wrangler.jsonc` config; SQLite FTS5 covers search needs; zero egress cost; `--local` mode for dev |
| **Authentication** | Hono JWT middleware (Phase 5) → Clerk (Phase 6 SaaS) | JWT is zero-dependency and fits the Workers runtime; Clerk adds org-level multi-tenancy when you go SaaS |
| **File Storage** | Cloudflare R2 | S3-compatible API; zero egress fees; binds directly to Workers; perfect for OPR docs, RMA photos, invoice PDFs |
| **Caching** | Cloudflare KV | Sub-millisecond reads at edge; ideal for VAT codes, device variant catalogue, supplier lists (read-heavy, rarely updated) |
| **Email Notifications** | [Resend](https://resend.com) | Simple REST API, works in Workers, generous free tier (3,000 emails/month); use for MTD deadlines + OPR expiry alerts |
| **CI/CD** | GitHub Actions + `cloudflare/pages-action` | Official action; triggers on push to `main`; runs `npm run build` then deploys to Pages automatically |
| **Monitoring** | Cloudflare Analytics (free) + [Axiom](https://axiom.co) via Logpush | Cloudflare Analytics gives request/error metrics for free; Axiom gives searchable structured logs (free tier: 500GB/month) |
| **HMRC MTD API** | HMRC Developer Hub (OAuth 2.0) | Required for live VAT submission; register at `developer.service.hmrc.gov.uk`; use `MTD-VAT` API v1.0 |
| **Marketplace APIs** | eBay REST API · Amazon SP-API | Both require OAuth app registration; eBay is simpler to start with |

---

## Recommended Build Sequence (Phase 5 → 6)

```
Phase 5 (Data Persistence)
├── Week 1: D1 schema design + migration files
├── Week 2: Port api.ts endpoints to D1 queries (most complex week)
├── Week 3: Auth (JWT middleware + login page)
└── Week 4: First Cloudflare Pages deploy + GitHub Actions CI/CD

Phase 6 (Production Hardening)
├── Week 5: R2 for OPR document vault
├── Week 6: KV caching layer + rate limiting
├── Week 7: HMRC MTD live API (removes #1 compliance stub)
├── Week 8: Resend email notifications for MTD/OPR deadlines
└── Week 9: Marketplace OAuth (eBay first, Amazon second)
```

---

*This document reflects the state of the codebase as of 2026-04-28.  
Update alongside `docs/STATUS.md` when phases complete.*
