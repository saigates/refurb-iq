// ============================================================
// RefurbIQ — Main Hono Entry Point
// ============================================================

import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import { api } from './routes/api.js';

const app = new Hono();

// Static assets
app.use('/static/*', serveStatic({ root: './' }));

// API routes
app.route('/api', api);

// Main SPA — serve index.html for all routes
app.get('*', (c) => {
  return c.html(getIndexHTML());
});

function getIndexHTML(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RefurbIQ — Refurbished Electronics ERP</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
              300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
              600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a'
            }
          }
        }
      }
    }
  </script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', system-ui, sans-serif; }
    .sidebar-item { transition: all 0.15s ease; }
    .sidebar-item:hover { transform: translateX(2px); }
    .card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease; }
    .card-hover:hover { box-shadow: 0 8px 25px rgba(0,0,0,0.15); transform: translateY(-1px); }
    .status-badge { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; }
    .fade-in { animation: fadeIn 0.25s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .tab-active { border-bottom: 2px solid #3b82f6; color: #3b82f6; }
    .progress-bar { transition: width 0.5s ease; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #1e2a3a; }
    ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
    .vat-code-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.04em; }
    .opr-urgent { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .opr-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .opr-ok { background: linear-gradient(135deg, #10b981, #059669); }
    .modal-overlay { background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
    .ring-glow { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
    input, select, textarea { color-scheme: dark; }
  </style>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen flex">

<!-- ═══════════════════════════════════════════════════════ SIDEBAR -->
<aside id="sidebar" class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen fixed top-0 left-0 z-40">
  <!-- Logo -->
  <div class="p-4 border-b border-gray-800">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
        <i class="fas fa-mobile-alt text-white text-sm"></i>
      </div>
      <div>
        <div class="font-bold text-white text-base tracking-tight">RefurbIQ</div>
        <div class="text-xs text-gray-400">Electronics ERP</div>
      </div>
    </div>
  </div>

  <!-- Tenant Badge -->
  <div class="px-4 py-2 border-b border-gray-800">
    <div class="flex items-center gap-2 bg-blue-900/30 rounded-lg px-3 py-2">
      <div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">R</div>
      <div>
        <div class="text-xs font-semibold text-blue-300">RefurbIQ Demo Ltd</div>
        <div class="text-xs text-gray-500">VAT: GB369979995</div>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mt-1">Core Operations</div>
    
    <button onclick="navigateTo('dashboard')" id="nav-dashboard" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-tachometer-alt w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Dashboard</span>
    </button>

    <button onclick="navigateTo('inventory')" id="nav-inventory" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-boxes w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Inventory & Goods-In</span>
      <span class="ml-auto bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">8</span>
    </button>

    <button onclick="navigateTo('qc')" id="nav-qc" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-microscope w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Quality Control</span>
      <span class="ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">2</span>
    </button>

    <button onclick="navigateTo('opr')" id="nav-opr" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-globe-europe w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>OPR Engine</span>
      <span class="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">!</span>
    </button>

    <button onclick="navigateTo('orders')" id="nav-orders" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-shopping-cart w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Orders</span>
    </button>

    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mt-3">Finance & Compliance</div>

    <button onclick="navigateTo('vat')" id="nav-vat" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-landmark w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>VAT Engine</span>
    </button>

    <button onclick="navigateTo('fintech')" id="nav-fintech" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-coins w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Fintech Advances</span>
    </button>

    <button onclick="navigateTo('suppliers')" id="nav-suppliers" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-truck w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Suppliers & Batches</span>
    </button>

    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mt-3">Customer & Risk</div>

    <button onclick="navigateTo('support')" id="nav-support" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-headset w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Support & Tickets</span>
      <span class="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">3</span>
    </button>

    <button onclick="navigateTo('admin')" id="nav-admin" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-cog w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Admin & Settings</span>
    </button>
  </nav>

  <!-- Footer -->
  <div class="p-4 border-t border-gray-800 text-xs text-gray-500">
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
      <span>System Operational</span>
    </div>
    <div class="mt-1">v2.0.0 · Phase 1 Build</div>
  </div>
</aside>

<!-- ═══════════════════════════════════════════════════════ MAIN CONTENT -->
<main class="ml-64 flex-1 flex flex-col min-h-screen">
  <!-- Top Bar -->
  <header class="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <span id="page-title" class="text-lg font-semibold text-white">Dashboard</span>
      <span id="page-subtitle" class="text-sm text-gray-400"></span>
    </div>
    <div class="flex items-center gap-4">
      <!-- Search -->
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input type="text" placeholder="Search IMEI, order, ticket..." class="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" />
      </div>
      <!-- Notifications -->
      <button class="relative text-gray-400 hover:text-white">
        <i class="fas fa-bell text-sm"></i>
        <span class="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center text-white font-bold">4</span>
      </button>
      <!-- User -->
      <div class="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-700">
        <div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">A</div>
        <span class="text-sm text-gray-300">Admin</span>
        <i class="fas fa-chevron-down text-xs text-gray-500"></i>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <div id="page-content" class="flex-1 p-6 overflow-auto"></div>
</main>

<!-- ═══════════════════════════════════════════════════════ MODAL -->
<div id="modal" class="fixed inset-0 z-50 hidden modal-overlay flex items-center justify-center p-4">
  <div id="modal-inner" class="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between p-5 border-b border-gray-700">
      <h3 id="modal-title" class="text-lg font-bold text-white"></h3>
      <button onclick="closeModal()" class="text-gray-400 hover:text-white text-xl">&times;</button>
    </div>
    <div id="modal-body" class="p-5"></div>
  </div>
</div>

<script>
// ═══════════════════════════════════════════════════════════════════════════
// RefurbIQ Frontend Application
// ═══════════════════════════════════════════════════════════════════════════

const API = '/api';
let currentPage = '';

// ── Utility Functions ───────────────────────────────────────────────────────

function fmt(n, decimals = 2) {
  if (n === null || n === undefined) return '—';
  return '£' + parseFloat(n).toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtNum(n) {
  return parseFloat(n).toLocaleString('en-GB');
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(status, type = 'device') {
  const maps = {
    device: {
      AVAILABLE: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-check-circle'],
      INTAKE_QC_PENDING: ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'fa-clock'],
      RETURN_QC_PENDING: ['bg-orange-500/20 text-orange-400 border-orange-500/30', 'fa-undo'],
      SHIPPED: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-shipping-fast'],
      WITH_CUSTOMER: ['bg-purple-500/20 text-purple-400 border-purple-500/30', 'fa-user'],
      IN_OPR: ['bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 'fa-globe-europe'],
      LOCKED: ['bg-red-500/20 text-red-400 border-red-500/30', 'fa-lock'],
      SCRAPPED: ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-trash'],
      EXPECTED: ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-hourglass'],
      RECEIVED: ['bg-indigo-500/20 text-indigo-400 border-indigo-500/30', 'fa-box-open'],
    },
    order: {
      PENDING: ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'fa-clock'],
      PROCESSING: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-cog'],
      SHIPPED: ['bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 'fa-shipping-fast'],
      DELIVERED: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-check'],
      CANCELLED: ['bg-red-500/20 text-red-400 border-red-500/30', 'fa-times'],
      RETURNED: ['bg-orange-500/20 text-orange-400 border-orange-500/30', 'fa-undo'],
    },
    ticket: {
      OPEN: ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'fa-folder-open'],
      IN_PROGRESS: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-spinner'],
      AWAITING_CUSTOMER: ['bg-purple-500/20 text-purple-400 border-purple-500/30', 'fa-hourglass-half'],
      RESOLVED: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-check-circle'],
      ESCALATED: ['bg-red-500/20 text-red-400 border-red-500/30', 'fa-exclamation-triangle'],
    },
    opr: {
      DRAFT: ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-edit'],
      EXPORTED: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-plane-departure'],
      IN_REPAIR: ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'fa-tools'],
      REIMPORTED: ['bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 'fa-plane-arrival'],
      DISCHARGED: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-check-circle'],
      OVERDUE: ['bg-red-500/20 text-red-400 border-red-500/30', 'fa-exclamation-circle'],
    },
    batch: {
      DRAFT: ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-edit'],
      CONFIRMED: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-check'],
      RECEIVED: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-box-open'],
      CLOSED: ['bg-purple-500/20 text-purple-400 border-purple-500/30', 'fa-lock'],
    }
  };
  const map = maps[type] || maps.device;
  const [cls, icon] = map[status] || ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-question'];
  return \`<span class="status-badge inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 \${cls}"><i class="fas \${icon} text-xs"></i> \${status.replace(/_/g, ' ')}</span>\`;
}

function vatCodeBadge(code) {
  const colors = {
    '20S_SALES': 'bg-blue-500 text-white',
    '20S_PURCHASES': 'bg-indigo-500 text-white',
    '20RC_PURCHASES': 'bg-purple-500 text-white',
    '0RCS_SALES': 'bg-yellow-500 text-black',
    '0MARGIN_PURCHASES': 'bg-teal-500 text-white',
    '0MARGIN_SALES': 'bg-teal-600 text-white',
    '0EXPORT_SALES': 'bg-emerald-500 text-white',
    'NOVAT_PURCHASES': 'bg-gray-500 text-white',
  };
  return \`<span class="vat-code-badge \${colors[code] || 'bg-gray-600 text-white'}">\${code}</span>\`;
}

function priorityBadge(p) {
  const map = { LOW: 'bg-gray-500/20 text-gray-400', NORMAL: 'bg-blue-500/20 text-blue-400', HIGH: 'bg-orange-500/20 text-orange-400', URGENT: 'bg-red-500/20 text-red-400 font-bold animate-pulse' };
  return \`<span class="text-xs px-2 py-0.5 rounded-full \${map[p] || 'bg-gray-500/20 text-gray-400'}">\${p}</span>\`;
}

function gradeBadge(g) {
  const map = { A: 'bg-emerald-500/20 text-emerald-400', B: 'bg-blue-500/20 text-blue-400', C: 'bg-amber-500/20 text-amber-400', D: 'bg-red-500/20 text-red-400' };
  return \`<span class="text-xs px-2 py-0.5 rounded-full font-bold \${map[g] || 'bg-gray-500/20 text-gray-400'}">Grade \${g}</span>\`;
}

function card(content, classes = '') {
  return \`<div class="bg-gray-900 border border-gray-800 rounded-xl p-5 card-hover \${classes}">\${content}</div>\`;
}

function table(headers, rows, compact = false) {
  const py = compact ? 'py-2' : 'py-3';
  return \`
    <div class="overflow-x-auto rounded-xl border border-gray-800">
      <table class="w-full text-sm">
        <thead class="bg-gray-800/50">
          <tr>
            \${headers.map(h => \`<th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 \${py}">\${h}</th>\`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800/50">
          \${rows.map(r => \`<tr class="hover:bg-gray-800/30 transition-colors">\${r.map(c => \`<td class="px-4 \${py} text-gray-300">\${c}</td>\`).join('')}</tr>\`).join('') || \`<tr><td colspan="\${headers.length}" class="px-4 py-8 text-center text-gray-500"><i class="fas fa-inbox mr-2"></i>No records found</td></tr>\`}
        </tbody>
      </table>
    </div>
  \`;
}

function statCard(title, value, icon, color, subtitle = '') {
  return \`
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 card-hover">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm text-gray-400 font-medium">\${title}</p>
          <p class="text-2xl font-bold text-white mt-1">\${value}</p>
          \${subtitle ? \`<p class="text-xs text-gray-500 mt-1">\${subtitle}</p>\` : ''}
        </div>
        <div class="w-10 h-10 rounded-lg \${color} flex items-center justify-center shadow-lg">
          <i class="fas \${icon} text-white text-sm"></i>
        </div>
      </div>
    </div>
  \`;
}

// ── Navigation ──────────────────────────────────────────────────────────────

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('[id^="nav-"]').forEach(el => {
    el.classList.remove('bg-blue-600/20', 'text-white', 'border-l-2', 'border-blue-500');
    el.classList.add('text-gray-300');
  });
  const navEl = document.getElementById('nav-' + page);
  if (navEl) {
    navEl.classList.add('bg-blue-600/20', 'text-white');
    navEl.classList.remove('text-gray-300');
  }
  
  const pages = {
    dashboard: ['Dashboard', ''],
    inventory: ['Inventory & Goods-In', 'Device Registry'],
    qc: ['Quality Control', 'Intake & Return QC'],
    opr: ['OPR Engine', 'HMRC Outward Processing Relief'],
    orders: ['Orders', 'Marketplace Sales'],
    vat: ['VAT Engine', 'HMRC Compliance'],
    fintech: ['Fintech Advances', 'Advance Reconciliation'],
    suppliers: ['Suppliers & Batches', 'Purchase Management'],
    support: ['Support & Tickets', 'Customer Communications'],
    admin: ['Admin & Settings', 'System Configuration'],
  };
  const [title, sub] = pages[page] || ['RefurbIQ', ''];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = sub;
  document.getElementById('page-content').innerHTML = '<div class="flex items-center justify-center h-40"><div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>';
  
  const handlers = {
    dashboard: renderDashboard,
    inventory: renderInventory,
    qc: renderQC,
    opr: renderOPR,
    orders: renderOrders,
    vat: renderVAT,
    fintech: renderFintech,
    suppliers: renderSuppliers,
    support: renderSupport,
    admin: renderAdmin,
  };
  
  setTimeout(() => {
    const fn = handlers[page];
    if (fn) fn();
  }, 100);
}

// ── Modal ────────────────────────────────────────────────────────────────────

function openModal(title, body) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal').classList.add('flex');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').classList.remove('flex');
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

async function renderDashboard() {
  const stats = await axios.get(API + '/dashboard').then(r => r.data);
  const vatPositive = stats.vat_liability >= 0;
  
  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- Alert Banner -->
      <div class="bg-red-900/30 border border-red-700/50 rounded-xl px-5 py-3 flex items-center gap-3">
        <i class="fas fa-exclamation-triangle text-red-400"></i>
        <span class="text-sm text-red-300"><strong>OPR Alert:</strong> Batch OPR2025-009 expires in <strong>7 days</strong> — reimport or discharge immediately.</span>
        <button onclick="navigateTo('opr')" class="ml-auto text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg">View OPR →</button>
      </div>

      <!-- KPI Stats Row 1 -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Total Devices', fmtNum(stats.total_devices), 'fa-mobile-alt', 'bg-blue-600', 'In registry')}
        \${statCard('Available Stock', fmtNum(stats.available_devices), 'fa-check-circle', 'bg-emerald-600', 'Ready to sell')}
        \${statCard('Pending QC', fmtNum(stats.pending_qc), 'fa-microscope', 'bg-amber-600', 'Awaiting inspection')}
        \${statCard('Devices in OPR', fmtNum(stats.in_opr), 'fa-globe-europe', 'bg-cyan-600', 'At repair vendor')}
      </div>

      <!-- KPI Stats Row 2 -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Open Orders', fmtNum(stats.open_orders), 'fa-shopping-cart', 'bg-indigo-600', 'Active fulfilment')}
        \${statCard('Open Tickets', fmtNum(stats.open_tickets), 'fa-headset', 'bg-red-600', 'Requires attention')}
        \${statCard('Revenue MTD', fmt(stats.total_revenue_mtd), 'fa-pound-sign', 'bg-purple-600', 'April 2026')}
        \${statCard('VAT Liability', (vatPositive ? '' : '') + fmt(Math.abs(stats.vat_liability)), 'fa-landmark', vatPositive ? 'bg-red-600' : 'bg-emerald-600', vatPositive ? 'Payable to HMRC' : 'Reclaimable from HMRC')}
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Device Status Breakdown -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-pie text-blue-400"></i> Device Status Breakdown</h3>
          <canvas id="deviceChart" height="200"></canvas>
        </div>
        <!-- VAT Position -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-bar text-purple-400"></i> Current VAT Period (Q2 2026)</h3>
          <canvas id="vatChart" height="200"></canvas>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Recent Orders -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-white flex items-center gap-2"><i class="fas fa-shopping-cart text-indigo-400"></i> Recent Orders</h3>
            <button onclick="navigateTo('orders')" class="text-xs text-blue-400 hover:text-blue-300">View all →</button>
          </div>
          <div class="space-y-2" id="recent-orders"></div>
        </div>
        <!-- OPR Countdown -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-white flex items-center gap-2"><i class="fas fa-globe-europe text-cyan-400"></i> OPR 180-Day Tracker</h3>
            <button onclick="navigateTo('opr')" class="text-xs text-blue-400 hover:text-blue-300">View all →</button>
          </div>
          <div class="space-y-3" id="opr-tracker"></div>
        </div>
      </div>
    </div>
  \`;

  // Render charts
  setTimeout(() => {
    renderDeviceChart();
    renderVatChart();
    renderRecentOrders();
    renderOPRTracker();
  }, 100);
}

function renderDeviceChart() {
  const ctx = document.getElementById('deviceChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Available', 'Shipped/Customer', 'In OPR', 'QC Pending', 'Locked'],
      datasets: [{
        data: [2, 2, 1, 2, 1],
        backgroundColor: ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, plugins: { legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 11 } } } }
    }
  });
}

function renderVatChart() {
  const ctx = document.getElementById('vatChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Box 1\\n(Output VAT)', 'Box 4\\n(Input VAT)', 'Box 6\\n(Sales)', 'Box 7\\n(Purchases)'],
      datasets: [{
        label: 'Q2 2026 (Partial)',
        data: [88.75, 0, 6347, 0],
        backgroundColor: ['#ef444466', '#10b98166', '#3b82f666', '#8b5cf666'],
        borderColor: ['#ef4444', '#10b981', '#3b82f6', '#8b5cf6'],
        borderWidth: 1.5,
      }]
    },
    options: {
      responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
        y: { ticks: { color: '#6b7280', callback: v => '£' + v.toLocaleString() }, grid: { color: '#1f2937' } }
      }
    }
  });
}

async function renderRecentOrders() {
  const orders = await axios.get(API + '/orders').then(r => r.data);
  const el = document.getElementById('recent-orders');
  if (!el) return;
  el.innerHTML = orders.slice(0, 4).map(o => \`
    <div class="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-blue-400">\${o.marketplace_name?.substring(0,2)}</div>
        <div>
          <div class="text-sm font-medium text-white">\${o.external_order_ref.substring(0,20)}...</div>
          <div class="text-xs text-gray-400">\${o.customer_name} · \${fmtDate(o.order_date)}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm font-bold text-white">\${fmt(o.total_sale_value)}</div>
        \${vatCodeBadge(o.vat_code_applied)}
      </div>
    </div>
  \`).join('');
}

async function renderOPRTracker() {
  const batches = await axios.get(API + '/opr-batches').then(r => r.data);
  const el = document.getElementById('opr-tracker');
  if (!el) return;
  el.innerHTML = batches.map(b => {
    const pct = Math.max(0, Math.min(100, (b.days_remaining / 180) * 100));
    const urgent = b.days_remaining <= 14;
    const warning = b.days_remaining <= 30;
    const barClass = urgent ? 'bg-red-500' : warning ? 'bg-amber-500' : 'bg-emerald-500';
    return \`
      <div class="p-3 bg-gray-800/50 rounded-lg">
        <div class="flex items-center justify-between mb-2">
          <div>
            <div class="text-sm font-medium text-white">\${b.batch_reference}</div>
            <div class="text-xs text-gray-400">\${b.unit_count} units · \${b.vendor_name?.substring(0,25)}...</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold \${urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-emerald-400'}">\${b.days_remaining}d left</div>
            \${statusBadge(b.status, 'opr')}
          </div>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-1.5">
          <div class="h-1.5 rounded-full progress-bar \${barClass}" style="width:\${pct}%"></div>
        </div>
      </div>
    \`;
  }).join('');
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: INVENTORY
// ══════════════════════════════════════════════════════════════════════════════

async function renderInventory() {
  const devices = await axios.get(API + '/devices').then(r => r.data);
  
  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-5">
      <!-- Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <input id="imei-search" type="text" placeholder="Search IMEI, model..." class="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
          <select id="status-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterDevices()">
            <option value="">All Statuses</option>
            <option>AVAILABLE</option><option>INTAKE_QC_PENDING</option><option>SHIPPED</option>
            <option>WITH_CUSTOMER</option><option>IN_OPR</option><option>LOCKED</option>
            <option>RETURN_QC_PENDING</option><option>SCRAPPED</option>
          </select>
          <select id="grade-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterDevices()">
            <option value="">All Grades</option>
            <option>A</option><option>B</option><option>C</option><option>D</option>
          </select>
        </div>
        <button onclick="showImportModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <i class="fas fa-upload"></i> Import Batch / IMEI CSV
        </button>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-4 gap-4">
        \${statCard('Total Devices', devices.length, 'fa-database', 'bg-gray-700', '')}
        \${statCard('Available', devices.filter(d=>d.current_status==='AVAILABLE').length, 'fa-check-circle', 'bg-emerald-700', '')}
        \${statCard('Pending QC', devices.filter(d=>d.current_status.includes('QC')).length, 'fa-microscope', 'bg-amber-700', '')}
        \${statCard('Locked', devices.filter(d=>d.current_status==='LOCKED').length, 'fa-lock', 'bg-red-700', '')}
      </div>

      <!-- Device Table -->
      <div id="devices-table">
        \${renderDevicesTable(devices)}
      </div>
    </div>
  \`;
  
  document.getElementById('imei-search').addEventListener('input', filterDevices);
  window._allDevices = devices;
}

function renderDevicesTable(devices) {
  return table(
    ['IMEI', 'Make / Model', 'Spec', 'Grade', 'Status', 'Cost', 'Landed', 'VAT Code', 'Actions'],
    devices.map(d => [
      \`<code class="text-xs text-blue-300 bg-blue-900/20 px-2 py-0.5 rounded">\${d.imei_primary}</code>\`,
      \`<div class="font-medium text-white">\${d.make} \${d.model}</div>\`,
      \`<span class="text-xs text-gray-400">\${d.storage} · \${d.colour}</span>\`,
      gradeBadge(d.grade),
      statusBadge(d.current_status, 'device'),
      fmt(d.cost_price),
      \`<span class="\${d.landed_cost > d.cost_price ? 'text-amber-400' : ''}">\${fmt(d.landed_cost)}</span>\`,
      vatCodeBadge(d.purchase_vat_code),
      \`<button onclick="viewDevice('\${d.device_id}')" class="text-xs text-blue-400 hover:text-blue-300 bg-blue-900/20 px-2.5 py-1 rounded-lg">View</button>\`,
    ])
  );
}

function filterDevices() {
  const search = document.getElementById('imei-search')?.value.toLowerCase() || '';
  const status = document.getElementById('status-filter')?.value || '';
  const grade = document.getElementById('grade-filter')?.value || '';
  const filtered = (window._allDevices || []).filter(d => {
    const matchSearch = !search || d.imei_primary.includes(search) || d.model.toLowerCase().includes(search) || d.make.toLowerCase().includes(search);
    const matchStatus = !status || d.current_status === status;
    const matchGrade = !grade || d.grade === grade;
    return matchSearch && matchStatus && matchGrade;
  });
  document.getElementById('devices-table').innerHTML = renderDevicesTable(filtered);
}

async function viewDevice(id) {
  const d = await axios.get(API + '/devices/' + id).then(r => r.data);
  const qcHtml = d.qc_records?.map(q => \`
    <div class="bg-gray-800 rounded-lg p-4 mt-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-white">\${q.qc_type} QC — \${fmtDate(q.performed_at)}</span>
        <span class="text-xs px-2 py-0.5 rounded-full \${q.outcome === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : q.outcome === 'LOCKED_BLOCKED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}">\${q.outcome}</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs text-gray-400">
        <span>Lock Check: <strong class="\${q.lock_check_result === 'CLEAR' ? 'text-emerald-400' : 'text-red-400'}">\${q.lock_check_result}</strong></span>
        <span>Grade: <strong class="text-white">\${q.grade_assigned}</strong></span>
      </div>
      \${q.outcome === 'LOCKED_BLOCKED' ? \`<div class="mt-2 bg-red-900/30 border border-red-700/30 rounded px-3 py-2 text-xs text-red-300"><i class="fas fa-lock mr-1"></i>\${q.notes}</div>\` : ''}
      <div class="mt-2 flex flex-wrap gap-1">
        \${q.functional_tests.map(t => \`<span class="text-xs px-2 py-0.5 rounded \${t.result === 'PASS' ? 'bg-emerald-900/30 text-emerald-400' : t.result === 'FAIL' ? 'bg-red-900/30 text-red-400' : 'bg-gray-700 text-gray-400'}">\${t.test_name}: \${t.result}</span>\`).join('')}
      </div>
    </div>
  \`).join('') || '<p class="text-sm text-gray-500 mt-2">No QC records</p>';

  openModal(\`\${d.make} \${d.model} — \${d.imei_primary}\`, \`
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Status</span><div class="mt-1">\${statusBadge(d.current_status, 'device')}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Grade</span><div class="mt-1 font-bold text-white text-lg">\${d.grade}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Cost Price</span><div class="mt-1 font-bold text-white">\${fmt(d.cost_price)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Landed Cost</span><div class="mt-1 font-bold text-white">\${fmt(d.landed_cost)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Storage / Colour</span><div class="mt-1 text-white">\${d.storage} · \${d.colour}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Network</span><div class="mt-1 text-white">\${d.network}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">Purchase Batch</span><div class="mt-1 text-blue-400">\${d.purchase_batch_id || '—'}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400">VAT Code</span><div class="mt-1">\${vatCodeBadge(d.purchase_vat_code)}</div></div>
      </div>
      <div>
        <h4 class="font-semibold text-white mb-1">QC History</h4>
        \${qcHtml}
      </div>
    </div>
  \`);
}

function showImportModal() {
  openModal('Import Purchase Batch / IMEI CSV', \`
    <div class="space-y-4 text-sm">
      <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <p class="text-blue-300 font-medium">Goods-In Workflow</p>
        <ol class="text-blue-200/70 mt-2 space-y-1 list-decimal list-inside text-xs">
          <li>Create purchase batch with supplier invoice reference</li>
          <li>Import expected IMEI list from supplier CSV</li>
          <li>Scan physical devices against expected list</li>
          <li>Flag discrepancies as Device Identity Events</li>
          <li>Devices enter Intake QC queue automatically</li>
        </ol>
      </div>
      <div>
        <label class="block text-gray-400 text-xs mb-1">Supplier</label>
        <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
          <option>TechSource Ltd</option><option>Mobile Wholesale EU</option><option>PhoneFlip Direct</option>
        </select>
      </div>
      <div>
        <label class="block text-gray-400 text-xs mb-1">Invoice Reference</label>
        <input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="e.g. TS-INV-5500" />
      </div>
      <div>
        <label class="block text-gray-400 text-xs mb-1">VAT Code</label>
        <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
          <option value="20RC_PURCHASES">20RC_PURCHASES — Reverse Charge</option>
          <option value="20S_PURCHASES">20S_PURCHASES — Standard 20%</option>
          <option value="0MARGIN_PURCHASES">0MARGIN_PURCHASES — Margin Scheme</option>
        </select>
      </div>
      <div class="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
        <i class="fas fa-file-csv text-3xl text-gray-500 mb-2"></i>
        <p class="text-gray-400 text-xs">Drop IMEI CSV here or <span class="text-blue-400 cursor-pointer">browse</span></p>
        <p class="text-gray-600 text-xs mt-1">Expected: IMEI, Make, Model, Storage, Colour, Network</p>
      </div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Create Batch & Import</button>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: QUALITY CONTROL
// ══════════════════════════════════════════════════════════════════════════════

async function renderQC() {
  const pending = await axios.get(API + '/qc/pending').then(r => r.data);
  const qcRecs = await axios.get(API + '/qc').then(r => r.data);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- Warning Banner -->
      <div class="bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-start gap-3">
        <i class="fas fa-shield-alt text-red-400 mt-0.5"></i>
        <div>
          <div class="text-sm font-semibold text-red-300">Non-Negotiable QC Controls Active</div>
          <div class="text-xs text-red-300/70 mt-1">No device enters AVAILABLE without completed QC and lock check. Any lock detected blocks ALL sale paths until LOCK_CLEARED event is raised by a Manager.</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-800">
        <div class="flex gap-6">
          <button id="tab-pending" onclick="showQCTab('pending')" class="pb-3 text-sm font-medium text-blue-400 tab-active">Pending QC (\${pending.length})</button>
          <button id="tab-history" onclick="showQCTab('history')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">QC History (\${qcRecs.length})</button>
          <button id="tab-locked" onclick="showQCTab('locked')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">🔒 Locked Devices (1)</button>
        </div>
      </div>

      <div id="qc-content">
        \${renderQCPending(pending)}
      </div>
    </div>
  \`;
  window._qcPending = pending;
  window._qcRecs = qcRecs;
}

function renderQCPending(pending) {
  if (!pending.length) return \`<div class="text-center py-16 text-gray-500"><i class="fas fa-check-circle text-4xl text-emerald-500 mb-3 block"></i>All QC checks complete!</div>\`;
  return \`
    <div class="space-y-4">
      \${pending.map(d => \`
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between card-hover">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
              <i class="fas fa-mobile-alt text-gray-400"></i>
            </div>
            <div>
              <div class="font-medium text-white">\${d.make} \${d.model} — \${d.storage}</div>
              <div class="flex items-center gap-3 mt-1">
                <code class="text-xs text-blue-300">\${d.imei_primary}</code>
                <span class="text-xs text-gray-400">\${d.colour} · \${d.network}</span>
              </div>
              <div class="mt-1">\${statusBadge(d.current_status, 'device')}</div>
            </div>
          </div>
          <button onclick="openQCForm('\${d.device_id}', '\${d.imei_primary}', '\${d.make} \${d.model}')" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <i class="fas fa-microscope"></i> Begin QC
          </button>
        </div>
      \`).join('')}
    </div>
  \`;
}

function showQCTab(tab) {
  document.querySelectorAll('[id^="tab-"]').forEach(el => { el.classList.remove('text-blue-400', 'tab-active'); el.classList.add('text-gray-400'); });
  document.getElementById('tab-' + tab).classList.add('text-blue-400', 'tab-active');
  document.getElementById('tab-' + tab).classList.remove('text-gray-400');
  
  if (tab === 'pending') {
    document.getElementById('qc-content').innerHTML = renderQCPending(window._qcPending || []);
  } else if (tab === 'history') {
    const recs = window._qcRecs || [];
    document.getElementById('qc-content').innerHTML = table(
      ['IMEI', 'Type', 'Grade', 'Lock Check', 'Outcome', 'Performed By', 'Date'],
      recs.map(q => [
        \`<code class="text-xs text-blue-300">\${q.imei}</code>\`,
        \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">\${q.qc_type}</span>\`,
        gradeBadge(q.grade_assigned),
        \`<span class="\${q.lock_check_result === 'CLEAR' ? 'text-emerald-400' : 'text-red-400'} text-xs font-medium">\${q.lock_check_result}</span>\`,
        \`<span class="text-xs px-2 py-0.5 rounded-full \${q.outcome === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}">\${q.outcome}</span>\`,
        q.performed_by,
        fmtDate(q.performed_at),
      ])
    );
  } else {
    document.getElementById('qc-content').innerHTML = \`
      <div class="bg-red-900/20 border border-red-700/40 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-red-800/50 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-lock text-red-400 text-xl"></i>
          </div>
          <div>
            <div class="font-bold text-white">Apple iPhone 13 Pro Max — 354678901234574</div>
            <div class="text-sm text-gray-400 mt-1">256GB · Sierra Blue · Grade B · Batch PB2026-003</div>
            <div class="mt-3 bg-red-900/30 border border-red-700/30 rounded-lg px-4 py-3 text-sm text-red-300">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              <strong>iCloud Activation Lock Detected</strong> — Device is FMiP locked. All sale, reservation, and listing paths are blocked. A LOCK_CLEARED event must be raised by a Manager before this device can progress.
            </div>
            <div class="mt-3 flex gap-3">
              <button onclick="alert('Manager approval required to raise LOCK_CLEARED event')" class="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-unlock mr-1"></i> Raise Lock Cleared Event (Manager)
              </button>
              <button onclick="alert('Device scheduled for BER discharge')" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
                <i class="fas fa-trash mr-1"></i> Discharge as BER
              </button>
            </div>
          </div>
        </div>
      </div>
    \`;
  }
}

function openQCForm(deviceId, imei, name) {
  openModal(\`Intake QC — \${name}\`, \`
    <div class="space-y-4 text-sm">
      <div class="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 flex items-center gap-2">
        <i class="fas fa-exclamation-triangle text-amber-400"></i>
        <span class="text-amber-300 text-xs">Lock check is MANDATORY and cannot be skipped. If lock detected, device status becomes LOCKED automatically.</span>
      </div>
      <div>
        <label class="block text-gray-400 text-xs mb-1">IMEI Confirmed</label>
        <code class="block bg-gray-800 rounded px-3 py-2 text-blue-300">\${imei}</code>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-gray-400 text-xs mb-1">Grade Assigned *</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option>A — Near Mint</option><option>B — Good</option><option>C — Fair</option><option>D — Poor</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-400 text-xs mb-1">🔒 Lock Check Result *</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option value="CLEAR">✅ CLEAR — No lock detected</option>
            <option value="LOCKED">❌ LOCKED — iCloud / Google / Samsung lock</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block text-gray-400 text-xs mb-2">Functional Tests *</label>
        <div class="grid grid-cols-2 gap-2">
          \${['Screen & Display', 'Battery Health', 'Front Camera', 'Rear Camera', 'Cellular / SIM', 'WiFi & BT', 'Touch / Face ID', 'Charging Port'].map(t => \`
            <div class="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
              <span class="text-gray-300">\${t}</span>
              <select class="bg-gray-700 border-0 rounded text-xs text-gray-300 py-0.5">
                <option>PASS</option><option>FAIL</option><option>N/A</option>
              </select>
            </div>
          \`).join('')}
        </div>
      </div>
      <div>
        <label class="block text-gray-400 text-xs mb-1">Cosmetic Notes</label>
        <textarea class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm h-20 resize-none" placeholder="Describe any visible cosmetic issues..."></textarea>
      </div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button onclick="alert('QC submitted. Device status updated.'); closeModal();" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium">Submit QC ✓</button>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: OPR ENGINE
// ══════════════════════════════════════════════════════════════════════════════

async function renderOPR() {
  const batches = await axios.get(API + '/opr-batches').then(r => r.data);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- HMRC Info Banner -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-blue-900/50 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-university text-blue-400"></i>
          </div>
          <div class="flex-1">
            <div class="font-semibold text-white">HMRC Outward Processing Relief</div>
            <div class="text-sm text-gray-400 mt-1">OPR Authorisation: <strong class="text-white">GB369979995000</strong> · 180-day reimport window · 4-year document retention (non-deletable)</div>
          </div>
          <button onclick="showOPRCalculator()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <i class="fas fa-calculator"></i> Uplift Calculator
          </button>
          <button onclick="showNewOPRModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <i class="fas fa-plus"></i> New OPR Batch
          </button>
        </div>
      </div>

      <!-- OPR Cards -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        \${batches.map(b => renderOPRCard(b)).join('')}
      </div>

      <!-- 180-Day Timeline -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-calendar-alt text-blue-400"></i> OPR 180-Day Timeline</h3>
        \${batches.map(b => {
          const pct = Math.max(0, Math.min(100, (b.days_remaining / 180) * 100));
          const urgent = b.days_remaining <= 14;
          const warning = b.days_remaining <= 30;
          return \`
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-300">\${b.batch_reference} (\${b.unit_count} units)</span>
              <div class="flex items-center gap-2">
                \${statusBadge(b.status, 'opr')}
                <span class="text-sm font-bold \${urgent ? 'text-red-400' : warning ? 'text-amber-400' : 'text-emerald-400'}">\${b.days_remaining} days remaining</span>
              </div>
            </div>
            <div class="w-full bg-gray-800 rounded-full h-3">
              <div class="h-3 rounded-full progress-bar \${urgent ? 'opr-urgent' : warning ? 'opr-warning' : 'opr-ok'}" style="width:\${pct}%"></div>
            </div>
            <div class="flex justify-between mt-1 text-xs text-gray-500">
              <span>Export: \${fmtDate(b.export_date)}</span>
              <span>Deadline: \${fmtDate(b.reimport_deadline)}</span>
            </div>
          </div>
          \`;
        }).join('')}
      </div>
    </div>
  \`;
}

function renderOPRCard(b) {
  const urgent = b.days_remaining <= 14;
  const warning = b.days_remaining <= 30;
  const borderClass = urgent ? 'border-red-500/50' : warning ? 'border-amber-500/50' : 'border-gray-800';
  return \`
    <div class="bg-gray-900 border \${borderClass} rounded-xl p-5 space-y-4 card-hover">
      <div class="flex items-start justify-between">
        <div>
          <div class="font-bold text-white">\${b.batch_reference}</div>
          <div class="text-xs text-gray-400 mt-0.5">\${b.vendor_name}</div>
        </div>
        \${statusBadge(b.status, 'opr')}
      </div>
      
      \${urgent ? \`<div class="bg-red-900/30 border border-red-600/40 rounded-lg px-3 py-2 text-xs text-red-300 font-medium"><i class="fas fa-exclamation-circle mr-1"></i>URGENT: \${b.days_remaining} days to reimport deadline!</div>\` : ''}
      
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="bg-gray-800 rounded-lg p-2.5">
          <div class="text-gray-400">Units</div>
          <div class="font-bold text-white text-base">\${b.unit_count}</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-2.5">
          <div class="text-gray-400">Uplift/Unit</div>
          <div class="font-bold text-white text-base">\${fmt(b.uplift_per_unit)}</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-2.5">
          <div class="text-gray-400">Processing Value</div>
          <div class="font-medium text-white">\${fmt(b.processing_invoice_value)}</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-2.5">
          <div class="text-gray-400">Import VAT (Box 4)</div>
          <div class="font-medium text-emerald-400">\${fmt(b.import_vat_on_uplift)}</div>
        </div>
      </div>
      
      <div class="text-xs text-gray-500 space-y-1">
        <div>Export MRN: <span class="text-gray-300">\${b.export_mrn || '—'}</span></div>
        <div>AWB Out: <span class="text-gray-300">\${b.awb_number_outbound || '—'}</span></div>
        <div>C88 Ref: <span class="text-gray-300">\${b.c88_document_ref || '—'}</span></div>
      </div>
      
      <div class="flex gap-2">
        <button onclick="viewOPRDocs('\${b.opr_batch_id}')" class="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg">Docs</button>
        \${b.status === 'IN_REPAIR' || b.status === 'EXPORTED' ? \`<button onclick="alert('Mark reimported — C88 reference required')" class="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Mark Reimported</button>\` : ''}
      </div>
    </div>
  \`;
}

function showOPRCalculator() {
  openModal('OPR Uplift Calculator', \`
    <div class="space-y-4 text-sm">
      <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 text-xs text-blue-300">
        <strong>Formula:</strong> Uplift Per Unit = (Processing Invoice + Outbound Freight + Inbound Freight) ÷ Unit Count<br>
        <strong>Import VAT:</strong> Total Uplift × 20% (reclaimable in Box 4)
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-gray-400 text-xs block mb-1">Processing Invoice (£)</label><input id="opr-proc" type="number" value="4800" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Outbound Freight (£)</label><input id="opr-out" type="number" value="220" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Inbound Freight (£)</label><input id="opr-in" type="number" value="195" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Unit Count</label><input id="opr-units" type="number" value="18" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
      </div>
      <button onclick="calcOPR()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium">Calculate Uplift</button>
      <div id="opr-result" class="hidden bg-gray-800 rounded-xl p-4 space-y-3">
        <div class="grid grid-cols-3 gap-3 text-center">
          <div><div class="text-gray-400 text-xs">Total Uplift</div><div id="res-total" class="font-bold text-white text-lg"></div></div>
          <div><div class="text-gray-400 text-xs">Per Unit</div><div id="res-unit" class="font-bold text-blue-400 text-lg"></div></div>
          <div><div class="text-gray-400 text-xs">Import VAT (Box 4)</div><div id="res-vat" class="font-bold text-emerald-400 text-lg"></div></div>
        </div>
      </div>
    </div>
  \`);
}

async function calcOPR() {
  const result = await axios.post(API + '/opr/calculate', {
    processingInvoiceValue: parseFloat(document.getElementById('opr-proc').value),
    freightOutbound: parseFloat(document.getElementById('opr-out').value),
    freightInbound: parseFloat(document.getElementById('opr-in').value),
    unitCount: parseInt(document.getElementById('opr-units').value),
  }).then(r => r.data);
  document.getElementById('res-total').textContent = fmt(result.totalUplift);
  document.getElementById('res-unit').textContent = fmt(result.upliftPerUnit);
  document.getElementById('res-vat').textContent = fmt(result.importVatOnUplift);
  document.getElementById('opr-result').classList.remove('hidden');
}

function viewOPRDocs(id) {
  openModal('OPR Document Vault — ' + id, \`
    <div class="space-y-3 text-sm">
      <div class="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 flex items-center gap-2 text-xs text-amber-300">
        <i class="fas fa-lock"></i> HMRC mandatory retention: 4 years. Documents cannot be deleted.
      </div>
      \${['Commercial Invoice (Export)', 'HMRC OPR Authorisation Letter', 'Export MRN Document', 'Repair Vendor Invoice', 'Airway Bill (Outbound)', 'C88 Import Entry (if reimported)'].map((doc, i) => \`
        <div class="flex items-center justify-between bg-gray-800 rounded-lg p-3">
          <div class="flex items-center gap-3">
            <i class="fas \${i < 4 ? 'fa-file-pdf text-red-400' : i === 4 ? 'fa-file-alt text-blue-400' : 'fa-question-circle text-gray-500'}"></i>
            <span class="text-gray-300">\${doc}</span>
          </div>
          \${i < 4 ? \`<button class="text-xs text-blue-400 hover:text-blue-300">Download</button>\` : \`<span class="text-xs text-gray-500">Not yet uploaded</span>\`}
        </div>
      \`).join('')}
      <button class="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-dashed border-gray-700 py-3 rounded-lg text-xs">
        <i class="fas fa-upload mr-2"></i>Upload Document
      </button>
    </div>
  \`);
}

function showNewOPRModal() {
  openModal('Create New OPR Batch', \`
    <div class="space-y-4 text-sm">
      <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-xs text-blue-300">
        OPR Authorisation: <strong>GB369979995000</strong> · Devices will transition to IN_OPR status
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-gray-400 text-xs block mb-1">Repair Vendor</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option>EuroRepair Solutions SRL</option><option>FixMasters Poland Sp. z o.o.</option>
          </select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Export Date</label><input type="date" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Processing Invoice Value (£)</label><input type="number" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="0.00" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Export MRN</label><input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="GB2026-EX-..." /></div>
      </div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button onclick="alert('OPR batch created. 180-day timer started.'); closeModal();" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium">Create OPR Batch</button>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: ORDERS
// ══════════════════════════════════════════════════════════════════════════════

async function renderOrders() {
  const orders = await axios.get(API + '/orders').then(r => r.data);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <select id="order-status-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterOrders()">
            <option value="">All Statuses</option>
            <option>PENDING</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option>
          </select>
          <select id="marketplace-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterOrders()">
            <option value="">All Marketplaces</option>
            <option>Amazon</option><option>Back Market</option><option>eBay</option>
          </select>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="showDRCInfo()" class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg border border-gray-700">
            <i class="fas fa-info-circle mr-1"></i>DRC Rules
          </button>
          <button onclick="alert('CSV import for marketplace orders')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <i class="fas fa-sync"></i> Sync Marketplace
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-4 gap-4">
        \${statCard('Total Orders', orders.length, 'fa-shopping-cart', 'bg-blue-700')}
        \${statCard('Total Revenue', fmt(orders.reduce((s,o) => s+o.total_sale_value,0)), 'fa-pound-sign', 'bg-emerald-700')}
        \${statCard('Total VAT', fmt(orders.reduce((s,o) => s+o.vat_amount,0)), 'fa-landmark', 'bg-purple-700')}
        \${statCard('Export Orders', orders.filter(o=>o.is_export).length, 'fa-globe', 'bg-cyan-700')}
      </div>

      <div id="orders-table">
        \${renderOrdersTable(orders)}
      </div>
    </div>
  \`;
  window._allOrders = orders;
}

function renderOrdersTable(orders) {
  return table(
    ['Order Ref', 'Customer', 'Marketplace', 'Date', 'Sale Value', 'VAT Code', 'VAT Amount', 'Status', 'Actions'],
    orders.map(o => [
      \`<div class="font-mono text-xs text-blue-300">\${o.external_order_ref.substring(0,22)}</div>\`,
      \`<div class="text-sm text-white">\${o.customer_name}</div><div class="text-xs text-gray-400">\${o.delivery_country} \${o.is_export ? '<i class="fas fa-plane text-cyan-400"></i> Export' : ''}</div>\`,
      \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">\${o.marketplace_name}</span>\`,
      fmtDate(o.order_date),
      \`<span class="font-bold text-white">\${fmt(o.total_sale_value)}</span>\`,
      vatCodeBadge(o.vat_code_applied),
      o.vat_amount > 0 ? \`<span class="text-amber-400">\${fmt(o.vat_amount)}</span>\` : \`<span class="text-gray-500">—</span>\`,
      statusBadge(o.order_status, 'order'),
      \`<button onclick="viewOrder('\${o.order_id}')" class="text-xs text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded-lg hover:bg-blue-900/40">View</button>\`,
    ])
  );
}

function filterOrders() {
  const status = document.getElementById('order-status-filter')?.value || '';
  const marketplace = document.getElementById('marketplace-filter')?.value || '';
  const filtered = (window._allOrders || []).filter(o => {
    const ms = !status || o.order_status === status;
    const mm = !marketplace || o.marketplace_name === marketplace;
    return ms && mm;
  });
  document.getElementById('orders-table').innerHTML = renderOrdersTable(filtered);
}

async function viewOrder(id) {
  const o = await axios.get(API + '/orders/' + id).then(r => r.data);
  openModal(\`Order \${o.external_order_ref}\`, \`
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Status</span><div class="mt-1">\${statusBadge(o.order_status, 'order')}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Marketplace</span><div class="mt-1 font-medium text-white">\${o.marketplace_name}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Customer</span><div class="mt-1 text-white">\${o.customer_name}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Delivery Country</span><div class="mt-1 text-white">\${o.delivery_country} \${o.is_export ? '(Export)' : '(Domestic)'}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Sale Value</span><div class="mt-1 font-bold text-white text-lg">\${fmt(o.total_sale_value)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">VAT Amount</span><div class="mt-1 font-bold text-amber-400">\${fmt(o.vat_amount)}</div></div>
      </div>
      
      \${o.vat_record ? \`
        <div class="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
          <div class="font-semibold text-white mb-3 flex items-center gap-2"><i class="fas fa-landmark text-purple-400"></i> VAT Record</div>
          <div class="grid grid-cols-3 gap-3 text-xs">
            <div class="text-center"><div class="text-gray-400">VAT Code</div><div class="mt-1">\${vatCodeBadge(o.vat_record.vat_code)}</div></div>
            <div class="text-center"><div class="text-gray-400">Tax Point</div><div class="mt-1 font-medium text-white">\${fmtDate(o.vat_record.tax_point_date)}</div></div>
            <div class="text-center"><div class="text-gray-400">Override?</div><div class="mt-1 font-medium \${o.vat_record.override_applied ? 'text-amber-400' : 'text-gray-400'}">\${o.vat_record.override_applied ? '⚠ YES' : 'No'}</div></div>
          </div>
          \${o.vat_record.override_applied ? \`<div class="mt-2 text-xs text-amber-300 bg-amber-900/20 rounded px-3 py-2"><i class="fas fa-info-circle mr-1"></i>\${o.vat_record.override_reason}</div>\` : ''}
          \${o.vat_record.vat_code === '0RCS_SALES' ? \`<div class="mt-2 text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded px-3 py-2 italic">"Customer to account to HMRC for the reverse charge output tax on the VAT exclusive price of items marked 'reverse charge'."</div>\` : ''}
          <div class="grid grid-cols-4 gap-2 mt-3 text-xs">
            <div class="bg-gray-800 rounded p-2 text-center"><div class="text-gray-500">Box 1</div><div class="font-bold text-white">\${fmt(o.vat_record.box_1_amount)}</div></div>
            <div class="bg-gray-800 rounded p-2 text-center"><div class="text-gray-500">Box 4</div><div class="font-bold text-white">\${fmt(o.vat_record.box_4_amount)}</div></div>
            <div class="bg-gray-800 rounded p-2 text-center"><div class="text-gray-500">Box 6</div><div class="font-bold text-white">\${fmt(o.vat_record.box_6_amount)}</div></div>
            <div class="bg-gray-800 rounded p-2 text-center"><div class="text-gray-500">Box 7</div><div class="font-bold text-white">\${fmt(o.vat_record.box_7_amount)}</div></div>
          </div>
        </div>
      \` : ''}
      
      \${o.fintech_advance ? \`
        <div class="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
          <div class="font-semibold text-white mb-3 flex items-center gap-2"><i class="fas fa-coins text-emerald-400"></i> Fintech Advance</div>
          <div class="grid grid-cols-3 gap-3 text-xs text-center">
            <div><div class="text-gray-400">Advance (80%)</div><div class="font-bold text-white">\${fmt(o.fintech_advance.advance_amount)}</div></div>
            <div><div class="text-gray-400">Fee (1.95%)</div><div class="font-bold text-red-400">\${fmt(o.fintech_advance.fintech_fee)}</div></div>
            <div><div class="text-gray-400">Net Received</div><div class="font-bold text-emerald-400">\${fmt(o.fintech_advance.net_advance_received)}</div></div>
          </div>
          <div class="mt-2 text-xs text-gray-500 text-center">⚠ Tax point remains sale date (\${fmtDate(o.order_date)}) — not advance date. No VAT record on fintech transaction.</div>
        </div>
      \` : ''}
    </div>
  \`);
}

function showDRCInfo() {
  openModal('Domestic Reverse Charge Rules', \`
    <div class="space-y-4 text-sm">
      <div class="bg-gray-800 rounded-xl p-4">
        <h4 class="font-semibold text-white mb-3">£5,000 DRC Threshold — Automatic Logic</h4>
        <div class="space-y-3 text-sm">
          <div class="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
            <div class="text-emerald-400 font-mono">Net &lt; £5,000</div>
            <i class="fas fa-arrow-right text-gray-500"></i>
            \${vatCodeBadge('20S_SALES')} <span class="text-gray-400">Standard 20% applied</span>
          </div>
          <div class="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
            <div class="text-amber-400 font-mono">Net ≥ £5,000</div>
            <i class="fas fa-arrow-right text-gray-500"></i>
            \${vatCodeBadge('0RCS_SALES')} <span class="text-gray-400">DRC automatically applied</span>
          </div>
          <div class="flex items-center gap-3 bg-gray-700/50 rounded-lg p-3">
            <div class="text-cyan-400 font-mono">Non-UK delivery</div>
            <i class="fas fa-arrow-right text-gray-500"></i>
            \${vatCodeBadge('0EXPORT_SALES')} <span class="text-gray-400">Export override (absolute precedence)</span>
          </div>
        </div>
      </div>
      <div class="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
        <div class="font-medium text-yellow-300 mb-2">Mandatory DRC Legal Text</div>
        <div class="text-xs text-yellow-200/70 italic">"Customer to account to HMRC for the reverse charge output tax on the VAT exclusive price of items marked 'reverse charge'."</div>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: VAT ENGINE
// ══════════════════════════════════════════════════════════════════════════════

async function renderVAT() {
  const vatCodes = await axios.get(API + '/vat-codes').then(r => r.data);
  const periods = await axios.get(API + '/vat-periods').then(r => r.data);
  const records = await axios.get(API + '/vat-records').then(r => r.data);
  const currentPeriod = periods.find(p => p.status === 'OPEN') || periods[0];

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- Tabs -->
      <div class="border-b border-gray-800">
        <div class="flex gap-6">
          <button id="vtab-return" onclick="showVatTab('return')" class="pb-3 text-sm font-medium text-blue-400 tab-active">HMRC Return</button>
          <button id="vtab-codes" onclick="showVatTab('codes')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">VAT Code Table</button>
          <button id="vtab-calc" onclick="showVatTab('calc')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">VAT Calculator</button>
          <button id="vtab-records" onclick="showVatTab('records')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">VAT Records (\${records.length})</button>
        </div>
      </div>

      <div id="vat-content">
        \${renderVatReturn(currentPeriod, periods)}
      </div>
    </div>
  \`;
  window._vatCodes = vatCodes;
  window._vatPeriods = periods;
  window._vatRecords = records;
  window._vatCurrentPeriod = currentPeriod;
}

function renderVatReturn(period, periods) {
  const liability = period.box_5;
  const isPayable = liability >= 0;
  return \`
    <div class="space-y-5">
      <!-- Period Selector -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-400">VAT Period:</span>
          <select onchange="changePeriod(this.value)" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
            \${(periods || []).map(p => \`<option value="\${p.vat_period_id}" \${p.vat_period_id === period.vat_period_id ? 'selected' : ''}>\${p.vat_period_id} (\${p.status})</option>\`).join('')}
          </select>
        </div>
        <span class="text-xs px-2 py-1 rounded-full \${period.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400' : period.status === 'LOCKED' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}">\${period.status}</span>
        \${period.status === 'OPEN' ? \`<button onclick="alert('Lock period for submission — requires Manager approval')" class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg ml-auto">Lock Period</button>\` : ''}
        \${period.status === 'LOCKED' ? \`<button onclick="alert('Submit to HMRC MTD')" class="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg ml-auto">Submit to HMRC</button>\` : ''}
      </div>

      <!-- 9-Box Return -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="bg-gray-800/50 px-5 py-3 border-b border-gray-800">
          <h3 class="font-semibold text-white flex items-center gap-2">
            <i class="fas fa-landmark text-purple-400"></i>
            HMRC 9-Box VAT Return — \${period.vat_period_id}
          </h3>
        </div>
        <div class="p-5">
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">
            \${renderVatBox(1, 'VAT due on sales & other outputs', period.box_1, false)}
            \${renderVatBox(2, 'VAT due on acquisitions from EU', period.box_2, false)}
            \${renderVatBox(3, 'Total VAT due (Box 1 + Box 2)', period.box_3, false, true)}
            \${renderVatBox(4, 'VAT reclaimed on purchases', period.box_4, true)}
            \${renderVatBox(5, 'Net VAT to pay / reclaim (Box 3 − Box 4)', period.box_5, liability < 0, true, true)}
            \${renderVatBox(6, 'Total value of sales (exc. VAT)', period.box_6, false)}
            \${renderVatBox(7, 'Total value of purchases (exc. VAT)', period.box_7, false)}
            \${renderVatBox(8, 'Total goods supplied to EU', period.box_8, false)}
            \${renderVatBox(9, 'Total goods acquired from EU', period.box_9, false)}
          </div>
          <!-- Liability Summary -->
          <div class="mt-5 \${isPayable ? 'bg-red-900/30 border-red-700/40' : 'bg-emerald-900/30 border-emerald-700/40'} border rounded-xl p-5 flex items-center justify-between">
            <div>
              <div class="font-bold text-white text-lg">\${isPayable ? '⚠ Amount Payable to HMRC' : '✓ Amount Reclaimable from HMRC'}</div>
              <div class="text-sm text-gray-400 mt-1">Period: \${fmtDate(period.period_start)} — \${fmtDate(period.period_end)}</div>
            </div>
            <div class="text-3xl font-black \${isPayable ? 'text-red-400' : 'text-emerald-400'}">\${fmt(Math.abs(liability))}</div>
          </div>
        </div>
      </div>
    </div>
  \`;
}

function renderVatBox(num, label, value, isCredit = false, highlighted = false, isFinal = false) {
  const color = isFinal ? (value >= 0 ? 'border-red-500/50 bg-red-900/10' : 'border-emerald-500/50 bg-emerald-900/10') : 'border-gray-700 bg-gray-800/50';
  return \`
    <div class="border \${color} rounded-xl p-4">
      <div class="flex items-start justify-between mb-2">
        <div class="w-7 h-7 rounded-full \${isFinal ? (value >= 0 ? 'bg-red-600' : 'bg-emerald-600') : 'bg-blue-900'} flex items-center justify-center text-xs font-bold text-white">\${num}</div>
        \${isCredit ? '<span class="text-xs text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded">Deductible</span>' : ''}
      </div>
      <div class="text-xs text-gray-400 mb-2">\${label}</div>
      <div class="text-xl font-black \${isFinal && value < 0 ? 'text-emerald-400' : isFinal && value > 0 ? 'text-red-400' : 'text-white'}">\${fmt(value)}</div>
    </div>
  \`;
}

function changePeriod(periodId) {
  const period = (window._vatPeriods || []).find(p => p.vat_period_id === periodId);
  if (period) document.getElementById('vat-content').innerHTML = renderVatReturn(period, window._vatPeriods);
}

function showVatTab(tab) {
  document.querySelectorAll('[id^="vtab-"]').forEach(el => { el.classList.remove('text-blue-400', 'tab-active'); el.classList.add('text-gray-400'); });
  document.getElementById('vtab-' + tab).classList.add('text-blue-400', 'tab-active');
  document.getElementById('vtab-' + tab).classList.remove('text-gray-400');
  
  if (tab === 'return') {
    document.getElementById('vat-content').innerHTML = renderVatReturn(window._vatCurrentPeriod, window._vatPeriods);
  } else if (tab === 'codes') {
    const codes = window._vatCodes || [];
    document.getElementById('vat-content').innerHTML = \`
      <div class="space-y-3">
        \${codes.map(code => \`
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                \${vatCodeBadge(code.vat_code)}
                <div>
                  <div class="font-medium text-white">\${code.display_name}</div>
                  <div class="text-xs text-gray-400 mt-0.5">\${code.description}</div>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="\${code.scope === 'SALES' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'} px-2 py-0.5 rounded-full">\${code.scope}</span>
                <span class="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">\${code.scheme}</span>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-3 text-xs">
              <span class="text-gray-400">HMRC Boxes:</span>
              \${[1,2,4,6,7].map(n => code['box_' + n + '_flag'] ? \`<span class="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded font-bold">Box \${n}</span>\` : '').filter(Boolean).join('') || '<span class="text-gray-600">None</span>'}
              <span class="ml-auto text-gray-400">Rate: <strong class="text-white">\${code.rate_percent}%</strong></span>
            </div>
          </div>
        \`).join('')}
      </div>
    \`;
  } else if (tab === 'calc') {
    document.getElementById('vat-content').innerHTML = \`
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Calculator -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 class="font-semibold text-white">VAT Calculator & DRC Evaluator</h3>
          <div>
            <label class="text-gray-400 text-xs block mb-1">VAT Code</label>
            <select id="calc-code" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm">
              \${(window._vatCodes || []).map(c => \`<option value="\${c.vat_code}">\${c.display_name}</option>\`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-gray-400 text-xs block mb-1">Gross Amount (£)</label><input id="calc-gross" type="number" value="450" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
            <div><label class="text-gray-400 text-xs block mb-1">Cost Price (£) — Margin only</label><input id="calc-cost" type="number" value="200" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="text-gray-400 text-xs block mb-1">Delivery Country (DRC check)</label><input id="calc-country" type="text" value="GB" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
          </div>
          <div class="flex gap-3">
            <button onclick="runVatCalc()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Calculate VAT</button>
            <button onclick="runDRCEval()" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium">Evaluate DRC</button>
          </div>
          <div id="calc-result" class="hidden bg-gray-800 rounded-xl p-4"></div>
        </div>
        <!-- Margin Scheme Info -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 class="font-semibold text-white">Margin Scheme — 1/6 Formula</h3>
          <div class="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4 text-sm text-gray-300 space-y-2">
            <div class="font-mono text-purple-300">VAT = (Sale Price − Cost Price) × 1/6</div>
            <div class="text-xs text-gray-400">Equivalent to 16.67% of the profit margin</div>
          </div>
          <div id="margin-example" class="space-y-3">
            <div class="text-sm text-gray-400">Live Example:</div>
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-gray-400">Sale Price</div><div id="me-sale" class="font-bold text-white mt-1">£450</div></div>
              <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-gray-400">Cost Price</div><div id="me-cost" class="font-bold text-white mt-1">£200</div></div>
              <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-gray-400">Margin</div><div id="me-margin" class="font-bold text-amber-400 mt-1">£250</div></div>
            </div>
            <div class="bg-purple-900/30 rounded-lg p-3 text-center">
              <div class="text-gray-400 text-xs">VAT on Margin (1/6)</div>
              <div id="me-vat" class="font-bold text-purple-400 text-xl mt-1">£41.67</div>
            </div>
          </div>
        </div>
      </div>
    \`;
  } else if (tab === 'records') {
    const records = window._vatRecords || [];
    document.getElementById('vat-content').innerHTML = table(
      ['Entity', 'Type', 'VAT Code', 'Tax Point', 'Net', 'VAT', 'Box 1', 'Box 4', 'Box 6', 'Override'],
      records.map(r => [
        \`<span class="text-xs font-mono text-blue-300">\${r.linked_entity_id}</span>\`,
        \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">\${r.linked_entity_type}</span>\`,
        vatCodeBadge(r.vat_code),
        fmtDate(r.tax_point_date),
        fmt(r.net_amount),
        r.vat_amount > 0 ? \`<span class="text-amber-400">\${fmt(r.vat_amount)}</span>\` : '<span class="text-gray-500">—</span>',
        r.box_1_amount > 0 ? \`<span class="text-blue-400">\${fmt(r.box_1_amount)}</span>\` : '<span class="text-gray-600">—</span>',
        r.box_4_amount > 0 ? \`<span class="text-emerald-400">\${fmt(r.box_4_amount)}</span>\` : '<span class="text-gray-600">—</span>',
        r.box_6_amount > 0 ? \`<span class="text-purple-400">\${fmt(r.box_6_amount)}</span>\` : '<span class="text-gray-600">—</span>',
        r.override_applied ? \`<span class="text-xs text-amber-400" title="\${r.override_reason}">⚠ Yes</span>\` : '<span class="text-gray-600">No</span>',
      ])
    );
  }
}

async function runVatCalc() {
  try {
    const result = await axios.post(API + '/vat/calculate', {
      vatCode: document.getElementById('calc-code').value,
      grossAmount: parseFloat(document.getElementById('calc-gross').value),
      costPrice: parseFloat(document.getElementById('calc-cost').value),
    }).then(r => r.data);
    const el = document.getElementById('calc-result');
    el.classList.remove('hidden');
    el.innerHTML = \`
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="text-center bg-gray-700 rounded-lg p-2"><div class="text-gray-400">Net Amount</div><div class="font-bold text-white">\${fmt(result.netAmount)}</div></div>
        <div class="text-center bg-gray-700 rounded-lg p-2"><div class="text-gray-400">VAT Amount</div><div class="font-bold text-amber-400">\${fmt(result.vatAmount)}</div></div>
        <div class="text-center bg-gray-700 rounded-lg p-2"><div class="text-gray-400">Box 1 (Output)</div><div class="font-bold text-blue-400">\${fmt(result.box1)}</div></div>
        <div class="text-center bg-gray-700 rounded-lg p-2"><div class="text-gray-400">Box 4 (Input)</div><div class="font-bold text-emerald-400">\${fmt(result.box4)}</div></div>
        \${result.marginAmount > 0 ? \`<div class="col-span-2 text-center bg-purple-900/30 rounded-lg p-2"><div class="text-gray-400">Margin Amount</div><div class="font-bold text-purple-400">\${fmt(result.marginAmount)}</div></div>\` : ''}
      </div>
    \`;
  } catch(e) { alert('Calculation error'); }
}

async function runDRCEval() {
  try {
    const result = await axios.post(API + '/vat/evaluate', {
      vatCode: document.getElementById('calc-code').value,
      grossAmount: parseFloat(document.getElementById('calc-gross').value),
      costPrice: parseFloat(document.getElementById('calc-cost').value),
      netValue: parseFloat(document.getElementById('calc-gross').value),
      deliveryCountry: document.getElementById('calc-country').value,
    }).then(r => r.data);
    const el = document.getElementById('calc-result');
    el.classList.remove('hidden');
    el.innerHTML = \`
      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <div class="text-xs text-gray-400">Applied VAT Code:</div>
          \${vatCodeBadge(result.code)}
          \${result.overrideApplied ? '<span class="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">Override Applied</span>' : ''}
        </div>
        \${result.overrideApplied ? \`<div class="text-xs text-amber-300 bg-amber-900/20 rounded px-3 py-2">\${result.reason}</div>\` : ''}
        \${result.drc_legal_text ? \`<div class="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded px-3 py-2 italic">"\${result.drc_legal_text}"</div>\` : ''}
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-gray-700 rounded p-2 text-center"><div class="text-gray-400">Net</div><div class="font-bold text-white">\${fmt(result.netAmount)}</div></div>
          <div class="bg-gray-700 rounded p-2 text-center"><div class="text-gray-400">VAT</div><div class="font-bold text-amber-400">\${fmt(result.vatAmount)}</div></div>
        </div>
      </div>
    \`;
  } catch(e) { alert('Evaluation error'); }
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: FINTECH ADVANCES
// ══════════════════════════════════════════════════════════════════════════════

async function renderFintech() {
  const advances = await axios.get(API + '/fintech').then(r => r.data);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- Critical Rule -->
      <div class="bg-amber-900/30 border border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
        <i class="fas fa-exclamation-triangle text-amber-400 mt-0.5"></i>
        <div>
          <div class="font-semibold text-amber-300">Critical VAT Rule: Tax Point ≠ Advance Date</div>
          <div class="text-xs text-amber-300/70 mt-1">Fintech advances are financing events ONLY. VAT tax point remains the original sale date. All fintech transactions carry <code class="bg-amber-900/30 px-1 rounded">vat_record_id = NULL</code>. The 1.95% fee is recorded as a cost, not a VAT transaction.</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        \${statCard('Total Advances', advances.length, 'fa-coins', 'bg-emerald-700')}
        \${statCard('Total Advanced', fmt(advances.reduce((s,a)=>s+a.advance_amount,0)), 'fa-pound-sign', 'bg-blue-700')}
        \${statCard('Total Fees (1.95%)', fmt(advances.reduce((s,a)=>s+a.fintech_fee,0)), 'fa-percentage', 'bg-red-700')}
      </div>

      <!-- Advance Calculator -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-calculator text-emerald-400"></i> Advance Calculator</h3>
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="text-gray-400 text-xs block mb-1">Gross Sale Value (£)</label>
            <input id="ft-gross" type="number" value="520" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" />
          </div>
          <button onclick="calcFintech()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-medium">Calculate</button>
        </div>
        <div id="ft-result" class="hidden mt-4 grid grid-cols-3 gap-4">
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <div class="text-xs text-gray-400">Advance Amount (80%)</div>
            <div id="ft-advance" class="text-xl font-black text-white mt-2"></div>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center">
            <div class="text-xs text-gray-400">Fintech Fee (1.95%)</div>
            <div id="ft-fee" class="text-xl font-black text-red-400 mt-2"></div>
          </div>
          <div class="bg-gray-800 rounded-xl p-4 text-center border border-emerald-700/40">
            <div class="text-xs text-gray-400">Net Received</div>
            <div id="ft-net" class="text-xl font-black text-emerald-400 mt-2"></div>
          </div>
        </div>
      </div>

      <!-- Advances Table -->
      \${table(
        ['Order ID', 'Marketplace', 'Gross Sale', 'Advance (80%)', 'Fee (1.95%)', 'Net Received', 'Status', 'VAT Record'],
        advances.map(a => [
          \`<span class="font-mono text-xs text-blue-300">\${a.order_id}</span>\`,
          a.marketplace,
          fmt(a.gross_sale_value),
          \`<span class="font-bold text-white">\${fmt(a.advance_amount)}</span>\`,
          \`<span class="text-red-400">\${fmt(a.fintech_fee)}</span>\`,
          \`<span class="font-bold text-emerald-400">\${fmt(a.net_advance_received)}</span>\`,
          statusBadge(a.status, 'device'),
          \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">NULL — No VAT Record</span>\`,
        ])
      )}
    </div>
  \`;
}

async function calcFintech() {
  const result = await axios.post(API + '/fintech/calculate', { grossSaleValue: parseFloat(document.getElementById('ft-gross').value) }).then(r => r.data);
  document.getElementById('ft-advance').textContent = fmt(result.advanceAmount);
  document.getElementById('ft-fee').textContent = fmt(result.fintechFee);
  document.getElementById('ft-net').textContent = fmt(result.netAdvanceReceived);
  document.getElementById('ft-result').classList.remove('hidden');
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: SUPPLIERS & BATCHES
// ══════════════════════════════════════════════════════════════════════════════

async function renderSuppliers() {
  const suppliers = await axios.get(API + '/suppliers').then(r => r.data);
  const batches = await axios.get(API + '/purchase-batches').then(r => r.data);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- Tabs -->
      <div class="border-b border-gray-800">
        <div class="flex gap-6">
          <button id="stab-batches" onclick="showSuppTab('batches')" class="pb-3 text-sm font-medium text-blue-400 tab-active">Purchase Batches</button>
          <button id="stab-suppliers" onclick="showSuppTab('suppliers')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">Suppliers</button>
        </div>
      </div>
      <div id="supp-content">
        \${renderBatchesTable(batches)}
      </div>
    </div>
  \`;
  window._suppData = { suppliers, batches };
}

function renderBatchesTable(batches) {
  return \`<div class="space-y-4">
    <div class="flex justify-end">
      <button onclick="showNewBatchModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
        <i class="fas fa-plus"></i> New Purchase Batch
      </button>
    </div>
    \${table(
      ['Batch Code', 'Supplier', 'Invoice Ref', 'Date', 'Devices', 'Total Value', 'VAT Code', 'VAT Amount', 'Status'],
      batches.map(b => [
        \`<span class="font-mono text-xs text-blue-300">\${b.batch_code}</span>\`,
        b.supplier_name,
        \`<span class="text-xs text-gray-400">\${b.external_invoice_ref}</span>\`,
        fmtDate(b.batch_date),
        \`<span class="font-bold text-white">\${b.device_count}</span>\`,
        fmt(b.total_purchase_value),
        vatCodeBadge(b.vat_code),
        b.vat_amount > 0 ? \`<span class="text-amber-400">\${fmt(b.vat_amount)}</span>\` : '<span class="text-gray-500">—</span>',
        statusBadge(b.status, 'batch'),
      ])
    )}
  </div>\`;
}

function showSuppTab(tab) {
  document.querySelectorAll('[id^="stab-"]').forEach(el => { el.classList.remove('text-blue-400', 'tab-active'); el.classList.add('text-gray-400'); });
  document.getElementById('stab-' + tab).classList.add('text-blue-400', 'tab-active');
  const { suppliers, batches } = window._suppData || { suppliers: [], batches: [] };
  if (tab === 'batches') {
    document.getElementById('supp-content').innerHTML = renderBatchesTable(batches);
  } else {
    document.getElementById('supp-content').innerHTML = table(
      ['Supplier', 'Country', 'VAT Number', 'Default VAT Code', 'Total Purchases', 'Status'],
      suppliers.map(s => [
        \`<div class="font-medium text-white">\${s.name}</div><div class="text-xs text-gray-400">\${s.contact_email || ''}</div>\`,
        s.country,
        \`<span class="font-mono text-xs text-gray-400">\${s.vat_number || '—'}</span>\`,
        vatCodeBadge(s.default_vat_code),
        fmt(s.total_purchases || 0),
        s.is_active ? '<span class="text-xs text-emerald-400">Active</span>' : '<span class="text-xs text-gray-500">Inactive</span>',
      ])
    );
  }
}

function showNewBatchModal() {
  openModal('Create Purchase Batch', \`
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-gray-400 text-xs block mb-1">Supplier</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option>TechSource Ltd</option><option>Mobile Wholesale EU</option><option>PhoneFlip Direct</option>
          </select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Invoice Reference</label><input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Batch Date</label><input type="date" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Currency</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"><option>GBP</option><option>EUR</option><option>USD</option></select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Total Purchase Value</label><input type="number" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="0.00" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">VAT Code</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option value="20RC_PURCHASES">20RC_PURCHASES — Reverse Charge</option>
            <option value="20S_PURCHASES">20S_PURCHASES — Standard 20%</option>
            <option value="0MARGIN_PURCHASES">0MARGIN_PURCHASES — Margin Scheme</option>
            <option value="NOVAT_PURCHASES">NOVAT_PURCHASES — No VAT</option>
          </select>
        </div>
      </div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button onclick="alert('Purchase batch created with VAT record'); closeModal();" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Create Batch</button>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: SUPPORT & TICKETS
// ══════════════════════════════════════════════════════════════════════════════

async function renderSupport() {
  const tickets = await axios.get(API + '/tickets').then(r => r.data);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-5">
      <!-- Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <select id="tk-status" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterTickets()">
            <option value="">All Statuses</option>
            <option>OPEN</option><option>IN_PROGRESS</option><option>ESCALATED</option><option>RESOLVED</option>
          </select>
          <select id="tk-priority" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterTickets()">
            <option value="">All Priorities</option>
            <option>URGENT</option><option>HIGH</option><option>NORMAL</option><option>LOW</option>
          </select>
        </div>
        <button onclick="showNewTicketModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <i class="fas fa-plus"></i> New Ticket
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        \${statCard('Open', tickets.filter(t=>t.status==='OPEN').length, 'fa-folder-open', 'bg-amber-700')}
        \${statCard('In Progress', tickets.filter(t=>t.status==='IN_PROGRESS').length, 'fa-spinner', 'bg-blue-700')}
        \${statCard('Escalated', tickets.filter(t=>t.status==='ESCALATED').length, 'fa-exclamation-triangle', 'bg-red-700')}
        \${statCard('Resolved', tickets.filter(t=>t.status==='RESOLVED').length, 'fa-check-circle', 'bg-emerald-700')}
      </div>

      <div id="tickets-table">
        \${renderTicketsTable(tickets)}
      </div>
    </div>
  \`;
  window._allTickets = tickets;
}

function renderTicketsTable(tickets) {
  return table(
    ['Ticket ID', 'Customer', 'Marketplace', 'Subject', 'Category', 'Priority', 'Status', 'Actions'],
    tickets.map(t => [
      \`<span class="font-mono text-xs text-blue-300">\${t.ticket_id}</span>\`,
      \`<div class="text-sm text-white">\${t.customer_name}</div><div class="text-xs text-gray-400">\${t.customer_email}</div>\`,
      t.marketplace,
      \`<div class="text-sm text-white max-w-xs truncate">\${t.subject}</div>\`,
      \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">\${t.category}</span>\`,
      priorityBadge(t.priority),
      statusBadge(t.status, 'ticket'),
      \`<button onclick="viewTicket('\${t.ticket_id}')" class="text-xs text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded-lg hover:bg-blue-900/40">View</button>\`,
    ])
  );
}

function filterTickets() {
  const status = document.getElementById('tk-status')?.value || '';
  const priority = document.getElementById('tk-priority')?.value || '';
  const filtered = (window._allTickets || []).filter(t => (!status || t.status === status) && (!priority || t.priority === priority));
  document.getElementById('tickets-table').innerHTML = renderTicketsTable(filtered);
}

async function viewTicket(id) {
  const t = await axios.get(API + '/tickets/' + id).then(r => r.data);
  openModal(\`Ticket \${t.ticket_id} — \${t.customer_name}\`, \`
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Status</span><div class="mt-1">\${statusBadge(t.status, 'ticket')}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Priority</span><div class="mt-1">\${priorityBadge(t.priority)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Marketplace</span><div class="mt-1 text-white">\${t.marketplace}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Category</span><div class="mt-1 text-white">\${t.category}</div></div>
        \${t.order_id ? \`<div class="bg-gray-800 rounded-lg p-3 col-span-2"><span class="text-gray-400 text-xs">Linked Order</span><div class="mt-1 text-blue-400 font-mono">\${t.order_id}</div></div>\` : ''}
      </div>
      
      <div class="bg-gray-800 rounded-lg p-4">
        <div class="text-xs text-gray-400 mb-2">Subject</div>
        <div class="text-white font-medium">\${t.subject}</div>
      </div>

      \${t.ai_draft ? \`
        <div class="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 text-blue-400 font-semibold text-xs"><i class="fas fa-robot"></i>AI Draft Response</div>
            <span class="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">⚠ Human review required before sending</span>
          </div>
          <div class="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-line">\${t.ai_draft}</div>
          <div class="flex gap-3 mt-3">
            <button onclick="alert('Message sent after review')" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Send Response</button>
            <button onclick="alert('Draft edited')" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Edit Draft</button>
          </div>
        </div>
      \` : \`
        <div class="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div class="flex items-center gap-2 text-gray-400 font-semibold text-xs mb-3"><i class="fas fa-robot"></i>Generate AI Draft</div>
          <button onclick="alert('AI draft being generated...')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Generate Response Draft</button>
        </div>
      \`}

      \${t.rma_id ? \`
        <div class="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs text-amber-300">
          <i class="fas fa-undo mr-1"></i> RMA Linked: <strong>\${t.rma_id}</strong> — Return QC required before any refund/replacement
        </div>
      \` : ''}
    </div>
  \`);
}

function showNewTicketModal() {
  openModal('Create Support Ticket', \`
    <div class="space-y-3 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-gray-400 text-xs block mb-1">Customer Name</label><input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Customer Email</label><input type="email" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Marketplace</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"><option>Amazon</option><option>Back Market</option><option>eBay</option></select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Category</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"><option>GENERAL</option><option>RETURN</option><option>INR</option><option>FAULT</option><option>REFUND</option></select>
        </div>
      </div>
      <div><label class="text-gray-400 text-xs block mb-1">Subject</label><input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button onclick="alert('Ticket created'); closeModal();" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Create Ticket</button>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: ADMIN & SETTINGS
// ══════════════════════════════════════════════════════════════════════════════

function renderAdmin() {
  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Company Settings -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-building text-blue-400"></i> Company Settings</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between py-2 border-b border-gray-800"><span class="text-gray-400">Company Name</span><span class="text-white font-medium">RefurbIQ Demo Ltd</span></div>
            <div class="flex justify-between py-2 border-b border-gray-800"><span class="text-gray-400">VAT Number</span><span class="text-white font-mono">GB369979995</span></div>
            <div class="flex justify-between py-2 border-b border-gray-800"><span class="text-gray-400">OPR Authorisation</span><span class="text-white font-mono">GB369979995000</span></div>
            <div class="flex justify-between py-2 border-b border-gray-800"><span class="text-gray-400">VAT Scheme</span><span class="text-blue-400">Standard</span></div>
            <div class="flex justify-between py-2 border-b border-gray-800"><span class="text-gray-400">DRC Threshold</span><span class="text-white font-medium">£5,000</span></div>
            <div class="flex justify-between py-2 border-b border-gray-800"><span class="text-gray-400">Default Currency</span><span class="text-white">GBP</span></div>
            <div class="flex justify-between py-2"><span class="text-gray-400">Subscription Plan</span><span class="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Professional</span></div>
          </div>
        </div>

        <!-- Data Retention Policy -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-archive text-amber-400"></i> Data Retention Policy (HMRC)</h3>
          <div class="space-y-3 text-sm">
            \${[
              ['Operational Data', '6 years minimum', 'bg-blue-500'],
              ['OPR Documents', '4 years — NON-DELETABLE', 'bg-red-500'],
              ['VAT Records', '6 years — HMRC mandatory', 'bg-red-500'],
              ['System Audit Logs', '2 years minimum', 'bg-amber-500'],
            ].map(([label, policy, color]) => \`
              <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span class="text-gray-300">\${label}</span>
                <span class="text-xs font-medium \${color === 'bg-red-500' ? 'text-red-400' : color === 'bg-amber-500' ? 'text-amber-400' : 'text-blue-400'}">\${policy}</span>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- System Controls -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-shield-alt text-emerald-400"></i> Non-Negotiable System Controls</h3>
          <div class="space-y-2">
            \${[
              ['Intake QC Mandatory', 'No device enters AVAILABLE without completed QC', true],
              ['Lock Check Enforcement', 'Lock blocks all sale paths until LOCK_CLEARED event', true],
              ['IMEI Matching Required', 'Returns must match sold IMEI exactly', true],
              ['Duplicate IMEI Prevention', 'Global block across all tenants', true],
              ['VAT Tax Point Rule', 'Always sale date — never advance/settlement', true],
              ['Reverse Charge Atomicity', 'Both Box 1 and Box 4 created simultaneously', true],
              ['Export VAT Override', 'Non-UK addresses force 0EXPORT_SALES', true],
              ['Audit Trail Mandatory', 'All overrides require user, reason, timestamp', true],
            ].map(([ctrl, desc, active]) => \`
              <div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <i class="fas fa-\${active ? 'check-circle text-emerald-400' : 'times-circle text-red-400'} mt-0.5 text-sm flex-shrink-0"></i>
                <div>
                  <div class="text-sm font-medium text-white">\${ctrl}</div>
                  <div class="text-xs text-gray-400">\${desc}</div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- Marketplace Integrations -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-plug text-purple-400"></i> Marketplace Integrations</h3>
          <div class="space-y-3">
            \${[
              ['Amazon SP-API', 'Order sync, settlements, refund alerts', 'connected'],
              ['Back Market API', 'Orders, financial statements, cases', 'connected'],
              ['eBay API', 'Order sync, settlement import', 'pending'],
              ['Shopify API', 'Order sync', 'not_configured'],
              ['HMRC MTD API', 'Direct VAT submission (Phase 4)', 'roadmap'],
              ['Xero Integration', 'Accounting export with VAT (Phase 4)', 'roadmap'],
            ].map(([name, desc, status]) => \`
              <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <div class="text-sm font-medium text-white">\${name}</div>
                  <div class="text-xs text-gray-400">\${desc}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full \${
                  status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' :
                  status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  status === 'roadmap' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }">\${status === 'connected' ? '✓ Connected' : status === 'pending' ? '⏳ Pending' : status === 'roadmap' ? '🗺 Roadmap' : '⚙ Configure'}</span>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>

      <!-- Build Phase Roadmap -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-road text-cyan-400"></i> Build Phase Roadmap</h3>
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
          \${[
            ['Phase 1', 'Months 1-3', 'Core Foundation', 'Multi-tenant, VAT engine, Purchase batches, Intake QC, OPR engine, Order sync, Basic RMA', 'IN PROGRESS', 'bg-blue-600'],
            ['Phase 2', 'Months 4-5', 'Risk & Recovery', 'INR workflows, AI communications, Fintech reconciliation, Loss tracking', 'PLANNED', 'bg-gray-600'],
            ['Phase 3', 'Months 6-7', 'Operations Expansion', 'Inventory audits, Repair workflows, Supplier analytics, Additional marketplaces', 'PLANNED', 'bg-gray-600'],
            ['Phase 4', 'Months 8-9', 'Intelligence & SaaS', 'Profitability engine, Dashboards, SaaS tenant management, HMRC MTD', 'PLANNED', 'bg-gray-600'],
          ].map(([phase, timing, title, desc, status, color]) => \`
            <div class="bg-gray-800 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold \${color === 'bg-blue-600' ? 'bg-blue-600' : 'bg-gray-600'} text-white px-2 py-0.5 rounded">\${phase}</span>
                <span class="text-xs text-gray-500">\${timing}</span>
              </div>
              <div class="font-semibold text-white text-sm mb-1">\${title}</div>
              <div class="text-xs text-gray-400">\${desc}</div>
              <div class="mt-3">
                <span class="text-xs px-2 py-0.5 rounded-full \${status === 'IN PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}">\${status}</span>
              </div>
            </div>
          \`).join('')}
        </div>
      </div>
    </div>
  \`;
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('dashboard');
});

// Close modal on overlay click
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
</script>

</body>
</html>`;
}

export default app;
