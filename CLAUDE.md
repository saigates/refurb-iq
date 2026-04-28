# CLAUDE.md — RefurbIQ Project Intelligence
> Keep under 200 lines. Every line must pass the Mistake Test:
> "Would Claude make an error without this?" If no → delete it.

---

## What This Is
RefurbIQ is a refurbished-electronics ERP for UK resellers — inventory, QC,
VAT/HMRC MTD, repairs, RMA, P&L, and supplier management.
Deployed to Cloudflare Pages/Workers. All data is **in-memory** (no DB yet).

---

## Architecture — The Single-File Constraint

### `src/index.tsx` — 5,700+ lines, one TypeScript template literal
The **entire HTML page** (head, styles, HTML, and all JS) is returned as a
single Hono `c.html(...)` response. The JS lives in one `<script>` block.

**This creates a critical escaping rule (see Gotchas).**

### `src/routes/api.ts` — REST API (~670 lines)
All `/api/*` routes. Data stored in module-level arrays (`suppliers`,
`purchaseBatches`, `devices`, etc.) — resets on worker restart.

### File map
```
src/index.tsx        ← HTML + all frontend JS (one file, one template literal)
src/routes/api.ts    ← All REST API endpoints + in-memory data arrays
src/lib/             ← VAT/OPR calculation helpers
src/types/           ← TypeScript interfaces
src/renderer.tsx     ← Hono JSX renderer (do not modify)
public/static/       ← Static assets (CSS, icons)
```

---

## `src/index.tsx` Section Map

The entire file is a single Hono `c.html(...)` template literal returned by
`getIndexHTML()` (line 22 → 5692). To navigate, grep for landmark banners:
`grep -n '═══\|PAGE:' src/index.tsx`. Each page renderer is preceded by a
`// PAGE: <NAME>` banner comment — these are intentional and must be preserved.

**Top-level block ranges:**

| Block | Lines |
|---|---|
| Hono entry + `getIndexHTML()` opener | 1–22 |
| HTML Shell (head + Tailwind/FA/Chart.js + `<style>`) | 23–149 |
| Layout (sidebar, topbar, modal scaffold) | 150–384 |
| `<script>` open + frontend JS utilities (`fmt`, `statusBadge`, `table`, `statCard`, badges) | 386–520 |
| Navigation (`navigateTo`) + Modal helpers (`openModal`/`closeModal`) | 522–606 |
| Page Renderers (all 21 pages) | 608–5606 |
| UI Chrome (`toggleSidebar`, `applyTheme`, `toggleTheme`, `initUI`) | 5608–5677 |
| `DOMContentLoaded` + modal overlay listener + `</script></body></html>` | 5680–5692 |

**Page renderer table:**

| Page | Render Function | Line Range | Key sub-functions |
|---|---|---|---|
| Dashboard | `renderDashboard` | 608–940 | `renderDeviceChart`, `renderMktChart`, `renderVatChart`, `renderRecentOrders`, `renderOPRTracker` |
| Inventory | `renderInventory` | 941–987 | `renderDevicesTable`, `filterDevices`, `viewDevice`, `showImportModal`, `parseImportCsvFile`, `submitImportBatch` |
| QC | `renderQC` | 1491–1656 | `renderQCPending`, `showQCTab`, `openQCForm` |
| OPR | `renderOPR` | 1657–1853 | `renderOPRCard`, `showOPRCalculator`, `calcOPR`, `viewOPRDocs`, `showNewOPRModal` |
| Orders | `renderOrders` | 1854–2005 | `renderOrdersTable`, `filterOrders`, `viewOrder`, `showDRCInfo` |
| VAT Engine | `renderVAT` | 2006–2261 | `renderVatReturn`, `renderVatBox`, `showVatTab`, `runVatCalc`, `runDRCEval` |
| Fintech | `renderFintech` | 2262–2338 | `calcFintech` |
| Suppliers & Batches | `renderSuppliers` | 2339–2740 | `renderBatchesTable`, `renderSuppliersTable`, `openSupplierDrawer`, `saveSupplier`, `deactivateSupplier`, `showNewBatchModal` |
| Bulk Override | `openBulkOverrideModal` | 2741–2906 | `previewBulkOverride`, `submitBulkOverride`, `bulkSelectAll` |
| Support | `renderSupport` | 2907–3038 | `renderTicketsTable`, `filterTickets`, `viewTicket`, `showNewTicketModal` |
| Admin & Settings | `renderAdmin` | 3039–3252 | `renderAdminSettingsHTML`, `showAdminTab`, `renderDeviceVariantsInto`, `sortVariants` |
| Variants Catalogue | (`renderDeviceVariantsInto`) | 3255–3412 | `variantRow`, `filterVariants`, `openAddVariantModal`, `submitAddVariant`, `handleVariantCsvUpload`, `confirmCsvImport` |
| Device Override Panel | `renderOverridePanel` | 3413–3505 | `onOverrideReasonChange`, `submitAttributeOverride` |
| Courier & INR | `renderCourier` | 3507–3752 | `invStatusBadge`, `eventTypeBadge`, `renderInvestigationsTable`, `filterInvestigations`, `viewInvestigation`, `showNewInvestigationModal` |
| Returns & RMA | `renderRMA` | 3753–3950 | `rmaStatusBadge`, `renderRMATable`, `showRMATab`, `viewRMA` |
| Profitability & P&L | `renderProfitability` | 3951–4166 | `renderMakeChart`, `renderPnLTable`, `filterPnL` |
| Repairs | `renderRepairs` | 4167–4440 | `repairStatusBadge`, `repairOutcomeBadge`, `renderRepairCards`, `filterRepairs`, `showRepairDetail` |
| Supplier Analytics | `renderSupplierAnalytics` | 4441–4662 | `renderSupplierChart`, `showSupplierDetail` |
| HMRC MTD Returns | `renderMTD` | 4663–4827 | `submitMTDReturn` |
| Audit Log | `renderAuditLog` | 4828–4933 | `renderAuditTable`, `filterAuditLog` |
| IMEI Scanner | `renderScanner` | 4934–5209 | `scanLookup`, `showIntakeForm`, `showManualIntake`, `cancelIntake`, `submitIntake` |
| Marketplace Hub | `renderMarketplace` | 5210–5398 | `syncMarketplace`, `reconnectMarketplace`, `openMktDetail` |
| Tenant Management | `renderTenants` | 5399–5606 | `renderTenantRows`, `filterTenants`, `openTenantDetail`, `suspendTenant`, `reactivateTenant` |

**Quick grep recipes:**
```bash
grep -n '═══\|PAGE:' src/index.tsx              # all banners + page markers
grep -n '^function \|^async function ' src/index.tsx  # every top-level fn
grep -n 'window\._' src/index.tsx               # all global state usage
grep -n '// Fix ' src/index.tsx                 # change-history landmarks
```

---

## Tech Stack

**Runtime:** Cloudflare Workers (edge) via Wrangler v3  
**Framework:** Hono v4 — backend only; no frontend framework  
**Language:** TypeScript  
**Build:** Vite + `@hono/vite-build` → `dist/_worker.js`  
**Styling:** Tailwind CSS (CDN), Font Awesome 6 (CDN)  
**HTTP client:** Axios (CDN, `window.axios`)  
**Frontend paradigm:** Vanilla JS — global functions, `document.getElementById`, `innerHTML`  
**Dev server:** `wrangler pages dev dist` managed by PM2 on port 3000  

**Do NOT introduce:** React/Vue/Svelte, npm frontend packages, CSS modules,
fetch() instead of axios, localStorage/sessionStorage for app state.

---

## ⚠️ Critical Gotchas — Read Before Every Edit

### 1. The Outer Template Literal Rule
`src/index.tsx` is one giant TS template literal (backtick string from line ~23
to EOF). **Any JS code embedded in it is subject to these escaping rules:**

| What you want | Write in source | Why |
|---|---|---|
| Template literal in JS | `\`...\`` | backtick must be escaped |
| `${expr}` interpolation | `\${expr}` | `$` must be escaped |
| `\n` in a JS string | `'\\n'` | one extra backslash |
| Regex with `\d \w \r` etc. | `new RegExp('\\d+')` | **NEVER** use `/\d/` literal — backslash consumed |
| Newlines in string values | `'line1\\nline2'` | same double-escape rule |

**Rule: no regex literals with backslash escapes inside `src/index.tsx`.
Always use `new RegExp('pattern', 'flags')` constructor instead.**

### 2. State Management via `window._*` Globals
All page-level state lives on `window._*` globals. Convention: each
`render<Page>` function caches its primary fetched data on a `window._*`
global for subsequent filter/sort/refresh operations. Common patterns:
`_allFoo` for full list arrays, `_fooData` for nested
`{ foo: [], bar: [] }` structures, `_<page>Current<Thing>` for the
currently-selected entity. After any API mutation, refresh the relevant
`window._*` global AND re-render the corresponding DOM element — there
is no reactive framework. To find all globals in use:
`grep -n 'window\._' src/index.tsx`.

### 3. Supplier Dropdown Pattern
Both `showImportModal()` and `showNewBatchModal()` are `async` — they call
`GET /suppliers?active=true` on every open. **Never hardcode supplier options.**
After `saveSupplier()` (POST/PATCH), `window._suppData.suppliers` is refreshed
so the next modal open sees the new supplier automatically.

### 4. API Layer — In-Memory Data
All data arrays in `src/routes/api.ts` are module-scope and reset on restart.
`GET /suppliers?active=true` filters `is_active === true`. The `active` query
param must be checked explicitly — it is not a default filter.

### 5. Build Verification Workflow
After **every** `src/index.tsx` or `src/routes/api.ts` edit:
```bash
cd /home/user/webapp && npm run build          # must succeed
pm2 restart refurbiq && sleep 5
curl -s http://localhost:3000 > /tmp/page.html
python3 -c "
import re
with open('/tmp/page.html') as f: html = f.read()
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
largest = max(scripts, key=len)
open('/tmp/app.js','w').write(largest)
print('length:', len(largest))
"
node --check /tmp/app.js && echo "SYNTAX OK"   # must print SYNTAX OK
```
**Do not commit until `node --check` passes.**

---

## Stubs & Placeholders

Many action buttons in `src/index.tsx` currently fire `alert(...)`
placeholders rather than real backend calls (e.g. 'Quote approved',
'Manager approval recorded', 'Refund issued', 'Police report generated').
Do NOT assume any workflow is implemented end-to-end. Before adding logic
that depends on a button's behaviour, grep `src/routes/api.ts` to verify
the corresponding endpoint exists. If a feature appears to work in the UI
but no matching endpoint exists, it is a stub awaiting implementation.

---

## Coding Conventions

- **Indentation:** 2 spaces everywhere
- **String quotes:** single quotes in JS; double quotes for HTML attributes
- **Functions:** camelCase verbs — `showImportModal`, `parseImportCsvFile`
- **IDs:** kebab-case — `import-supplier-sel`, `new-batch-vat-code`
- **No `var`** — use `const`/`let` only
- **API responses:** snake_case (`supplier_id`, `default_vat_code`)
- **New API endpoints:** add to `src/routes/api.ts` only; follow the
  existing `api.get/post/patch(...)` pattern; return `c.json(data, statusCode)`

---

## PM2 + Dev Server
```bash
pm2 restart refurbiq          # restart after build
pm2 logs refurbiq --nostream  # check logs (non-blocking)
pm2 list                      # see status
```
Port is always 3000. Kill conflicts: `fuser -k 3000/tcp 2>/dev/null || true`

---

## Key API Endpoints

For the full endpoint list, grep `src/routes/api.ts` for
`api\.(get|post|patch|delete)`. README.md has a curated subset for
human reference.

---

## Safety Rules — Never Without Explicit Request
- Do NOT modify VAT calculation logic in `src/lib/`
- Do NOT change existing audit log entries or the `auditLog` array structure
- Do NOT remove the `is_active` flag checks from supplier queries
- Do NOT add `<script src="...">` CDN tags without confirming they don't
  conflict with existing globals (`axios`, `tailwind`)
- Do NOT use `innerHTML` with unsanitised user input — use `textContent`
  or encode values via `encodeURIComponent` / `JSON.stringify`

---

## Known Past Mistakes (recurring)
- **Regex literals** in `index.tsx` — always broke build. Use `new RegExp()`.
- **Hardcoded supplier options** in modals — always `async` fetch from API.
- **`\n` in string literals** inside `index.tsx` — use `'\\n'` (double-escape).
- **`${expr}` without backslash** inside `index.tsx` — build silently broke UI.
- **`onclick="fn('value')"` with single quotes** inside template literal HTML —
  use `data-*` attributes or encode with `JSON.stringify` to avoid quote nesting.
- **Removing banner comments or 'Fix N' change-history comments** in
  `src/index.tsx` — these are intentional landmarks (`═══ PAGE:` banners and
  inline `// Fix 1A + 1C` notes). Preserve them when editing surrounding code.

---

## Session Start Checklist

1. Read `CLAUDE.md` in full. This file contains the project constitution,
   architecture rules, critical gotchas (especially the template-literal
   escaping rules in `src/index.tsx`), the section map for navigating
   `src/index.tsx`, and known past mistakes. Treat it as authoritative.

2. Read `docs/STATUS.md` — confirm the current build phase and which modules
   are genuinely complete vs in-progress vs stubbed. Do not assume anything
   about project state from `CLAUDE.md` or `README.md` alone.

3. Confirm you have read both by replying with:
   - The current line count of `CLAUDE.md`
   - The current phase from `docs/STATUS.md`
   - The three most relevant rules, gotchas, or status flags for the task
     I'm about to give you (you'll need to wait for the task before
     answering this — just acknowledge you've noted it)

4. Do NOT read any other files yet. Do NOT run builds, pm2 commands, or git
   commands. Do NOT explore the project structure. Wait for my actual task.

Once you've read both files and confirmed, I'll give you the task. When I do:
- Use the section map in `CLAUDE.md` to jump directly to the relevant lines
  in `src/index.tsx` with `sed -n` rather than reading the whole file.
- Cross-check the task against `docs/STATUS.md` — if it touches a module
  marked stubbed or in-progress, flag any assumptions before coding.
- Follow the escaping rules strictly when editing `src/index.tsx`.
- Run the build verification workflow from `CLAUDE.md` before declaring
  the task done.
- Stop and ask if a task seems to require changes outside the scope
  I've described.

---
*Last updated: 2026-04-28 | Update when Claude makes a new recurring mistake*
