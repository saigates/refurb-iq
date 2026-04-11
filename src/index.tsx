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

    <button onclick="navigateTo('courier')" id="nav-courier" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-truck-fast w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Courier & INR</span>
      <span class="ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">2</span>
    </button>

    <button onclick="navigateTo('rma')" id="nav-rma" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-undo w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Returns & RMA</span>
      <span class="ml-auto bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">!</span>
    </button>

    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mt-3">Analytics</div>

    <button onclick="navigateTo('profitability')" id="nav-profitability" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-chart-line w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Profitability & P&L</span>
    </button>

    <button onclick="navigateTo('repairs')" id="nav-repairs" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white group">
      <i class="fas fa-tools w-4 text-gray-400 group-hover:text-blue-400"></i>
      <span>Repairs & Refurbishment</span>
      <span class="ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">4</span>
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
    <div class="mt-1">v2.2.0 · Phase 2 Complete</div>
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
    courier: ['Courier & INR', 'Investigations & Loss Recovery'],
    rma: ['Returns & RMA', 'Return QC & Resolution Workflow'],
    profitability: ['Profitability & P&L', 'Unit Economics & Margin Analytics'],
    repairs: ['Repairs & Refurbishment', 'Job Management & Grade Outcomes'],
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
    courier: renderCourier,
    rma: renderRMA,
    profitability: renderProfitability,
    repairs: renderRepairs,
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
// PAGE: DASHBOARD (Enhanced v2.2)
// ══════════════════════════════════════════════════════════════════════════════

async function renderDashboard() {
  const [stats, repairStats, pnlSummary, investigations] = await Promise.all([
    axios.get(API + '/dashboard').then(r => r.data),
    axios.get(API + '/repairs/stats/summary').then(r => r.data),
    axios.get(API + '/pnl/summary').then(r => r.data),
    axios.get(API + '/investigations/stats/summary').then(r => r.data),
  ]);
  const vatPositive = stats.vat_liability >= 0;
  const marginColor = pnlSummary.avg_margin_percent >= 20 ? 'text-emerald-400' : pnlSummary.avg_margin_percent >= 0 ? 'text-amber-400' : 'text-red-400';
  
  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">
      <!-- Alert Banners -->
      <div class="space-y-2">
        <div class="bg-red-900/30 border border-red-700/50 rounded-xl px-5 py-3 flex items-center gap-3">
          <i class="fas fa-exclamation-triangle text-red-400"></i>
          <span class="text-sm text-red-300"><strong>OPR Alert:</strong> Batch OPR2025-009 expires in <strong>7 days</strong> — reimport or discharge immediately to avoid HMRC liability.</span>
          <button onclick="navigateTo('opr')" class="ml-auto text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex-shrink-0">View OPR →</button>
        </div>
        <div class="bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-2.5 flex items-center gap-3">
          <i class="fas fa-shield-alt text-amber-400"></i>
          <span class="text-sm text-amber-300"><strong>IMEI Mismatch:</strong> RMA-2026-007 (Amazon) — returned device IMEI does not match sold IMEI. All resolution paths frozen pending manager review.</span>
          <button onclick="navigateTo('rma')" class="ml-auto text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg flex-shrink-0">Review →</button>
        </div>
      </div>

      <!-- KPI Row 1: Operations -->
      <div>
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Operations Overview</div>
        <div class="grid grid-cols-2 xl:grid-cols-5 gap-4">
          \${statCard('Total Devices', fmtNum(stats.total_devices), 'fa-mobile-alt', 'bg-blue-600', 'In registry')}
          \${statCard('Available Stock', fmtNum(stats.available_devices), 'fa-check-circle', 'bg-emerald-600', 'Ready to sell')}
          \${statCard('Pending QC', fmtNum(stats.pending_qc), 'fa-microscope', 'bg-amber-600', 'Awaiting inspection')}
          \${statCard('In OPR', fmtNum(stats.in_opr), 'fa-globe-europe', 'bg-cyan-600', 'At repair vendor')}
          \${statCard('Active Repairs', fmtNum(repairStats.in_progress + repairStats.awaiting_parts), 'fa-tools', 'bg-orange-600', \`\${repairStats.awaiting_parts} awaiting parts\`)}
        </div>
      </div>

      <!-- KPI Row 2: Finance -->
      <div>
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Finance & Compliance</div>
        <div class="grid grid-cols-2 xl:grid-cols-5 gap-4">
          \${statCard('Revenue MTD', fmt(stats.total_revenue_mtd), 'fa-pound-sign', 'bg-purple-600', 'April 2026')}
          \${statCard('Net Profit MTD', fmt(pnlSummary.total_net_profit), 'fa-chart-line', pnlSummary.total_net_profit >= 0 ? 'bg-emerald-700' : 'bg-red-700', \`Avg \${pnlSummary.avg_margin_percent}% margin\`)}
          \${statCard('VAT Liability', fmt(Math.abs(stats.vat_liability)), 'fa-landmark', vatPositive ? 'bg-red-600' : 'bg-emerald-600', vatPositive ? 'Payable to HMRC' : 'Reclaimable')}
          \${statCard('Open Orders', fmtNum(stats.open_orders), 'fa-shopping-cart', 'bg-indigo-600', 'Active fulfilment')}
          \${statCard('Open Tickets', fmtNum(stats.open_tickets), 'fa-headset', 'bg-red-600', 'Requires attention')}
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Device Status Doughnut -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-pie text-blue-400"></i> Device Status</h3>
          <canvas id="deviceChart" height="220"></canvas>
        </div>
        <!-- Revenue & Margin Bar -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-bar text-purple-400"></i> Revenue by Marketplace</h3>
          <canvas id="mktChart" height="220"></canvas>
        </div>
        <!-- Repair Pipeline -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-3 flex items-center gap-2"><i class="fas fa-tools text-orange-400"></i> Repair Pipeline</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">In Progress</span>
              <div class="flex items-center gap-2"><span class="text-white font-bold">\${repairStats.in_progress}</span><div class="w-20 bg-gray-700 rounded-full h-2"><div class="h-2 rounded-full bg-blue-500" style="width:\${repairStats.total_jobs > 0 ? (repairStats.in_progress/repairStats.total_jobs*100) : 0}%"></div></div></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Awaiting Parts</span>
              <div class="flex items-center gap-2"><span class="text-white font-bold">\${repairStats.awaiting_parts}</span><div class="w-20 bg-gray-700 rounded-full h-2"><div class="h-2 rounded-full bg-amber-500" style="width:\${repairStats.total_jobs > 0 ? (repairStats.awaiting_parts/repairStats.total_jobs*100) : 0}%"></div></div></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Completed</span>
              <div class="flex items-center gap-2"><span class="text-white font-bold">\${repairStats.completed}</span><div class="w-20 bg-gray-700 rounded-full h-2"><div class="h-2 rounded-full bg-emerald-500" style="width:\${repairStats.total_jobs > 0 ? (repairStats.completed/repairStats.total_jobs*100) : 0}%"></div></div></div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">Quote Pending</span>
              <div class="flex items-center gap-2"><span class="text-white font-bold">\${repairStats.total_jobs - repairStats.in_progress - repairStats.awaiting_parts - repairStats.completed - repairStats.scrapped}</span><div class="w-20 bg-gray-700 rounded-full h-2"><div class="h-2 rounded-full bg-gray-500" style="width:25%"></div></div></div>
            </div>
            <div class="border-t border-gray-800 pt-3 mt-3 grid grid-cols-2 gap-2">
              <div class="bg-gray-800 rounded-lg p-2 text-center">
                <div class="text-xs text-gray-400">Grade Upgrades</div>
                <div class="text-lg font-bold text-emerald-400">\${repairStats.grade_upgrades}</div>
              </div>
              <div class="bg-gray-800 rounded-lg p-2 text-center">
                <div class="text-xs text-gray-400">Total Cost</div>
                <div class="text-lg font-bold text-amber-400">\${fmt(repairStats.total_repair_cost)}</div>
              </div>
            </div>
            <button onclick="navigateTo('repairs')" class="w-full text-xs text-blue-400 hover:text-blue-300 text-center mt-1">View all repair jobs →</button>
          </div>
        </div>
      </div>

      <!-- Bottom Row: 3 panels -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
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

        <!-- Risk & Compliance Summary -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-white flex items-center gap-2"><i class="fas fa-shield-alt text-red-400"></i> Risk & Compliance</h3>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-2.5 bg-red-900/20 border border-red-800/40 rounded-lg">
              <div class="flex items-center gap-2"><i class="fas fa-exclamation-circle text-red-400 text-sm"></i><span class="text-sm text-gray-300">OPR Expiring ≤30d</span></div>
              <span class="text-red-400 font-bold">\${stats.opr_expiring_soon}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-amber-900/20 border border-amber-800/40 rounded-lg">
              <div class="flex items-center gap-2"><i class="fas fa-fingerprint text-amber-400 text-sm"></i><span class="text-sm text-gray-300">IMEI Mismatches</span></div>
              <span class="text-amber-400 font-bold">1</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-purple-900/20 border border-purple-800/40 rounded-lg">
              <div class="flex items-center gap-2"><i class="fas fa-truck-fast text-purple-400 text-sm"></i><span class="text-sm text-gray-300">Open Investigations</span></div>
              <span class="text-purple-400 font-bold">\${investigations.open}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-blue-900/20 border border-blue-800/40 rounded-lg">
              <div class="flex items-center gap-2"><i class="fas fa-lock text-blue-400 text-sm"></i><span class="text-sm text-gray-300">Locked Devices</span></div>
              <span class="text-blue-400 font-bold">1</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-gray-800/50 border border-gray-700/40 rounded-lg">
              <div class="flex items-center gap-2"><i class="fas fa-coins text-yellow-400 text-sm"></i><span class="text-sm text-gray-300">Carrier Recovery MTD</span></div>
              <span class="text-yellow-400 font-bold">\${fmt(investigations.totalRecovered)}</span>
            </div>
            <div class="mt-2 p-3 bg-emerald-900/20 border border-emerald-800/40 rounded-lg">
              <div class="flex items-center gap-2 mb-1"><i class="fas fa-check-circle text-emerald-400 text-xs"></i><span class="text-xs font-semibold text-emerald-300">VAT Period Q1 2026</span></div>
              <div class="text-xs text-gray-400">Locked & Submitted · Box 5 liability <span class="text-white font-bold">-£626.25</span> (reclaimable)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VAT Chart Row -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-bar text-purple-400"></i> VAT Position — Q2 2026 (Open Period)</h3>
          <canvas id="vatChart" height="180"></canvas>
        </div>
        <!-- P&L Waterfall summary -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-funnel-dollar text-emerald-400"></i> P&L Summary — April 2026 MTD</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between py-2 border-b border-gray-800">
              <span class="text-sm text-gray-400">Gross Revenue</span>
              <span class="text-white font-bold">\${fmt(pnlSummary.total_gross_revenue)}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-800">
              <span class="text-sm text-gray-400">Less: VAT Collected</span>
              <span class="text-red-400">− \${fmt(pnlSummary.total_vat_collected)}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-800">
              <span class="text-sm text-gray-400">Net Revenue</span>
              <span class="text-white font-bold">\${fmt(pnlSummary.total_net_revenue)}</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b border-gray-800">
              <span class="text-sm text-gray-400">Less: Total Costs</span>
              <span class="text-amber-400">− \${fmt(pnlSummary.total_costs)}</span>
            </div>
            <div class="flex items-center justify-between py-2 bg-emerald-900/20 rounded-lg px-3">
              <span class="text-sm font-bold text-gray-300">Net Profit</span>
              <span class="text-emerald-400 font-bold text-lg">\${fmt(pnlSummary.total_net_profit)}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-400">Units Sold</span>
              <span class="text-white">\${pnlSummary.total_units_sold}</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-400">Avg Margin</span>
              <span class="font-bold \${marginColor}">\${pnlSummary.avg_margin_percent}%</span>
            </div>
            <div class="flex items-center justify-between py-2">
              <span class="text-sm text-gray-400">Best Margin Device</span>
              <span class="text-xs text-emerald-400">\${pnlSummary.best_margin_device}</span>
            </div>
            <button onclick="navigateTo('profitability')" class="w-full text-xs text-blue-400 hover:text-blue-300 text-center mt-2">Full P&L breakdown →</button>
          </div>
        </div>
      </div>
    </div>
  \`;

  // Render charts
  setTimeout(() => {
    renderDeviceChart();
    renderMktChart(pnlSummary.by_marketplace);
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
      responsive: true,
      plugins: { legend: { position: 'right', labels: { color: '#9ca3af', font: { size: 11 } } } }
    }
  });
}

function renderMktChart(byMarketplace) {
  const ctx = document.getElementById('mktChart');
  if (!ctx || !byMarketplace) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: byMarketplace.map(m => m.marketplace),
      datasets: [
        { label: 'Revenue', data: byMarketplace.map(m => m.revenue), backgroundColor: '#3b82f666', borderColor: '#3b82f6', borderWidth: 1.5 },
        { label: 'Profit', data: byMarketplace.map(m => m.profit), backgroundColor: '#10b98166', borderColor: '#10b981', borderWidth: 1.5 },
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
        y: { ticks: { color: '#6b7280', callback: v => '£' + v }, grid: { color: '#1f2937' } }
      }
    }
  });
}

function renderVatChart() {
  const ctx = document.getElementById('vatChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Box 1 (Output VAT)', 'Box 4 (Input VAT)', 'Box 6 (Net Sales)', 'Box 7 (Purchases)'],
      datasets: [{
        label: 'Q2 2026 (Partial)',
        data: [88.75, 0, 6347, 0],
        backgroundColor: ['#ef444466', '#10b98166', '#3b82f666', '#8b5cf666'],
        borderColor: ['#ef4444', '#10b981', '#3b82f6', '#8b5cf6'],
        borderWidth: 1.5,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#9ca3af' } } },
      scales: {
        x: { ticks: { color: '#6b7280', font: { size: 10 } }, grid: { color: '#1f2937' } },
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
            <div class="text-xs text-gray-400">\${b.unit_count} units · \${b.vendor_name?.substring(0,22)}...</div>
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

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: COURIER & INR INVESTIGATIONS
// ══════════════════════════════════════════════════════════════════════════════

async function renderCourier() {
  const [investigations, stats] = await Promise.all([
    axios.get(API + '/investigations').then(r => r.data),
    axios.get(API + '/investigations/stats/summary').then(r => r.data),
  ]);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-5">
      <!-- Stats -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Open Cases', stats.open, 'fa-folder-open', 'bg-amber-700', 'Active investigations')}
        \${statCard('Total Claimed', fmt(stats.totalClaimed), 'fa-file-invoice-dollar', 'bg-blue-700', 'From carriers')}
        \${statCard('Total Recovered', fmt(stats.totalRecovered), 'fa-hand-holding-usd', 'bg-emerald-700', 'Successfully reclaimed')}
        \${statCard('Recovery Rate', stats.recoveryRate + '%', 'fa-percentage', stats.recoveryRate >= 60 ? 'bg-emerald-700' : 'bg-red-700', 'Claims success rate')}
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <select id="inv-status-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterInvestigations()">
            <option value="">All Statuses</option>
            <option>OPEN</option>
            <option>SUBMITTED_TO_CARRIER</option>
            <option>UNDER_INVESTIGATION</option>
            <option>EVIDENCE_REQUIRED</option>
            <option>CLAIM_SUBMITTED</option>
            <option>CLAIM_APPROVED</option>
            <option>CLAIM_REJECTED</option>
            <option>RESOLVED_LOSS</option>
            <option>RESOLVED_FOUND</option>
          </select>
          <select id="inv-type-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterInvestigations()">
            <option value="">All Types</option>
            <option value="INR">INR — Item Not Received</option>
            <option value="DAMAGED">Damaged in Transit</option>
            <option value="LOST_IN_TRANSIT">Lost in Transit</option>
            <option value="WRONG_ITEM">Wrong Item</option>
            <option value="LATE_DELIVERY">Late Delivery</option>
          </select>
        </div>
        <button onclick="showNewInvestigationModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <i class="fas fa-plus"></i> Open Investigation
        </button>
      </div>

      <!-- Process Guide -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="flex items-center gap-3 mb-3">
          <i class="fas fa-route text-blue-400"></i>
          <span class="font-semibold text-white text-sm">INR Investigation Workflow</span>
        </div>
        <div class="flex items-center gap-1 overflow-x-auto pb-1">
          \${['Open Case', 'Upload Evidence', 'Submit to Carrier', 'Under Investigation', 'Claim Decision', 'Recovery / Loss'].map((step, i) => \`
            <div class="flex items-center gap-1 flex-shrink-0">
              <div class="flex flex-col items-center">
                <div class="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-xs font-bold text-blue-300">\${i+1}</div>
                <div class="text-xs text-gray-400 mt-1 whitespace-nowrap">\${step}</div>
              </div>
              \${i < 5 ? '<i class="fas fa-chevron-right text-gray-600 mt-[-14px] mx-1"></i>' : ''}
            </div>
          \`).join('')}
        </div>
      </div>

      <!-- Investigations Table -->
      <div id="inv-table">
        \${renderInvestigationsTable(investigations)}
      </div>
    </div>
  \`;
  window._allInvestigations = investigations;
}

function invStatusBadge(status) {
  const map = {
    OPEN: ['bg-gray-500/20 text-gray-300 border-gray-500/30', 'fa-folder-open'],
    SUBMITTED_TO_CARRIER: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-paper-plane'],
    UNDER_INVESTIGATION: ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'fa-search'],
    EVIDENCE_REQUIRED: ['bg-orange-500/20 text-orange-400 border-orange-500/30', 'fa-exclamation-triangle'],
    CLAIM_SUBMITTED: ['bg-purple-500/20 text-purple-400 border-purple-500/30', 'fa-file-alt'],
    CLAIM_APPROVED: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-check-circle'],
    CLAIM_REJECTED: ['bg-red-500/20 text-red-400 border-red-500/30', 'fa-times-circle'],
    ESCALATED: ['bg-red-700/30 text-red-300 border-red-700/50', 'fa-exclamation-circle'],
    RESOLVED_LOSS: ['bg-red-900/30 text-red-400 border-red-900/50', 'fa-minus-circle'],
    RESOLVED_FOUND: ['bg-emerald-900/30 text-emerald-400 border-emerald-900/50', 'fa-check-double'],
    CLOSED: ['bg-gray-700/30 text-gray-400 border-gray-700/50', 'fa-archive'],
  };
  const [cls, icon] = map[status] || ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-question'];
  return \`<span class="status-badge inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 \${cls}"><i class="fas \${icon} text-xs"></i> \${status.replace(/_/g,' ')}</span>\`;
}

function eventTypeBadge(type) {
  const map = {
    INR: 'bg-red-500/20 text-red-400',
    DAMAGED: 'bg-orange-500/20 text-orange-400',
    LOST_IN_TRANSIT: 'bg-red-700/20 text-red-300',
    WRONG_ITEM: 'bg-purple-500/20 text-purple-400',
    LATE_DELIVERY: 'bg-amber-500/20 text-amber-400',
  };
  return \`<span class="text-xs px-2 py-0.5 rounded-full \${map[type] || 'bg-gray-600/30 text-gray-400'}">\${type.replace(/_/g,' ')}</span>\`;
}

function renderInvestigationsTable(investigations) {
  return table(
    ['Inv. ID', 'Order', 'Customer', 'Type', 'Courier / Tracking', 'Sale Value', 'Claimed', 'Recovered', 'Status', 'Actions'],
    investigations.map(inv => [
      \`<span class="font-mono text-xs text-blue-300">\${inv.investigation_id}</span>\`,
      \`<span class="font-mono text-xs text-gray-300">\${inv.order_id}</span>\`,
      \`<div class="text-sm text-white">\${inv.customer_name}</div><div class="text-xs text-gray-400">\${inv.marketplace}</div>\`,
      eventTypeBadge(inv.event_type),
      \`<div class="text-xs text-gray-300">\${inv.courier}</div><code class="text-xs text-blue-300">\${inv.tracking_number}</code>\`,
      fmt(inv.sale_value),
      \`<span class="text-amber-400">\${fmt(inv.claimed_amount)}</span>\`,
      inv.recovery_amount > 0 ? \`<span class="font-bold text-emerald-400">\${fmt(inv.recovery_amount)}</span>\` : '<span class="text-gray-600">—</span>',
      invStatusBadge(inv.status),
      \`<button onclick="viewInvestigation('\${inv.investigation_id}')" class="text-xs text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded-lg hover:bg-blue-900/40">View</button>\`,
    ])
  );
}

function filterInvestigations() {
  const status = document.getElementById('inv-status-filter')?.value || '';
  const type = document.getElementById('inv-type-filter')?.value || '';
  const filtered = (window._allInvestigations || []).filter(i => (!status || i.status === status) && (!type || i.event_type === type));
  document.getElementById('inv-table').innerHTML = renderInvestigationsTable(filtered);
}

async function viewInvestigation(id) {
  const inv = await axios.get(API + '/investigations/' + id).then(r => r.data);
  const evidenceHtml = inv.evidence_items.map(e => \`
    <div class="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
      <div class="flex items-center gap-2">
        <i class="fas fa-file-pdf text-red-400 text-sm"></i>
        <div>
          <div class="text-sm text-white">\${e.filename}</div>
          <div class="text-xs text-gray-400">\${e.type.replace(/_/g,' ')} · \${fmtDate(e.uploaded_at)} · \${e.uploaded_by}</div>
        </div>
      </div>
      <button class="text-xs text-blue-400 hover:text-blue-300">Download</button>
    </div>
  \`).join('') || '<p class="text-sm text-gray-500">No evidence uploaded yet</p>';

  const timelineHtml = inv.timeline.map(t => \`
    <div class="flex gap-3">
      <div class="flex flex-col items-center">
        <div class="w-7 h-7 rounded-full \${t.system_generated ? 'bg-blue-900/50 border border-blue-700/50' : 'bg-gray-700 border border-gray-600'} flex items-center justify-center flex-shrink-0">
          <i class="fas \${t.system_generated ? 'fa-robot text-blue-400' : 'fa-user text-gray-300'} text-xs"></i>
        </div>
        <div class="flex-1 w-px bg-gray-700 mt-1"></div>
      </div>
      <div class="pb-4 flex-1">
        <div class="text-xs text-gray-400">\${new Date(t.timestamp).toLocaleString('en-GB')} · \${t.actor}</div>
        <div class="text-sm text-gray-200 mt-0.5">\${t.action}</div>
      </div>
    </div>
  \`).join('');

  openModal(\`Investigation \${inv.investigation_id} — \${inv.event_type.replace(/_/g,' ')}\`, \`
    <div class="space-y-4 text-sm">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">\${invStatusBadge(inv.status)} \${eventTypeBadge(inv.event_type)}</div>
          <div class="text-white font-semibold">\${inv.customer_name} · \${inv.marketplace}</div>
          <div class="text-gray-400 text-xs">\${inv.courier} · <code class="text-blue-300">\${inv.tracking_number}</code></div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-gray-400 text-xs">IMEI</div>
          <code class="text-blue-300 text-xs">\${inv.imei || '—'}</code>
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-gray-400 text-xs">Sale Value</div><div class="font-bold text-white mt-1">\${fmt(inv.sale_value)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-gray-400 text-xs">Claimed</div><div class="font-bold text-amber-400 mt-1">\${fmt(inv.claimed_amount)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3 text-center border \${inv.recovery_amount > 0 ? 'border-emerald-700/40' : 'border-gray-700'}"><div class="text-gray-400 text-xs">Recovered</div><div class="font-bold \${inv.recovery_amount > 0 ? 'text-emerald-400' : 'text-gray-500'} mt-1">\${fmt(inv.recovery_amount)}</div></div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-3 gap-3 text-xs">
        <div class="bg-gray-800 rounded-lg p-2.5"><div class="text-gray-400">Dispatched</div><div class="text-white mt-0.5">\${fmtDate(inv.dispatch_date)}</div></div>
        <div class="bg-gray-800 rounded-lg p-2.5"><div class="text-gray-400">Expected Delivery</div><div class="text-white mt-0.5">\${fmtDate(inv.expected_delivery_date)}</div></div>
        <div class="bg-gray-800 rounded-lg p-2.5"><div class="text-gray-400">Last Tracking</div><div class="text-amber-400 mt-0.5">\${inv.last_tracking_event.substring(0,30)}…</div></div>
      </div>

      \${inv.notes ? \`<div class="bg-gray-800 rounded-lg p-3"><div class="text-gray-400 text-xs mb-1">Case Notes</div><div class="text-gray-200 text-sm">\${inv.notes}</div></div>\` : ''}

      <!-- Actions -->
      <div class="flex flex-wrap gap-2">
        \${inv.status === 'OPEN' ? \`<button onclick="alert('Evidence upload modal')" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-upload mr-1"></i>Upload Evidence</button>\` : ''}
        \${['OPEN','EVIDENCE_REQUIRED'].includes(inv.status) ? \`<button onclick="alert('Carrier portal submission recorded')" class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-paper-plane mr-1"></i>Submit to Carrier</button>\` : ''}
        \${inv.status === 'CLAIM_APPROVED' ? \`<button onclick="alert('Recovery amount posted to device P&L')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-check mr-1"></i>Post Recovery to P&L</button>\` : ''}
        \${inv.status === 'CLAIM_REJECTED' ? \`<button onclick="alert('Escalation logged')" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-level-up-alt mr-1"></i>Escalate</button>\` : ''}
        <button onclick="alert('Loss confirmed — device status updated')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-minus-circle mr-1"></i>Mark as Loss</button>
      </div>

      <!-- Evidence -->
      <div>
        <div class="flex items-center justify-between mb-2"><h4 class="font-semibold text-white text-sm">Evidence (\${inv.evidence_items.length})</h4>
          <button onclick="alert('Upload evidence')" class="text-xs text-blue-400 hover:text-blue-300">+ Add Evidence</button></div>
        <div class="space-y-2">\${evidenceHtml}</div>
      </div>

      <!-- Timeline -->
      <div>
        <h4 class="font-semibold text-white text-sm mb-3">Investigation Timeline</h4>
        <div class="space-y-0">\${timelineHtml}</div>
      </div>
    </div>
  \`);
}

function showNewInvestigationModal() {
  openModal('Open Courier Investigation', \`
    <div class="space-y-3 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-gray-400 text-xs block mb-1">Order ID</label><input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="ORD-..."/></div>
        <div><label class="text-gray-400 text-xs block mb-1">Event Type</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option>INR</option><option>DAMAGED</option><option>LOST_IN_TRANSIT</option><option>WRONG_ITEM</option><option>LATE_DELIVERY</option>
          </select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Courier</label>
          <select class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option>DHL Express</option><option>FedEx International</option><option>Royal Mail Tracked 48</option><option>UPS</option><option>Evri</option>
          </select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Tracking Number</label><input type="text" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Sale Value (£)</label><input type="number" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Claimed Amount (£)</label><input type="number" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
      </div>
      <div><label class="text-gray-400 text-xs block mb-1">Notes</label>
        <textarea class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 h-20 resize-none text-sm"></textarea>
      </div>
      <div class="flex gap-3 pt-2">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button onclick="alert('Investigation opened. Device custody event logged.'); closeModal();" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Open Investigation</button>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: RETURNS & RMA
// ══════════════════════════════════════════════════════════════════════════════

async function renderRMA() {
  const [rmaList, stats] = await Promise.all([
    axios.get(API + '/rma').then(r => r.data),
    axios.get(API + '/rma/stats/summary').then(r => r.data),
  ]);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-5">

      <!-- IMEI Mismatch ALERT -->
      <div class="bg-red-900/40 border border-red-600/60 rounded-xl p-4 flex items-start gap-3">
        <i class="fas fa-exclamation-triangle text-red-400 text-lg mt-0.5 flex-shrink-0"></i>
        <div class="flex-1">
          <div class="font-bold text-red-300">IMEI Mismatch Detected — Immediate Action Required</div>
          <div class="text-xs text-red-300/80 mt-1">RMA-2026-007: Customer returned IMEI <code class="bg-red-900/40 px-1 rounded">354678901234999</code> — does NOT match sold IMEI <code class="bg-red-900/40 px-1 rounded">354678901234573</code>. All refund and replacement paths are FROZEN. Manager escalation mandatory.</div>
        </div>
        <button onclick="viewRMA('RMA-2026-007')" class="flex-shrink-0 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg">View →</button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Open RMAs', stats.open, 'fa-undo', 'bg-amber-700', 'Active returns')}
        \${statCard('IMEI Mismatches', stats.mismatches, 'fa-exclamation-triangle', 'bg-red-700', 'Frozen — escalate')}
        \${statCard('Pending Return QC', stats.pendingQC, 'fa-microscope', 'bg-blue-700', 'Awaiting inspection')}
        \${statCard('Total Refunded', fmt(stats.totalRefunded), 'fa-pound-sign', 'bg-purple-700', 'Approved refunds')}
      </div>

      <!-- Non-Negotiable Controls -->
      <div class="bg-gray-900 border border-amber-700/30 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3"><i class="fas fa-shield-alt text-amber-400"></i><span class="font-semibold text-white text-sm">Return QC Non-Negotiable Controls</span></div>
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-2 text-xs">
          \${[
            ['Return QC Mandatory', 'No refund or replacement issued without completed Return QC'],
            ['IMEI Matching Required', 'Returned IMEI must exactly match the IMEI that was sold'],
            ['IMEI Mismatch → Freeze', 'Immediate RETURN_MISMATCH event — all paths frozen until manager clears'],
            ['Lock Check on Return', 'Any lock detected on returned device blocks resolution'],
          ].map(([ctrl, desc]) => \`
            <div class="flex items-start gap-2 bg-gray-800 rounded-lg p-2.5">
              <i class="fas fa-check-circle text-amber-400 mt-0.5 flex-shrink-0"></i>
              <div><div class="font-medium text-white">\${ctrl}</div><div class="text-gray-400">\${desc}</div></div>
            </div>
          \`).join('')}
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-800">
        <div class="flex gap-6">
          <button id="rtab-all" onclick="showRMATab('all')" class="pb-3 text-sm font-medium text-blue-400 tab-active">All RMAs (\${rmaList.length})</button>
          <button id="rtab-pending-qc" onclick="showRMATab('pending-qc')" class="pb-3 text-sm font-medium text-gray-400 hover:text-white">Pending QC</button>
          <button id="rtab-mismatch" onclick="showRMATab('mismatch')" class="pb-3 text-sm font-medium text-red-400 hover:text-red-300">⚠ IMEI Mismatches (1)</button>
        </div>
      </div>

      <div id="rma-content">
        \${renderRMATable(rmaList)}
      </div>
    </div>
  \`;
  window._allRMA = rmaList;
}

function rmaStatusBadge(status) {
  const map = {
    REQUESTED: ['bg-gray-500/20 text-gray-300 border-gray-500/30', 'fa-inbox'],
    AUTHORISED: ['bg-blue-500/20 text-blue-400 border-blue-500/30', 'fa-check'],
    IN_TRANSIT_BACK: ['bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 'fa-truck'],
    RECEIVED: ['bg-indigo-500/20 text-indigo-400 border-indigo-500/30', 'fa-box-open'],
    RETURN_QC_PENDING: ['bg-amber-500/20 text-amber-400 border-amber-500/30', 'fa-microscope'],
    QC_PASS_NO_FAULT: ['bg-emerald-500/20 text-emerald-400 border-emerald-500/30', 'fa-check-circle'],
    QC_FAIL_FAULT_CONFIRMED: ['bg-red-500/20 text-red-400 border-red-500/30', 'fa-times-circle'],
    IMEI_MISMATCH: ['bg-red-700/40 text-red-300 border-red-600/60 animate-pulse', 'fa-exclamation-triangle'],
    REFUND_APPROVED: ['bg-purple-500/20 text-purple-400 border-purple-500/30', 'fa-pound-sign'],
    REPLACEMENT_DISPATCHED: ['bg-cyan-500/20 text-cyan-400 border-cyan-500/30', 'fa-shipping-fast'],
    CLOSED: ['bg-gray-700/30 text-gray-400 border-gray-700/50', 'fa-archive'],
    CLOSED_NO_ACTION: ['bg-gray-700/30 text-gray-400 border-gray-700/50', 'fa-ban'],
  };
  const [cls, icon] = map[status] || ['bg-gray-500/20 text-gray-400 border-gray-500/30', 'fa-question'];
  return \`<span class="status-badge inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 \${cls}"><i class="fas \${icon} text-xs"></i> \${status.replace(/_/g,' ')}</span>\`;
}

function renderRMATable(rmaList) {
  return table(
    ['RMA ID', 'Order', 'Customer', 'Reason', 'IMEI Match', 'Sale Value', 'Refund', 'Resolution', 'Status', 'Actions'],
    rmaList.map(r => [
      \`<span class="font-mono text-xs text-blue-300">\${r.rma_id}</span>\`,
      \`<span class="font-mono text-xs text-gray-300">\${r.order_id}</span>\`,
      \`<div class="text-sm text-white">\${r.customer_name}</div><div class="text-xs text-gray-400">\${r.marketplace}</div>\`,
      \`<div class="text-xs text-gray-300 max-w-[120px] truncate" title="\${r.return_reason}">\${r.return_reason.substring(0,40)}…</div>\`,
      r.imei_match === null
        ? '<span class="text-xs text-gray-500">—</span>'
        : r.imei_match
          ? '<span class="text-xs text-emerald-400 font-bold"><i class="fas fa-check mr-1"></i>MATCH</span>'
          : '<span class="text-xs text-red-400 font-bold animate-pulse"><i class="fas fa-times mr-1"></i>MISMATCH</span>',
      fmt(r.sale_value),
      r.refund_amount > 0 ? \`<span class="text-amber-400">\${fmt(r.refund_amount)}</span>\` : '<span class="text-gray-600">—</span>',
      \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">\${r.resolution}</span>\`,
      rmaStatusBadge(r.status),
      \`<button onclick="viewRMA('\${r.rma_id}')" class="text-xs text-blue-400 bg-blue-900/20 px-2.5 py-1 rounded-lg hover:bg-blue-900/40">View</button>\`,
    ])
  );
}

function showRMATab(tab) {
  document.querySelectorAll('[id^="rtab-"]').forEach(el => { el.classList.remove('text-blue-400', 'tab-active'); el.classList.add('text-gray-400'); });
  document.getElementById('rtab-' + tab).classList.add('text-blue-400', 'tab-active');
  document.getElementById('rtab-' + tab).classList.remove('text-gray-400');
  const all = window._allRMA || [];
  let filtered = all;
  if (tab === 'pending-qc') filtered = all.filter(r => r.status === 'RETURN_QC_PENDING');
  if (tab === 'mismatch') filtered = all.filter(r => r.imei_match === false);
  document.getElementById('rma-content').innerHTML = renderRMATable(filtered);
}

async function viewRMA(id) {
  const r = await axios.get(API + '/rma/' + id).then(r => r.data);
  const isMismatch = r.imei_match === false;

  const timelineHtml = r.timeline.map(ev => \`
    <div class="flex gap-3">
      <div class="flex flex-col items-center">
        <div class="w-7 h-7 rounded-full \${ev.system_generated ? 'bg-blue-900/50 border border-blue-700/50' : 'bg-gray-700 border border-gray-600'} flex items-center justify-center flex-shrink-0">
          <i class="fas \${ev.system_generated ? 'fa-robot text-blue-400' : 'fa-user text-gray-300'} text-xs"></i>
        </div>
        <div class="flex-1 w-px bg-gray-700 mt-1"></div>
      </div>
      <div class="pb-4 flex-1">
        <div class="text-xs text-gray-400">\${new Date(ev.timestamp).toLocaleString('en-GB')} · \${ev.actor}</div>
        <div class="text-sm \${ev.action.includes('MISMATCH') ? 'text-red-300 font-semibold' : 'text-gray-200'} mt-0.5">\${ev.action}</div>
      </div>
    </div>
  \`).join('');

  openModal(\`RMA \${r.rma_id} — \${r.customer_name}\`, \`
    <div class="space-y-4 text-sm">

      \${isMismatch ? \`
        <div class="bg-red-900/40 border border-red-600/60 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2"><i class="fas fa-exclamation-triangle text-red-400 text-lg"></i><div class="font-bold text-red-300 text-base">IMEI MISMATCH — ALL PATHS FROZEN</div></div>
          <div class="grid grid-cols-2 gap-3 text-xs mt-2">
            <div class="bg-red-900/30 rounded-lg p-2.5"><div class="text-gray-400">IMEI Sold</div><code class="text-emerald-300 font-bold">\${r.imei_sold}</code></div>
            <div class="bg-red-900/30 rounded-lg p-2.5"><div class="text-gray-400">IMEI Returned</div><code class="text-red-300 font-bold">\${r.imei_returned}</code></div>
          </div>
          <div class="text-xs text-red-300/70 mt-2">A RETURN_MISMATCH event has been created. No refund, replacement, or restock can proceed until a Manager raises MISMATCH_CLEARED. This may indicate device swap fraud.</div>
          <div class="mt-3 flex gap-2">
            <button onclick="alert('Manager escalation notification sent')" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg flex-1">Escalate to Manager</button>
            <button onclick="alert('Police report template generated')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex-1">Generate Police Report</button>
          </div>
        </div>
      \` : \`
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Status</span><div class="mt-1">\${rmaStatusBadge(r.status)}</div></div>
          <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Resolution</span><div class="mt-1 text-white">\${r.resolution}</div></div>
          <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">IMEI Sold</span><code class="block text-emerald-300 text-xs mt-0.5">\${r.imei_sold}</code></div>
          <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">IMEI Returned</span><code class="block \${r.imei_match === true ? 'text-emerald-300' : 'text-red-300'} text-xs mt-0.5">\${r.imei_returned || '—'}</code></div>
          <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Sale Value</span><div class="mt-1 font-bold text-white">\${fmt(r.sale_value)}</div></div>
          <div class="bg-gray-800 rounded-lg p-3"><span class="text-gray-400 text-xs">Refund Amount</span><div class="mt-1 font-bold text-amber-400">\${fmt(r.refund_amount)}</div></div>
        </div>
      \`}

      <div class="bg-gray-800 rounded-lg p-3">
        <div class="text-gray-400 text-xs mb-1">Return Reason</div>
        <div class="text-gray-200">\${r.return_reason}</div>
      </div>

      \${r.status === 'RETURN_QC_PENDING' && !isMismatch ? \`
        <div class="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
          <div class="font-semibold text-amber-300 mb-2 flex items-center gap-2"><i class="fas fa-microscope"></i>Return QC Required</div>
          <div class="text-xs text-amber-300/70 mb-3">No refund or replacement can be issued until Return QC is completed. Lock check is mandatory.</div>
          <button onclick="alert('Return QC form opened'); closeModal();" class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full">Begin Return QC</button>
        </div>
      \` : ''}

      \${r.status === 'QC_FAIL_FAULT_CONFIRMED' ? \`
        <div class="bg-gray-800 rounded-xl p-4">
          <div class="font-semibold text-white mb-3">Resolution Actions</div>
          <div class="grid grid-cols-2 gap-3">
            <button onclick="alert('Full refund approved')" class="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm">Approve Full Refund</button>
            <button onclick="alert('Partial refund modal')" class="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">Partial Refund</button>
            <button onclick="alert('Replacement dispatched')" class="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm">Send Replacement</button>
            <button onclick="alert('Device scrapped')" class="bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg text-sm">Scrap Device</button>
          </div>
        </div>
      \` : ''}

      <!-- Timeline -->
      <div>
        <h4 class="font-semibold text-white text-sm mb-3">Return Timeline</h4>
        <div class="space-y-0">\${timelineHtml}</div>
      </div>
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: PROFITABILITY & UNIT P&L
// ══════════════════════════════════════════════════════════════════════════════

async function renderProfitability() {
  const [units, summary] = await Promise.all([
    axios.get(API + '/pnl/units').then(r => r.data),
    axios.get(API + '/pnl/summary').then(r => r.data),
  ]);

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-5">
      <!-- KPIs -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Units Sold', summary.total_units_sold, 'fa-mobile-alt', 'bg-blue-700', summary.period)}
        \${statCard('Gross Revenue', fmt(summary.total_gross_revenue), 'fa-pound-sign', 'bg-indigo-700', 'Before VAT')}
        \${statCard('Net Profit', fmt(summary.total_net_profit), 'fa-chart-line', summary.total_net_profit >= 0 ? 'bg-emerald-700' : 'bg-red-700', 'After all costs')}
        \${statCard('Avg Margin', summary.avg_margin_percent + '%', 'fa-percentage', summary.avg_margin_percent >= 20 ? 'bg-emerald-700' : 'bg-amber-700', 'Net margin')}
      </div>

      <!-- P&L Formula -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Unit P&L Formula</div>
        <div class="font-mono text-xs text-gray-300 leading-6">
          Net Profit = (Gross Sale − VAT) − (Purchase Cost + OPR Uplift + Marketplace Fee + Fintech Fee + Shipping + Repair Cost) + Recovery Amount
        </div>
      </div>

      <!-- Charts + Breakdown -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <!-- By Marketplace -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-store text-blue-400"></i> By Marketplace</h3>
          <div class="space-y-3">
            \${summary.by_marketplace.map(m => \`
              <div class="bg-gray-800 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-medium text-white">\${m.marketplace}</div>
                  <div class="flex items-center gap-3 text-xs">
                    <span class="text-gray-400">\${m.units} units</span>
                    <span class="font-bold \${m.margin_percent >= 20 ? 'text-emerald-400' : m.margin_percent >= 0 ? 'text-amber-400' : 'text-red-400'}">\${m.margin_percent}% margin</span>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-2 text-xs text-center">
                  <div><div class="text-gray-400">Revenue</div><div class="font-bold text-white">\${fmt(m.revenue)}</div></div>
                  <div><div class="text-gray-400">Profit</div><div class="font-bold \${m.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}">\${fmt(m.profit)}</div></div>
                  <div><div class="text-gray-400">Avg Fee</div><div class="font-bold text-amber-400">\${m.avg_fee_percent}%</div></div>
                </div>
                <div class="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full \${m.margin_percent >= 20 ? 'bg-emerald-500' : m.margin_percent >= 0 ? 'bg-amber-500' : 'bg-red-500'} progress-bar" style="width:\${Math.max(0, Math.min(100, m.margin_percent))}%"></div>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- By Make -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-mobile-alt text-purple-400"></i> By Manufacturer</h3>
          <canvas id="makeChart" height="180"></canvas>
          <div class="space-y-3 mt-4">
            \${summary.by_make.map(m => \`
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span class="text-sm text-gray-300">\${m.make}</span>
                  <span class="text-xs text-gray-500">\${m.units} units</span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold text-white">\${fmt(m.profit)}</span>
                  <span class="text-xs text-gray-400 ml-2">\${m.margin_percent}%</span>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
          <div class="text-xs text-gray-400 mb-1">Best Margin Device</div>
          <div class="font-semibold text-emerald-300">\${summary.best_margin_device}</div>
        </div>
        <div class="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
          <div class="text-xs text-gray-400 mb-1">Lowest Margin Device</div>
          <div class="font-semibold text-red-300">\${summary.worst_margin_device}</div>
        </div>
      </div>

      <!-- Unit P&L Table -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-white flex items-center gap-2"><i class="fas fa-table text-blue-400"></i> Unit P&L Breakdown</h3>
          <div class="flex items-center gap-2">
            <select id="pnl-status-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterPnL()">
              <option value="">All Units</option><option value="SOLD">Sold</option><option value="IN_STOCK">In Stock</option><option value="IN_OPR">In OPR</option>
            </select>
          </div>
        </div>
        <div id="pnl-table">
          \${renderPnLTable(units)}
        </div>
      </div>
    </div>
  \`;
  window._allPnL = units;
  window._pnlSummary = summary;
  setTimeout(() => renderMakeChart(summary.by_make), 100);
}

function renderMakeChart(byMake) {
  const ctx = document.getElementById('makeChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: byMake.map(m => m.make),
      datasets: [
        { label: 'Revenue', data: byMake.map(m => m.revenue), backgroundColor: '#3b82f666', borderColor: '#3b82f6', borderWidth: 1.5 },
        { label: 'Profit', data: byMake.map(m => m.profit), backgroundColor: '#10b98166', borderColor: '#10b981', borderWidth: 1.5 },
      ]
    },
    options: {
      responsive: true, plugins: { legend: { labels: { color: '#9ca3af', font: { size: 10 } } } },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
        y: { ticks: { color: '#6b7280', callback: v => '£' + v }, grid: { color: '#1f2937' } }
      }
    }
  });
}

function renderPnLTable(units) {
  return table(
    ['IMEI', 'Device', 'Grade', 'Marketplace', 'Gross Sale', 'Net Rev', 'Total Costs', 'Recovery', 'Net Profit', 'Margin', 'Status'],
    units.map(u => {
      const profitCls = u.net_profit > 0 ? 'text-emerald-400' : u.net_profit < 0 ? 'text-red-400' : 'text-gray-500';
      const marginCls = u.margin_percent >= 20 ? 'text-emerald-400' : u.margin_percent >= 0 ? 'text-amber-400' : 'text-red-400';
      return [
        \`<code class="text-xs text-blue-300">\${u.imei.substring(0, 12)}…</code>\`,
        \`<div class="text-sm text-white">\${u.make} \${u.model}</div><div class="text-xs text-gray-400">\${u.storage}</div>\`,
        gradeBadge(u.grade),
        u.marketplace ? \`<span class="text-xs bg-gray-700 px-2 py-0.5 rounded">\${u.marketplace}</span>\` : '<span class="text-gray-600 text-xs">—</span>',
        u.gross_sale > 0 ? fmt(u.gross_sale) : '<span class="text-gray-600">—</span>',
        u.net_revenue > 0 ? fmt(u.net_revenue) : '<span class="text-gray-600">—</span>',
        \`<span class="text-amber-400">\${fmt(u.total_costs)}</span>\`,
        u.recovery_amount > 0 ? \`<span class="text-cyan-400 font-bold">\${fmt(u.recovery_amount)}</span>\` : '<span class="text-gray-600">—</span>',
        \`<span class="font-bold \${profitCls}">\${fmt(u.net_profit)}</span>\`,
        u.status === 'SOLD' ? \`<span class="font-bold \${marginCls}">\${u.margin_percent}%</span>\` : '<span class="text-gray-600">—</span>',
        \`<span class="text-xs px-2 py-0.5 rounded-full \${u.status === 'SOLD' ? 'bg-emerald-500/20 text-emerald-400' : u.status === 'IN_OPR' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-500/20 text-blue-400'}">\${u.status}</span>\`,
      ];
    })
  );
}

function filterPnL() {
  const status = document.getElementById('pnl-status-filter')?.value || '';
  const filtered = (window._allPnL || []).filter(u => !status || u.status === status);
  document.getElementById('pnl-table').innerHTML = renderPnLTable(filtered);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: REPAIRS & REFURBISHMENT
// ══════════════════════════════════════════════════════════════════════════════

async function renderRepairs() {
  const [repairs, stats] = await Promise.all([
    axios.get(API + '/repairs').then(r => r.data),
    axios.get(API + '/repairs/stats/summary').then(r => r.data),
  ]);
  window._allRepairs = repairs;

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- Non-Negotiable Controls -->
      <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3">
          <i class="fas fa-shield-alt text-blue-400"></i>
          <span class="text-sm font-semibold text-blue-300">Repair Module — Non-Negotiable Controls</span>
        </div>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-2 text-xs text-gray-400">
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> Post-repair QC mandatory before device re-enters Available</div>
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> Economic viability check required before approval</div>
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> Grade outcomes written to device record and audit log</div>
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> Repair cost posted to unit P&L automatically</div>
        </div>
      </div>

      <!-- KPI Row -->
      <div class="grid grid-cols-2 xl:grid-cols-5 gap-4">
        \${statCard('Total Jobs', stats.total_jobs, 'fa-tools', 'bg-orange-600', 'All time')}
        \${statCard('In Progress', stats.in_progress, 'fa-cog', 'bg-blue-600', 'Active repairs')}
        \${statCard('Awaiting Parts', stats.awaiting_parts, 'fa-clock', 'bg-amber-600', 'Parts on order')}
        \${statCard('Completed', stats.completed, 'fa-check-circle', 'bg-emerald-600', 'Successfully repaired')}
        \${statCard('Grade Upgrades', stats.grade_upgrades, 'fa-arrow-up', 'bg-purple-600', 'Grade improved')}
      </div>

      <!-- Financial summary -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div class="text-xs text-gray-400 mb-1">Total Repair Cost</div>
          <div class="text-2xl font-bold text-amber-400">\${fmt(stats.total_repair_cost)}</div>
          <div class="text-xs text-gray-500 mt-1">Avg \${fmt(stats.avg_repair_cost)} per job</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div class="text-xs text-gray-400 mb-1">Grade Upgrade Value</div>
          <div class="text-2xl font-bold text-emerald-400">\${fmt(stats.recovery_value)}</div>
          <div class="text-xs text-gray-500 mt-1">Estimated uplift from grade upgrades</div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div class="text-xs text-gray-400 mb-1">Economically Unviable</div>
          <div class="text-2xl font-bold text-red-400">\${stats.economically_unviable}</div>
          <div class="text-xs text-gray-500 mt-1">Repairs declined on cost grounds</div>
        </div>
      </div>

      <!-- Repair Pipeline Diagram -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-stream text-orange-400"></i> Repair Workflow</h3>
        <div class="flex items-center gap-1 overflow-x-auto pb-2">
          \${['QC Fail / Trigger', 'Create Job', 'Quote & Approval', 'Parts Ordered', 'In Progress', 'Completed', 'Post-Repair QC', 'Back to Available'].map((step, i) => \`
            <div class="flex items-center gap-1 flex-shrink-0">
              <div class="px-3 py-2 rounded-lg text-xs font-medium \${i === 0 ? 'bg-red-900/50 text-red-300 border border-red-700/50' : i === 7 ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50' : 'bg-gray-800 text-gray-300 border border-gray-700'}">\${step}</div>
              \${i < 7 ? '<i class="fas fa-chevron-right text-gray-600 text-xs"></i>' : ''}
            </div>
          \`).join('')}
        </div>
        <div class="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
          <span class="bg-gray-800 px-2 py-1 rounded">⚠ Quote Rejected → Scrap or Return Unrepaired</span>
          <span class="bg-gray-800 px-2 py-1 rounded">⚠ Economically Unviable → Write-off to P&L</span>
          <span class="bg-gray-800 px-2 py-1 rounded">✓ Post-repair QC mandatory before re-listing</span>
          <span class="bg-gray-800 px-2 py-1 rounded">✓ Grade outcome locked to audit log</span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-3 flex-wrap">
        <select id="repair-status-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterRepairs()">
          <option value="">All Statuses</option>
          <option value="QUOTE_PENDING">Quote Pending</option>
          <option value="QUOTE_APPROVED">Quote Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="AWAITING_PARTS">Awaiting Parts</option>
          <option value="COMPLETED">Completed</option>
          <option value="SCRAPPED">Scrapped</option>
        </select>
        <select id="repair-outcome-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterRepairs()">
          <option value="">All Outcomes</option>
          <option value="PENDING">Pending</option>
          <option value="UPGRADED_GRADE">Grade Upgraded</option>
          <option value="DOWNGRADED_GRADE">Grade Downgraded</option>
          <option value="RESTORED_SAME_GRADE">Same Grade Restored</option>
          <option value="ECONOMICALLY_UNVIABLE">Unviable</option>
        </select>
        <div class="text-xs text-gray-400 ml-auto">\${repairs.length} job(s)</div>
      </div>

      <!-- Jobs Table / Cards -->
      <div id="repairs-list">
        \${renderRepairCards(repairs)}
      </div>
    </div>
  \`;
}

function repairStatusBadge(status) {
  const map = {
    QUOTE_PENDING: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    QUOTE_APPROVED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    QUOTE_REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    IN_PROGRESS: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    AWAITING_PARTS: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
    SCRAPPED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    RETURNED_UNREPAIRED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return \`<span class="status-badge inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5 \${map[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}">\${status.replace(/_/g, ' ')}</span>\`;
}

function repairOutcomeBadge(outcome) {
  const map = {
    PENDING: 'bg-gray-500/20 text-gray-400',
    RESTORED_SAME_GRADE: 'bg-blue-500/20 text-blue-400',
    UPGRADED_GRADE: 'bg-emerald-500/20 text-emerald-400',
    DOWNGRADED_GRADE: 'bg-amber-500/20 text-amber-400',
    ECONOMICALLY_UNVIABLE: 'bg-red-500/20 text-red-400',
    SCRAPPED: 'bg-gray-600/20 text-gray-500',
  };
  const icons = {
    PENDING: 'fa-clock',
    RESTORED_SAME_GRADE: 'fa-check',
    UPGRADED_GRADE: 'fa-arrow-up',
    DOWNGRADED_GRADE: 'fa-arrow-down',
    ECONOMICALLY_UNVIABLE: 'fa-ban',
    SCRAPPED: 'fa-trash',
  };
  return \`<span class="text-xs px-2 py-0.5 rounded-full flex items-center gap-1 \${map[outcome] || 'bg-gray-500/20 text-gray-400'}"><i class="fas \${icons[outcome] || 'fa-question'} text-xs"></i> \${outcome.replace(/_/g, ' ')}</span>\`;
}

function renderRepairCards(repairs) {
  if (!repairs.length) return \`<div class="text-center py-12 text-gray-500"><i class="fas fa-tools text-4xl mb-3"></i><p>No repair jobs found</p></div>\`;
  return repairs.map(r => \`
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4 card-hover cursor-pointer" onclick="showRepairDetail('\${r.repair_id}')">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-xs font-mono text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">\${r.repair_id}</span>
            \${repairStatusBadge(r.status)}
            \${repairOutcomeBadge(r.outcome)}
            \${r.is_internal ? '<span class="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">In-House</span>' : '<span class="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded">External Vendor</span>'}
          </div>
          <div class="text-white font-semibold">\${r.make} \${r.model} <span class="text-gray-400 font-normal text-sm">(\${r.storage})</span></div>
          <div class="text-xs text-gray-400 mt-0.5 font-mono">\${r.imei}</div>
          <div class="mt-2 text-sm text-gray-300">\${r.repair_description.substring(0, 120)}\${r.repair_description.length > 120 ? '...' : ''}</div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="text-lg font-bold text-amber-400">\${fmt(r.actual_cost ?? r.quote_amount ?? 0)}</div>
          <div class="text-xs text-gray-400">\${r.actual_cost ? 'Actual cost' : r.quote_amount ? 'Quote' : 'TBD'}</div>
          <div class="mt-2 text-xs text-gray-400">
            Grade: <span class="text-white font-bold">\${r.grade_before}</span>
            \${r.grade_after ? \` → <span class="font-bold \${r.grade_after > r.grade_before ? 'text-emerald-400' : r.grade_after < r.grade_before ? 'text-amber-400' : 'text-white'}">\${r.grade_after}</span>\` : ' → <span class="text-gray-500">TBD</span>'}
          </div>
          <div class="text-xs text-gray-500 mt-1">\${fmtDate(r.created_at)}</div>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-4 text-xs text-gray-400 border-t border-gray-800 pt-3">
        <span><i class="fas fa-mobile-alt text-gray-500 mr-1"></i>\${r.device_id}</span>
        <span><i class="fas fa-tag text-gray-500 mr-1"></i>\${r.repair_type.replace(/_/g,' ')}</span>
        <span><i class="fas fa-bolt text-gray-500 mr-1"></i>\${r.trigger.replace(/_/g,' ')}</span>
        \${r.vendor_name ? \`<span><i class="fas fa-building text-gray-500 mr-1"></i>\${r.vendor_name}</span>\` : ''}
        \${r.source_rma_id ? \`<span class="text-orange-400"><i class="fas fa-undo mr-1"></i>\${r.source_rma_id}</span>\` : ''}
        \${r.parts_used?.length ? \`<span><i class="fas fa-box text-gray-500 mr-1"></i>\${r.parts_used.length} part(s)</span>\` : ''}
        <span class="ml-auto"><i class="fas fa-clock text-gray-500 mr-1"></i>\${r.timeline.length} events</span>
      </div>
    </div>
  \`).join('');
}

function filterRepairs() {
  const status = document.getElementById('repair-status-filter')?.value || '';
  const outcome = document.getElementById('repair-outcome-filter')?.value || '';
  let filtered = window._allRepairs || [];
  if (status) filtered = filtered.filter(r => r.status === status);
  if (outcome) filtered = filtered.filter(r => r.outcome === outcome);
  document.getElementById('repairs-list').innerHTML = renderRepairCards(filtered);
}

async function showRepairDetail(repairId) {
  const r = await axios.get(API + '/repairs/' + repairId).then(x => x.data);
  const gradeDiff = r.grade_after ? (r.grade_after < r.grade_before ? '↑ Upgraded' : r.grade_after > r.grade_before ? '↓ Downgraded' : '= Unchanged') : 'TBD';
  const gradeColor = r.grade_after ? (r.grade_after < r.grade_before ? 'text-emerald-400' : r.grade_after > r.grade_before ? 'text-amber-400' : 'text-gray-400') : 'text-gray-500';
  const body = \`
    <div class="space-y-4">
      <!-- Header -->
      <div class="grid grid-cols-2 gap-3">
        <div><div class="text-xs text-gray-400">Device</div><div class="text-white font-bold">\${r.make} \${r.model} \${r.storage}</div><div class="text-xs text-blue-300 font-mono">\${r.imei}</div></div>
        <div><div class="text-xs text-gray-400">Status</div><div class="mt-1">\${repairStatusBadge(r.status)}</div></div>
        <div><div class="text-xs text-gray-400">Repair Type</div><div class="text-white">\${r.repair_type.replace(/_/g,' ')}</div></div>
        <div><div class="text-xs text-gray-400">Trigger</div><div class="text-amber-300 text-sm">\${r.trigger.replace(/_/g,' ')}</div></div>
        <div><div class="text-xs text-gray-400">Vendor</div><div class="text-white">\${r.vendor_name || '—'} \${r.is_internal ? '<span class="text-xs text-gray-400">(In-House)</span>' : ''}</div></div>
        <div><div class="text-xs text-gray-400">Grade</div><div class="text-sm"><span class="text-gray-300">\${r.grade_before}</span> → <span class="\${gradeColor} font-bold">\${r.grade_after || 'TBD'}</span> <span class="\${gradeColor} text-xs">\${gradeDiff}</span></div></div>
      </div>

      <!-- Description -->
      <div class="bg-gray-800 rounded-lg p-3">
        <div class="text-xs text-gray-400 mb-1">Description</div>
        <div class="text-sm text-gray-300">\${r.repair_description}</div>
      </div>

      <!-- Financials -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-gray-800 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-400">Quote</div>
          <div class="text-lg font-bold text-blue-400">\${fmt(r.quote_amount ?? 0)}</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-400">Actual Cost</div>
          <div class="text-lg font-bold text-amber-400">\${r.actual_cost ? fmt(r.actual_cost) : '—'}</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-3 text-center">
          <div class="text-xs text-gray-400">Parts / Labour</div>
          <div class="text-sm font-bold text-gray-300">\${fmt(r.parts_cost ?? 0)} / \${fmt(r.labour_cost ?? 0)}</div>
        </div>
      </div>

      <!-- Parts Used -->
      \${r.parts_used?.length ? \`
        <div>
          <div class="text-xs font-semibold text-gray-400 uppercase mb-2">Parts Used</div>
          <div class="space-y-1">
            \${r.parts_used.map(p => \`
              <div class="flex items-center justify-between py-1.5 px-3 bg-gray-800 rounded-lg text-sm">
                <div><span class="text-white">\${p.part_name}</span> \${p.part_number ? \`<span class="text-xs text-gray-500">(\${p.part_number})</span>\` : ''}</div>
                <div class="text-right text-xs text-gray-400">\${p.supplier || ''} · Qty \${p.quantity} · <span class="text-amber-400 font-bold">\${fmt(p.cost)}</span></div>
              </div>
            \`).join('')}
          </div>
        </div>
      \` : ''}

      <!-- Timeline -->
      <div>
        <div class="text-xs font-semibold text-gray-400 uppercase mb-2">Timeline</div>
        <div class="space-y-2">
          \${r.timeline.map(e => \`
            <div class="flex gap-3 py-2 border-l-2 \${e.system_generated ? 'border-blue-600/50' : 'border-gray-600'} pl-3">
              <div class="flex-1">
                <div class="text-xs text-gray-500">\${new Date(e.timestamp).toLocaleString('en-GB')} · \${e.system_generated ? '<span class="text-blue-400">system</span>' : \`<span class="text-gray-300">\${e.actor}</span>\`}</div>
                <div class="text-sm text-gray-300 mt-0.5">\${e.action}</div>
              </div>
            </div>
          \`).join('')}
        </div>
      </div>

      \${r.notes ? \`<div class="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3"><div class="text-xs text-amber-400 mb-1">Notes</div><div class="text-sm text-gray-300">\${r.notes}</div></div>\` : ''}

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
        \${r.status === 'QUOTE_PENDING' ? \`
          <button onclick="alert('✅ Quote approved — job moves to IN_PROGRESS')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-check mr-1"></i>Approve Quote</button>
          <button onclick="alert('❌ Quote rejected — device to be scrapped or returned unrepaired')" class="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-times mr-1"></i>Reject / Scrap</button>
        \` : ''}
        \${r.status === 'AWAITING_PARTS' ? \`<button onclick="alert('📦 Parts received — job progressing to IN_PROGRESS')" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-box-open mr-1"></i>Mark Parts Received</button>\` : ''}
        \${r.status === 'IN_PROGRESS' ? \`<button onclick="alert('✅ Repair completed — queuing for Post-Repair QC')" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-tools mr-1"></i>Mark Complete — Queue Post-Repair QC</button>\` : ''}
        \${r.status === 'COMPLETED' && !r.post_repair_qc_id ? \`<button onclick="alert('🔍 Launching Post-Repair QC form...')" class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-microscope mr-1"></i>Run Post-Repair QC</button>\` : ''}
        <button onclick="alert('📋 Audit log entry created')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-history mr-1"></i>Add Note</button>
      </div>
    </div>
  \`;
  openModal(\`Repair Job: \${repairId} — \${r.make} \${r.model}\`, body);
}


document.addEventListener('DOMContentLoaded', () => {
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
