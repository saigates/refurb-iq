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
All page-level state lives on `window`. Key globals:

| Global | Contents |
|---|---|
| `window._suppData` | `{ suppliers: [], batches: [] }` — loaded by `renderSuppliers()` |
| `window._importCsvRows` | Parsed IMEI CSV rows pending import |
| `window._csvImportRows` | Parsed device-variant CSV rows pending import |
| `window._variantsData` | Device variants catalogue array |
| `window._allDevices` | Full device list from last fetch |

After any API mutation, **refresh the relevant `window._*` global AND
re-render the corresponding DOM element** — there is no reactive framework.

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

## Key API Endpoints (summary)
```
GET    /api/suppliers?active=true         → active supplier list
POST   /api/suppliers                     → create supplier
PATCH  /api/suppliers/:id                 → update / deactivate supplier
GET    /api/purchase-batches              → all batches
POST   /api/purchase-batches              → create batch
POST   /api/purchase-batches/:id/imei-import → bulk IMEI ingest
GET    /api/devices                       → devices (filter: status, grade, make)
POST   /api/device-variants/import        → bulk variant CSV ingest
POST   /api/scanner/lookup               → IMEI lookup
POST   /api/scanner/intake               → single device intake
```

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

---
*Last updated: 2026-04-25 | Update when Claude makes a new recurring mistake*
