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
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: var(--sb-track); }
    ::-webkit-scrollbar-thumb { background: var(--sb-thumb); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--sb-thumb-hover); }
    .vat-code-badge { font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.04em; }
    .opr-urgent { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .opr-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .opr-ok { background: linear-gradient(135deg, #10b981, #059669); }
    .modal-overlay { background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
    .ring-glow { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3); }
    input, select, textarea { color-scheme: dark; }

    /* ── CSS variables — dark mode (default) ── */
    :root {
      --bg-body:       #030712;
      --bg-sidebar:    #111827;
      --bg-sidebar-h:  #1f2937;
      --bg-main:       #030712;
      --bg-card:       #111827;
      --bg-card-h:     #1f2937;
      --bg-topbar:     #111827;
      --bg-input:      #1f2937;
      --border:        #1f2937;
      --border-light:  #374151;
      --text-primary:  #f9fafb;
      --text-secondary:#9ca3af;
      --text-muted:    #6b7280;
      --text-nav:      #d1d5db;
      --sb-track:      #1e2a3a;
      --sb-thumb:      #374151;
      --sb-thumb-hover:#4b5563;
      --nav-active-bg: #1e3a5f;
      --nav-active-text:#60a5fa;
    }
    /* ── light mode overrides ── */
    body.light-mode {
      --bg-body:       #f1f5f9;
      --bg-sidebar:    #ffffff;
      --bg-sidebar-h:  #f1f5f9;
      --bg-main:       #f1f5f9;
      --bg-card:       #ffffff;
      --bg-card-h:     #f8fafc;
      --bg-topbar:     #ffffff;
      --bg-input:      #f8fafc;
      --border:        #e2e8f0;
      --border-light:  #cbd5e1;
      --text-primary:  #0f172a;
      --text-secondary:#475569;
      --text-muted:    #94a3b8;
      --text-nav:      #334155;
      --sb-track:      #e2e8f0;
      --sb-thumb:      #94a3b8;
      --sb-thumb-hover:#64748b;
      --nav-active-bg: #dbeafe;
      --nav-active-text:#1d4ed8;
    }
    body.light-mode { color-scheme: light; }
    body.light-mode input, body.light-mode select, body.light-mode textarea { color-scheme: light; }

    /* ── apply variables ── */
    body                 { background-color: var(--bg-body); color: var(--text-primary); }
    #sidebar             { background-color: var(--bg-sidebar); border-color: var(--border); }
    #topbar              { background-color: var(--bg-topbar); border-color: var(--border); }
    .card-lm             { background-color: var(--bg-card);   border-color: var(--border); }
    .sidebar-section-label { color: var(--text-muted); }

    /* ── sidebar collapse ── */
    #sidebar { transition: width 0.25s cubic-bezier(0.4,0,0.2,1); overflow: hidden; }
    #sidebar.collapsed { width: 4rem !important; }
    #sidebar.collapsed .sidebar-label,
    #sidebar.collapsed .sidebar-badge,
    #sidebar.collapsed .sidebar-section-label,
    #sidebar.collapsed #tenant-block,
    #sidebar.collapsed #sidebar-footer-text { display: none !important; }
    #sidebar.collapsed .sidebar-item { justify-content: center; padding-left: 0; padding-right: 0; }
    #sidebar.collapsed .sidebar-item i { margin: 0; width: auto; }
    #sidebar.collapsed #logo-text { display: none !important; }
    #sidebar.collapsed #collapse-btn i { transform: rotate(180deg); }
    main.collapsed-main { margin-left: 4rem !important; }
    #sidebar.collapsed #sidebar-logo { justify-content: center; }
    #sidebar.collapsed #sidebar-footer { justify-content: center; padding: 0.75rem 0; }
    #sidebar.collapsed #sidebar-footer > * { display: none; }
    #sidebar.collapsed #sidebar-footer #collapse-btn { display: flex !important; }
    /* tooltip on collapsed icons */
    #sidebar.collapsed .sidebar-item { position: relative; }
    #sidebar.collapsed .sidebar-item::after { content: attr(data-tooltip); position: absolute; left: calc(100% + 8px); top: 50%; transform: translateY(-50%); background: #1e293b; color: #f1f5f9; font-size: 0.7rem; white-space: nowrap; padding: 4px 8px; border-radius: 6px; pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 100; border: 1px solid #334155; }
    #sidebar.collapsed .sidebar-item:hover::after { opacity: 1; }
    body.light-mode #sidebar.collapsed .sidebar-item::after { background: #fff; color: #0f172a; border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  </style>
</head>
<body class="min-h-screen flex" id="app-body">

<!-- ═══════════════════════════════════════════════════════ SIDEBAR -->
<aside id="sidebar" class="w-64 flex flex-col h-screen fixed top-0 left-0 z-40 border-r">
  <!-- Logo -->
  <div class="px-4 py-3 border-b flex items-center justify-between flex-shrink-0" id="sidebar-logo" style="border-color:var(--border)">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
        <i class="fas fa-mobile-alt text-white text-sm"></i>
      </div>
      <div id="logo-text">
        <div class="font-bold text-base tracking-tight" style="color:var(--text-primary)">RefurbIQ</div>
        <div class="text-xs" style="color:var(--text-muted)">Electronics ERP</div>
      </div>
    </div>
    <button id="collapse-btn" onclick="toggleSidebar()" title="Collapse sidebar"
      class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-700 flex-shrink-0"
      style="color:var(--text-muted)">
      <i class="fas fa-chevron-left text-xs transition-transform duration-250"></i>
    </button>
  </div>

  <!-- Tenant Badge -->
  <div class="px-3 py-2 border-b flex-shrink-0" id="tenant-block" style="border-color:var(--border)">
    <div class="flex items-center gap-2 rounded-lg px-3 py-2" style="background:rgba(59,130,246,0.12)">
      <div class="w-6 h-6 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">R</div>
      <div class="sidebar-label">
        <div class="text-xs font-semibold text-blue-400">RefurbIQ Demo Ltd</div>
        <div class="text-xs" style="color:var(--text-muted)">VAT: GB369979995</div>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto" style="scrollbar-width:thin">
    <div class="text-xs font-semibold uppercase tracking-wider px-2 py-1 mt-1 sidebar-section-label">Core Operations</div>
    
    <button onclick="navigateTo('dashboard')" id="nav-dashboard" data-tooltip="Dashboard" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-tachometer-alt w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Dashboard</span>
    </button>

    <button onclick="navigateTo('inventory')" id="nav-inventory" data-tooltip="Inventory &amp; Goods-In" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-boxes w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Inventory &amp; Goods-In</span>
      <span class="sidebar-badge ml-auto bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">8</span>
    </button>

    <button onclick="navigateTo('qc')" id="nav-qc" data-tooltip="Quality Control" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-microscope w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Quality Control</span>
      <span class="sidebar-badge ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">2</span>
    </button>

    <button onclick="navigateTo('opr')" id="nav-opr" data-tooltip="OPR Engine" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-globe-europe w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">OPR Engine</span>
      <span class="sidebar-badge ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">!</span>
    </button>

    <button onclick="navigateTo('orders')" id="nav-orders" data-tooltip="Orders" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-shopping-cart w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Orders</span>
    </button>

    <div class="text-xs font-semibold uppercase tracking-wider px-2 py-1 mt-3 sidebar-section-label">Finance &amp; Compliance</div>

    <button onclick="navigateTo('vat')" id="nav-vat" data-tooltip="VAT Engine" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-landmark w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">VAT Engine</span>
    </button>

    <button onclick="navigateTo('fintech')" id="nav-fintech" data-tooltip="Fintech Advances" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-coins w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Fintech Advances</span>
    </button>

    <button onclick="navigateTo('suppliers')" id="nav-suppliers" data-tooltip="Suppliers &amp; Batches" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-truck w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Suppliers &amp; Batches</span>
    </button>

    <button onclick="navigateTo('scanner')" id="nav-scanner" data-tooltip="IMEI Scanner" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-barcode w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">IMEI Scanner</span>
    </button>

    <div class="text-xs font-semibold uppercase tracking-wider px-2 py-1 mt-3 sidebar-section-label">Customer &amp; Risk</div>

    <button onclick="navigateTo('support')" id="nav-support" data-tooltip="Support &amp; Tickets" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-headset w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Support &amp; Tickets</span>
      <span class="sidebar-badge ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">3</span>
    </button>

    <button onclick="navigateTo('courier')" id="nav-courier" data-tooltip="Courier &amp; INR" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-truck-fast w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Courier &amp; INR</span>
      <span class="sidebar-badge ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">2</span>
    </button>

    <button onclick="navigateTo('rma')" id="nav-rma" data-tooltip="Returns &amp; RMA" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-undo w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Returns &amp; RMA</span>
      <span class="sidebar-badge ml-auto bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">!</span>
    </button>

    <div class="text-xs font-semibold uppercase tracking-wider px-2 py-1 mt-3 sidebar-section-label">Analytics</div>

    <button onclick="navigateTo('profitability')" id="nav-profitability" data-tooltip="Profitability &amp; P&amp;L" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-chart-line w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Profitability &amp; P&amp;L</span>
    </button>

    <button onclick="navigateTo('repairs')" id="nav-repairs" data-tooltip="Repairs &amp; Refurbishment" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-tools w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Repairs &amp; Refurbishment</span>
      <span class="sidebar-badge ml-auto bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">4</span>
    </button>

    <button onclick="navigateTo('supplier-analytics')" id="nav-supplier-analytics" data-tooltip="Supplier Analytics" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-chart-pie w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Supplier Analytics</span>
    </button>

    <div class="text-xs font-semibold uppercase tracking-wider px-2 py-1 mt-3 sidebar-section-label">Compliance &amp; System</div>

    <button onclick="navigateTo('mtd')" id="nav-mtd" data-tooltip="HMRC MTD Returns" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-paper-plane w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">HMRC MTD Returns</span>
      <span class="sidebar-badge ml-auto bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">1</span>
    </button>

    <button onclick="navigateTo('audit')" id="nav-audit" data-tooltip="Audit Log" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-history w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Audit Log</span>
    </button>

    <button onclick="navigateTo('marketplace')" id="nav-marketplace" data-tooltip="Marketplace Hub" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-store w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Marketplace Hub</span>
      <span class="sidebar-badge ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold" id="mkt-badge">!</span>
    </button>

    <button onclick="navigateTo('tenants')" id="nav-tenants" data-tooltip="Tenant Management" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-users-cog w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Tenant Management</span>
      <span class="sidebar-badge ml-auto bg-indigo-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">5</span>
    </button>

    <button onclick="navigateTo('admin')" id="nav-admin" data-tooltip="Admin &amp; Settings" class="sidebar-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors" style="color:var(--text-nav)">
      <i class="fas fa-cog w-4 flex-shrink-0" style="color:var(--text-muted)"></i>
      <span class="sidebar-label">Admin &amp; Settings</span>
    </button>
  </nav>

  <!-- Footer -->
  <div class="flex-shrink-0 border-t px-3 py-3" id="sidebar-footer" style="border-color:var(--border)">
    <!-- Status + version -->
    <div id="sidebar-footer-text" class="mb-2">
      <div class="flex items-center gap-2 text-xs" style="color:var(--text-muted)">
        <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0"></div>
        <span class="sidebar-label">System Operational</span>
      </div>
      <div class="text-xs mt-1 sidebar-label" style="color:var(--text-muted)">v2.4.0 · Phase 4 Build</div>
    </div>
    <!-- Theme + Collapse controls -->
    <div class="flex items-center gap-2">
      <!-- Light/Dark toggle -->
      <button id="theme-btn" onclick="toggleTheme()" title="Toggle light/dark mode"
        class="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
        style="background:var(--bg-sidebar-h); color:var(--text-secondary); border:1px solid var(--border-light)">
        <i id="theme-icon" class="fas fa-moon text-xs"></i>
        <span id="theme-label" class="sidebar-label">Dark</span>
      </button>
      <!-- Collapse (shown in footer only when expanded) -->
      <button onclick="toggleSidebar()" title="Collapse"
        class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style="background:var(--bg-sidebar-h); color:var(--text-muted); border:1px solid var(--border-light)">
        <i class="fas fa-chevron-left text-xs"></i>
      </button>
    </div>
  </div>
</aside>

<!-- ═══════════════════════════════════════════════════════ MAIN CONTENT -->
<main id="main-content" class="ml-64 flex-1 flex flex-col min-h-screen" style="transition:margin-left 0.25s cubic-bezier(0.4,0,0.2,1)">
  <!-- Top Bar -->
  <header id="topbar" class="border-b px-6 py-3 flex items-center justify-between sticky top-0 z-30">
    <div class="flex items-center gap-3">
      <!-- Hamburger (shown when sidebar collapsed) -->
      <button id="hamburger-btn" onclick="toggleSidebar()" title="Expand sidebar"
        class="hidden w-8 h-8 rounded-lg items-center justify-center transition-colors mr-1"
        style="color:var(--text-muted); background:var(--bg-card); border:1px solid var(--border)">
        <i class="fas fa-bars text-sm"></i>
      </button>
      <span id="page-title" class="text-lg font-semibold" style="color:var(--text-primary)">Dashboard</span>
      <span id="page-subtitle" class="text-sm" style="color:var(--text-secondary)"></span>
    </div>
    <div class="flex items-center gap-4">
      <!-- Search -->
      <div class="relative">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
        <input type="text" placeholder="Search IMEI, order, ticket..." class="rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72" style="background:var(--bg-input); border:1px solid var(--border-light); color:var(--text-primary)" />
      </div>
      <!-- Notifications -->
      <button class="relative" style="color:var(--text-secondary)">
        <i class="fas fa-bell text-sm"></i>
        <span class="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center text-white font-bold">4</span>
      </button>
      <!-- User -->
      <div class="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
        style="background:var(--bg-card); border:1px solid var(--border)">
        <div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">A</div>
        <span class="text-sm" style="color:var(--text-secondary)">Admin</span>
        <i class="fas fa-chevron-down text-xs" style="color:var(--text-muted)"></i>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <div id="page-content" class="flex-1 p-6 overflow-auto" style="background:var(--bg-main)"></div>
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
    el.classList.remove('nav-active');
    el.style.background = '';
    el.style.color = 'var(--text-nav)';
  });
  const navEl = document.getElementById('nav-' + page);
  if (navEl) {
    navEl.classList.add('nav-active');
    navEl.style.background = 'var(--nav-active-bg)';
    navEl.style.color = 'var(--nav-active-text)';
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
    'supplier-analytics': ['Supplier Analytics', 'Purchase Intelligence & Risk Scoring'],
    mtd: ['HMRC MTD VAT Returns', 'Making Tax Digital Submission Workflow'],
    audit: ['Audit Log', 'Immutable System Event Trail'],
    admin: ['Admin & Settings', 'System Configuration'],
    scanner: ['IMEI Scanner', 'Barcode & IMEI Intake Workflow'],
    marketplace: ['Marketplace Hub', 'Channel Integrations & Sync Status'],
    tenants: ['Tenant Management', 'SaaS Platform Administration'],
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
    'supplier-analytics': renderSupplierAnalytics,
    mtd: renderMTD,
    audit: renderAuditLog,
    admin: renderAdmin,
    scanner: renderScanner,
    marketplace: renderMarketplace,
    tenants: renderTenants,
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
  const overrides = await axios.get(API + '/devices/' + id + '/overrides').then(r => r.data).catch(() => []);

  const qcHtml = d.qc_records?.map(q => \`
    <div class="rounded-lg p-4 mt-2 border" style="background:var(--bg-sidebar); border-color:var(--border)">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium" style="color:var(--text-primary)">\${q.qc_type} QC — \${fmtDate(q.performed_at)}</span>
        <span class="text-xs px-2 py-0.5 rounded-full \${q.outcome === 'PASS' ? 'bg-emerald-500/20 text-emerald-400' : q.outcome === 'LOCKED_BLOCKED' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}">\${q.outcome}</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs" style="color:var(--text-secondary)">
        <span>Lock: <strong class="\${q.lock_check_result === 'CLEAR' ? 'text-emerald-400' : 'text-red-400'}">\${q.lock_check_result}</strong></span>
        <span>Grade: <strong style="color:var(--text-primary)">\${q.grade_assigned}</strong></span>
      </div>
      <div class="mt-2 flex flex-wrap gap-1">
        \${q.functional_tests.map(t => \`<span class="text-xs px-2 py-0.5 rounded \${t.result === 'PASS' ? 'bg-emerald-900/30 text-emerald-400' : t.result === 'FAIL' ? 'bg-red-900/30 text-red-400' : 'bg-gray-700 text-gray-400'}">\${t.test_name}: \${t.result}</span>\`).join('')}
      </div>
    </div>
  \`).join('') || '<p class="text-sm mt-2" style="color:var(--text-muted)">No QC records</p>';

  const overridesHtml = overrides.length ? overrides.map(ov => \`
    <div class="flex items-start gap-2 p-3 rounded-lg border mt-2" style="background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.3)">
      <i class="fas fa-flag text-amber-400 mt-0.5 flex-shrink-0 text-xs"></i>
      <div class="text-xs" style="color:var(--text-secondary)">
        <span class="font-semibold text-amber-400">\${ov.field_changed.toUpperCase()} OVERRIDE</span>
        &nbsp;·&nbsp;\${ov.previous_value} → <strong style="color:var(--text-primary)">\${ov.new_value}</strong>
        &nbsp;·&nbsp;\${ov.reason_code.replace(/_/g,' ')}
        \${ov.notes ? \`&nbsp;·&nbsp;<span style="color:var(--text-muted)">\${ov.notes}</span>\` : ''}
        <div class="mt-0.5 opacity-60">\${ov.changed_by} · \${fmtDate(ov.changed_at)}</div>
      </div>
    </div>
  \`).join('') : '';

  openModal(\`\${d.make} \${d.model} — \${d.imei_primary}\`, \`
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <span style="color:var(--text-muted)">Status</span>
          <div class="mt-1">\${statusBadge(d.current_status, 'device')}</div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <div class="flex items-center justify-between">
            <span style="color:var(--text-muted)">Grade</span>
            <button onclick="showDeviceOverridePanel('\${d.device_id}','grade','\${d.grade}','\${d.purchase_vat_code}')"
              class="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 hover:opacity-80"
              title="Override Grade (Manager+)">
              <i class="fas fa-pencil-alt"></i> Override
            </button>
          </div>
          <div class="mt-1 font-bold text-lg" style="color:var(--text-primary)">
            <span id="device-grade-display">\${d.grade}</span>
          </div>
          <div id="grade-override-container"></div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <span style="color:var(--text-muted)">Cost Price</span>
          <div class="mt-1 font-bold" style="color:var(--text-primary)">\${fmt(d.cost_price)}</div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <span style="color:var(--text-muted)">Landed Cost</span>
          <div class="mt-1 font-bold" style="color:var(--text-primary)">\${fmt(d.landed_cost)}</div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <div class="flex items-center justify-between">
            <span style="color:var(--text-muted)">Colour</span>
            <button onclick="showDeviceOverridePanel('\${d.device_id}','colour','\${d.colour}','\${d.purchase_vat_code}')"
              class="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 hover:opacity-80"
              title="Override Colour (Manager+)">
              <i class="fas fa-pencil-alt"></i> Override
            </button>
          </div>
          <div class="mt-1" style="color:var(--text-primary)">
            \${d.storage} · <span id="device-colour-display">\${d.colour}</span>
          </div>
          <div id="colour-override-container"></div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <span style="color:var(--text-muted)">Network</span>
          <div class="mt-1" style="color:var(--text-primary)">\${d.network}</div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <span style="color:var(--text-muted)">Purchase Batch</span>
          <div class="mt-1 text-blue-400">\${d.purchase_batch_id || '—'}</div>
        </div>
        <div class="rounded-lg p-3" style="background:var(--bg-sidebar)">
          <span style="color:var(--text-muted)">VAT Code</span>
          <div class="mt-1">\${vatCodeBadge(d.purchase_vat_code)}</div>
        </div>
      </div>
      \${overridesHtml ? \`<div><h4 class="font-semibold text-amber-400 text-sm mb-1 flex items-center gap-2"><i class="fas fa-flag text-xs"></i>Attribute Override History</h4>\${overridesHtml}</div>\` : ''}
      <div>
        <h4 class="font-semibold mb-1 text-sm" style="color:var(--text-primary)">QC History</h4>
        \${qcHtml}
      </div>
    </div>
  \`);
}

function showDeviceOverridePanel(deviceId, field, currentValue, purchaseVatCode) {
  const containerId = field + '-override-container';
  const container = document.getElementById(containerId);
  if (!container) return;
  // Toggle: if already showing, remove it
  if (container.innerHTML.trim()) { container.innerHTML = ''; return; }
  container.innerHTML = renderOverridePanel(deviceId, field, currentValue, purchaseVatCode);
}

async function showImportModal() {
  // Fetch fresh active-only suppliers on every modal open (Fix 1A + 1C)
  let activeSuppliers = [];
  try {
    activeSuppliers = await axios.get(API + '/suppliers?active=true').then(r => r.data);
  } catch(e) {
    activeSuppliers = (window._suppData && window._suppData.suppliers || []).filter(function(s){ return s.is_active; });
  }
  // Build option HTML: CODE — Full Name (Fix 2)
  const supplierOpts = activeSuppliers.map(function(s){
    return '<option value="' + s.supplier_id + '" data-vatcode="' + (s.default_vat_code || '') + '">' + s.supplier_code + ' \u2014 ' + s.name + '</option>';
  }).join('');

  // CSV template download blob
  const CSV_TEMPLATE_IMEI = 'IMEI,Make,Model,Storage,Colour,Network,Grade\\n353012340000001,Apple,iPhone 14,128GB,Midnight,UNLOCKED,A\\n353012340000002,Samsung,Galaxy S23,256GB,Phantom Black,UNLOCKED,B\\n';
  const csvBlob = new Blob([CSV_TEMPLATE_IMEI], {type:'text/csv'});
  const csvUrl = URL.createObjectURL(csvBlob);

  openModal('Import Purchase Batch / IMEI CSV', \`
    <div class="space-y-4 text-sm" id="import-modal-wrap">

      <!-- Goods-In info banner -->
      <div class="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
        <p class="text-blue-300 font-medium text-xs mb-1"><i class="fas fa-info-circle mr-1"></i>Goods-In Workflow</p>
        <ol class="text-blue-200/70 space-y-0.5 list-decimal list-inside text-xs">
          <li>Fill supplier, invoice ref and VAT code below</li>
          <li>Upload IMEI CSV (columns: IMEI, Make, Model, Storage, Colour, Network, Grade)</li>
          <li>Review the preview table, then click Create Batch &amp; Import</li>
          <li>Devices enter Intake QC queue automatically</li>
        </ol>
      </div>

      <!-- Form fields row -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-gray-400 text-xs mb-1">Supplier <span class="text-red-400">*</span></label>
          <select id="import-supplier-sel" onchange="onImportSupplierChange()" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm">
            <option value="">Select supplier...</option>
            \${supplierOpts}
          </select>
        </div>
        <div>
          <label class="block text-gray-400 text-xs mb-1">Invoice Reference <span class="text-red-400">*</span></label>
          <input type="text" id="import-inv-ref" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm" placeholder="e.g. TS-INV-5500" />
        </div>
        <div>
          <label class="block text-gray-400 text-xs mb-1">Batch Date</label>
          <input type="date" id="import-batch-date" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm" />
        </div>
        <div>
          <label class="block text-gray-400 text-xs mb-1">VAT Code</label>
          <select id="import-vat-code" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm">
            <option value="20RC_PURCHASES">20RC_PURCHASES — Reverse Charge</option>
            <option value="20S_PURCHASES">20S_PURCHASES — Standard 20%</option>
            <option value="0MARGIN_PURCHASES">0MARGIN_PURCHASES — Margin Scheme</option>
            <option value="NOVAT_PURCHASES">NOVAT_PURCHASES — No VAT</option>
          </select>
        </div>
      </div>

      <!-- File upload zone -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="text-gray-400 text-xs">IMEI CSV File <span class="text-red-400">*</span></label>
          <a href="\${csvUrl}" download="imei_import_template.csv" class="text-blue-400 text-xs hover:text-blue-300"><i class="fas fa-download mr-1"></i>Download Template</a>
        </div>

        <!-- Hidden real file input -->
        <input type="file" id="import-file-input" accept=".csv,text/csv,text/plain" class="hidden" onchange="onImportFileSelected(event)" />

        <!-- Drop zone — clicking anywhere triggers file picker -->
        <div id="import-drop-zone"
          class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-900/10"
          onclick="document.getElementById('import-file-input').click()"
          ondragover="onImportDragOver(event)"
          ondragleave="onImportDragLeave(event)"
          ondrop="onImportDrop(event)">
          <i class="fas fa-file-csv text-3xl text-gray-500 mb-2 pointer-events-none"></i>
          <p class="text-gray-400 text-xs pointer-events-none">
            Drop IMEI CSV here or <span class="text-blue-400 font-medium">browse files</span>
          </p>
          <p class="text-gray-600 text-xs mt-1 pointer-events-none">Columns: IMEI, Make, Model, Storage, Colour, Network, Grade</p>
        </div>

        <!-- Selected file name badge -->
        <div id="import-file-badge" class="hidden mt-2 flex items-center gap-2 text-xs text-emerald-400">
          <i class="fas fa-check-circle"></i>
          <span id="import-file-name"></span>
          <button onclick="clearImportFile()" class="ml-auto text-gray-500 hover:text-red-400"><i class="fas fa-times"></i></button>
        </div>
      </div>

      <!-- CSV preview table (hidden until file parsed) -->
      <div id="import-csv-preview" class="hidden">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-medium text-gray-300"><i class="fas fa-table mr-1 text-blue-400"></i>CSV Preview</span>
          <div id="import-csv-stats" class="flex gap-2 text-xs"></div>
        </div>
        <div id="import-csv-table" class="overflow-x-auto max-h-48 overflow-y-auto rounded-lg border border-gray-700 text-xs"></div>
      </div>

      <!-- Error message area -->
      <div id="import-error" class="hidden bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2 text-red-300 text-xs"></div>

      <!-- Action buttons -->
      <div class="flex gap-3 pt-1">
        <button onclick="closeModal()" class="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm">Cancel</button>
        <button id="import-submit-btn" onclick="submitImportBatch()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
          <i class="fas fa-file-import mr-1"></i>Create Batch &amp; Import
        </button>
      </div>
    </div>
  \`);

  // Set today as default batch date
  document.getElementById('import-batch-date').value = new Date().toISOString().slice(0, 10);
}

// ── Import modal: supplier change → auto-fill VAT code ────────────────────────
function onImportSupplierChange() {
  const sel = document.getElementById('import-supplier-sel');
  const opt = sel && sel.options[sel.selectedIndex];
  if (opt && opt.dataset.vatcode) {
    const vc = document.getElementById('import-vat-code');
    if (vc) vc.value = opt.dataset.vatcode;
  }
}

// ── Import modal: drag-and-drop handlers ─────────────────────────────────────
function onImportDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const zone = document.getElementById('import-drop-zone');
  if (zone) { zone.classList.add('border-blue-500', 'bg-blue-900/20'); zone.classList.remove('border-gray-600'); }
}

function onImportDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const zone = document.getElementById('import-drop-zone');
  if (zone) { zone.classList.remove('border-blue-500', 'bg-blue-900/20'); zone.classList.add('border-gray-600'); }
}

function onImportDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const zone = document.getElementById('import-drop-zone');
  if (zone) { zone.classList.remove('border-blue-500', 'bg-blue-900/20'); zone.classList.add('border-gray-600'); }
  const files = e.dataTransfer && e.dataTransfer.files;
  if (files && files.length > 0) {
    parseImportCsvFile(files[0]);
  }
}

// ── Import modal: file input change ──────────────────────────────────────────
function onImportFileSelected(e) {
  const file = e.target && e.target.files && e.target.files[0];
  if (file) parseImportCsvFile(file);
}

// ── Import modal: clear selected file ────────────────────────────────────────
function clearImportFile() {
  window._importCsvRows = null;
  const inp = document.getElementById('import-file-input');
  if (inp) inp.value = '';
  const badge = document.getElementById('import-file-badge');
  if (badge) badge.classList.add('hidden');
  const preview = document.getElementById('import-csv-preview');
  if (preview) preview.classList.add('hidden');
  const zone = document.getElementById('import-drop-zone');
  if (zone) { zone.classList.remove('border-emerald-500', 'bg-emerald-900/10'); zone.classList.add('border-gray-600'); }
}

// ── Import modal: parse CSV and render preview ────────────────────────────────
function parseImportCsvFile(file) {
  const errorEl = document.getElementById('import-error');
  // Validate extension
  if (!file.name.toLowerCase().endsWith('.csv') && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
    if (errorEl) { errorEl.textContent = 'Please select a .csv file.'; errorEl.classList.remove('hidden'); }
    return;
  }
  if (errorEl) errorEl.classList.add('hidden');

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const crRe = new RegExp('\\r', 'g');
    const lines = text.replace(crRe, '').split('\\n').map(function(l){ return l.trim(); }).filter(function(l){ return l; });
    if (lines.length < 2) {
      if (errorEl) { errorEl.textContent = 'CSV file must have a header row and at least one data row.'; errorEl.classList.remove('hidden'); }
      return;
    }

    // Detect header columns (case-insensitive, trim whitespace)
    const nonAlphaRe = new RegExp('[^a-z0-9_]', 'g');
    const rawHeaders = lines[0].split(',').map(function(h){ return h.trim().toLowerCase().replace(nonAlphaRe, ''); });
    const colIdx = {
      imei:    rawHeaders.indexOf('imei'),
      make:    rawHeaders.indexOf('make'),
      model:   rawHeaders.indexOf('model'),
      storage: rawHeaders.indexOf('storage'),
      colour:  rawHeaders.findIndex(function(h){ return h === 'colour' || h === 'color'; }),
      network: rawHeaders.indexOf('network'),
      grade:   rawHeaders.indexOf('grade'),
    };
    if (colIdx.imei === -1) {
      if (errorEl) { errorEl.textContent = 'CSV must have an IMEI column.'; errorEl.classList.remove('hidden'); }
      return;
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      // Handle quoted CSV fields: split on comma, strip wrapping double-quotes
      const cols = lines[i].split(',');
      const quoteRe = new RegExp('^"|"$', 'g');
      const get = function(idx){ return idx >= 0 && cols[idx] ? cols[idx].replace(quoteRe, '').trim() : ''; };
      const row = {
        imei:    get(colIdx.imei),
        make:    get(colIdx.make),
        model:   get(colIdx.model),
        storage: get(colIdx.storage),
        colour:  get(colIdx.colour),
        network: get(colIdx.network),
        grade:   get(colIdx.grade) || 'UNGRADED',
        _row: i + 1,
        _errors: [],
      };
      if (!row.imei)  row._errors.push('Missing IMEI');
      else if (!new RegExp('^[0-9]{14,16}$').test(row.imei)) row._errors.push('IMEI must be 14-16 digits');
      if (!row.make)  row._errors.push('Missing Make');
      if (!row.model) row._errors.push('Missing Model');
      // Duplicate within the file
      if (row.imei && rows.find(function(r){ return r.imei === row.imei; })) row._errors.push('Duplicate in file');
      rows.push(row);
    }

    window._importCsvRows = rows;
    const valid   = rows.filter(function(r){ return r._errors.length === 0; }).length;
    const invalid = rows.length - valid;

    // Show file badge
    const badge = document.getElementById('import-file-badge');
    const nameEl = document.getElementById('import-file-name');
    if (badge) badge.classList.remove('hidden');
    if (nameEl) nameEl.textContent = file.name + ' (' + rows.length + ' rows)';
    const zone = document.getElementById('import-drop-zone');
    if (zone) { zone.classList.add('border-emerald-500', 'bg-emerald-900/10'); zone.classList.remove('border-gray-600', 'border-blue-500', 'bg-blue-900/10'); }

    // Stats chips
    const statsEl = document.getElementById('import-csv-stats');
    if (statsEl) statsEl.innerHTML =
      '<span class="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-700/40">' + valid + ' valid</span>' +
      (invalid > 0 ? '<span class="px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-700/40">' + invalid + ' errors</span>' : '');

    // Preview table
    const tableEl = document.getElementById('import-csv-table');
    if (tableEl) tableEl.innerHTML =
      '<table class="w-full text-xs min-w-[540px]">' +
      '<thead><tr class="bg-gray-800 sticky top-0">' +
      '<th class="text-left p-2 text-gray-400">Row</th>' +
      '<th class="text-left p-2 text-gray-400">IMEI</th>' +
      '<th class="text-left p-2 text-gray-400">Make</th>' +
      '<th class="text-left p-2 text-gray-400">Model</th>' +
      '<th class="text-left p-2 text-gray-400">Storage</th>' +
      '<th class="text-left p-2 text-gray-400">Colour</th>' +
      '<th class="text-left p-2 text-gray-400">Grade</th>' +
      '<th class="text-left p-2 text-gray-400">Status</th>' +
      '</tr></thead><tbody>' +
      rows.map(function(r) {
        const ok = r._errors.length === 0;
        return '<tr style="background:' + (ok ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.08)') + ';border-bottom:1px solid #374151">' +
          '<td class="p-2 font-mono text-gray-400">' + r._row + '</td>' +
          '<td class="p-2 font-mono">' + (r.imei || '<span class="text-red-400">—</span>') + '</td>' +
          '<td class="p-2">' + (r.make || '—') + '</td>' +
          '<td class="p-2">' + (r.model || '—') + '</td>' +
          '<td class="p-2">' + (r.storage || '—') + '</td>' +
          '<td class="p-2">' + (r.colour || '—') + '</td>' +
          '<td class="p-2 font-semibold">' + r.grade + '</td>' +
          '<td class="p-2">' + (ok ? '<span class="text-emerald-400"><i class="fas fa-check mr-1"></i>Valid</span>' : '<span class="text-red-400">' + r._errors.join(', ') + '</span>') + '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table>';

    const previewEl = document.getElementById('import-csv-preview');
    if (previewEl) previewEl.classList.remove('hidden');
  };
  reader.readAsText(file);
}

// ── Import modal: submit — create batch then import IMEI rows ─────────────────
async function submitImportBatch() {
  const errorEl = document.getElementById('import-error');
  const btn     = document.getElementById('import-submit-btn');
  const suppId  = (document.getElementById('import-supplier-sel') || {}).value;
  const invRef  = (document.getElementById('import-inv-ref')      || {}).value.trim();
  const vatCode = (document.getElementById('import-vat-code')      || {}).value;
  const batchDate = (document.getElementById('import-batch-date')  || {}).value;

  // Validation
  if (!suppId)  { errorEl.textContent = 'Please select a supplier.';        errorEl.classList.remove('hidden'); return; }
  if (!invRef)  { errorEl.textContent = 'Invoice reference is required.';   errorEl.classList.remove('hidden'); return; }
  if (!window._importCsvRows || !window._importCsvRows.length) {
    errorEl.textContent = 'Please upload a CSV file before importing.';
    errorEl.classList.remove('hidden'); return;
  }
  const validRows = window._importCsvRows.filter(function(r){ return r._errors.length === 0; });
  if (!validRows.length) {
    errorEl.textContent = 'No valid rows found in the CSV — fix errors highlighted in the preview.';
    errorEl.classList.remove('hidden'); return;
  }
  if (errorEl) errorEl.classList.add('hidden');

  // Disable button while processing
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Creating batch…'; }

  try {
    // Step 1: Create the purchase batch
    const batchRes = await axios.post(API + '/purchase-batches', {
      supplier_id: suppId,
      external_invoice_ref: invRef,
      batch_date: batchDate || new Date().toISOString().slice(0, 10),
      currency: 'GBP',
      total_purchase_value: 0,
      vat_code: vatCode,
    });
    const batchId = batchRes.data.purchase_batch_id;

    if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importing ' + validRows.length + ' devices…';

    // Step 2: Import IMEI rows
    const importRes = await axios.post(API + '/purchase-batches/' + batchId + '/imei-import', {
      rows: validRows,
    });

    // Step 3: Refresh the batches table in background
    try {
      const batches = await axios.get(API + '/purchase-batches').then(function(r){ return r.data; });
      if (window._suppData) window._suppData.batches = batches;
      const batchesEl = document.getElementById('batches-content');
      if (batchesEl && typeof renderBatchesTable === 'function') batchesEl.innerHTML = renderBatchesTable(batches);
    } catch(_) {}

    // Step 4: Show success inline then close
    const wrap = document.getElementById('import-modal-wrap');
    if (wrap) wrap.innerHTML =
      '<div class="flex flex-col items-center py-8 gap-4">' +
      '<div class="w-16 h-16 rounded-full bg-emerald-900/40 border-2 border-emerald-500 flex items-center justify-center">' +
      '<i class="fas fa-check text-emerald-400 text-2xl"></i></div>' +
      '<div class="text-center">' +
      '<p class="text-white font-semibold text-base mb-1">Batch ' + batchId + ' created</p>' +
      '<p class="text-gray-400 text-sm">' + importRes.data.created + ' devices imported to Intake QC</p>' +
      (importRes.data.duplicates > 0 ? '<p class="text-yellow-400 text-xs mt-1">' + importRes.data.duplicates + ' duplicate IMEIs skipped</p>' : '') +
      '</div>' +
      '<button onclick="closeModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg text-sm font-medium">Done</button>' +
      '</div>';

    window._importCsvRows = null;

  } catch(err) {
    const msg = (err.response && err.response.data && (err.response.data.error || err.response.data.message)) || 'Import failed — please try again.';
    if (errorEl) { errorEl.textContent = msg; errorEl.classList.remove('hidden'); }
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-import mr-1"></i>Create Batch &amp; Import'; }
  }
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
      <div class="border-b" style="border-color:var(--border)">
        <div class="flex gap-6">
          <button id="stab-batches"   onclick="showSuppTab('batches')"   class="pb-3 text-sm font-medium text-blue-400 tab-active">Purchase Batches</button>
          <button id="stab-suppliers" onclick="showSuppTab('suppliers')" class="pb-3 text-sm font-medium hover:text-white" style="color:var(--text-secondary)">Suppliers</button>
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
      ['Batch Code', 'Supplier', 'Invoice Ref', 'Date', 'Devices', 'Total Value', 'VAT Code', 'Status', 'Actions'],
      batches.map(b => [
        \`<span class="font-mono text-xs text-blue-300">\${b.batch_code}</span>\`,
        b.supplier_name,
        \`<span class="text-xs text-gray-400">\${b.external_invoice_ref}</span>\`,
        fmtDate(b.batch_date),
        \`<span class="font-bold" style="color:var(--text-primary)">\${b.device_count}</span>\`,
        fmt(b.total_purchase_value),
        vatCodeBadge(b.vat_code),
        statusBadge(b.status, 'batch'),
        \`<button onclick="openBulkOverrideModal('\${b.batch_id}','\${b.batch_code}','\${b.vat_code}')"
          class="text-xs text-amber-400 hover:text-amber-300 border border-amber-700/40 px-2.5 py-1 rounded-lg hover:opacity-80 whitespace-nowrap">
          <i class="fas fa-layer-group mr-1"></i>Bulk Override
        </button>\`,
      ])
    )}
  </div>\`;
}

function renderSuppliersTable(suppliers) {
  const VAT_CODES = ['20S_SALES','20S_PURCHASES','20RC_PURCHASES','0RCS_SALES','0MARGIN_PURCHASES','0MARGIN_SALES','0EXPORT_SALES','NOVAT_PURCHASES'];
  const COUNTRIES = [{v:'GB',l:'GB \u2014 United Kingdom'},{v:'DE',l:'DE \u2014 Germany'},{v:'FR',l:'FR \u2014 France'},{v:'US',l:'US \u2014 United States'},{v:'IE',l:'IE \u2014 Ireland'},{v:'NL',l:'NL \u2014 Netherlands'},{v:'PL',l:'PL \u2014 Poland'},{v:'ES',l:'ES \u2014 Spain'},{v:'IT',l:'IT \u2014 Italy'},{v:'CN',l:'CN \u2014 China'}];

  function supplierMenuBtn(s) {
    const sid = s.supplier_id;
    const scode = s.supplier_code;
    const encodedS = JSON.stringify(s).replace(/"/g, '&quot;');
    const toggleLabel = s.is_active ? 'Deactivate' : 'Reactivate';
    const toggleIcon  = s.is_active ? 'fa-ban text-red-400' : 'fa-check text-emerald-400';
    const toggleCls   = s.is_active ? 'text-red-400' : 'text-emerald-400';
    const toggleFn    = s.is_active ? 'deactivateSupplier' : 'reactivateSupplier';
    return '<div class="relative inline-block">'
      + '<button data-smid="' + sid + '" onclick="toggleSupplierMenu(this.dataset.smid)" class="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80" style="background:var(--bg-card-h); color:var(--text-secondary)"><i class="fas fa-ellipsis-v text-sm"></i></button>'
      + '<div id="smenu-' + sid + '" class="hidden absolute right-0 top-9 z-50 rounded-lg shadow-xl border py-1 min-w-max" style="background:var(--bg-card); border-color:var(--border-light)">'
      + '<button onclick="openSupplierDrawer(' + encodedS + ')" class="w-full text-left px-4 py-2 text-sm hover:opacity-80" style="color:var(--text-primary)"><i class="fas fa-edit w-4 mr-2 text-blue-400"></i>Edit</button>'
      + '<button data-sid="' + sid + '" data-scode="' + scode + '" onclick="' + toggleFn + '(this.dataset.sid,this.dataset.scode)" class="w-full text-left px-4 py-2 text-sm ' + toggleCls + ' hover:opacity-80"><i class="fas ' + toggleIcon + ' w-4 mr-2"></i>' + toggleLabel + '</button>'
      + '</div></div>';
  }

  function statusCell(isActive) {
    return isActive
      ? '<span class="text-xs text-emerald-400 font-medium">\u25cf Active</span>'
      : '<span class="text-xs text-gray-500 font-medium">\u25cb Inactive</span>';
  }

  const tableRows = suppliers.map(function(s) {
    return '<tr class="border-b transition-opacity hover:opacity-80" style="border-color:var(--border)">'
      + '<td class="py-3 px-4"><span class="font-mono text-sm font-bold text-blue-400">' + s.supplier_code + '</span></td>'
      + '<td class="py-3 px-4"><div class="font-medium" style="color:var(--text-primary)">' + s.name + '</div><div class="text-xs" style="color:var(--text-muted)">' + (s.contact_email || '') + '</div></td>'
      + '<td class="py-3 px-4"><span class="font-mono text-xs" style="color:var(--text-secondary)">' + s.country + '</span></td>'
      + '<td class="py-3 px-4"><span class="font-mono text-xs" style="color:var(--text-secondary)">' + (s.vat_number || '\u2014') + '</span></td>'
      + '<td class="py-3 px-4">' + vatCodeBadge(s.default_vat_code) + '</td>'
      + '<td class="py-3 px-4">' + fmt(s.total_purchases || 0) + '</td>'
      + '<td class="py-3 px-4">' + statusCell(s.is_active) + '</td>'
      + '<td class="py-3 px-4 text-right">' + supplierMenuBtn(s) + '</td>'
      + '</tr>';
  }).join('');

  const countryOptions = COUNTRIES.map(function(c) { return '<option value="' + c.v + '">' + c.l + '</option>'; }).join('');
  const vatCodeOptions = VAT_CODES.map(function(vc) { return '<option value="' + vc + '">' + vc + '</option>'; }).join('');

  const drawerHtml = '<div id="supplier-drawer" class="fixed inset-y-0 right-0 z-50 w-96 shadow-2xl border-l transform translate-x-full transition-transform duration-300 flex flex-col" style="background:var(--bg-card); border-color:var(--border-light)">'
    + '<div class="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style="border-color:var(--border)">'
    + '<h2 id="drawer-title" class="font-semibold text-base" style="color:var(--text-primary)">Add Supplier</h2>'
    + '<button onclick="closeSupplierDrawer()" class="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-80" style="background:var(--bg-sidebar-h); color:var(--text-muted)"><i class="fas fa-times"></i></button>'
    + '</div>'
    + '<div class="flex-1 overflow-y-auto p-5 space-y-4 text-sm">'
    + '<input type="hidden" id="drawer-supplier-id" value="" />'
    + '<input type="hidden" id="drawer-edit-mode" value="add" />'
    + '<input type="hidden" id="drawer-original-vat-code" value="" />'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Supplier Code <span class="text-red-400">*</span></label>'
    + '<input id="d-scode" type="text" placeholder="e.g. TECH-01" maxlength="20" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">'
    + '<div id="d-scode-err" class="text-xs text-red-400 mt-1 hidden"></div></div>'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Full Name <span class="text-red-400">*</span> <span class="ml-1 text-xs bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded">[ADMIN ONLY]</span></label>'
    + '<input id="d-name" type="text" placeholder="e.g. TechSource Ltd" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">'
    + '<div id="d-name-err" class="text-xs text-red-400 mt-1 hidden"></div></div>'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Email</label>'
    + '<input id="d-email" type="email" placeholder="contact@supplier.com" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)"></div>'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Country <span class="text-red-400">*</span></label>'
    + '<select id="d-country" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)"><option value="">Select country...</option>' + countryOptions + '</select></div>'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">VAT Number</label>'
    + '<input id="d-vat" type="text" placeholder="e.g. GB123456789" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)"></div>'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Default VAT Code <span class="text-red-400">*</span></label>'
    + '<select id="d-vatcode" onchange="onDrawerVatCodeChange()" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)"><option value="">Select VAT code...</option>' + vatCodeOptions + '</select>'
    + '<div id="d-vatcode-warning" class="hidden mt-2 p-3 rounded-lg border text-xs" style="background:rgba(251,191,36,0.1); border-color:rgba(251,191,36,0.4); color:#fbbf24">'
    + '<i class="fas fa-exclamation-triangle mr-1"></i>This will apply to new batches only. Existing batch VAT codes will not be changed.'
    + '<div class="flex gap-2 mt-2"><button onclick="confirmVatCodeChange()" class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-xs font-medium">Confirm Change</button>'
    + '<button onclick="cancelVatCodeChange()" class="text-xs px-3 py-1 rounded border" style="border-color:var(--border-light); color:var(--text-secondary)">Cancel</button></div></div></div>'
    + '<div><label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Status</label>'
    + '<div class="flex items-center gap-3">'
    + '<button id="d-status-btn" type="button" onclick="toggleDrawerStatus()" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-emerald-600">'
    + '<span id="d-status-knob" class="inline-block h-4 w-4 rounded-full bg-white transform translate-x-6 transition-transform"></span>'
    + '</button><span id="d-status-label" class="text-sm text-emerald-400 font-medium">Active</span>'
    + '<input type="hidden" id="d-status" value="true">'
    + '</div></div>'
    + '</div>'
    + '<div class="flex-shrink-0 border-t px-5 py-4 flex gap-3" style="border-color:var(--border)">'
    + '<button onclick="closeSupplierDrawer()" class="flex-1 rounded-lg py-2.5 text-sm font-medium border hover:opacity-80" style="border-color:var(--border-light); color:var(--text-secondary)">Cancel</button>'
    + '<button onclick="saveSupplier()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium"><i class="fas fa-save mr-2"></i><span id="drawer-save-label">Add Supplier</span></button>'
    + '</div></div>'
    + '<div id="supplier-drawer-bg" class="fixed inset-0 z-40 hidden" style="background:rgba(0,0,0,0.5)" onclick="closeSupplierDrawer()"></div>';

  return '<div class="space-y-4 relative">'
    + '<div id="supplier-toast" class="hidden fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white border" style="min-width:260px"></div>'
    + '<div class="flex items-center justify-between">'
    + '<div class="text-sm" style="color:var(--text-muted)">' + suppliers.length + ' suppliers \u00b7 ' + suppliers.filter(function(s){return s.is_active;}).length + ' active</div>'
    + '<button onclick="openSupplierDrawer(null)" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><i class="fas fa-plus"></i> Add Supplier</button>'
    + '</div>'
    + '<div class="overflow-x-auto rounded-xl border" style="border-color:var(--border)">'
    + '<table class="w-full text-sm"><thead><tr class="border-b" style="border-color:var(--border); background:var(--bg-sidebar)">'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Supplier Code</th>'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Full Name <span class="ml-1 bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded text-xs font-medium normal-case tracking-normal">ADMIN ONLY</span></th>'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Country</th>'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">VAT Number</th>'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Default VAT Code</th>'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Total Purchases</th>'
    + '<th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Status</th>'
    + '<th class="py-3 px-4"></th>'
    + '</tr></thead><tbody>' + tableRows + '</tbody></table>'
    + '</div>'
    + drawerHtml
    + '</div>';
}
function showSuppTab(tab) {
  document.querySelectorAll('[id^="stab-"]').forEach(el => {
    el.classList.remove('text-blue-400', 'tab-active');
    el.style.color = 'var(--text-secondary)';
  });
  const activeTab = document.getElementById('stab-' + tab);
  if (activeTab) { activeTab.classList.add('text-blue-400', 'tab-active'); activeTab.style.color = ''; }
  const { suppliers, batches } = window._suppData || { suppliers: [], batches: [] };
  if (tab === 'batches') {
    document.getElementById('supp-content').innerHTML = renderBatchesTable(batches);
  } else {
    document.getElementById('supp-content').innerHTML = renderSuppliersTable(suppliers);
  }
}

function openSupplierDrawer(supplier) {
  document.querySelectorAll('[id^="smenu-"]').forEach(el => el.classList.add('hidden'));
  const drawer = document.getElementById('supplier-drawer');
  const bg = document.getElementById('supplier-drawer-bg');
  if (!drawer) return;
  document.getElementById('d-vatcode-warning').classList.add('hidden');
  ['d-scode-err','d-name-err'].forEach(id => { const el=document.getElementById(id); if(el) el.classList.add('hidden'); });
  if (supplier) {
    document.getElementById('drawer-title').textContent = 'Edit Supplier';
    document.getElementById('drawer-save-label').textContent = 'Save Changes';
    document.getElementById('drawer-edit-mode').value = 'edit';
    document.getElementById('drawer-supplier-id').value = supplier.supplier_id;
    document.getElementById('d-scode').value = supplier.supplier_code;
    document.getElementById('d-scode').disabled = true;
    document.getElementById('d-scode').style.opacity = '0.6';
    document.getElementById('d-name').value = supplier.name;
    document.getElementById('d-email').value = supplier.contact_email || '';
    document.getElementById('d-country').value = supplier.country;
    document.getElementById('d-vat').value = supplier.vat_number || '';
    document.getElementById('d-vatcode').value = supplier.default_vat_code;
    document.getElementById('drawer-original-vat-code').value = supplier.default_vat_code;
    const isActive = supplier.is_active;
    document.getElementById('d-status').value = String(isActive);
    document.getElementById('d-status-btn').className = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (isActive ? 'bg-emerald-600' : 'bg-gray-600');
    document.getElementById('d-status-knob').className = 'inline-block h-4 w-4 rounded-full bg-white transform transition-transform ' + (isActive ? 'translate-x-6' : 'translate-x-1');
    document.getElementById('d-status-label').textContent = isActive ? 'Active' : 'Inactive';
    document.getElementById('d-status-label').className = 'text-sm font-medium ' + (isActive ? 'text-emerald-400' : 'text-gray-400');
  } else {
    document.getElementById('drawer-title').textContent = 'Add Supplier';
    document.getElementById('drawer-save-label').textContent = 'Add Supplier';
    document.getElementById('drawer-edit-mode').value = 'add';
    document.getElementById('drawer-supplier-id').value = '';
    document.getElementById('d-scode').value = '';
    document.getElementById('d-scode').disabled = false;
    document.getElementById('d-scode').style.opacity = '1';
    document.getElementById('d-name').value = '';
    document.getElementById('d-email').value = '';
    document.getElementById('d-country').value = '';
    document.getElementById('d-vat').value = '';
    document.getElementById('d-vatcode').value = '';
    document.getElementById('drawer-original-vat-code').value = '';
    document.getElementById('d-status').value = 'true';
    document.getElementById('d-status-btn').className = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-emerald-600';
    document.getElementById('d-status-knob').className = 'inline-block h-4 w-4 rounded-full bg-white transform translate-x-6 transition-transform';
    document.getElementById('d-status-label').textContent = 'Active';
    document.getElementById('d-status-label').className = 'text-sm font-medium text-emerald-400';
  }
  drawer.classList.remove('translate-x-full');
  bg.classList.remove('hidden');
}

function closeSupplierDrawer() {
  const drawer = document.getElementById('supplier-drawer');
  const bg = document.getElementById('supplier-drawer-bg');
  if (drawer) drawer.classList.add('translate-x-full');
  if (bg) bg.classList.add('hidden');
}

function toggleSupplierMenu(id) {
  document.querySelectorAll('[id^="smenu-"]').forEach(el => { if (el.id !== 'smenu-' + id) el.classList.add('hidden'); });
  document.getElementById('smenu-' + id)?.classList.toggle('hidden');
  // Close on outside click
  setTimeout(() => {
    const handler = (e) => { const menu = document.getElementById('smenu-' + id); if (menu && !menu.contains(e.target)) { menu.classList.add('hidden'); document.removeEventListener('click', handler); } };
    document.addEventListener('click', handler);
  }, 10);
}

function toggleDrawerStatus() {
  const cur = document.getElementById('d-status').value === 'true';
  const next = !cur;
  document.getElementById('d-status').value = String(next);
  document.getElementById('d-status-btn').className = 'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' + (next ? 'bg-emerald-600' : 'bg-gray-600');
  document.getElementById('d-status-knob').className = 'inline-block h-4 w-4 rounded-full bg-white transform transition-transform ' + (next ? 'translate-x-6' : 'translate-x-1');
  document.getElementById('d-status-label').textContent = next ? 'Active' : 'Inactive';
  document.getElementById('d-status-label').className = 'text-sm font-medium ' + (next ? 'text-emerald-400' : 'text-gray-400');
}

function onDrawerVatCodeChange() {
  const isEdit = document.getElementById('drawer-edit-mode').value === 'edit';
  if (!isEdit) return;
  const newCode = document.getElementById('d-vatcode').value;
  const origCode = document.getElementById('drawer-original-vat-code').value;
  if (newCode !== origCode && origCode) {
    document.getElementById('d-vatcode-warning').classList.remove('hidden');
  } else {
    document.getElementById('d-vatcode-warning').classList.add('hidden');
  }
}

function confirmVatCodeChange() {
  document.getElementById('drawer-original-vat-code').value = document.getElementById('d-vatcode').value;
  document.getElementById('d-vatcode-warning').classList.add('hidden');
}

function cancelVatCodeChange() {
  document.getElementById('d-vatcode').value = document.getElementById('drawer-original-vat-code').value;
  document.getElementById('d-vatcode-warning').classList.add('hidden');
}

function showSupplierToast(msg, isError) {
  const t = document.getElementById('supplier-toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = isError ? '#7f1d1d' : '#14532d';
  t.style.borderColor = isError ? '#ef4444' : '#22c55e';
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3500);
}

async function saveSupplier() {
  const isEdit = document.getElementById('drawer-edit-mode').value === 'edit';
  const scode = (document.getElementById('d-scode').value || '').trim().toUpperCase();
  const name  = (document.getElementById('d-name').value || '').trim();
  const email = (document.getElementById('d-email').value || '').trim();
  const country = document.getElementById('d-country').value;
  const vat = (document.getElementById('d-vat').value || '').trim();
  const vatCode = document.getElementById('d-vatcode').value;
  const isActive = document.getElementById('d-status').value === 'true';
  let valid = true;
  if (!isEdit && !scode) { document.getElementById('d-scode-err').textContent='Supplier code is required'; document.getElementById('d-scode-err').classList.remove('hidden'); valid=false; } else { document.getElementById('d-scode-err').classList.add('hidden'); }
  if (!name) { document.getElementById('d-name-err').textContent='Full name is required'; document.getElementById('d-name-err').classList.remove('hidden'); valid=false; } else { document.getElementById('d-name-err').classList.add('hidden'); }
  if (!country) { alert('Country is required'); return; }
  if (!vatCode) { alert('Default VAT Code is required'); return; }
  if (!valid) return;
  // If VAT code changed and warning not yet confirmed, show warning
  const origCode = document.getElementById('drawer-original-vat-code').value;
  if (isEdit && vatCode !== origCode && origCode && !document.getElementById('d-vatcode-warning').classList.contains('hidden') === false) {
    document.getElementById('d-vatcode-warning').classList.remove('hidden');
    return;
  }
  try {
    if (isEdit) {
      const id = document.getElementById('drawer-supplier-id').value;
      await axios.patch(API + '/suppliers/' + id, { name, contact_email: email, country, vat_number: vat, default_vat_code: vatCode, is_active: isActive });
      showSupplierToast('Supplier updated successfully', false);
    } else {
      const res = await axios.post(API + '/suppliers', { supplier_code: scode, name, contact_email: email, country, vat_number: vat, default_vat_code: vatCode });
      showSupplierToast('Supplier ' + res.data.supplier_code + ' added successfully', false);
    }
    closeSupplierDrawer();
    const newSuppliers = await axios.get(API + '/suppliers').then(r => r.data);
    window._suppData.suppliers = newSuppliers;
    document.getElementById('supp-content').innerHTML = renderSuppliersTable(newSuppliers);
  } catch(err) {
    const msg = err.response?.data?.message || err.response?.data?.error || 'Save failed';
    if (err.response?.data?.error === 'DUPLICATE_CODE') {
      document.getElementById('d-scode-err').textContent = msg;
      document.getElementById('d-scode-err').classList.remove('hidden');
    } else { showSupplierToast(msg, true); }
  }
}

async function deactivateSupplier(id, code) {
  document.getElementById('smenu-' + id)?.classList.add('hidden');
  if (!confirm('Deactivate supplier ' + code + '? Status will be set to Inactive. No records will be deleted.')) return;
  try {
    await axios.patch(API + '/suppliers/' + id, { is_active: false });
    showSupplierToast('Supplier ' + code + ' deactivated', false);
    const s = await axios.get(API + '/suppliers').then(r => r.data);
    window._suppData.suppliers = s;
    document.getElementById('supp-content').innerHTML = renderSuppliersTable(s);
  } catch(e) { showSupplierToast('Deactivation failed', true); }
}

async function reactivateSupplier(id, code) {
  document.getElementById('smenu-' + id)?.classList.add('hidden');
  try {
    await axios.patch(API + '/suppliers/' + id, { is_active: true });
    showSupplierToast('Supplier ' + code + ' reactivated', false);
    const s = await axios.get(API + '/suppliers').then(r => r.data);
    window._suppData.suppliers = s;
    document.getElementById('supp-content').innerHTML = renderSuppliersTable(s);
  } catch(e) { showSupplierToast('Reactivation failed', true); }
}


async function showNewBatchModal() {
  // Fix 1A + 1C: Fetch fresh active-only suppliers every time modal opens
  let activeSuppliers = [];
  try {
    activeSuppliers = await axios.get(API + '/suppliers?active=true').then(r => r.data);
  } catch(e) {
    activeSuppliers = (window._suppData && window._suppData.suppliers || []).filter(function(s){ return s.is_active; });
  }
  // Fix 2: Display "CODE — Full Name", store supplier_id as value
  const supplierOpts = activeSuppliers.map(function(s){
    return '<option value="' + s.supplier_id + '" data-vatcode="' + (s.default_vat_code || '') + '">' + s.supplier_code + ' \u2014 ' + s.name + '</option>';
  }).join('');

  openModal('Create Purchase Batch', \`
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div><label class="text-gray-400 text-xs block mb-1">Supplier</label>
          <select id="new-batch-supplier-sel" onchange="onNewBatchSupplierChange()" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
            <option value="">Select supplier...</option>
            \${supplierOpts}
          </select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Invoice Reference</label><input type="text" id="new-batch-inv-ref" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="e.g. TS-INV-5500" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Batch Date</label><input type="date" id="new-batch-date" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">Currency</label>
          <select id="new-batch-currency" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300"><option value="GBP">GBP</option><option value="EUR">EUR</option><option value="USD">USD</option></select>
        </div>
        <div><label class="text-gray-400 text-xs block mb-1">Total Purchase Value</label><input type="number" id="new-batch-value" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300" placeholder="0.00" /></div>
        <div><label class="text-gray-400 text-xs block mb-1">VAT Code</label>
          <select id="new-batch-vat-code" class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-300">
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

// Fix 3: Auto-populate VAT code when supplier is selected in Create Batch modal
function onNewBatchSupplierChange() {
  const sel = document.getElementById('new-batch-supplier-sel');
  const opt = sel && sel.options[sel.selectedIndex];
  if (opt && opt.dataset.vatcode) {
    const vc = document.getElementById('new-batch-vat-code');
    if (vc) vc.value = opt.dataset.vatcode;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// BULK GRADE/COLOUR OVERRIDE (Purchase Batch Detail — Manager role)
// ══════════════════════════════════════════════════════════════════════════════

async function openBulkOverrideModal(batchId, batchCode, batchVatCode) {
  // Fetch devices in this batch
  let batchDevices = [];
  try {
    const allDevices = await axios.get(API + '/devices').then(r => r.data);
    batchDevices = allDevices.filter(d => d.purchase_batch_id === batchId);
  } catch(e) { batchDevices = []; }

  const GRADES = ['A+','A','B','C','D','Faulty'];
  const COLOURS = ['Space Black','Deep Purple','Gold','Silver','Midnight','Starlight','Pink','Blue','Green','Red','White','Black','Obsidian','Titanium Black','Phantom Grey','Awesome White','Sierra Blue'];
  const REASONS = [
    { code:'GRADE_DISCREPANCY_QC', label:'Grade Discrepancy Found at QC' },
    { code:'POST_REPAIR_UPGRADE', label:'Post-Repair Grade Upgrade' },
    { code:'POST_REPAIR_DOWNGRADE', label:'Post-Repair Grade Downgrade' },
    { code:'COLOUR_MISMATCH', label:'Colour Mismatch Identified' },
    { code:'CUSTOMER_RETURN_CONDITION', label:'Customer Return — Condition Changed' },
    { code:'OTHER', label:'Other (specify below)' },
  ];
  const isMarginBatch = batchVatCode && batchVatCode.includes('MARGIN');

  openModal(\`Bulk Grade/Colour Correction — \${batchCode}\`, \`
    <div class="space-y-4 text-sm">
      \${isMarginBatch ? \`<div class="p-3 rounded-lg border text-xs" style="background:rgba(251,191,36,0.1); border-color:rgba(251,191,36,0.4); color:#fbbf24">
        <i class="fas fa-exclamation-triangle mr-1"></i><strong>Margin Scheme Batch:</strong> Grade changes on these devices may affect margin VAT calculations. Review pricing before listing.
      </div>\` : ''}
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Field to Override *</label>
          <select id="bulk-field" onchange="onBulkFieldChange()" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
            <option value="">Select field...</option>
            <option value="grade">Grade</option>
            <option value="colour">Colour</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">New Value *</label>
          <select id="bulk-new-value" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
            <option value="">Select field first...</option>
          </select>
        </div>
        <div class="col-span-2">
          <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Reason *</label>
          <select id="bulk-reason" onchange="onBulkReasonChange()" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
            <option value="">Select reason...</option>
            \${REASONS.map(r => \`<option value="\${r.code}">\${r.label}</option>\`).join('')}
          </select>
        </div>
        <div id="bulk-notes-wrap" class="col-span-2 hidden">
          <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Notes * (min 20 chars)</label>
          <textarea id="bulk-notes" rows="2" placeholder="Describe the reason in detail..." class="w-full rounded-lg px-3 py-2 text-sm border resize-none" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)"></textarea>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold mb-2" style="color:var(--text-muted)">Select Devices to Apply Override *</label>
        <div class="flex gap-2 mb-2">
          <button onclick="bulkSelectAll(true)" class="text-xs text-blue-400 hover:underline">Select all</button>
          <span style="color:var(--text-muted)">·</span>
          <button onclick="bulkSelectAll(false)" class="text-xs text-blue-400 hover:underline">Deselect all</button>
        </div>
        <div class="overflow-y-auto max-h-48 rounded-lg border" style="border-color:var(--border)">
          <table class="w-full text-xs">
            <thead><tr style="background:var(--bg-sidebar)">
              <th class="p-2 w-8"><input type="checkbox" id="bulk-check-all" onchange="bulkSelectAll(this.checked)"></th>
              <th class="p-2 text-left" style="color:var(--text-muted)">IMEI</th>
              <th class="p-2 text-left" style="color:var(--text-muted)">Model</th>
              <th class="p-2 text-left" style="color:var(--text-muted)">Grade</th>
              <th class="p-2 text-left" style="color:var(--text-muted)">Colour</th>
            </tr></thead>
            <tbody>
              \${batchDevices.length ? batchDevices.map(d => \`
                <tr class="border-b hover:opacity-80" style="border-color:var(--border)">
                  <td class="p-2"><input type="checkbox" class="bulk-device-cb" value="\${d.device_id}" checked></td>
                  <td class="p-2 font-mono text-blue-300">\${d.imei_primary}</td>
                  <td class="p-2" style="color:var(--text-primary)">\${d.make} \${d.model}</td>
                  <td class="p-2 font-bold \${d.grade==='A'||d.grade==='A+'?'text-emerald-400':d.grade==='B'?'text-blue-400':'text-amber-400'}">\${d.grade}</td>
                  <td class="p-2" style="color:var(--text-secondary)">\${d.colour}</td>
                </tr>
              \`).join('') : \`<tr><td colspan="5" class="p-4 text-center text-xs" style="color:var(--text-muted)">No devices found for this batch in the current view</td></tr>\`}
            </tbody>
          </table>
        </div>
      </div>
      <div id="bulk-err" class="hidden text-xs text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2"></div>
      <div id="bulk-preview" class="hidden"></div>
      <div class="flex gap-3">
        <button onclick="closeModal()" class="flex-1 rounded-lg py-2.5 text-sm border hover:opacity-80" style="border-color:var(--border-light); color:var(--text-secondary)">Cancel</button>
        <button onclick="previewBulkOverride()" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2.5 text-sm font-semibold">
          <i class="fas fa-eye mr-2"></i>Preview & Apply
        </button>
      </div>
    </div>
  \`);
  // Store grades and colours for dynamic select
  window._bulkGrades = GRADES;
  window._bulkColours = COLOURS;
}

function onBulkFieldChange() {
  const field = document.getElementById('bulk-field')?.value;
  const sel = document.getElementById('bulk-new-value');
  if (!sel) return;
  const options = field === 'grade' ? (window._bulkGrades||[]) : field === 'colour' ? (window._bulkColours||[]) : [];
  sel.innerHTML = '<option value="">Select value...</option>' + options.map(o => \`<option value="\${o}">\${o}</option>\`).join('');
}

function onBulkReasonChange() {
  const reason = document.getElementById('bulk-reason')?.value;
  const wrap = document.getElementById('bulk-notes-wrap');
  if (wrap) { if (reason === 'OTHER') wrap.classList.remove('hidden'); else wrap.classList.add('hidden'); }
}

function bulkSelectAll(checked) {
  document.querySelectorAll('.bulk-device-cb').forEach(cb => cb.checked = checked);
  const all = document.getElementById('bulk-check-all');
  if (all) all.checked = checked;
}

async function previewBulkOverride() {
  const field = document.getElementById('bulk-field')?.value;
  const newValue = document.getElementById('bulk-new-value')?.value;
  const reasonCode = document.getElementById('bulk-reason')?.value;
  const notes = document.getElementById('bulk-notes')?.value || '';
  const errEl = document.getElementById('bulk-err');
  const previewEl = document.getElementById('bulk-preview');
  errEl.classList.add('hidden');
  if (!field || !newValue || !reasonCode) { errEl.textContent = 'Please select field, value and reason'; errEl.classList.remove('hidden'); return; }
  if (reasonCode === 'OTHER' && notes.length < 20) { errEl.textContent = 'Notes must be at least 20 characters'; errEl.classList.remove('hidden'); return; }
  const selected = [...document.querySelectorAll('.bulk-device-cb:checked')].map(cb => cb.value);
  if (!selected.length) { errEl.textContent = 'Please select at least one device'; errEl.classList.remove('hidden'); return; }
  previewEl.innerHTML = \`<div class="p-3 rounded-lg border text-xs" style="background:rgba(245,158,11,0.08); border-color:rgba(245,158,11,0.4); color:#fbbf24">
    <i class="fas fa-exclamation-triangle mr-1"></i>
    You are about to override <strong>\${selected.length} device(s)</strong> — 
    setting \${field} to <strong>\${newValue}</strong>.
    Reason: \${reasonCode.replace(/_/g,' ')}.
    <strong>This will create \${selected.length} individual audit event(s) and cannot be undone.</strong>
    <div class="flex gap-2 mt-2">
      <button onclick="submitBulkOverride(\${JSON.stringify(selected)},'\${field}','\${newValue}','\${reasonCode}',\${JSON.stringify(notes)})"
        class="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-xs font-semibold">
        <i class="fas fa-check mr-1"></i>Confirm (\${selected.length} devices)
      </button>
      <button onclick="document.getElementById('bulk-preview').innerHTML=''" class="text-xs px-3 py-1 rounded border" style="border-color:rgba(245,158,11,0.4); color:#fbbf24">Edit</button>
    </div>
  </div>\`;
  previewEl.classList.remove('hidden');
}

async function submitBulkOverride(deviceIds, fieldChanged, newValue, reasonCode, notes) {
  try {
    const res = await axios.post(API + '/devices/batch-override', { device_ids: deviceIds, field_changed: fieldChanged, new_value: newValue, reason_code: reasonCode, notes: notes || '' });
    closeModal();
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white border flex items-center gap-2';
    toast.style.cssText = 'background:#92400e; border-color:#f59e0b; min-width:320px';
    toast.innerHTML = \`<i class="fas fa-layer-group text-amber-400"></i> Bulk Override applied: \${res.data.overrides_created} device(s) updated. Audit events created.\`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  } catch(err) {
    const errEl = document.getElementById('bulk-err');
    if (errEl) { errEl.textContent = err.response?.data?.error || 'Bulk override failed'; errEl.classList.remove('hidden'); }
  }
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
  const el = document.getElementById('page-content');
  if (!el) return;
  el.innerHTML = \`<div class="fade-in space-y-6">
    <div class="border-b" style="border-color:var(--border)">
      <div class="flex gap-6">
        <button id="atab-settings" onclick="showAdminTab('settings')" class="pb-3 text-sm font-medium text-blue-400 tab-active">Settings</button>
        <button id="atab-catalogue" onclick="showAdminTab('catalogue')" class="pb-3 text-sm font-medium hover:text-white" style="color:var(--text-secondary)"><i class="fas fa-tags mr-1.5 text-xs"></i>Device Catalogue</button>
      </div>
    </div>
    <div id="admin-tab-content"></div>
  </div>\`;
  showAdminTab('settings');
}

function renderAdminSettingsHTML() {
  return \`<div id="admin-settings-panel" class="space-y-6">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
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
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-archive text-amber-400"></i> Data Retention Policy (HMRC)</h3>
          <div class="space-y-3 text-sm">
            \${[['Operational Data','6 years minimum','blue'],['OPR Documents','4 years — NON-DELETABLE','red'],['VAT Records','6 years — HMRC mandatory','red'],['System Audit Logs','2 years minimum','amber']].map(([l,p,c])=>\`<div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg"><span class="text-gray-300">\${l}</span><span class="text-xs font-medium text-\${c}-400">\${p}</span></div>\`).join('')}
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-shield-alt text-emerald-400"></i> Non-Negotiable System Controls</h3>
          <div class="space-y-2">
            \${[['Intake QC Mandatory','No device enters AVAILABLE without completed QC'],['Lock Check Enforcement','Lock blocks all sale paths until LOCK_CLEARED event'],['IMEI Matching Required','Returns must match sold IMEI exactly'],['Duplicate IMEI Prevention','Global block across all tenants'],['VAT Tax Point Rule','Always sale date — never advance/settlement'],['Reverse Charge Atomicity','Both Box 1 and Box 4 created simultaneously'],['Export VAT Override','Non-UK addresses force 0EXPORT_SALES'],['Audit Trail Mandatory','All overrides require user, reason, timestamp']].map(([ctrl,desc])=>\`<div class="flex items-start gap-3 p-3 bg-gray-800 rounded-lg"><i class="fas fa-check-circle text-emerald-400 mt-0.5 text-sm flex-shrink-0"></i><div><div class="text-sm font-medium text-white">\${ctrl}</div><div class="text-xs text-gray-400">\${desc}</div></div></div>\`).join('')}
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-plug text-purple-400"></i> Marketplace Integrations</h3>
          <div class="space-y-3">
            \${[['Amazon SP-API','Order sync, settlements','connected'],['Back Market API','Orders, financials, cases','connected'],['eBay API','Order sync, settlement import','pending'],['Shopify API','Order sync','not_configured'],['HMRC MTD API','Direct VAT submission (Phase 4)','roadmap'],['Xero Integration','Accounting export with VAT (Phase 4)','roadmap']].map(([n,d,s])=>\`<div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg"><div><div class="text-sm font-medium text-white">\${n}</div><div class="text-xs text-gray-400">\${d}</div></div><span class="text-xs px-2 py-1 rounded-full \${s==='connected'?'bg-emerald-500/20 text-emerald-400':s==='pending'?'bg-amber-500/20 text-amber-400':s==='roadmap'?'bg-blue-500/20 text-blue-400':'bg-gray-500/20 text-gray-400'}">\${s==='connected'?'✓ Connected':s==='pending'?'⏳ Pending':s==='roadmap'?'🗺 Roadmap':'⚙ Configure'}</span></div>\`).join('')}
          </div>
        </div>
      </div>
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-road text-cyan-400"></i> Build Phase Roadmap</h3>
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-4">
          \${[['Phase 1','Months 1-3','Core Foundation','Multi-tenant, VAT engine, Purchase batches, Intake QC, OPR engine','IN PROGRESS'],['Phase 2','Months 4-5','Risk & Recovery','INR workflows, AI communications, Fintech reconciliation, Loss tracking','PLANNED'],['Phase 3','Months 6-7','Operations Expansion','Inventory audits, Repair workflows, Supplier analytics, Marketplaces','PLANNED'],['Phase 4','Months 8-9','Intelligence & SaaS','Profitability engine, SaaS tenant management, HMRC MTD','PLANNED']].map(([ph,t,title,desc,st])=>\`<div class="bg-gray-800 rounded-xl p-4"><div class="flex items-center justify-between mb-2"><span class="text-xs font-bold \${st==='IN PROGRESS'?'bg-blue-600':'bg-gray-600'} text-white px-2 py-0.5 rounded">\${ph}</span><span class="text-xs text-gray-500">\${t}</span></div><div class="font-semibold text-white text-sm mb-1">\${title}</div><div class="text-xs text-gray-400">\${desc}</div><div class="mt-3"><span class="text-xs px-2 py-0.5 rounded-full \${st==='IN PROGRESS'?'bg-blue-500/20 text-blue-400':'bg-gray-500/20 text-gray-400'}">\${st}</span></div></div>\`).join('')}
        </div>
      </div>
    </div>\`;
}

function showAdminTab(tab) {
  document.querySelectorAll('[id^="atab-"]').forEach(el => {
    el.classList.remove('text-blue-400','tab-active');
    el.style.color = 'var(--text-secondary)';
  });
  const active = document.getElementById('atab-' + tab);
  if (active) { active.classList.add('text-blue-400','tab-active'); active.style.color = ''; }
  const wrap = document.getElementById('admin-tab-content');
  if (!wrap) return;
  if (tab === 'catalogue') {
    wrap.innerHTML = '<div id="admin-catalogue-panel"></div>';
    renderDeviceVariantsInto('admin-catalogue-panel');
  } else {
    wrap.innerHTML = renderAdminSettingsHTML();
  }
}

async function renderDeviceVariantsInto(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="py-8 text-center text-sm" style="color:var(--text-muted)"><i class="fas fa-spinner fa-spin mr-2"></i>Loading catalogue...</div>';
  try {
    const [variants, makes] = await Promise.all([
      axios.get(API + '/device-variants').then(r => r.data),
      axios.get(API + '/device-variants/makes').then(r => r.data),
    ]);
    window._variantsData = variants;
    window._variantMakes = makes;
    const CSV_TEMPLATE = 'Make,Model,Storage,Colour,Grade\\nApple,iPhone 11,64GB,Black,A\\nApple,iPhone 12,128GB,Blue,A\\nSamsung,Galaxy S21,256GB,Phantom Grey,A';
    const csvBlob = new Blob([CSV_TEMPLATE], {type:'text/csv'});
    const csvUrl = URL.createObjectURL(csvBlob);
    container.innerHTML = \`<div class="space-y-5">
      <div class="flex flex-wrap items-center gap-3 justify-between">
        <div class="flex items-center gap-3">
          <input id="var-search" type="text" placeholder="Search SKU, make, model..." oninput="filterVariants()"
            class="rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
          <span id="var-count" class="text-xs" style="color:var(--text-muted)">\${variants.length} variants</span>
        </div>
        <div class="flex items-center gap-2">
          <a href="\${csvUrl}" download="device_variants_template.csv"
            class="px-3 py-2 rounded-lg text-xs font-medium border hover:opacity-80 flex items-center gap-1.5"
            style="border-color:var(--border-light); color:var(--text-secondary)">
            <i class="fas fa-download text-xs"></i> CSV Template
          </a>
          <label class="px-3 py-2 rounded-lg text-xs font-medium border hover:opacity-80 cursor-pointer flex items-center gap-1.5"
            style="background:var(--bg-sidebar-h); border-color:var(--border-light); color:var(--text-primary)">
            <i class="fas fa-upload text-xs text-blue-400"></i> Upload Variants
            <input type="file" accept=".csv" class="hidden" onchange="handleVariantCsvUpload(event)">
          </label>
          <button onclick="openAddVariantModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <i class="fas fa-plus"></i> Add Variant
          </button>
        </div>
      </div>
      <div id="csv-import-panel" class="hidden rounded-xl border p-5 space-y-4" style="border-color:var(--border); background:var(--bg-card)">
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-sm" style="color:var(--text-primary)"><i class="fas fa-table mr-2 text-blue-400"></i>CSV Import Preview</h4>
          <button onclick="document.getElementById('csv-import-panel').classList.add('hidden')" class="text-xs" style="color:var(--text-muted)"><i class="fas fa-times"></i></button>
        </div>
        <div id="csv-preview-stats" class="flex gap-4 text-xs flex-wrap"></div>
        <div id="csv-preview-table" class="overflow-x-auto max-h-64 overflow-y-auto"></div>
        <div class="flex gap-3">
          <button onclick="confirmCsvImport()" class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium"><i class="fas fa-check mr-2"></i>Confirm Import</button>
          <button onclick="document.getElementById('csv-import-panel').classList.add('hidden')" class="px-4 py-2 rounded-lg text-sm border hover:opacity-80" style="border-color:var(--border-light); color:var(--text-secondary)">Cancel</button>
        </div>
      </div>
      <div id="variants-table-wrap" class="overflow-x-auto rounded-xl border" style="border-color:var(--border)">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b" style="border-color:var(--border); background:var(--bg-sidebar)">
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80" style="color:var(--text-muted)" onclick="sortVariants('sku_code')">SKU Code <i class="fas fa-sort ml-1 text-xs opacity-50"></i></th>
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80" style="color:var(--text-muted)" onclick="sortVariants('make')">Make <i class="fas fa-sort ml-1 text-xs opacity-50"></i></th>
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80" style="color:var(--text-muted)" onclick="sortVariants('model')">Model <i class="fas fa-sort ml-1 text-xs opacity-50"></i></th>
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Storage</th>
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Colour</th>
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:opacity-80" style="color:var(--text-muted)" onclick="sortVariants('grade')">Grade <i class="fas fa-sort ml-1 text-xs opacity-50"></i></th>
              <th class="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider" style="color:var(--text-muted)">Status</th>
            </tr>
          </thead>
          <tbody id="variants-tbody">
            \${variants.map(v => variantRow(v)).join('')}
          </tbody>
        </table>
      </div>
      <div id="add-variant-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center" style="background:rgba(0,0,0,0.6)">
        <div class="rounded-xl shadow-2xl border w-full max-w-md mx-4" style="background:var(--bg-card); border-color:var(--border-light)">
          <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color:var(--border)">
            <h3 class="font-semibold" style="color:var(--text-primary)">Add Device Variant</h3>
            <button onclick="closeAddVariantModal()" class="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80" style="background:var(--bg-sidebar-h); color:var(--text-muted)"><i class="fas fa-times text-xs"></i></button>
          </div>
          <div class="p-5 space-y-4 text-sm">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Make *</label>
                <select id="av-make" onchange="onAvMakeChange();updateAvSkuPreview();" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
                  <option value="">Select...</option>
                  \${makes.map(m => \`<option value="\${m}">\${m}</option>\`).join('')}
                  <option value="__custom__">+ Custom make...</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Model *</label>
                <select id="av-model" onchange="updateAvSkuPreview()" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
                  <option value="">Select make first</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Storage *</label>
                <select id="av-storage" onchange="updateAvSkuPreview()" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
                  <option value="">Select...</option>
                  \${['16GB','32GB','64GB','128GB','256GB','512GB','1TB'].map(s => \`<option value="\${s}">\${s}</option>\`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Colour *</label>
                <input id="av-colour" type="text" placeholder="e.g. Space Black" oninput="updateAvSkuPreview()" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Grade *</label>
                <select id="av-grade" onchange="updateAvSkuPreview()" class="w-full rounded-lg px-3 py-2 text-sm border" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
                  <option value="">Select...</option>
                  \${['A+','A','B','C','D','Faulty'].map(g => \`<option value="\${g}">\${g}</option>\`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Preview SKU</label>
                <div id="av-sku-preview" class="rounded-lg px-3 py-2 text-xs font-mono text-blue-400 border" style="background:var(--bg-input); border-color:var(--border-light); min-height:36px">—</div>
              </div>
            </div>
            <div id="av-err" class="hidden text-xs text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2"></div>
          </div>
          <div class="flex gap-3 px-5 pb-5">
            <button onclick="closeAddVariantModal()" class="flex-1 rounded-lg py-2.5 text-sm border hover:opacity-80" style="border-color:var(--border-light); color:var(--text-secondary)">Cancel</button>
            <button onclick="submitAddVariant()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium"><i class="fas fa-plus mr-2"></i>Add Variant</button>
          </div>
        </div>
      </div>
    </div>\`;
  } catch(err) {
    container.innerHTML = '<div class="text-red-400 text-sm p-4">Failed to load catalogue: ' + err.message + '</div>';
  }
}

function sortVariants(field) {
  if (!window._variantsData) return;
  const asc = window._variantsSortField !== field;
  window._variantsSortField = asc ? field : null;
  const sorted = [...window._variantsData].sort((a,b) => asc ? String(a[field]||'').localeCompare(String(b[field]||'')) : 0);
  const tbody = document.getElementById('variants-tbody');
  if (tbody) tbody.innerHTML = sorted.map(v => variantRow(v)).join('');
}
// ══════════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════════
// DEVICE VARIANTS CATALOGUE (Admin → Catalogue tab)
// ══════════════════════════════════════════════════════════════════════════════

function variantRow(v) {
  return \`<tr class="border-b hover:opacity-80" style="border-color:var(--border)">
    <td class="py-3 px-4"><span class="font-mono text-xs text-blue-400 font-bold">\${v.sku_code}</span></td>
    <td class="py-3 px-4" style="color:var(--text-primary)">\${v.make}</td>
    <td class="py-3 px-4" style="color:var(--text-primary)">\${v.model}</td>
    <td class="py-3 px-4"><span class="text-xs font-mono" style="color:var(--text-secondary)">\${v.storage}</span></td>
    <td class="py-3 px-4" style="color:var(--text-secondary)">\${v.colour}</td>
    <td class="py-3 px-4"><span class="font-bold text-sm \${v.grade === 'A' || v.grade === 'A+' ? 'text-emerald-400' : v.grade === 'B' ? 'text-blue-400' : v.grade === 'C' ? 'text-amber-400' : 'text-red-400'}">\${v.grade}</span></td>
    <td class="py-3 px-4">\${v.is_active ? '<span class="text-xs text-emerald-400">Active</span>' : '<span class="text-xs text-gray-500">Inactive</span>'}</td>
  </tr>\`;
}

function filterVariants() {
  const q = (document.getElementById('var-search')?.value || '').toLowerCase();
  const all = window._variantsData || [];
  const filtered = q ? all.filter(v => (v.sku_code+v.make+v.model+v.colour+v.grade).toLowerCase().includes(q)) : all;
  const tbody = document.getElementById('variants-tbody');
  if (tbody) tbody.innerHTML = filtered.map(v => variantRow(v)).join('');
  const cnt = document.getElementById('var-count');
  if (cnt) cnt.textContent = filtered.length + ' variants';
}

function openAddVariantModal() {
  document.getElementById('add-variant-modal').classList.remove('hidden');
  document.getElementById('av-err').classList.add('hidden');
}

function closeAddVariantModal() {
  document.getElementById('add-variant-modal').classList.add('hidden');
}

async function onAvMakeChange() {
  const make = document.getElementById('av-make').value;
  if (!make) return;
  const models = await axios.get(API + '/device-variants/models?make=' + encodeURIComponent(make)).then(r => r.data);
  const sel = document.getElementById('av-model');
  sel.innerHTML = '<option value="">Select model...</option>' + models.map(m => \`<option value="\${m}">\${m}</option>\`).join('') + '<option value="__custom__">+ Custom model...</option>';
}

function updateAvSkuPreview() {
  const make = document.getElementById('av-make').value;
  const model = document.getElementById('av-model').value;
  const storage = document.getElementById('av-storage').value;
  const colour = document.getElementById('av-colour').value;
  const grade = document.getElementById('av-grade').value;
  const preview = document.getElementById('av-sku-preview');
  if (make && model && storage && colour && grade) {
    const makeM = {Apple:'APL',Samsung:'SAM',Google:'GOG',OnePlus:'OPL',Xiaomi:'XMI',Sony:'SNY'};
    const ms = makeM[make] || make.substring(0,3).toUpperCase();
    const mod = model.replace(/[^a-zA-Z0-9]/g,'').replace(/iPhone/i,'IP').replace(/Galaxy/i,'G').replace(/Pixel/i,'PX').substring(0,6).toUpperCase();
    const st = storage.replace(/[^0-9a-zA-Z]/g,'').toUpperCase();
    const cm = {Black:'BLK',White:'WHT',Blue:'BLU',Red:'RED',Pink:'PNK',Purple:'PRP',Gold:'GLD',Silver:'SLV',Midnight:'MID',Starlight:'STR',Obsidian:'OBS'};
    const col = cm[colour] || colour.replace(/\s+/g,'').substring(0,3).toUpperCase();
    preview.textContent = [ms,mod,st,col,grade.toUpperCase()].join('-');
  } else {
    preview.textContent = '—';
  }
}

async function submitAddVariant() {
  const make = document.getElementById('av-make').value;
  const model = document.getElementById('av-model').value;
  const storage = document.getElementById('av-storage').value;
  const colour = (document.getElementById('av-colour').value || '').trim();
  const grade = document.getElementById('av-grade').value;
  const errEl = document.getElementById('av-err');
  if (!make || !model || !storage || !colour || !grade) {
    errEl.textContent = 'All fields are required'; errEl.classList.remove('hidden'); return;
  }
  try {
    const res = await axios.post(API + '/device-variants', { make, model, storage, colour, grade });
    const newVariant = res.data.variant;
    window._variantsData = window._variantsData || [];
    window._variantsData.push(newVariant);
    const tbody = document.getElementById('variants-tbody');
    if (tbody) tbody.innerHTML += variantRow(newVariant);
    const cnt = document.getElementById('var-count');
    if (cnt) cnt.textContent = window._variantsData.length + ' variants';
    closeAddVariantModal();
  } catch(err) {
    const msg = err.response?.data?.message || 'Failed to add variant';
    errEl.textContent = msg; errEl.classList.remove('hidden');
  }
}

function handleVariantCsvUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\\n').map(l => l.trim()).filter(l => l);
    if (!lines.length) return;
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const rows = [];
    const errors = [];
    const existing = window._variantsData || [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      const row = { make: cols[0]||'', model: cols[1]||'', storage: cols[2]||'', colour: cols[3]||'', grade: cols[4]||'', _row: i+1, _errors: [] };
      if (!row.make || !row.model || !row.storage || !row.colour || !row.grade) row._errors.push('Missing fields');
      const dupInFile = rows.find(r => r.make===row.make && r.model===row.model && r.storage===row.storage && r.colour===row.colour && r.grade===row.grade);
      if (dupInFile) row._errors.push('Duplicate in file');
      const dupInDb = existing.find(v => v.make===row.make && v.model===row.model && v.storage===row.storage && v.colour===row.colour && v.grade===row.grade);
      if (dupInDb) row._errors.push('Already in catalogue ('+dupInDb.sku_code+')');
      rows.push(row);
    }
    window._csvImportRows = rows;
    window._csvImportFilename = file.name;
    const valid = rows.filter(r => r._errors.length === 0).length;
    const invalid = rows.length - valid;
    document.getElementById('csv-preview-stats').innerHTML = \`
      <span class="px-2 py-1 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-700/40">\${valid} valid rows</span>
      \${invalid > 0 ? \`<span class="px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-700/40">\${invalid} rows with errors</span>\` : ''}
      <span class="px-2 py-1 rounded border" style="border-color:var(--border-light); color:var(--text-muted)">File: \${file.name}</span>\`;
    document.getElementById('csv-preview-table').innerHTML = \`<table class="w-full text-xs">
      <thead><tr style="background:var(--bg-sidebar)">
        <th class="text-left p-2">Row</th><th class="text-left p-2">Make</th><th class="text-left p-2">Model</th>
        <th class="text-left p-2">Storage</th><th class="text-left p-2">Colour</th><th class="text-left p-2">Grade</th><th class="text-left p-2">Status</th>
      </tr></thead>
      <tbody>\${rows.map(r => \`<tr style="background:\${r._errors.length ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.05)'}; border-bottom:1px solid var(--border)">
        <td class="p-2 font-mono">\${r._row}</td>
        <td class="p-2">\${r.make}</td><td class="p-2">\${r.model}</td>
        <td class="p-2">\${r.storage}</td><td class="p-2">\${r.colour}</td><td class="p-2 font-bold">\${r.grade}</td>
        <td class="p-2">\${r._errors.length ? '<span class="text-red-400">'+r._errors.join(', ')+'</span>' : '<span class="text-emerald-400">Valid</span>'}</td>
      </tr>\`).join('')}</tbody></table>\`;
    document.getElementById('csv-import-panel').classList.remove('hidden');
  };
  reader.readAsText(file);
  event.target.value = '';
}

async function confirmCsvImport() {
  const rows = (window._csvImportRows || []).filter(r => r._errors.length === 0);
  if (!rows.length) { alert('No valid rows to import'); return; }
  try {
    const res = await axios.post(API + '/device-variants/import', {
      rows: rows.map(r => ({ make: r.make, model: r.model, storage: r.storage, colour: r.colour, grade: r.grade })),
      filename: window._csvImportFilename || 'upload.csv'
    });
    document.getElementById('csv-import-panel').classList.add('hidden');
    // Refresh
    const updated = await axios.get(API + '/device-variants').then(r => r.data);
    window._variantsData = updated;
    const tbody = document.getElementById('variants-tbody');
    if (tbody) tbody.innerHTML = updated.map(v => variantRow(v)).join('');
    const cnt = document.getElementById('var-count');
    if (cnt) cnt.textContent = updated.length + ' variants';
    alert('Imported ' + res.data.imported + ' variants. Skipped ' + res.data.skipped_duplicate + ' duplicates.');
  } catch(err) {
    alert('Import failed: ' + (err.response?.data?.error || err.message));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// GRADE & COLOUR OVERRIDE (Device Detail)
// ══════════════════════════════════════════════════════════════════════════════

function renderOverridePanel(deviceId, fieldChanged, currentValue, purchaseVatCode) {
  const GRADES = ['A+','A','B','C','D','Faulty'];
  const COLOURS = ['Space Black','Deep Purple','Gold','Silver','Midnight','Starlight','Pink','Blue','Green','Red','White','Black','Obsidian','Titanium Black','Titanium White','Phantom Grey','Awesome White','Sierra Blue'];
  const REASONS = [
    { code:'GRADE_DISCREPANCY_QC', label:'Grade Discrepancy Found at QC' },
    { code:'POST_REPAIR_UPGRADE', label:'Post-Repair Grade Upgrade' },
    { code:'POST_REPAIR_DOWNGRADE', label:'Post-Repair Grade Downgrade' },
    { code:'COLOUR_MISMATCH', label:'Colour Mismatch Identified' },
    { code:'CUSTOMER_RETURN_CONDITION', label:'Customer Return — Condition Changed' },
    { code:'OTHER', label:'Other (specify below)' },
  ];
  const isMarginScheme = purchaseVatCode && (purchaseVatCode.includes('MARGIN') || purchaseVatCode.includes('0MARGIN'));
  const marginWarning = (fieldChanged === 'grade' && isMarginScheme) ? \`
    <div class="p-3 rounded-lg border text-xs mb-3" style="background:rgba(251,191,36,0.1); border-color:rgba(251,191,36,0.4); color:#fbbf24">
      <i class="fas fa-exclamation-triangle mr-1"></i>
      <strong>Margin Scheme Notice:</strong> This device is under the Margin Scheme. A grade change may affect the expected sale price and margin VAT calculation. Ensure the landed cost and sale price are reviewed before listing.
    </div>\` : '';
  const options = fieldChanged === 'grade' ? GRADES : COLOURS;
  return \`
    <div id="override-panel-\${fieldChanged}" class="mt-3 p-4 rounded-xl border space-y-3" style="background:var(--bg-card-h); border-color:rgba(251,191,36,0.4)">
      <div class="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
        <i class="fas fa-exclamation-triangle"></i> Attribute Override — \${fieldChanged.charAt(0).toUpperCase()+fieldChanged.slice(1)} Change
      </div>
      \${marginWarning}
      <div>
        <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">New \${fieldChanged.charAt(0).toUpperCase()+fieldChanged.slice(1)} *</label>
        <select id="ov-new-value-\${fieldChanged}" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
          <option value="">Select...</option>
          \${options.filter(o => o !== currentValue).map(o => \`<option value="\${o}">\${o}</option>\`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Reason *</label>
        <select id="ov-reason-\${fieldChanged}" onchange="onOverrideReasonChange('\${fieldChanged}')" class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500" style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)">
          <option value="">Select reason...</option>
          \${REASONS.map(r => \`<option value="\${r.code}">\${r.label}</option>\`).join('')}
        </select>
      </div>
      <div id="ov-notes-wrap-\${fieldChanged}" class="hidden">
        <label class="block text-xs font-semibold mb-1" style="color:var(--text-muted)">Notes * <span class="font-normal">(min 20 characters)</span></label>
        <textarea id="ov-notes-\${fieldChanged}" rows="3" placeholder="Describe the reason in detail..."
          class="w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          style="background:var(--bg-input); border-color:var(--border-light); color:var(--text-primary)"></textarea>
      </div>
      <div id="ov-err-\${fieldChanged}" class="hidden text-xs text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2"></div>
      <div class="flex gap-2">
        <button onclick="submitAttributeOverride('\${deviceId}','\${fieldChanged}')"
          class="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2 text-sm font-semibold">
          <i class="fas fa-check mr-2"></i>Confirm Change
        </button>
        <button onclick="document.getElementById('override-panel-\${fieldChanged}').remove()"
          class="px-4 py-2 rounded-lg text-sm border hover:opacity-80" style="border-color:var(--border-light); color:var(--text-secondary)">Cancel</button>
      </div>
    </div>\`;
}

function onOverrideReasonChange(field) {
  const reason = document.getElementById('ov-reason-' + field)?.value;
  const wrap = document.getElementById('ov-notes-wrap-' + field);
  if (wrap) { if (reason === 'OTHER') wrap.classList.remove('hidden'); else wrap.classList.add('hidden'); }
}

async function submitAttributeOverride(deviceId, fieldChanged) {
  const newValue = document.getElementById('ov-new-value-' + fieldChanged)?.value;
  const reasonCode = document.getElementById('ov-reason-' + fieldChanged)?.value;
  const notes = document.getElementById('ov-notes-' + fieldChanged)?.value || '';
  const errEl = document.getElementById('ov-err-' + fieldChanged);
  errEl.classList.add('hidden');
  if (!newValue) { errEl.textContent = 'Please select a new value'; errEl.classList.remove('hidden'); return; }
  if (!reasonCode) { errEl.textContent = 'Please select a reason'; errEl.classList.remove('hidden'); return; }
  if (reasonCode === 'OTHER' && notes.length < 20) { errEl.textContent = 'Notes must be at least 20 characters when reason is "Other"'; errEl.classList.remove('hidden'); return; }
  try {
    await axios.post(API + '/devices/' + deviceId + '/override', { field_changed: fieldChanged, new_value: newValue, reason_code: reasonCode, notes });
    document.getElementById('override-panel-' + fieldChanged)?.remove();
    // Update displayed value
    const displayEl = document.getElementById('device-' + fieldChanged + '-display');
    if (displayEl) displayEl.textContent = newValue;
    // Show amber timeline event toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-medium text-white border flex items-center gap-2';
    toast.style.cssText = 'background:#92400e; border-color:#f59e0b; min-width:300px';
    toast.innerHTML = '<i class="fas fa-flag text-amber-400"></i> ATTRIBUTE OVERRIDE recorded. Audit event created.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  } catch(err) {
    const msg = err.response?.data?.error || 'Override failed';
    errEl.textContent = msg; errEl.classList.remove('hidden');
  }
}

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

      <!-- P&L Waterfall -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-water text-blue-400"></i> P&L Waterfall — April 2026 MTD</h3>
        <div class="flex items-end gap-2 overflow-x-auto pb-2">
          \${[
            { label: 'Gross Revenue', value: summary.total_gross_revenue, color: 'bg-blue-600', base: 0 },
            { label: 'VAT Collected', value: -summary.total_vat, color: 'bg-amber-600', sign: '-' },
            { label: 'Net Revenue', value: summary.total_net_revenue, color: 'bg-indigo-600', divider: true },
            { label: 'Costs', value: -summary.total_costs, color: 'bg-red-600', sign: '-' },
            { label: 'Net Profit', value: summary.total_net_profit, color: summary.total_net_profit >= 0 ? 'bg-emerald-600' : 'bg-red-700', divider: true },
          ].map(step => {
            const pct = Math.abs(step.value) / summary.total_gross_revenue * 100;
            return \`
              <div class="flex flex-col items-center gap-1.5 min-w-20">
                <div class="text-xs font-bold \${step.value >= 0 ? 'text-white' : 'text-red-400'}">\${step.sign || ''}\${fmt(Math.abs(step.value))}</div>
                <div class="\${step.color} rounded-t-md w-full" style="height:\${Math.max(20, pct * 1.8)}px"></div>
                <div class="text-xs text-gray-400 text-center leading-tight">\${step.label}</div>
                \${step.divider ? '<div class="w-full border-t border-gray-600 mt-1"></div>' : ''}
              </div>
            \`;
          }).join('')}
        </div>
      </div>

      <!-- MTD Integration Panel -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white flex items-center gap-2"><i class="fas fa-link text-purple-400"></i> HMRC MTD Integration</h3>
          <button onclick="navigateTo('mtd')" class="text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-external-link-alt mr-1"></i>Open MTD Returns</button>
        </div>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-xs text-gray-400 mb-1">VAT on Sales</div>
            <div class="font-bold text-amber-400">\${fmt(summary.total_vat)}</div>
            <div class="text-xs text-gray-500 mt-1">→ MTD Box 1</div>
          </div>
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-xs text-gray-400 mb-1">Net Sales Value</div>
            <div class="font-bold text-white">\${fmt(summary.total_net_revenue)}</div>
            <div class="text-xs text-gray-500 mt-1">→ MTD Box 6</div>
          </div>
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-xs text-gray-400 mb-1">Avg Margin</div>
            <div class="font-bold \${summary.avg_margin_percent >= 20 ? 'text-emerald-400' : 'text-amber-400'}">\${summary.avg_margin_percent}%</div>
            <div class="text-xs text-gray-500 mt-1">Target: ≥20%</div>
          </div>
          <div class="bg-gray-800/50 rounded-lg p-3">
            <div class="text-xs text-gray-400 mb-1">Period</div>
            <div class="font-bold text-blue-300">\${summary.period}</div>
            <div class="text-xs text-gray-500 mt-1">Q2 2026 Open</div>
          </div>
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

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: SUPPLIER ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════

async function renderSupplierAnalytics() {
  const data = await axios.get(API + '/supplier-analytics').then(r => r.data);
  const { metrics, ...summary } = data;
  window._supplierMetrics = metrics;

  const riskColor = (label) => ({ LOW: 'text-emerald-400', MEDIUM: 'text-amber-400', HIGH: 'text-orange-400', CRITICAL: 'text-red-400' }[label] || 'text-gray-400');
  const riskBg = (label) => ({ LOW: 'bg-emerald-500/20 border-emerald-500/30', MEDIUM: 'bg-amber-500/20 border-amber-500/30', HIGH: 'bg-orange-500/20 border-orange-500/30', CRITICAL: 'bg-red-500/20 border-red-500/30' }[label] || 'bg-gray-500/20');

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 xl:grid-cols-5 gap-4">
        \${statCard('Total Suppliers', summary.total_suppliers, 'fa-building', 'bg-blue-600', \`\${summary.active_suppliers} active\`)}
        \${statCard('Total Spend', fmt(summary.total_spend), 'fa-pound-sign', 'bg-purple-600', 'All time')}
        \${statCard('Devices Sourced', summary.total_devices_from_suppliers, 'fa-mobile-alt', 'bg-indigo-600', 'All batches')}
        \${statCard('Avg QC Pass Rate', summary.avg_qc_pass_rate + '%', 'fa-microscope', summary.avg_qc_pass_rate >= 90 ? 'bg-emerald-600' : 'bg-amber-600', 'Active suppliers')}
        \${statCard('Highest Risk', 'CRITICAL', 'fa-exclamation-triangle', 'bg-red-600', 'Horizon Devices')}
      </div>

      <!-- Insights Bar -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div class="bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-5 py-3 flex items-start gap-3">
          <i class="fas fa-trophy text-emerald-400 mt-0.5"></i>
          <div>
            <div class="text-sm font-semibold text-emerald-300">Best Margin Supplier</div>
            <div class="text-xs text-gray-400 mt-0.5">\${summary.highest_margin_supplier}</div>
          </div>
        </div>
        <div class="bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-3 flex items-start gap-3">
          <i class="fas fa-shield-alt text-red-400 mt-0.5"></i>
          <div>
            <div class="text-sm font-semibold text-red-300">Highest Risk Supplier</div>
            <div class="text-xs text-gray-400 mt-0.5">\${summary.highest_risk_supplier}</div>
          </div>
        </div>
      </div>

      <!-- Supplier Cards -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-5" id="supplier-analytics-grid">
        \${metrics.map(m => \`
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 card-hover cursor-pointer" onclick="showSupplierDetail('\${m.supplier_id}')">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center font-bold text-white text-sm">\${m.name.substring(0,2)}</div>
                <div>
                  <div class="font-bold text-white">\${m.name}</div>
                  <div class="text-xs text-gray-400">\${m.country} · \${m.vat_number || 'No VAT'} \${!m.is_active ? '<span class="text-red-400 ml-1">INACTIVE</span>' : ''}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400 mb-1">Risk Score</div>
                <div class="flex items-center gap-1.5">
                  <div class="text-xl font-bold \${riskColor(m.risk_label)}">\${m.risk_score}</div>
                  <span class="text-xs px-2 py-0.5 rounded-full border \${riskBg(m.risk_label)} \${riskColor(m.risk_label)}">\${m.risk_label}</span>
                </div>
              </div>
            </div>

            <!-- Risk bar -->
            <div class="mb-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1"><span>Risk Score</span><span>\${m.risk_score}/100</span></div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="h-2 rounded-full \${m.risk_score >= 75 ? 'bg-red-500' : m.risk_score >= 50 ? 'bg-amber-500' : m.risk_score >= 25 ? 'bg-blue-500' : 'bg-emerald-500'}" style="width:\${m.risk_score}%"></div>
              </div>
            </div>

            <!-- Metrics Grid -->
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="bg-gray-800/70 rounded-lg p-2.5 text-center">
                <div class="text-lg font-bold text-white">\${m.batch_count}</div>
                <div class="text-xs text-gray-400">Batches</div>
              </div>
              <div class="bg-gray-800/70 rounded-lg p-2.5 text-center">
                <div class="text-lg font-bold text-white">\${m.device_count}</div>
                <div class="text-xs text-gray-400">Devices</div>
              </div>
              <div class="bg-gray-800/70 rounded-lg p-2.5 text-center">
                <div class="text-lg font-bold text-white">\${fmt(m.avg_cost_per_device)}</div>
                <div class="text-xs text-gray-400">Avg Cost</div>
              </div>
            </div>

            <!-- Quality bar -->
            <div class="mb-3">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>QC Pass Rate</span>
                <span class="\${m.qc_pass_rate >= 90 ? 'text-emerald-400' : m.qc_pass_rate >= 75 ? 'text-amber-400' : 'text-red-400'} font-bold">\${m.qc_pass_rate}%</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="h-2 rounded-full \${m.qc_pass_rate >= 90 ? 'bg-emerald-500' : m.qc_pass_rate >= 75 ? 'bg-amber-500' : 'bg-red-500'} progress-bar" style="width:\${m.qc_pass_rate}%"></div>
              </div>
            </div>

            <!-- Stats row -->
            <div class="flex flex-wrap gap-3 text-xs text-gray-400 border-t border-gray-800 pt-3">
              <span><i class="fas fa-exclamation-circle text-red-400 mr-1"></i>\${m.defect_count} defects</span>
              <span><i class="fas fa-undo text-orange-400 mr-1"></i>\${m.return_count} returns</span>
              <span><i class="fas fa-tools text-amber-400 mr-1"></i>\${m.repair_triggered_count} repairs</span>
              <span><i class="fas fa-pound-sign text-amber-400 mr-1"></i>\${fmt(m.repair_cost_total)} repair cost</span>
              \${m.opr_device_count > 0 ? \`<span class="text-cyan-400"><i class="fas fa-globe-europe mr-1"></i>\${m.opr_device_count} in OPR</span>\` : ''}
              \${m.locked_device_count > 0 ? \`<span class="text-red-400"><i class="fas fa-lock mr-1"></i>\${m.locked_device_count} locked</span>\` : ''}
            </div>

            <!-- Margin (if sold) -->
            \${m.units_sold > 0 ? \`
              <div class="mt-3 grid grid-cols-3 gap-2 bg-gray-800/40 rounded-lg p-3">
                <div class="text-center"><div class="text-xs text-gray-400">Units Sold</div><div class="font-bold text-white">\${m.units_sold}</div></div>
                <div class="text-center"><div class="text-xs text-gray-400">Revenue</div><div class="font-bold text-white">\${fmt(m.gross_revenue)}</div></div>
                <div class="text-center"><div class="text-xs text-gray-400">Avg Margin</div><div class="font-bold \${m.avg_margin_percent >= 20 ? 'text-emerald-400' : m.avg_margin_percent >= 0 ? 'text-amber-400' : 'text-red-400'}">\${m.avg_margin_percent.toFixed(1)}%</div></div>
              </div>
            \` : '<div class="mt-3 text-center text-xs text-gray-500 py-2 bg-gray-800/30 rounded-lg">No units sold yet from this supplier</div>'}
          </div>
        \`).join('')}
      </div>

      <!-- Comparison Chart -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-bar text-blue-400"></i> Supplier Comparison — QC Pass Rate vs Risk Score</h3>
        <canvas id="supplierChart" height="120"></canvas>
      </div>

      <!-- OPR Exposure -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-globe-europe text-cyan-400"></i> OPR Exposure by Supplier</h3>
        \${table(
          ['Supplier', 'OPR Batches', 'Devices in OPR', 'Risk Value (Landed Cost)', 'Status'],
          metrics.map(m => [
            \`<span class="text-white font-medium">\${m.name}</span>\`,
            m.opr_batch_count > 0 ? \`<span class="text-cyan-400 font-bold">\${m.opr_batch_count}</span>\` : '<span class="text-gray-600">—</span>',
            m.opr_device_count > 0 ? \`<span class="text-cyan-400">\${m.opr_device_count}</span>\` : '<span class="text-gray-600">—</span>',
            m.opr_risk_value > 0 ? \`<span class="text-amber-400 font-bold">\${fmt(m.opr_risk_value)}</span>\` : '<span class="text-gray-600">—</span>',
            m.opr_batch_count > 0 ? '<span class="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">ACTIVE</span>' : '<span class="text-xs text-gray-600">None</span>',
          ])
        )}
      </div>
    </div>
  \`;

  setTimeout(() => renderSupplierChart(metrics), 100);
}

function renderSupplierChart(metrics) {
  const ctx = document.getElementById('supplierChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: metrics.map(m => m.name),
      datasets: [
        { label: 'QC Pass Rate %', data: metrics.map(m => m.qc_pass_rate), backgroundColor: '#10b98166', borderColor: '#10b981', borderWidth: 1.5, yAxisID: 'y' },
        { label: 'Risk Score', data: metrics.map(m => m.risk_score), backgroundColor: '#ef444466', borderColor: '#ef4444', borderWidth: 1.5, yAxisID: 'y2' },
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#9ca3af', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#6b7280' }, grid: { color: '#1f2937' } },
        y: { position: 'left', min: 0, max: 100, ticks: { color: '#10b981', callback: v => v + '%' }, grid: { color: '#1f2937' } },
        y2: { position: 'right', min: 0, max: 100, ticks: { color: '#ef4444' }, grid: { drawOnChartArea: false } },
      }
    }
  });
}

async function showSupplierDetail(supplierId) {
  const m = await axios.get(API + '/supplier-analytics/' + supplierId).then(r => r.data);
  const riskColor = { LOW: 'text-emerald-400', MEDIUM: 'text-amber-400', HIGH: 'text-orange-400', CRITICAL: 'text-red-400' }[m.risk_label] || 'text-gray-400';
  const body = \`
    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div><div class="text-xs text-gray-400">Country</div><div class="text-white">\${m.country}</div></div>
        <div><div class="text-xs text-gray-400">VAT Number</div><div class="text-white font-mono">\${m.vat_number || '—'}</div></div>
        <div><div class="text-xs text-gray-400">Status</div><div>\${m.is_active ? '<span class="text-emerald-400">Active</span>' : '<span class="text-red-400">Inactive</span>'}</div></div>
        <div><div class="text-xs text-gray-400">Risk Score</div><div class="font-bold \${riskColor}">\${m.risk_score}/100 (\${m.risk_label})</div></div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-xs text-gray-400">Total Spend</div><div class="text-lg font-bold text-white">\${fmt(m.total_purchases)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-xs text-gray-400">Devices</div><div class="text-lg font-bold text-white">\${m.device_count}</div></div>
        <div class="bg-gray-800 rounded-lg p-3 text-center"><div class="text-xs text-gray-400">QC Pass Rate</div><div class="text-lg font-bold \${m.qc_pass_rate >= 90 ? 'text-emerald-400' : m.qc_pass_rate >= 75 ? 'text-amber-400' : 'text-red-400'}">\${m.qc_pass_rate}%</div></div>
      </div>

      <div>
        <div class="text-xs font-semibold text-gray-400 uppercase mb-2">Quality & Returns</div>
        <div class="grid grid-cols-4 gap-2 text-center">
          <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Defects</div><div class="font-bold text-red-400">\${m.defect_count}</div></div>
          <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Returns</div><div class="font-bold text-orange-400">\${m.return_count}</div></div>
          <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Repairs</div><div class="font-bold text-amber-400">\${m.repair_triggered_count}</div></div>
          <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Repair Cost</div><div class="font-bold text-amber-400">\${fmt(m.repair_cost_total)}</div></div>
        </div>
      </div>

      \${m.units_sold > 0 ? \`
        <div>
          <div class="text-xs font-semibold text-gray-400 uppercase mb-2">Margin Performance</div>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Units Sold</div><div class="font-bold text-white">\${m.units_sold}</div></div>
            <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Net Profit</div><div class="font-bold text-emerald-400">\${fmt(m.net_profit)}</div></div>
            <div class="bg-gray-800 rounded-lg p-2"><div class="text-xs text-gray-400">Avg Margin</div><div class="font-bold \${m.avg_margin_percent >= 20 ? 'text-emerald-400' : 'text-amber-400'}">\${m.avg_margin_percent.toFixed(1)}%</div></div>
          </div>
          <div class="mt-2 text-xs text-gray-400">Best: <span class="text-emerald-400">\${m.best_device}</span> · Worst: <span class="text-red-400">\${m.worst_device}</span></div>
        </div>
      \` : ''}

      \${m.opr_device_count > 0 ? \`
        <div class="bg-cyan-900/20 border border-cyan-700/40 rounded-lg p-3">
          <div class="text-xs font-semibold text-cyan-300 mb-1">OPR Exposure</div>
          <div class="text-sm text-gray-300">\${m.opr_device_count} device(s) in active OPR · Risk value: <span class="text-amber-400 font-bold">\${fmt(m.opr_risk_value)}</span></div>
        </div>
      \` : ''}
    </div>
  \`;
  openModal('Supplier Detail: ' + m.name, body);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: HMRC MTD VAT RETURNS
// ══════════════════════════════════════════════════════════════════════════════

async function renderMTD() {
  const returns = await axios.get(API + '/mtd-returns').then(r => r.data);
  window._mtdReturns = returns;

  const statusColor = { DRAFT: 'text-gray-400', REVIEW_PENDING: 'text-amber-400', MANAGER_APPROVED: 'text-blue-400', SUBMITTED: 'text-cyan-400', ACCEPTED: 'text-emerald-400', REJECTED: 'text-red-400', AMENDED: 'text-purple-400' };
  const statusBg = { DRAFT: 'bg-gray-500/20 border-gray-500/40', REVIEW_PENDING: 'bg-amber-500/20 border-amber-500/40', MANAGER_APPROVED: 'bg-blue-500/20 border-blue-500/40', SUBMITTED: 'bg-cyan-500/20 border-cyan-500/40', ACCEPTED: 'bg-emerald-500/20 border-emerald-500/40', REJECTED: 'bg-red-500/20 border-red-500/40', AMENDED: 'bg-purple-500/20 border-purple-500/40' };

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- Non-Negotiable Controls -->
      <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
        <div class="flex items-center gap-2 mb-3"><i class="fas fa-shield-alt text-blue-400"></i><span class="text-sm font-semibold text-blue-300">MTD Non-Negotiable Controls</span></div>
        <div class="grid grid-cols-2 xl:grid-cols-4 gap-2 text-xs text-gray-400">
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> VAT period must be locked before submission</div>
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> Manager approval required before submission</div>
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> Box 3 = Box 1 + Box 2 validation enforced</div>
          <div class="flex items-center gap-1.5"><i class="fas fa-check text-emerald-400"></i> HMRC receipt ID stored on acceptance</div>
        </div>
      </div>

      <!-- Submission Workflow -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-stream text-blue-400"></i> MTD Submission Workflow</h3>
        <div class="flex items-center gap-1 overflow-x-auto pb-2">
          \${['Lock VAT Period', 'Auto-Calculate 9 Boxes', 'Accountant Review', 'Manager Approval', 'Submit to HMRC API', 'HMRC Acceptance', 'Payment / Refund'].map((step, i) => \`
            <div class="flex items-center gap-1 flex-shrink-0">
              <div class="px-3 py-2 rounded-lg text-xs font-medium \${i === 0 ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50' : i === 6 ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50' : 'bg-gray-800 text-gray-300 border border-gray-700'}">\${step}</div>
              \${i < 6 ? '<i class="fas fa-chevron-right text-gray-600 text-xs"></i>' : ''}
            </div>
          \`).join('')}
        </div>
      </div>

      <!-- Returns List -->
      <div class="space-y-5">
        \${returns.map(r => {
          const sc = statusColor[r.status] || 'text-gray-400';
          const sb = statusBg[r.status] || 'bg-gray-500/20 border-gray-500/40';
          const payable = r.box_5 > 0;
          return \`
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 card-hover">
              <!-- Return Header -->
              <div class="flex items-start justify-between mb-5">
                <div>
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-xs font-mono text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">\${r.return_id}</span>
                    <span class="text-xs px-2.5 py-1 rounded-full border \${sb} \${sc} font-semibold">\${r.status}</span>
                    \${r.finalised ? '<span class="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30"><i class="fas fa-lock mr-1"></i>Finalised</span>' : '<span class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30"><i class="fas fa-lock-open mr-1"></i>Open</span>'}
                  </div>
                  <div class="text-white font-bold text-lg">VAT Period: \${r.period_start} – \${r.period_end}</div>
                  <div class="text-sm text-gray-400 mt-0.5">Period Key: <span class="font-mono text-gray-300">\${r.period_key}</span> · Due: <span class="text-white">\${fmtDate(r.payment_due_date)}</span></div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-400 mb-1">Box 5 — \${payable ? 'Amount Payable' : 'Reclaimable'}</div>
                  <div class="text-2xl font-bold \${payable ? 'text-red-400' : 'text-emerald-400'}">\${payable ? '+' : ''}\${fmt(r.box_5)}</div>
                </div>
              </div>

              <!-- 9 Box Grid -->
              <div class="mb-5">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">HMRC 9-Box Return</div>
                <div class="grid grid-cols-3 xl:grid-cols-9 gap-2">
                  \${[1,2,3,4,5,6,7,8,9].map(box => {
                    const val = r['box_' + box];
                    const highlight = box === 5 ? (val > 0 ? 'border-red-500/50 bg-red-900/20' : 'border-emerald-500/50 bg-emerald-900/20') : 'border-gray-700 bg-gray-800/50';
                    const boxLabels = { 1: 'Output VAT', 2: 'EC VAT', 3: 'Total VAT Due', 4: 'Input VAT', 5: 'Net VAT', 6: 'Net Sales', 7: 'Net Purchases', 8: 'EC Supplies', 9: 'EC Acquisitions' };
                    return \`<div class="rounded-lg border \${highlight} p-2.5 text-center">
                      <div class="text-xs text-gray-400 mb-0.5">Box \${box}</div>
                      <div class="text-xs text-gray-500 mb-1" style="font-size:0.6rem">\${boxLabels[box]}</div>
                      <div class="font-bold \${box === 5 && val > 0 ? 'text-red-400' : box === 5 ? 'text-emerald-400' : 'text-white'} text-sm">\${fmt(val)}</div>
                    </div>\`;
                  }).join('')}
                </div>
              </div>

              <!-- Validation Panel -->
              \${(r.validation_errors.length > 0 || r.validation_warnings.length > 0) ? \`
                <div class="mb-4 space-y-2">
                  \${r.validation_errors.map(e => \`
                    <div class="flex items-start gap-2 bg-red-900/20 border border-red-700/40 rounded-lg p-2.5">
                      <i class="fas fa-times-circle text-red-400 text-sm mt-0.5"></i>
                      <span class="text-sm text-red-300">\${e}</span>
                    </div>
                  \`).join('')}
                  \${r.validation_warnings.map(w => \`
                    <div class="flex items-start gap-2 bg-amber-900/20 border border-amber-700/40 rounded-lg p-2.5">
                      <i class="fas fa-exclamation-triangle text-amber-400 text-sm mt-0.5"></i>
                      <span class="text-sm text-amber-300">\${w}</span>
                    </div>
                  \`).join('')}
                </div>
              \` : r.status !== 'DRAFT' ? \`<div class="mb-4 flex items-center gap-2 bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-2.5"><i class="fas fa-check-circle text-emerald-400"></i><span class="text-sm text-emerald-300">All validation checks passed</span></div>\` : ''}

              <!-- Approval Trail -->
              <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                \${[
                  { label: 'Prepared by', who: r.prepared_by, when: r.prepared_at, icon: 'fa-user-edit' },
                  { label: 'Reviewed by', who: r.reviewed_by, when: r.reviewed_at, icon: 'fa-search' },
                  { label: 'Approved by', who: r.approved_by, when: r.approved_at, icon: 'fa-user-shield' },
                  { label: 'Submitted', who: r.submitted_at ? 'HMRC API' : null, when: r.submitted_at, icon: 'fa-paper-plane' },
                ].map(step => \`
                  <div class="bg-gray-800/50 rounded-lg p-3">
                    <div class="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><i class="fas \${step.icon} text-xs"></i>\${step.label}</div>
                    \${step.who ? \`
                      <div class="text-sm text-white truncate">\${step.who}</div>
                      <div class="text-xs text-gray-500">\${step.when ? new Date(step.when).toLocaleDateString('en-GB') : ''}</div>
                    \` : '<div class="text-sm text-gray-600">Pending</div>'}
                  </div>
                \`).join('')}
              </div>

              <!-- HMRC Details (if submitted) -->
              \${r.hmrc_receipt_id ? \`
                <div class="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-3 mb-4 grid grid-cols-3 gap-3 text-xs">
                  <div><div class="text-gray-400">HMRC Receipt ID</div><div class="font-mono text-emerald-300">\${r.hmrc_receipt_id}</div></div>
                  <div><div class="text-gray-400">Correlation ID</div><div class="font-mono text-gray-300">\${r.hmrc_correlation_id}</div></div>
                  <div><div class="text-gray-400">Processing Date</div><div class="text-white">\${fmtDate(r.hmrc_processing_date)}</div></div>
                </div>
              \` : ''}

              <!-- Actions -->
              <div class="flex flex-wrap gap-2 pt-3 border-t border-gray-800">
                \${r.status === 'DRAFT' ? \`
                  <button onclick="alert('📋 Running full 9-box validation...')" class="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-check-double mr-1"></i>Validate Return</button>
                  <button onclick="alert('📤 Sending for accountant review...')" class="text-xs bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-search mr-1"></i>Submit for Review</button>
                \` : ''}
                \${r.status === 'REVIEW_PENDING' ? \`<button onclick="alert('✅ Manager approval recorded')" class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-user-shield mr-1"></i>Approve (Manager)</button>\` : ''}
                \${r.status === 'MANAGER_APPROVED' ? \`<button onclick="submitMTDReturn('\${r.return_id}')" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-paper-plane mr-1"></i>Submit to HMRC</button>\` : ''}
                \${r.status === 'ACCEPTED' ? \`
                  <button onclick="alert('📄 Generating VAT return PDF...')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-file-pdf mr-1"></i>Download PDF</button>
                  <button onclick="alert('📤 Exported to Xero / QuickBooks')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-sync mr-1"></i>Export to Accounting</button>
                \` : ''}
                <button onclick="navigateTo('vat')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-landmark mr-1"></i>View VAT Engine</button>
                <button onclick="navigateTo('audit')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-history mr-1"></i>View Audit Trail</button>
              </div>
            </div>
          \`;
        }).join('')}
      </div>
    </div>
  \`;
}

async function submitMTDReturn(returnId) {
  if (!confirm('Submit this VAT return to HMRC MTD API? This action cannot be undone.')) return;
  try {
    const res = await axios.post(API + '/mtd-returns/' + returnId + '/submit');
    const d = res.data;
    alert('VAT return accepted by HMRC! Receipt ID: ' + d.receipt_id + ' | Processing Date: ' + d.processing_date + '. Page will refresh.');
    renderMTD();
  } catch (err) {
    const e = err.response?.data;
    if (e?.errors?.length) {
      alert('Submission failed - Validation errors: ' + e.errors.join('; '));
    } else {
      alert('Submission failed: ' + (e?.error || 'Unknown error'));
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: AUDIT LOG
// ══════════════════════════════════════════════════════════════════════════════

async function renderAuditLog() {
  const [logData, statsData] = await Promise.all([
    axios.get(API + '/audit-log?limit=50').then(r => r.data),
    axios.get(API + '/audit-log/stats/summary').then(r => r.data),
  ]);
  window._auditEntries = logData.entries;

  const sevColor = { INFO: 'text-blue-400', WARNING: 'text-amber-400', CRITICAL: 'text-red-400', SECURITY: 'text-purple-400' };
  const sevBg = { INFO: 'bg-blue-500/20 border-blue-500/30', WARNING: 'bg-amber-500/20 border-amber-500/30', CRITICAL: 'bg-red-500/20 border-red-500/30', SECURITY: 'bg-purple-500/20 border-purple-500/30' };
  const sevIcon = { INFO: 'fa-info-circle', WARNING: 'fa-exclamation-triangle', CRITICAL: 'fa-exclamation-circle', SECURITY: 'fa-shield-alt' };

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- Controls Reminder -->
      <div class="bg-gray-800/60 border border-gray-700/50 rounded-xl px-5 py-3 flex items-center gap-3">
        <i class="fas fa-lock text-gray-400"></i>
        <span class="text-sm text-gray-300">Audit log is <strong>immutable</strong> — no entries can be modified or deleted. All write operations across every module are recorded automatically. Retention: <strong>2 years</strong> per HMRC policy.</span>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div class="text-xs text-gray-400 mb-1">Total Events</div>
          <div class="text-2xl font-bold text-white">\${statsData.total}</div>
          <div class="text-xs text-gray-500">All modules</div>
        </div>
        \${['CRITICAL', 'WARNING', 'SECURITY'].map(sev => \`
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div class="text-xs text-gray-400 mb-1">\${sev}</div>
            <div class="text-2xl font-bold \${sevColor[sev]}">\${statsData.bySeverity[sev] || 0}</div>
            <div class="text-xs text-gray-500">Events</div>
          </div>
        \`).join('')}
      </div>

      <!-- Module breakdown -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-chart-bar text-blue-400"></i> Events by Module</h3>
        <div class="flex flex-wrap gap-2">
          \${Object.entries(statsData.byModule).sort((a,b) => b[1] - a[1]).map(([mod, count]) => \`
            <div class="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <span class="text-xs font-semibold text-gray-300">\${mod}</span>
              <span class="text-xs font-bold text-blue-400 bg-blue-900/30 rounded-full px-2 py-0.5">\${count}</span>
            </div>
          \`).join('')}
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="flex items-center gap-3 flex-wrap">
        <select id="audit-module-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterAuditLog()">
          <option value="">All Modules</option>
          \${['INVENTORY','QC','OPR','ORDERS','VAT','FINTECH','SUPPLIERS','SUPPORT','COURIER','RMA','REPAIRS','SYSTEM','AUTH'].map(m => \`<option value="\${m}">\${m}</option>\`).join('')}
        </select>
        <select id="audit-severity-filter" class="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300" onchange="filterAuditLog()">
          <option value="">All Severities</option>
          <option value="INFO">INFO</option>
          <option value="WARNING">WARNING</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="SECURITY">SECURITY</option>
        </select>
        <div class="text-xs text-gray-400 ml-auto">Showing \${logData.entries.length} of \${logData.total} events</div>
      </div>

      <!-- Audit Table -->
      <div id="audit-table">
        \${renderAuditTable(logData.entries)}
      </div>
    </div>
  \`;
}

function renderAuditTable(entries) {
  const sevColor = { INFO: 'text-blue-400', WARNING: 'text-amber-400', CRITICAL: 'text-red-400', SECURITY: 'text-purple-400' };
  const sevBg = { INFO: 'bg-blue-500/20 border-blue-500/30', WARNING: 'bg-amber-500/20 border-amber-500/30', CRITICAL: 'bg-red-500/20 border-red-500/30', SECURITY: 'bg-purple-500/20 border-purple-500/30' };
  const sevIcon = { INFO: 'fa-info-circle', WARNING: 'fa-exclamation-triangle', CRITICAL: 'fa-exclamation-circle', SECURITY: 'fa-shield-alt' };
  return table(
    ['Timestamp', 'Severity', 'Module', 'Actor', 'Action', 'Entity'],
    entries.map(e => [
      \`<div class="text-xs text-gray-400 whitespace-nowrap">\${new Date(e.timestamp).toLocaleString('en-GB')}</div>\`,
      \`<span class="status-badge inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-xs \${sevBg[e.severity] || 'bg-gray-500/20'} \${sevColor[e.severity] || 'text-gray-400'}"><i class="fas \${sevIcon[e.severity] || 'fa-info'} text-xs"></i> \${e.severity}</span>\`,
      \`<span class="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">\${e.module}</span>\`,
      \`<div class="text-xs"><div class="text-white">\${e.actor === 'system' ? '<i class="fas fa-robot mr-1 text-blue-400"></i>system' : e.actor}</div><div class="text-gray-500">\${e.actor_role}</div></div>\`,
      \`<div class="text-xs text-gray-300 max-w-xs truncate" title="\${e.action}">\${e.action}</div>\`,
      \`<div class="text-xs"><div class="text-gray-400">\${e.entity_type}</div><div class="font-mono text-blue-300 text-xs">\${e.entity_id}</div></div>\`,
    ]),
    true
  );
}

async function filterAuditLog() {
  const module = document.getElementById('audit-module-filter')?.value || '';
  const severity = document.getElementById('audit-severity-filter')?.value || '';
  let params = [];
  if (module) params.push('module=' + module);
  if (severity) params.push('severity=' + severity);
  const url = API + '/audit-log' + (params.length ? '?' + params.join('&') : '');
  const data = await axios.get(url).then(r => r.data);
  document.getElementById('audit-table').innerHTML = renderAuditTable(data.entries);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: IMEI / BARCODE SCANNER
// ══════════════════════════════════════════════════════════════════════════════

function renderScanner() {
  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- Scanner Header Banner -->
      <div class="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-blue-700/40 rounded-xl p-5">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-3xl">
            <i class="fas fa-barcode text-white"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">IMEI & Barcode Scanner</h2>
            <p class="text-sm text-blue-300">Scan or enter IMEI/barcode to look up existing devices, batches, or create new intake records</p>
          </div>
          <div class="ml-auto text-right">
            <div class="text-xs text-gray-400">Non-Negotiable</div>
            <div class="text-xs text-blue-300 font-medium">Duplicate IMEI blocked globally</div>
          </div>
        </div>
      </div>

      <!-- Lookup Panel -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Scanner Input -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-search text-blue-400"></i> Quick Lookup
          </h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 mb-1 block">IMEI / Barcode / Batch ID</label>
              <div class="flex gap-2">
                <input id="scanner-input" type="text" placeholder="Enter or scan IMEI..." class="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" onkeydown="if(event.key==='Enter') scanLookup()">
                <button onclick="scanLookup()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"><i class="fas fa-search mr-1"></i>Scan</button>
              </div>
            </div>
            <div id="scanner-result"></div>
          </div>

          <!-- Quick IMEI examples -->
          <div class="mt-4 pt-4 border-t border-gray-800">
            <div class="text-xs text-gray-500 mb-2">Demo — click to scan:</div>
            <div class="flex flex-wrap gap-2">
              \${[
                ['354678901234567', 'DEV001 iPhone 14 Pro'],
                ['354678901234568', 'DEV002 iPhone 14 Pro'],
                ['354678901234574', 'DEV008 iPhone 13 (Locked)'],
                ['PB2026-001', 'Batch TS-INV-4421'],
                ['999000111222333', 'New IMEI (not in system)'],
              ].map(([val, label]) => \`
                <button onclick="document.getElementById('scanner-input').value='\${val}';scanLookup()" class="text-xs bg-gray-800 hover:bg-blue-900/50 border border-gray-700 hover:border-blue-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition-colors">
                  <i class="fas fa-barcode mr-1 text-gray-500"></i>\${label}
                </button>
              \`).join('')}
            </div>
          </div>
        </div>

        <!-- Intake Form (appears after lookup) -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-plus-circle text-emerald-400"></i> New Device Intake
          </h3>
          <div id="intake-form">
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-barcode text-4xl mb-3 text-gray-700"></i>
              <div class="text-sm">Scan an IMEI to pre-fill intake form</div>
              <div class="text-xs mt-1 text-gray-600">Or use the form below for manual entry</div>
            </div>
            <button onclick="showManualIntake()" class="w-full mt-2 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 py-2 rounded-lg">
              <i class="fas fa-edit mr-1"></i> Manual Intake Entry
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Scans Log -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
          <i class="fas fa-history text-purple-400"></i> Recent Scan Activity
        </h3>
        <div id="scan-log" class="space-y-2">
          <div class="text-sm text-gray-500 text-center py-4">No scans in this session</div>
        </div>
      </div>

      <!-- IMEI Check Rules -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${[
          ['fa-shield-alt', 'blue', 'Duplicate Block', 'Global IMEI deduplication across all tenants. Re-registration blocked.'],
          ['fa-lock', 'red', 'Lock Detection', 'iCloud/FRP lock check at intake — flags to LOCKED status immediately.'],
          ['fa-exchange-alt', 'amber', 'IMEI Mismatch', 'Return IMEI must match sold IMEI exactly. Mismatch freezes RMA.'],
          ['fa-fingerprint', 'emerald', 'Audit Trail', 'Every IMEI scan logged with actor, timestamp and outcome.'],
        ].map(([icon, color, title, desc]) => \`
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="fas \${icon} text-\${color}-400"></i>
              <span class="text-sm font-semibold text-white">\${title}</span>
            </div>
            <p class="text-xs text-gray-400">\${desc}</p>
          </div>
        \`).join('')}
      </div>
    </div>
  \`;
}

async function scanLookup() {
  const val = document.getElementById('scanner-input')?.value.trim();
  if (!val) return;
  const resultEl = document.getElementById('scanner-result');
  resultEl.innerHTML = '<div class="flex items-center gap-2 text-sm text-gray-400"><div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>Looking up...</div>';

  // Log the scan
  const logEl = document.getElementById('scan-log');
  const logEntry = document.createElement('div');
  logEntry.className = 'flex items-center justify-between bg-gray-800 rounded-lg p-2.5 text-xs';
  logEntry.innerHTML = \`<div class="flex items-center gap-2"><i class="fas fa-barcode text-blue-400"></i><span class="font-mono text-gray-300">\${val}</span></div><span class="text-gray-500">\${new Date().toLocaleTimeString('en-GB')}</span>\`;
  logEl.innerHTML = '';
  logEl.prepend(logEntry);

  try {
    const res = await axios.post(API + '/scanner/lookup', { imei: val });
    const d = res.data;

    if (d.found && d.type === 'device') {
      const dev = d.device;
      const actionColor = d.action === 'READY_TO_SHIP' ? 'emerald' : d.action === 'NEEDS_QC' ? 'amber' : 'blue';
      logEntry.querySelector('i').className = 'fas fa-check-circle text-emerald-400';
      resultEl.innerHTML = \`
        <div class="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-3"><i class="fas fa-check-circle text-emerald-400"></i><span class="font-semibold text-white">Device Found</span></div>
          <div class="grid grid-cols-2 gap-2 text-xs mb-3">
            <div><span class="text-gray-400">Device ID:</span> <span class="text-white font-mono">\${dev.device_id}</span></div>
            <div><span class="text-gray-400">IMEI:</span> <span class="text-white font-mono">\${dev.imei_primary || dev.imei || 'N/A'}</span></div>
            <div><span class="text-gray-400">Make/Model:</span> <span class="text-white">\${dev.make} \${dev.model}</span></div>
            <div><span class="text-gray-400">Grade:</span> <span class="text-white">\${dev.grade}</span></div>
            <div><span class="text-gray-400">Status:</span> <span class="text-\${actionColor}-400 font-semibold">\${dev.status}</span></div>
            <div><span class="text-gray-400">Location:</span> <span class="text-white">\${dev.location || 'N/A'}</span></div>
          </div>
          <div class="flex gap-2">
            <button onclick="navigateTo('inventory')" class="text-xs bg-\${actionColor}-700 hover:bg-\${actionColor}-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-arrow-right mr-1"></i>\${d.action.replace(/_/g, ' ')}</button>
            <button onclick="navigateTo('qc')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">View QC</button>
          </div>
        </div>
      \`;
    } else if (d.found && d.type === 'batch') {
      const b = d.batch;
      logEntry.querySelector('i').className = 'fas fa-check-circle text-blue-400';
      resultEl.innerHTML = \`
        <div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2"><i class="fas fa-box text-blue-400"></i><span class="font-semibold text-white">Purchase Batch Found</span></div>
          <div class="grid grid-cols-2 gap-2 text-xs mb-3">
            <div><span class="text-gray-400">Batch:</span> <span class="text-white font-mono">\${b.purchase_batch_id}</span></div>
            <div><span class="text-gray-400">Supplier:</span> <span class="text-white">\${b.supplier_name}</span></div>
            <div><span class="text-gray-400">Invoice:</span> <span class="text-white font-mono">\${b.external_invoice_ref}</span></div>
            <div><span class="text-gray-400">Devices:</span> <span class="text-white">\${b.device_count}</span></div>
          </div>
          <button onclick="navigateTo('suppliers')" class="text-xs bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-arrow-right mr-1"></i>View Batch</button>
        </div>
      \`;
    } else {
      // New IMEI — show intake form
      logEntry.querySelector('i').className = 'fas fa-plus-circle text-amber-400';
      resultEl.innerHTML = \`
        <div class="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4">
          <div class="flex items-center gap-2 mb-2"><i class="fas fa-info-circle text-amber-400"></i><span class="font-semibold text-white">New IMEI — Not in System</span></div>
          \${d.suggestion ? \`<div class="text-xs text-amber-300 mb-3">\${d.suggestion}</div>\` : ''}
          <button onclick="showIntakeForm('\${val}', '\${d.inferred_make||''}', '\${d.inferred_model||''}')" class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-plus mr-1"></i>Create Intake Record</button>
        </div>
      \`;
      showIntakeForm(val, d.inferred_make || '', d.inferred_model || '');
    }
  } catch (err) {
    resultEl.innerHTML = '<div class="text-sm text-red-400"><i class="fas fa-times-circle mr-1"></i>Lookup failed</div>';
  }
}

function showIntakeForm(imei = '', make = '', model = '') {
  document.getElementById('intake-form').innerHTML = \`
    <form onsubmit="submitIntake(event)" class="space-y-3 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs text-gray-400 mb-1 block">IMEI *</label>
          <input name="imei" value="\${imei}" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Make *</label>
          <input name="make" value="\${make}" required placeholder="Apple / Samsung / Google" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Model *</label>
          <input name="model" value="\${model}" required placeholder="iPhone 14 Pro" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Storage *</label>
          <select name="storage" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">Select...</option>
            \${['64GB','128GB','256GB','512GB','1TB'].map(s => \`<option value="\${s}">\${s}</option>\`).join('')}
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Grade *</label>
          <select name="grade" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">Select...</option>
            \${['A+','A','B','C','D','F'].map(g => \`<option value="\${g}">\${g}</option>\`).join('')}
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Network *</label>
          <select name="network" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            \${['UNLOCKED','EE','O2','Vodafone','Three','AT&T','T-Mobile'].map(n => \`<option value="\${n}">\${n}</option>\`).join('')}
          </select>
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Colour *</label>
          <input name="colour" required placeholder="Space Black" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-1 block">Unit Cost (£)</label>
          <input name="unit_cost" type="number" step="0.01" placeholder="0.00" class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
        </div>
      </div>
      <div>
        <label class="text-xs text-gray-400 mb-1 block">Purchase Batch *</label>
        <select name="purchase_batch_id" required class="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          <option value="PB2026-001">PB2026-001 — TechSource Ltd (TS-INV-4421)</option>
          <option value="PB2026-002">PB2026-002 — Mobile Wholesale EU (MWEU-INV-8821)</option>
          <option value="PB2026-003">PB2026-003 — PhoneFlip Direct (PF-INV-2201)</option>
          <option value="PB2026-004">PB2026-004 — TechSource Ltd (TS-INV-4490)</option>
        </select>
      </div>
      <div id="intake-status"></div>
      <div class="flex gap-2 pt-2">
        <button type="submit" class="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg text-sm font-medium"><i class="fas fa-plus-circle mr-1"></i>Create Intake Record</button>
        <button type="button" onclick="cancelIntake()" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg">Cancel</button>
      </div>
    </form>
  \`;
}

function showManualIntake() { showIntakeForm(); }

function cancelIntake() {
  const el = document.getElementById('intake-form');
  if (el) el.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-barcode text-4xl mb-3 text-gray-700"></i><div class="text-sm">Form cancelled — scan an IMEI to start</div></div>';
}

async function submitIntake(e) {
  e.preventDefault();
  const form = e.target;
  const statusEl = document.getElementById('intake-status');
  const data = Object.fromEntries(new FormData(form));
  data.unit_cost = parseFloat(data.unit_cost) || 0;
  statusEl.innerHTML = '<div class="flex items-center gap-2 text-xs text-gray-400"><div class="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>Creating record...</div>';
  try {
    const res = await axios.post(API + '/scanner/intake', data);
    statusEl.innerHTML = \`
      <div class="bg-emerald-900/20 border border-emerald-700/40 rounded-lg p-3 text-xs">
        <div class="flex items-center gap-2 text-emerald-300 font-semibold mb-1"><i class="fas fa-check-circle"></i>\${res.data.message}</div>
        <div class="text-gray-400">Device ID: <span class="font-mono text-white">\${res.data.device_id}</span> · Status: <span class="text-amber-300">\${res.data.status}</span></div>
        <button onclick="navigateTo('qc')" class="mt-2 text-xs bg-amber-700 hover:bg-amber-800 text-white px-2 py-1 rounded">Go to QC Queue <i class="fas fa-arrow-right ml-1"></i></button>
      </div>
    \`;
    form.reset();
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || 'Intake failed';
    const code = err.response?.data?.error;
    statusEl.innerHTML = \`<div class="bg-red-900/20 border border-red-700/40 rounded-lg p-3 text-xs text-red-300"><i class="fas fa-times-circle mr-1"></i>\${code === 'DUPLICATE_IMEI' ? '🛑 DUPLICATE IMEI BLOCKED — ' : ''}\${msg}</div>\`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: MARKETPLACE HUB
// ══════════════════════════════════════════════════════════════════════════════

async function renderMarketplace() {
  const [integrations, summary] = await Promise.all([
    axios.get(API + '/marketplace').then(r => r.data),
    axios.get(API + '/marketplace/stats/summary').then(r => r.data),
  ]);
  window._integrations = integrations;

  const statusColor = { CONNECTED: 'text-emerald-400', DISCONNECTED: 'text-gray-400', ERROR: 'text-red-400', RATE_LIMITED: 'text-amber-400', PENDING_AUTH: 'text-blue-400' };
  const statusBg = { CONNECTED: 'bg-emerald-500/20 border-emerald-500/40', DISCONNECTED: 'bg-gray-500/20 border-gray-500/40', ERROR: 'bg-red-500/20 border-red-500/40', RATE_LIMITED: 'bg-amber-500/20 border-amber-500/40', PENDING_AUTH: 'bg-blue-500/20 border-blue-500/40' };
  const syncColor = { SYNCED: 'text-emerald-400', SYNCING: 'text-blue-400', FAILED: 'text-red-400', PENDING: 'text-amber-400', PARTIAL: 'text-amber-400' };

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Connected', summary.connected + ' / ' + summary.total, 'fa-plug', 'bg-emerald-700', 'Marketplaces')}
        \${statCard('Errors', summary.errors, 'fa-exclamation-triangle', summary.errors > 0 ? 'bg-red-700' : 'bg-gray-700', 'Require action')}
        \${statCard('Orders Synced', fmtNum(summary.total_orders_synced), 'fa-shopping-cart', 'bg-blue-700', 'Total all time')}
        \${statCard('Pending Orders', summary.pending_orders, 'fa-clock', summary.pending_orders > 0 ? 'bg-amber-700' : 'bg-gray-700', 'Awaiting processing')}
      </div>

      \${summary.errors > 0 ? \`
        <div class="bg-red-900/20 border border-red-700/40 rounded-xl p-4 flex items-start gap-3">
          <i class="fas fa-exclamation-triangle text-red-400 text-lg mt-0.5"></i>
          <div>
            <div class="font-semibold text-red-300 mb-1">Action Required — Marketplace Integration Error</div>
            <div class="text-sm text-gray-300">eBay OAuth token expired on 2026-04-09. Order sync and listing updates are failing. Re-authenticate to restore connectivity.</div>
            <button onclick="reconnectMarketplace('MKT-INT-003')" class="mt-2 text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-key mr-1"></i>Re-authenticate eBay</button>
          </div>
        </div>
      \` : ''}

      <!-- Integration Cards -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-5" id="mkt-cards">
        \${integrations.map(m => \`
          <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 card-hover" id="mkt-card-\${m.integration_id}">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm" style="background-color:\${m.logo_color}20; border: 1px solid \${m.logo_color}40">
                  <i class="fas fa-store" style="color:\${m.logo_color}"></i>
                </div>
                <div>
                  <div class="font-semibold text-white">\${m.marketplace_name}</div>
                  <div class="text-xs text-gray-400">\${m.store_name || 'No store name'}</div>
                </div>
              </div>
              <span class="text-xs px-2.5 py-1 rounded-full border \${statusBg[m.status]} \${statusColor[m.status]} font-semibold">\${m.status}</span>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-2 mb-4">
              <div class="bg-gray-800/50 rounded-lg p-2.5 text-center">
                <div class="text-xs text-gray-400">Orders (Total)</div>
                <div class="font-bold text-white">\${fmtNum(m.total_orders_synced)}</div>
              </div>
              <div class="bg-gray-800/50 rounded-lg p-2.5 text-center">
                <div class="text-xs text-gray-400">Pending</div>
                <div class="font-bold \${m.pending_orders > 0 ? 'text-amber-400' : 'text-white'}">\${m.pending_orders}</div>
              </div>
              <div class="bg-gray-800/50 rounded-lg p-2.5 text-center">
                <div class="text-xs text-gray-400">Fee Rate</div>
                <div class="font-bold text-amber-400">\${m.fee_percent}%</div>
              </div>
              <div class="bg-gray-800/50 rounded-lg p-2.5 text-center">
                <div class="text-xs text-gray-400">API Quota</div>
                <div class="font-bold \${m.api_quota_used / m.api_quota_limit > 0.8 ? 'text-red-400' : 'text-white'}">\${m.api_quota_used}/\${m.api_quota_limit}</div>
              </div>
            </div>

            <!-- Quota Bar -->
            <div class="mb-3">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>API Quota</span>
                <span>\${Math.round(m.api_quota_used / m.api_quota_limit * 100)}%</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-1.5">
                <div class="h-1.5 rounded-full \${m.api_quota_used / m.api_quota_limit > 0.8 ? 'bg-red-500' : 'bg-blue-500'} progress-bar" style="width:\${Math.round(m.api_quota_used / m.api_quota_limit * 100)}%"></div>
              </div>
            </div>

            <!-- Last Sync -->
            <div class="flex items-center justify-between text-xs mb-3">
              <span class="text-gray-400">Last sync:</span>
              <span class="\${syncColor[m.last_sync_status]} font-medium">\${m.last_sync_at ? new Date(m.last_sync_at).toLocaleString('en-GB') : 'Never'}</span>
            </div>

            <!-- Errors -->
            \${m.recent_errors.filter(e => !e.resolved).length > 0 ? \`
              <div class="bg-red-900/20 border border-red-700/40 rounded-lg p-2 mb-3 text-xs">
                <div class="text-red-300 font-semibold mb-1"><i class="fas fa-times-circle mr-1"></i>\${m.recent_errors.filter(e => !e.resolved).length} active error(s)</div>
                \${m.recent_errors.filter(e => !e.resolved).map(err => \`<div class="text-gray-400 truncate">\${err.message}</div>\`).join('')}
              </div>
            \` : ''}

            <!-- Auto-Features -->
            <div class="flex gap-1.5 flex-wrap mb-3">
              \${m.auto_vat_code ? '<span class="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-700/30">Auto VAT</span>' : ''}
              \${m.auto_drc_check ? '<span class="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full border border-blue-700/30">DRC Check</span>' : ''}
              \${m.auto_export_detect ? '<span class="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full border border-purple-700/30">Export Detect</span>' : ''}
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-3 border-t border-gray-800">
              \${m.status === 'CONNECTED' ? \`
                <button onclick="syncMarketplace('\${m.integration_id}')" class="flex-1 text-xs bg-blue-700 hover:bg-blue-800 text-white py-1.5 rounded-lg"><i class="fas fa-sync mr-1"></i>Sync Now</button>
              \` : \`
                <button onclick="reconnectMarketplace('\${m.integration_id}')" class="flex-1 text-xs bg-amber-700 hover:bg-amber-800 text-white py-1.5 rounded-lg"><i class="fas fa-key mr-1"></i>Reconnect</button>
              \`}
              <button onclick="openMktDetail('\${m.integration_id}')" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-eye"></i></button>
            </div>
          </div>
        \`).join('')}
      </div>

      <!-- Sync History -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-list text-gray-400"></i> Recent Sync Log</h3>
        <div class="space-y-2">
          \${integrations.flatMap(m => m.sync_log.map(l => ({ ...l, marketplace: m.marketplace_name, logo_color: m.logo_color }))).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10).map(l => \`
            <div class="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0 text-xs">
              <div class="w-6 h-6 rounded flex items-center justify-center font-bold" style="background-color:\${l.logo_color}20"><i class="fas fa-store text-xs" style="color:\${l.logo_color}"></i></div>
              <span class="text-gray-400 w-24">\${l.marketplace}</span>
              <span class="text-gray-300">\${l.direction === 'INBOUND' ? '↓' : '↑'} \${l.entity_type}</span>
              <span class="text-white">\${l.count} records</span>
              <span class="\${l.status === 'SYNCED' ? 'text-emerald-400' : l.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'}">\${l.status}</span>
              <span class="text-gray-500 ml-auto">\${new Date(l.timestamp).toLocaleString('en-GB')}</span>
              <span class="text-gray-600">\${l.duration_ms}ms</span>
            </div>
          \`).join('')}
        </div>
      </div>
    </div>
  \`;
}

async function syncMarketplace(id) {
  try {
    const res = await axios.post(API + '/marketplace/' + id + '/sync');
    const d = res.data;
    alert(\`✅ Sync complete — \${d.orders_synced} orders pulled in \${d.duration_ms}ms. Page will refresh.\`);
    renderMarketplace();
  } catch (err) {
    alert('Sync failed: ' + (err.response?.data?.error || 'Unknown error'));
  }
}

async function reconnectMarketplace(id) {
  const mkt = window._integrations?.find(m => m.integration_id === id);
  if (!confirm('Re-authenticate ' + (mkt?.marketplace_name || id) + '? This will simulate a successful OAuth reconnection.')) return;
  try {
    const res = await axios.post(API + '/marketplace/' + id + '/reconnect');
    alert('\u2705 ' + (mkt?.marketplace_name || id) + ' reconnected \u2014 status: ' + res.data.status + '. Page will refresh.');
    renderMarketplace();
  } catch (err) {
    alert('Reconnection failed');
  }
}

function openMktDetail(id) {
  const m = window._integrations?.find(x => x.integration_id === id);
  if (!m) return;
  openModal(\`Integration Detail: \${m.marketplace_name}\`, \`
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        \${[
          ['Seller ID', m.seller_id || 'N/A'],
          ['Region', m.region || 'N/A'],
          ['Connected', m.connected_at ? new Date(m.connected_at).toLocaleDateString('en-GB') : 'N/A'],
          ['Token Expiry', m.credentials_expiry ? new Date(m.credentials_expiry).toLocaleDateString('en-GB') : 'N/A'],
          ['Sync Interval', m.sync_interval_mins + ' mins'],
          ['Fee Rate', m.fee_percent + '%'],
        ].map(([k, v]) => \`<div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">\${k}</div><div class="text-white font-medium truncate">\${v}</div></div>\`).join('')}
      </div>
      \${m.webhook_url ? \`<div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Webhook URL</div><div class="font-mono text-xs text-blue-300 break-all">\${m.webhook_url}</div></div>\` : ''}
      \${m.sync_log.length > 0 ? \`
        <div><div class="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Sync History</div>
        \${m.sync_log.map(l => \`<div class="flex items-center justify-between py-1.5 border-b border-gray-800 text-xs"><span class="text-gray-300">\${l.direction} \${l.entity_type}</span><span class="text-white">\${l.count}</span><span class="\${l.status === 'SYNCED' ? 'text-emerald-400' : 'text-red-400'}">\${l.status}</span><span class="text-gray-500">\${new Date(l.timestamp).toLocaleString('en-GB')}</span></div>\`).join('')}
        </div>
      \` : ''}
    </div>
  \`);
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE: TENANT MANAGEMENT (SaaS)
// ══════════════════════════════════════════════════════════════════════════════

async function renderTenants() {
  const [tenantList, summary] = await Promise.all([
    axios.get(API + '/tenants').then(r => r.data),
    axios.get(API + '/tenants/summary').then(r => r.data),
  ]);
  window._tenants = tenantList;

  const planColor = { STARTER: 'text-gray-400', PROFESSIONAL: 'text-blue-400', ENTERPRISE: 'text-purple-400', WHITE_LABEL: 'text-amber-400' };
  const planBg = { STARTER: 'bg-gray-500/20 border-gray-600/40', PROFESSIONAL: 'bg-blue-500/20 border-blue-600/40', ENTERPRISE: 'bg-purple-500/20 border-purple-600/40', WHITE_LABEL: 'bg-amber-500/20 border-amber-600/40' };
  const statusColor = { ACTIVE: 'text-emerald-400', TRIAL: 'text-blue-400', SUSPENDED: 'text-red-400', CANCELLED: 'text-gray-400', PENDING: 'text-amber-400' };
  const statusBg = { ACTIVE: 'bg-emerald-500/20 border-emerald-500/40', TRIAL: 'bg-blue-500/20 border-blue-500/40', SUSPENDED: 'bg-red-500/20 border-red-500/40', CANCELLED: 'bg-gray-500/20 border-gray-500/40', PENDING: 'bg-amber-500/20 border-amber-500/40' };

  document.getElementById('page-content').innerHTML = \`
    <div class="fade-in space-y-6">

      <!-- SaaS KPIs -->
      <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
        \${statCard('Total Tenants', summary.total_tenants, 'fa-building', 'bg-indigo-700', 'All registered')}
        \${statCard('Active', summary.active_tenants, 'fa-check-circle', 'bg-emerald-700', 'Paying subscribers')}
        \${statCard('MRR', fmt(summary.mrr), 'fa-pound-sign', 'bg-blue-700', 'Monthly recurring')}
        \${statCard('ARR', fmt(summary.arr), 'fa-chart-line', 'bg-purple-700', 'Annual run rate')}
      </div>

      <!-- Plan Breakdown + Trial -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-layer-group text-blue-400"></i> Plan Distribution</h3>
          <div class="space-y-2">
            \${Object.entries(summary.plan_breakdown).map(([plan, count]) => \`
              <div class="flex items-center justify-between">
                <span class="\${planColor[plan] || 'text-gray-300'} text-sm">\${plan}</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 bg-gray-800 rounded-full h-1.5">
                    <div class="h-1.5 rounded-full bg-blue-500 progress-bar" style="width:\${Math.round(count / summary.total_tenants * 100)}%"></div>
                  </div>
                  <span class="text-white font-bold text-sm w-6 text-right">\${count}</span>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-clock text-amber-400"></i> Status Overview</h3>
          <div class="space-y-2">
            \${[['ACTIVE', summary.active_tenants, 'emerald'], ['TRIAL', summary.trial_tenants, 'blue'], ['SUSPENDED', summary.suspended_tenants, 'red']].map(([status, count, color]) => \`
              <div class="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <span class="text-\${color}-400 text-sm font-medium">\${status}</span>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-\${color}-400"></div>
                  <span class="text-white font-bold">\${count}</span>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 class="font-semibold text-white mb-4 flex items-center gap-2"><i class="fas fa-mobile-alt text-purple-400"></i> Usage Metrics</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-gray-400">Avg Devices / Tenant</span><span class="text-white font-bold">\${summary.avg_devices_per_tenant}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">Total MRR</span><span class="text-emerald-400 font-bold">\${fmt(summary.mrr)}</span></div>
            <div class="flex justify-between"><span class="text-gray-400">ARR Projection</span><span class="text-blue-400 font-bold">\${fmt(summary.arr)}</span></div>
          </div>
        </div>
      </div>

      <!-- Tenant Table -->
      <div class="bg-gray-900 border border-gray-800 rounded-xl">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h3 class="font-semibold text-white flex items-center gap-2"><i class="fas fa-users text-indigo-400"></i> Tenant Registry</h3>
          <div class="flex gap-2">
            <select id="tenant-status-filter" onchange="filterTenants()" class="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select id="tenant-plan-filter" onchange="filterTenants()" class="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none">
              <option value="">All Plans</option>
              <option value="STARTER">Starter</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
        </div>
        <div id="tenant-table" class="divide-y divide-gray-800">
          \${renderTenantRows(tenantList)}
        </div>
      </div>
    </div>
  \`;
}

function renderTenantRows(list) {
  const planColor = { STARTER: 'bg-gray-500/20 border-gray-600/40 text-gray-400', PROFESSIONAL: 'bg-blue-500/20 border-blue-600/40 text-blue-400', ENTERPRISE: 'bg-purple-500/20 border-purple-600/40 text-purple-400', WHITE_LABEL: 'bg-amber-500/20 border-amber-600/40 text-amber-400' };
  const statusColor = { ACTIVE: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', TRIAL: 'bg-blue-500/20 border-blue-500/40 text-blue-400', SUSPENDED: 'bg-red-500/20 border-red-500/40 text-red-400', CANCELLED: 'bg-gray-500/20 border-gray-500/40 text-gray-400', PENDING: 'bg-amber-500/20 border-amber-500/40 text-amber-400' };
  return list.map(t => \`
    <div class="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/50 transition-colors cursor-pointer" onclick="openTenantDetail('\${t.tenant_id}')">
      <div class="w-8 h-8 bg-indigo-900/50 border border-indigo-700/40 rounded-lg flex items-center justify-center text-indigo-400 text-xs font-bold">\${t.company_name.substring(0, 2).toUpperCase()}</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-white truncate">\${t.company_name}</div>
        <div class="text-xs text-gray-400">\${t.subdomain}.refurbiq.io · \${t.contact_email}</div>
      </div>
      <div class="hidden xl:flex items-center gap-2">
        <span class="text-xs px-2 py-0.5 rounded-full border \${planColor[t.plan] || 'text-gray-400'} font-medium">\${t.plan}</span>
        <span class="text-xs px-2 py-0.5 rounded-full border \${statusColor[t.status] || 'text-gray-400'} font-medium">\${t.status}</span>
      </div>
      <div class="text-right hidden xl:block">
        <div class="text-sm text-white font-bold">\${fmt(t.monthly_fee)}/mo</div>
        <div class="text-xs text-gray-400">\${t.usage.devices_total} devices</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-400">\${t.users.length} user(s)</div>
        <div class="text-xs text-gray-500">Since \${new Date(t.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}</div>
      </div>
      \${t.status === 'SUSPENDED' ? '<div class="text-xs text-red-400 font-semibold"><i class="fas fa-ban"></i></div>' : ''}
    </div>
  \`).join('');
}

function filterTenants() {
  const status = document.getElementById('tenant-status-filter')?.value;
  const plan = document.getElementById('tenant-plan-filter')?.value;
  let list = window._tenants || [];
  if (status) list = list.filter(t => t.status === status);
  if (plan) list = list.filter(t => t.plan === plan);
  document.getElementById('tenant-table').innerHTML = renderTenantRows(list);
}

function openTenantDetail(id) {
  const t = window._tenants?.find(x => x.tenant_id === id);
  if (!t) return;
  const planColor = { STARTER: 'text-gray-400', PROFESSIONAL: 'text-blue-400', ENTERPRISE: 'text-purple-400', WHITE_LABEL: 'text-amber-400' };
  const statusColor = { ACTIVE: 'text-emerald-400', TRIAL: 'text-blue-400', SUSPENDED: 'text-red-400', CANCELLED: 'text-gray-400', PENDING: 'text-amber-400' };
  openModal(\`Tenant: \${t.company_name}\`, \`
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Tenant ID</div><div class="font-mono text-white">\${t.tenant_id}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Company No.</div><div class="font-mono text-white">\${t.company_number || 'N/A'}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">VAT Number</div><div class="font-mono text-white">\${t.vat_number || 'N/A'}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Subdomain</div><div class="text-blue-300">\${t.subdomain}.refurbiq.io</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Plan</div><div class="\${planColor[t.plan]||'text-white'} font-bold">\${t.plan}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Status</div><div class="\${statusColor[t.status]||'text-white'} font-bold">\${t.status}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Monthly Fee</div><div class="text-emerald-400 font-bold">\${fmt(t.monthly_fee)}</div></div>
        <div class="bg-gray-800 rounded-lg p-3"><div class="text-xs text-gray-400">Renewal</div><div class="text-white">\${t.subscription_renewal ? new Date(t.subscription_renewal).toLocaleDateString('en-GB') : 'N/A'}</div></div>
      </div>

      <div>
        <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Usage</div>
        <div class="grid grid-cols-3 gap-2">
          \${[
            ['Devices', t.usage.devices_total, t.usage.devices_limit],
            ['Users', t.usage.active_users, t.usage.users_limit],
            ['Storage', t.usage.storage_mb + ' MB', t.usage.storage_limit_mb + ' MB'],
          ].map(([label, used, limit]) => \`
            <div class="bg-gray-800 rounded-lg p-3 text-center">
              <div class="text-xs text-gray-400">\${label}</div>
              <div class="font-bold text-white">\${used}</div>
              <div class="text-xs text-gray-600">/ \${limit}</div>
            </div>
          \`).join('')}
        </div>
      </div>

      \${t.users.length > 0 ? \`
        <div>
          <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Users (\${t.users.length})</div>
          \${t.users.map(u => \`
            <div class="flex items-center justify-between py-2 border-b border-gray-800 text-xs">
              <div><div class="text-white">\${u.name}</div><div class="text-gray-400">\${u.email}</div></div>
              <div class="text-right"><div class="text-blue-400">\${u.role}</div><div class="text-gray-500">\${u.last_login ? 'Last: ' + new Date(u.last_login).toLocaleDateString('en-GB') : 'Never logged in'}</div></div>
            </div>
          \`).join('')}
        </div>
      \` : ''}

      \${t.notes ? \`<div class="bg-amber-900/20 border border-amber-700/40 rounded-lg p-3 text-xs text-amber-300"><i class="fas fa-sticky-note mr-1"></i>\${t.notes}</div>\` : ''}

      <div class="flex gap-2 pt-2 border-t border-gray-800">
        \${t.status !== 'SUSPENDED' ? \`<button onclick="suspendTenant('\${t.tenant_id}')" class="text-xs bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-ban mr-1"></i>Suspend</button>\` : \`<button onclick="reactivateTenant('\${t.tenant_id}')" class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg"><i class="fas fa-check mr-1"></i>Reactivate</button>\`}
        <button onclick="closeModal()" class="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">Close</button>
      </div>
    </div>
  \`);
}

async function suspendTenant(id) {
  if (!confirm('Suspend this tenant? All access will be blocked immediately.')) return;
  try {
    await axios.patch(API + '/tenants/' + id + '/status', { status: 'SUSPENDED' });
    closeModal();
    alert('Tenant suspended. Page will refresh.');
    renderTenants();
  } catch (err) { alert('Failed to suspend tenant'); }
}

async function reactivateTenant(id) {
  if (!confirm('Reactivate this tenant?')) return;
  try {
    await axios.patch(API + '/tenants/' + id + '/status', { status: 'ACTIVE' });
    closeModal();
    alert('Tenant reactivated. Page will refresh.');
    renderTenants();
  } catch (err) { alert('Failed to reactivate tenant'); }
}

// ══════════════════════════════════════════════════════════════════════════════
// SIDEBAR: COLLAPSE / EXPAND
// ══════════════════════════════════════════════════════════════════════════════

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('main-content');
  const ham     = document.getElementById('hamburger-btn');
  const collapsed = sidebar.classList.toggle('collapsed');
  if (collapsed) {
    main.style.marginLeft = '4rem';
    ham.style.display = 'flex';
  } else {
    main.style.marginLeft = '16rem';
    ham.style.display = 'none';
  }
  localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
}

// ══════════════════════════════════════════════════════════════════════════════
// THEME: LIGHT / DARK
// ══════════════════════════════════════════════════════════════════════════════

function applyTheme(light) {
  const body      = document.getElementById('app-body');
  const icon      = document.getElementById('theme-icon');
  const label     = document.getElementById('theme-label');
  if (light) {
    body.classList.add('light-mode');
    if (icon)  { icon.className  = 'fas fa-sun text-xs'; }
    if (label) { label.textContent = 'Light'; }
  } else {
    body.classList.remove('light-mode');
    if (icon)  { icon.className  = 'fas fa-moon text-xs'; }
    if (label) { label.textContent = 'Dark'; }
  }
  // Re-apply active nav highlight so it picks up the new CSS variable values
  const activeNav = document.querySelector('.nav-active');
  if (activeNav) {
    activeNav.style.background = 'var(--nav-active-bg)';
    activeNav.style.color = 'var(--nav-active-text)';
  }
}

function toggleTheme() {
  const isLight = document.getElementById('app-body').classList.contains('light-mode');
  const newLight = !isLight;
  applyTheme(newLight);
  localStorage.setItem('theme', newLight ? 'light' : 'dark');
}

// ══════════════════════════════════════════════════════════════════════════════
// INIT: restore persisted preferences
// ══════════════════════════════════════════════════════════════════════════════

function initUI() {
  // Theme
  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme === 'light');

  // Sidebar collapse
  const savedCollapse = localStorage.getItem('sidebarCollapsed');
  if (savedCollapse === '1') {
    const sidebar = document.getElementById('sidebar');
    const main    = document.getElementById('main-content');
    const ham     = document.getElementById('hamburger-btn');
    sidebar.classList.add('collapsed');
    main.style.marginLeft = '4rem';
    if (ham) ham.style.display = 'flex';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  initUI();
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
