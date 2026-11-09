(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const state = {
    token: sessionStorage.getItem('bb_token') || '',
    user: null,
    view: 'overview',
    market: 'GLOBAL',
    dashboard: null,
    incidents: [],
    partners: [],
    runs: [],
    notices: [],
    profiles: [],
    settings: null,
    selectedIncidentId: null,
    selectedIncident: null,
    trace: null,
    traceQuery: 'ING-4502',
    simulation: null,
    loading: false,
  };

  const icons = {
    logo: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 17.5 10.8 4l2.5 5.3 2.2-3.6L21 17.5H4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M7.3 17.5 10.8 11l3.4 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M11 17.5h3.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    overview: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="3.5" width="7" height="4" rx="1.2" stroke="currentColor" stroke-width="1.6"/><rect x="13.5" y="10.5" width="7" height="10" rx="1.5" stroke="currentColor" stroke-width="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.6"/></svg>',
    incidents: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 3.8h7l4.2 4.3v11.7a1.4 1.4 0 0 1-1.4 1.4H7a1.4 1.4 0 0 1-1.4-1.4V5.2A1.4 1.4 0 0 1 7 3.8Z" stroke="currentColor" stroke-width="1.6"/><path d="M14 4v4.5h4.2M8.5 12h7M8.5 15.5h7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    trace: '<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="6" r="2.3" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="6" r="2.3" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="18" r="2.3" stroke="currentColor" stroke-width="1.6"/><path d="M8.3 6h7.4M7.3 8 10.7 16M16.7 8 13.3 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    agents: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v3M6.2 8.2 4.5 6.5M17.8 8.2l1.7-1.7M4 13h3M17 13h3M7 20h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="7" y="7" width="10" height="10" rx="3" stroke="currentColor" stroke-width="1.6"/><circle cx="10" cy="11" r=".8" fill="currentColor"/><circle cx="14" cy="11" r=".8" fill="currentColor"/><path d="M10 14h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    partners: '<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 19c.4-3 2.2-4.5 5.5-4.5s5.1 1.5 5.5 4.5M16 5.5a2.8 2.8 0 0 1 0 5.5M17 14.5c2.2.4 3.4 1.9 3.7 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    drill: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 18.5V5.5M4 18.5h16M7.5 15l3.2-3.3 2.4 1.8 4.2-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 8.5h2.8v2.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    compliance: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.3 19 6v5.6c0 4.2-2.6 7.1-7 9.1-4.4-2-7-4.9-7-9.1V6l7-2.7Z" stroke="currentColor" stroke-width="1.6"/><path d="m8.7 12.2 2.1 2.1 4.6-4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M19 13.7a7.5 7.5 0 0 0 0-3.4l1.3-1-1.5-2.6-1.6.5a7.2 7.2 0 0 0-2.9-1.7L14 3.8h-3l-.3 1.7a7.2 7.2 0 0 0-2.9 1.7l-1.6-.5-1.5 2.6 1.3 1a7.5 7.5 0 0 0 0 3.4l-1.3 1 1.5 2.6 1.6-.5a7.2 7.2 0 0 0 2.9 1.7l.3 1.7h3l.3-1.7a7.2 7.2 0 0 0 2.9-1.7l1.6.5 1.5-2.6-1.3-1Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 9a6 6 0 0 0-12 0c0 7-2.5 7.5-2.5 9h17C20.5 16.5 18 16 18 9ZM10 21h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 19 6v5.5c0 4.1-2.5 7.1-7 9.5-4.5-2.4-7-5.4-7-9.5V6l7-3Z" stroke="currentColor" stroke-width="1.6"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 8 4.3v9.4L12 21l-8-4.3V7.3L12 3Z" stroke="currentColor" stroke-width="1.6"/><path d="m4 7.3 8 4.4 8-4.4M12 11.7V21" stroke="currentColor" stroke-width="1.6"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 15v4a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.2 4.2L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3.2 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12h4l2.1-6 4 12 2.2-6H21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none"><path d="M10 17 15 12 10 7M15 12H3m10-8h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  };
  const icon = (name) => icons[name] || icons.activity;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(value || 0));
  const timeAgo = (value) => {
    if (!value) return '—';
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };
  const dateShort = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
  const statusPill = (status) => `<span class="pill status ${esc(String(status || '').toLowerCase())}">${esc(String(status || 'open').replaceAll('_',' '))}</span>`;
  const severityPill = (severity) => `<span class="pill ${esc(severity || 'medium')}">${esc(severity || 'medium')}</span>`;
  const countryLabel = (code) => code === 'IN' ? 'India' : code === 'US' ? 'United States' : 'India + US';

  async function api(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (state.token) headers.set('Authorization', `Bearer ${state.token}`);
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(path, { ...options, headers });
    const type = response.headers.get('content-type') || '';
    const body = type.includes('application/json') ? await response.json() : await response.text();
    if (response.status === 401 && state.token) {
      state.token = ''; sessionStorage.removeItem('bb_token'); state.user = null; renderLogin();
    }
    if (!response.ok) throw new Error((body && body.detail) || `Request failed (${response.status})`);
    return body;
  }
  function toast(message, error = false) {
    const region = $('#toast-region');
    region.innerHTML = `<div class="toast ${error ? 'error' : ''}">${esc(message)}</div>`;
    setTimeout(() => { if (region.firstElementChild) region.innerHTML = ''; }, 3900);
  }
  function initials(name) { return String(name || 'BB').split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase(); }

  function renderLogin() {
    $('#app').innerHTML = `
      <div class="login-page">
        <section class="login-story">
          <div class="brand"><div class="brand-mark">${icon('logo')}</div><div><div class="brand-name" style="color:#f4f8f4">BatchBridge AI</div><div class="brand-sub">Recall operations</div></div></div>
          <div class="login-story-content">
            <div class="login-kicker">Food traceability · Recall intelligence</div>
            <h1>When every batch matters, know exactly where it went.</h1>
            <p>One operating picture for ingredient genealogy, finished goods, distribution partners and recall response — built for teams working across India and the United States.</p>
            <div class="login-art">
              <div class="login-art-top"><span>LOT GENEALOGY / ING-4502</span><span>DEMO NETWORK</span></div>
              <div class="login-art-graph">
                <div class="login-art-node"><span>INGREDIENT</span><strong>ING-4502</strong></div><div class="login-art-line"></div>
                <div class="login-art-node"><span>PRODUCTION</span><strong>2 runs</strong></div><div class="login-art-line"></div>
                <div class="login-art-node"><span>FINISHED GOODS</span><strong>4 lots</strong></div><div class="login-art-line"></div>
                <div class="login-art-node"><span>RECIPIENTS</span><strong>5 partners</strong></div>
              </div>
            </div>
          </div>
          <div class="login-story-foot">Evidence-led operations · Human-approved actions · Auditable by design</div>
        </section>
        <section class="login-form-side">
          <form class="login-form" id="login-form">
            <div class="brand"><div class="brand-mark">${icon('logo')}</div><div><div class="brand-name">BatchBridge AI</div><div class="brand-sub" style="color:#8a9a91">Recall operations</div></div></div>
            <h2>Welcome back</h2><p>Sign in to your organization's recall operations workspace.</p>
            <div class="form-field"><label class="form-label" for="email">Work email</label><input class="input" id="email" name="email" type="email" value="demo@batchbridge.ai" autocomplete="username" required /></div>
            <div class="form-field"><label class="form-label" for="password">Password</label><input class="input" id="password" name="password" type="password" value="BatchBridgeDemo#2026" autocomplete="current-password" required /></div>
            <button class="button primary" type="submit" id="login-submit">Sign in to workspace ${icon('arrow')}</button>
            <div class="demo-credentials"><strong>Demo workspace access</strong><br/>demo@batchbridge.ai &nbsp;·&nbsp; BatchBridgeDemo#2026<br/>Sample supply-chain records are fictional and isolated to this demo tenant.</div>
            <div style="font-size:10px;color:#89978f;text-align:center;margin-top:17px">New organization? <button type="button" class="text-link" data-action="request-workspace">Create a pilot workspace</button></div>
            <div class="login-legal">By continuing, you acknowledge this is an operational prototype. Regulatory profiles are references, not legal advice or official filings.</div>
          </form>
        </section>
      </div>`;
    $('#login-form').addEventListener('submit', onLogin);
  }

  async function onLogin(event) {
    event.preventDefault();
    const button = $('#login-submit');
    button.disabled = true; button.textContent = 'Signing in…';
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('#email').value, password: $('#password').value }) });
      state.token = data.access_token; state.user = data.user; sessionStorage.setItem('bb_token', state.token);
      await loadWorkspace(); renderApp();
    } catch (err) { toast(err.message, true); button.disabled = false; button.innerHTML = `Sign in to workspace ${icon('arrow')}`; }
  }

  async function loadWorkspace() {
    const [dashboard, incidents, partners, runs, notices, profiles, settingsData] = await Promise.all([
      api('/api/dashboard'), api('/api/incidents'), api('/api/partners'), api('/api/agents/runs'), api('/api/notices'), api('/api/compliance/profiles'), api('/api/settings/workspace')
    ]);
    state.dashboard = dashboard; state.incidents = incidents.items; state.partners = partners.items; state.runs = runs.items; state.notices = notices.items; state.profiles = profiles.profiles; state.settings = settingsData;
  }

  function navItem(view, label, ico, count = '') {
    return `<button class="nav-item ${state.view === view ? 'active' : ''}" data-action="navigate" data-view="${view}">${icon(ico)}<span>${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`;
  }
  function renderApp() {
    if (!state.user) { renderLogin(); return; }
    const pending = state.dashboard?.metrics?.pending_approvals || 0;
    const unread = state.dashboard?.metrics?.pending_acknowledgements || 0;
    $('#app').innerHTML = `
      <div class="app-shell">
        <aside class="sidebar" id="sidebar">
          <div class="brand"><div class="brand-mark">${icon('logo')}</div><div><div class="brand-name" style="color:#f4f8f4">BatchBridge AI</div><div class="brand-sub">Recall operations</div></div></div>
          <div class="workspace-switch"><div class="workspace-avatar">NF</div><div class="workspace-meta"><div class="workspace-label">WORKSPACE</div><div class="workspace-name">${esc(state.settings?.tenant?.name || 'Northstar Foods Group')}</div></div>${icon('chevron')}</div>
          <div class="nav-section-label">Operations</div>
          <nav class="nav-list">
            ${navItem('overview','Command center','overview')}
            ${navItem('incidents','Incidents','incidents', state.dashboard?.metrics?.active_incidents || '')}
            ${navItem('traceability','Traceability','trace')}
            ${navItem('agents','Agent activity','agents')}
            ${navItem('partners','Network partners','partners')}
            ${navItem('simulation','Mock recall drill','drill')}
          </nav>
          <div class="nav-section-label" style="margin-top:24px">Governance</div>
          <nav class="nav-list">
            ${navItem('compliance','Regulatory profiles','compliance')}
            ${navItem('settings','Workspace settings','settings')}
          </nav>
          <div class="nav-section-label" style="margin-top:24px">Mission Control UI</div>
          <nav class="nav-list">
            <a href="/stitch/incident_command_triage/code.html" class="nav-item" style="color:#adc6ff;background:rgba(77,142,255,0.08);border:1px solid rgba(77,142,255,0.2);margin-top:4px">${icon('agents')}<span style="font-weight:600">Stitch UI Demo</span><span class="nav-count" style="background:#4d8eff;color:#001a42">NEW</span></a>
          </nav>
          <div class="sidebar-spacer"></div>
          <div class="sidebar-bottom">
            <div class="environment-card"><span class="environment-dot"></span><span>Workspace operational</span></div>
            <div class="sidebar-user"><div class="user-avatar">${initials(state.user.full_name)}</div><div class="user-copy"><div class="user-name">${esc(state.user.full_name)}</div><div class="user-role">${esc(state.user.role.replaceAll('_',' '))}</div></div><button class="sidebar-logout" title="Sign out" data-action="logout">${icon('logout')}</button></div>
          </div>
        </aside>
        <main class="main-area">
          <header class="topbar">
            <button class="mobile-menu" data-action="mobile-menu">☰</button>
            <div class="breadcrumb">Northstar Foods <span style="color:#c3ccc5;margin:0 6px">/</span> <strong>${esc(viewTitle(state.view))}</strong></div>
            <div class="topbar-spacer"></div>
            <a href="/stitch/incident_command_triage/code.html" class="button" style="background:#0f131c;color:#adc6ff;border:1px solid #4d8eff;font-size:11px;font-weight:600;padding:5px 12px;border-radius:6px;display:flex;align-items:center;gap:6px;text-decoration:none"><span style="font-size:13px">✨</span><span>Mission Control (Stitch UI)</span></a>
            <button class="search-trigger" data-action="global-search">${icon('search')}<span class="search-label">Search incidents, lots, partners</span><span class="search-shortcut">⌘ K</span></button>
            <select class="market-select" id="market-select" aria-label="Market filter"><option value="GLOBAL" ${state.market==='GLOBAL'?'selected':''}>All markets</option><option value="IN" ${state.market==='IN'?'selected':''}>India · IN</option><option value="US" ${state.market==='US'?'selected':''}>United States · US</option></select>
            <button class="topbar-icon" title="Pending acknowledgements" data-action="navigate" data-view="partners">${icon('bell')}${unread ? '<span class="notification-dot"></span>' : ''}</button>
          </header>
          <div class="main-content" id="main-content">${renderLoading()}</div>
        </main>
      </div>`;
    $('#market-select').addEventListener('change', async (e) => { state.market = e.target.value; await refreshData(); renderView(); });
    renderView();
  }
  function viewTitle(view) {
    return ({ overview:'Command center', incidents:'Incidents', incident:'Incident detail', traceability:'Traceability', agents:'Agent activity', partners:'Network partners', simulation:'Mock recall drill', compliance:'Regulatory profiles', settings:'Workspace settings' })[view] || 'Command center';
  }
  function renderLoading() { return `<div class="loading-line"></div><div class="empty-state">Loading workspace records…</div>`; }
  async function refreshData() {
    await loadWorkspace();
  }
  async function renderView() {
    const host = $('#main-content'); if (!host) return;
    host.innerHTML = renderLoading();
    try {
      if (state.view === 'overview') host.innerHTML = await renderOverview();
      else if (state.view === 'incidents') host.innerHTML = renderIncidents();
      else if (state.view === 'incident') host.innerHTML = await renderIncidentDetail();
      else if (state.view === 'traceability') host.innerHTML = await renderTraceability();
      else if (state.view === 'agents') host.innerHTML = renderAgents();
      else if (state.view === 'partners') host.innerHTML = renderPartners();
      else if (state.view === 'simulation') host.innerHTML = renderSimulation();
      else if (state.view === 'compliance') host.innerHTML = renderCompliance();
      else if (state.view === 'settings') host.innerHTML = renderSettings();
    } catch (err) { host.innerHTML = `<div class="panel empty-state">${esc(err.message)}<br/><button class="button" style="margin-top:12px" data-action="refresh">Try again</button></div>`; }
  }
  function heading(eyebrow, title, desc, actions = '') {
    return `<div class="page-heading"><div class="page-heading-copy"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><div class="page-description">${desc}</div></div>${actions ? `<div class="heading-actions">${actions}</div>` : ''}</div>`;
  }
  function metric(label, value, foot, ico) {
    return `<div class="metric-card"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon">${icon(ico)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`;
  }
  function incidentTable(items, limit = 6) {
    if (!items.length) return `<div class="empty-state">No incidents match this view.</div>`;
    return `<div class="table-wrap"><table><thead><tr><th>Incident</th><th>Source lot</th><th>Market</th><th>Severity</th><th>Status</th><th>Updated</th></tr></thead><tbody>${items.slice(0,limit).map(x => `<tr class="clickable" data-action="open-incident" data-id="${x.id}"><td><div class="table-primary">${esc(x.title)}</div><div class="table-secondary code-text">${esc(x.code)} · ${esc(x.product_name)}</div></td><td class="code-text">${esc(x.lot_code)}</td><td>${esc(countryLabel(x.market))}</td><td>${severityPill(x.severity)}</td><td>${statusPill(x.status)}</td><td>${timeAgo(x.updated_at)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function activityList(items) {
    if (!items.length) return `<div class="empty-state">No activity recorded yet.</div>`;
    return `<div class="activity-list">${items.map(x => `<div class="activity-item"><div class="activity-mark">${icon(x.actor_type==='agent'?'agents':x.actor_type==='user'?'incidents':'activity')}</div><div class="activity-copy"><div class="activity-text"><strong>${esc(x.actor)}</strong> ${esc(x.detail)}</div><div class="activity-time">${timeAgo(x.created_at)} · ${esc(x.action.replaceAll('_',' '))}</div></div></div>`).join('')}</div>`;
  }
  async function renderOverview() {
    const data = state.dashboard || await api('/api/dashboard');
    const active = [...state.incidents].filter(x => !['closed','contained'].includes(x.status)).sort((a,b) => ({critical:4,high:3,medium:2,low:1}[b.severity]||0)-({critical:4,high:3,medium:2,low:1}[a.severity]||0))[0] || state.incidents[0];
    let trace = null;
    if (active) { try { trace = await api(`/api/traceability/${encodeURIComponent(active.lot_code)}`); } catch (_) {} }
    const shipped = trace?.shipments || [];
    const acked = shipped.filter(x => x.acknowledgement === 'acknowledged').length;
    const ackRate = shipped.length ? Math.round(acked / shipped.length * 100) : 0;
    const pending = data.metrics.pending_approvals;
    const actions = `<button class="button" data-action="navigate" data-view="simulation">Run recall drill</button><button class="button primary" data-action="new-incident">${icon('plus')} New incident</button>`;
    return `${heading('Operations overview','Command center','A live view of product incidents, distribution exposure and recall response.',actions)}
      <div class="metric-grid">
        ${metric('Active incidents',fmt(data.metrics.active_incidents),`${data.metrics.critical_incidents} critical requiring attention`,'incidents')}
        ${metric('Tracked lot records',fmt(data.metrics.tracked_lots),'Ingredient, production and finished goods','box')}
        ${metric('Network partners',fmt(data.metrics.partners),'Across India and the United States','partners')}
        ${metric('Actions awaiting approval',fmt(pending),pending ? '<span class="negative">Human review required</span>' : '<span class="positive">No pending approvals</span>','shield')}
      </div>
      <div class="dashboard-grid">
        <section class="panel">
          <div class="panel-header"><div><div class="panel-title">Priority incident</div><div class="panel-subtitle">The most recently updated open investigation</div></div><div class="panel-header-spacer"></div>${active ? `<button class="text-link" data-action="open-incident" data-id="${active.id}">View full case ${icon('arrow')}</button>` : ''}</div>
          ${active ? `<div class="incident-hero"><div class="incident-hero-top"><div><div class="incident-code">${esc(active.code)} · ${esc(active.lot_code)}</div><div class="incident-title">${esc(active.title)}</div><div class="incident-desc">${esc(active.description)}</div></div><div style="display:flex;flex-direction:column;gap:7px;align-items:flex-end">${severityPill(active.severity)}${statusPill(active.status)}</div></div>
            <div class="incident-meta-row"><div class="meta-item"><span class="meta-label">Product</span><span class="meta-value">${esc(active.product_name)}</span></div><div class="meta-item"><span class="meta-label">Market profile</span><span class="meta-value">${esc(countryLabel(active.market))}</span></div><div class="meta-item"><span class="meta-label">Lot records linked</span><span class="meta-value">${fmt(trace?.metrics?.lots ?? active.impacted_lots)}</span></div><div class="meta-item"><span class="meta-label">Downstream partners</span><span class="meta-value">${fmt(trace?.metrics?.partners ?? active.impacted_partners)}</span></div></div>
            <div class="progress-section"><div class="progress-head"><span>Recall response progress</span><strong>${active.recall_progress || 0}%</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,active.recall_progress || 0))}%"></div></div></div>
            <div class="hero-actions"><button class="button primary" data-action="investigate" data-id="${active.id}">${icon('agents')} Run investigation</button><button class="button" data-action="open-incident" data-id="${active.id}">Open incident workspace ${icon('arrow')}</button></div></div>` : `<div class="empty-state">No active incidents.</div>`}
        </section>
        <section class="panel readiness-panel"><div class="panel-title">Recipient response</div><div class="panel-subtitle">Acknowledgements from mapped shipments</div>
          <div class="readiness-score"><div class="score-ring" style="background:conic-gradient(#4c896b 0deg ${ackRate*3.6}deg,#e8eee9 ${ackRate*3.6}deg 360deg)"><div class="score-center"><div class="score-number">${ackRate}%</div><div class="score-label">ACKNOWLEDGED</div></div></div><div class="score-copy"><strong>${acked} of ${shipped.length} shipments confirmed</strong><p>${shipped.length-acked} recipient response(s) still need follow-up. This is a live count from the demo shipment register.</p></div></div>
          <div class="readiness-checks"><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Source lot in genealogy register</span><span class="check-value">${trace?.found ? 'FOUND' : '—'}</span></div><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Finished-goods links resolved</span><span class="check-value">${trace?.metrics?.finished_lots || 0}</span></div><div class="readiness-check"><span class="check-dot ${shipped.length-acked?'warn':''}">${shipped.length-acked?'!':icon('check')}</span><span>Recipient acknowledgements</span><span class="check-value">${acked}/${shipped.length}</span></div><div class="readiness-check"><span class="check-dot ${pending?'warn':''}">${pending?'!':icon('check')}</span><span>Human approvals outstanding</span><span class="check-value">${pending}</span></div></div>
        </section>
      </div>
      <div class="two-col-grid">
        <section class="panel"><div class="panel-header"><div><div class="panel-title">Recent incidents</div><div class="panel-subtitle">Latest activity across the workspace</div></div><div class="panel-header-spacer"></div><button class="text-link" data-action="navigate" data-view="incidents">All incidents ${icon('arrow')}</button></div>${incidentTable(state.incidents,5)}</section>
        <section class="panel"><div class="panel-header"><div><div class="panel-title">Activity stream</div><div class="panel-subtitle">Recent system and operator events</div></div><div class="panel-header-spacer"></div><span class="pill status contained">Live log</span></div>${activityList(data.activities.slice(0,5))}</section>
      </div>`;
  }

  function renderIncidents() {
    const filtered = state.incidents.filter(x => (state.market === 'GLOBAL' || x.market === state.market || x.market === 'GLOBAL'));
    return `${heading('Operations / case management','Incidents','Investigate a product safety signal from source lot through downstream distribution.',`<button class="button primary" data-action="new-incident">${icon('plus')} Open an incident</button>`)}
      <section class="panel"><div class="filter-row"><div class="filter-search">${icon('search')}<input class="input" id="incident-search" placeholder="Search by incident, product or lot…" /></div><select class="select" id="incident-status"><option value="">All statuses</option><option value="open">Open</option><option value="investigating">Investigating</option><option value="contained">Contained</option><option value="monitoring">Monitoring</option><option value="closed">Closed</option></select><span style="margin-left:auto;color:#9aa69f;font-size:10px">${filtered.length} records</span></div><div id="incident-table">${incidentTable(filtered,100)}</div></section>
      <div class="page-description" style="margin-top:12px">Incident severity and status are operational classifications. A system status does not replace a qualified food-safety or recall decision.</div>`;
  }

  async function renderIncidentDetail() {
    const id = state.selectedIncidentId;
    const data = await api(`/api/incidents/${id}`);
    state.selectedIncident = data;
    let trace = null;
    try { trace = await api(`/api/traceability/${encodeURIComponent(data.incident.lot_code)}`); } catch (_) {}
    state.trace = trace;
    const x = data.incident;
    const actions = data.actions || [];
    const docs = data.documents || [];
    const totalPending = actions.filter(a=>a.status==='pending_approval').length;
    const agentButton = `<button class="button primary" data-action="investigate" data-id="${x.id}">${icon('agents')} Run agent investigation</button>`;
    return `${heading(`Incident / ${esc(x.code)}`,esc(x.title),`${esc(x.product_name)} · Source lot ${esc(x.lot_code)} · Opened ${dateShort(x.created_at)}`,`<button class="button" data-action="navigate" data-view="incidents">Back to incidents</button>${agentButton}`)}
      <div class="detail-layout"><div style="display:flex;flex-direction:column;gap:15px">
        <section class="panel"><div class="incident-hero"><div class="incident-hero-top"><div><div class="incident-code">${esc(x.code)} · ${esc(x.issue_type.replaceAll('_',' '))}</div><div class="incident-title" style="font-size:18px">${esc(x.title)}</div><div class="incident-desc">${esc(x.description)}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:7px">${severityPill(x.severity)}${statusPill(x.status)}</div></div><div class="incident-meta-row"><div class="meta-item"><span class="meta-label">Market</span><span class="meta-value">${esc(countryLabel(x.market))}</span></div><div class="meta-item"><span class="meta-label">Owner</span><span class="meta-value">${esc(x.owner)}</span></div><div class="meta-item"><span class="meta-label">Linked lots</span><span class="meta-value">${trace?.metrics?.lots || 0}</span></div><div class="meta-item"><span class="meta-label">Recipients</span><span class="meta-value">${trace?.metrics?.partners || 0}</span></div><div class="meta-item"><span class="meta-label">Affected finished units</span><span class="meta-value">${fmt(trace?.metrics?.finished_quantity || 0)}</span></div></div></div>
          <div class="detail-section"><div class="detail-section-title">Investigation summary</div>${x.analysis?.summary ? `<p style="font-size:11px;color:#66786e;line-height:1.65;margin:0 0 10px">${esc(x.analysis.summary)}</p>` : `<div class="approval-bar">No investigation has been run yet. Start the agent workflow to resolve the batch genealogy and prepare proposed actions.</div>`}
            ${x.analysis?.findings?.length ? `<div style="display:grid;gap:7px">${x.analysis.findings.map(t=>`<div class="activity-text">• ${esc(t)}</div>`).join('')}</div>`:''}
            ${x.analysis?.uncertainties?.length ? `<div style="margin-top:12px"><div class="meta-label" style="margin-bottom:7px">Unresolved evidence / uncertainty</div>${x.analysis.uncertainties.map(t=>`<div class="activity-text" style="margin:5px 0">⚑ ${esc(t)}</div>`).join('')}</div>`:''}
            <div class="meta-label" style="margin:15px 0 7px">Reasoning source · ${esc(x.analysis?.provider || 'Not run')}</div><div class="code-text">${esc(x.analysis?.model || 'Run an investigation to generate an evidence-linked result.')}</div>
          </div>
          <div class="detail-section"><div class="detail-section-title">Proposed response actions <span class="pill status open" style="margin-left:7px">${totalPending} awaiting review</span></div><div class="approval-bar">AI-generated actions are proposals. Approving a task changes only the local workspace record and explicitly described internal state. This demo does not send external messages, submit regulatory filings or physically stop inventory.</div>
            ${actions.length ? actions.map(a=>`<div class="action-card"><div class="action-card-head"><div class="action-title">${esc(a.title)}</div><span class="pill ${a.risk_level==='high'?'high':'medium'}">${esc(a.risk_level)} risk</span></div><div class="action-description">${esc(a.description)}</div><div class="action-footer"><span class="action-target">${esc(a.target)}</span>${a.status==='pending_approval'?`<button class="button small" data-action="reject-action" data-id="${a.id}">Reject</button><button class="button small primary" data-action="approve-action" data-id="${a.id}">Approve</button>`:`<span class="pill status ${a.status==='approved'?'contained':'closed'}">${esc(a.status.replaceAll('_',' '))}</span>`}</div>${a.payload?.dossier ? `<div class="code-text" style="margin-top:8px">Dossier snapshot prepared · ${esc(a.payload.dossier.generated_at)}</div>`:''}</div>`).join('') : `<div class="empty-state">Run the investigation to generate a response plan.</div>`}
          </div>
          <div class="detail-section"><div class="detail-section-title">Agent run sequence</div>${renderAgentRows(x.analysis?.agents || state.lastAgents || [])}</div>
        </section>
        <section class="panel"><div class="panel-header"><div><div class="panel-title">Evidence register</div><div class="panel-subtitle">Original file retained privately · SHA-256 fingerprint recorded</div></div><div class="panel-header-spacer"></div><label class="button small" for="evidence-file">${icon('upload')} Upload evidence</label><input type="file" id="evidence-file" hidden accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg" /></div><div style="padding:5px 17px">${docs.length ? docs.map(d=>`<div class="doc-row"><div class="doc-icon">${icon('incidents')}</div><div class="doc-name">${esc(d.filename)}</div><span class="doc-size">${(d.size_bytes/1024).toFixed(0)} KB</span><span class="pill status contained">HASHED</span></div>`).join('') : `<div class="empty-state">No evidence uploaded. Add lab results, supplier certificates, inspection records or distribution files.</div>`}</div></section>
      </div><div style="display:flex;flex-direction:column;gap:15px">
        <section class="panel"><div class="panel-header"><div><div class="panel-title">Case controls</div><div class="panel-subtitle">Human-owned incident state</div></div></div><div class="detail-section"><div class="form-field"><label class="form-label">Incident status</label><select class="select" id="incident-status-edit"><option value="open" ${x.status==='open'?'selected':''}>Open</option><option value="investigating" ${x.status==='investigating'?'selected':''}>Investigating</option><option value="contained" ${x.status==='contained'?'selected':''}>Contained</option><option value="monitoring" ${x.status==='monitoring'?'selected':''}>Monitoring</option><option value="closed" ${x.status==='closed'?'selected':''}>Closed</option></select></div><div class="form-field" style="margin-top:11px"><label class="form-label">Case owner</label><input class="input" id="incident-owner-edit" value="${esc(x.owner)}" /></div><button class="button primary" style="margin-top:12px;width:100%" data-action="save-incident" data-id="${x.id}">Save case controls</button></div></section>
        <section class="panel"><div class="panel-header"><div><div class="panel-title">Distribution exposure</div><div class="panel-subtitle">Downstream partners connected to this lot</div></div><div class="panel-header-spacer"></div><button class="text-link" data-action="navigate" data-view="traceability">Open graph</button></div><div class="detail-section"><div class="trace-summary" style="grid-template-columns:repeat(2,1fr);padding:0"><div class="trace-stat"><div class="trace-stat-value">${trace?.metrics?.finished_lots || 0}</div><div class="trace-stat-label">Finished lots</div></div><div class="trace-stat"><div class="trace-stat-value">${trace?.metrics?.partners || 0}</div><div class="trace-stat-label">Recipients</div></div></div>${trace?.shipments?.slice(0,5).map(s=>`<div class="doc-row"><div class="doc-icon">${s.country==='US'?'US':'IN'}</div><div class="doc-name">${esc(s.partner)}<div class="table-secondary code-text">${esc(s.reference)}</div></div>${statusPill(s.acknowledgement)}</div>`).join('') || '<div class="empty-state">No downstream shipment records.</div>'}</div></section>
        <section class="panel"><div class="panel-header"><div><div class="panel-title">Incident activity</div><div class="panel-subtitle">Immutable-style event history</div></div></div>${activityList(data.activities.slice(0,7))}</section>
      </div></div>`;
  }

  function renderAgentRows(agents) {
    if (!agents.length) return `<div class="empty-state">No agent run recorded for this incident.</div>`;
    return agents.map(a=>`<div class="agent-row"><div class="agent-icon">${icon('agents')}</div><div class="agent-copy"><div class="agent-name">${esc(a.name)}</div><div class="agent-detail">${esc(a.detail)}</div></div><span class="agent-status ${a.status==='fallback'?'fallback':''}">${esc(a.status)}</span></div>`).join('');
  }
  function graphMarkup(trace) {
    if (!trace?.found) return `<div class="empty-state">No traceability records found for this lot.</div>`;
    const sources = trace.lots.filter(x=>x.type==='ingredient');
    const production = trace.lots.filter(x=>x.type==='production');
    const finished = trace.lots.filter(x=>x.type==='finished');
    const partners = [...new Map(trace.shipments.map(x=>[x.partner_id, x])).values()];
    const node = (x, cls = '') => `<div class="graph-node ${cls}"><div class="graph-node-code">${esc(x.code || x.reference)}</div><div class="graph-node-name">${esc(x.product_name || x.partner)}</div><div class="graph-node-foot">${esc(x.quantity ? `${fmt(x.quantity)} ${x.unit || 'units'}` : x.facility || countryLabel(x.country))}</div></div>`;
    return `<div class="graph-canvas"><div class="graph-layers"><div class="graph-layer"><div class="graph-layer-title">01 · Source ingredient</div>${sources.map(x=>node(x,'source')).join('') || '<div class="graph-node">No source lot</div>'}<span class="graph-arrow">→</span></div><div class="graph-layer"><div class="graph-layer-title">02 · Production runs</div>${production.map(x=>node(x)).join('') || '<div class="graph-node">No production run</div>'}<span class="graph-arrow">→</span></div><div class="graph-layer"><div class="graph-layer-title">03 · Finished goods</div>${finished.map(x=>node(x,'finished')).join('') || '<div class="graph-node">No finished lot</div>'}<span class="graph-arrow">→</span></div><div class="graph-layer"><div class="graph-layer-title">04 · Recipients</div>${partners.map(x=>node(x,'recipient')).join('') || '<div class="graph-node">No shipment recipients</div>'}</div></div></div><div class="graph-legend"><span><i class="legend-dot" style="background:#d6a76d"></i>Source material</span><span><i class="legend-dot" style="background:#a8c4b0"></i>Finished goods</span><span><i class="legend-dot" style="background:#9cb6ce"></i>Distribution partner</span><span style="margin-left:auto">${trace.edges.length} recorded relationships</span></div>`;
  }
  async function renderTraceability() {
    let trace = state.trace;
    if (!trace || trace.query !== state.traceQuery) {
      try { trace = await api(`/api/traceability/${encodeURIComponent(state.traceQuery)}`); state.trace = trace; }
      catch (err) { trace = null; }
    }
    return `${heading('Operations / traceability','Lot traceability','Follow a raw material lot through production transformations and downstream shipment records.',`<button class="button" data-action="navigate" data-view="incidents">View incidents</button>`)}
      <section class="panel"><div class="trace-search-panel">${icon('search')}<input class="input" id="trace-search" value="${esc(state.traceQuery)}" placeholder="Enter a source or finished lot code…" /><button class="button primary" data-action="trace-search">Trace lot ${icon('arrow')}</button><span class="pill status contained">Record-level trace</span></div>
      ${trace ? `<div class="trace-summary"><div class="trace-stat"><div class="trace-stat-value">${trace.metrics.lots}</div><div class="trace-stat-label">Connected lots</div></div><div class="trace-stat"><div class="trace-stat-value">${trace.metrics.finished_lots}</div><div class="trace-stat-label">Finished-goods lots</div></div><div class="trace-stat"><div class="trace-stat-value">${trace.metrics.partners}</div><div class="trace-stat-label">Downstream partners</div></div><div class="trace-stat"><div class="trace-stat-value">${fmt(trace.metrics.shipped_quantity)}</div><div class="trace-stat-label">Units in shipment records</div></div></div>${graphMarkup(trace)}` : `<div class="empty-state">Enter a known lot code such as ING-4502, ING-3910 or ING-2104.</div>`}</section>
      ${trace ? `<section class="panel" style="margin-top:15px"><div class="panel-header"><div><div class="panel-title">Shipment register</div><div class="panel-subtitle">Recipient acknowledgement and quantity reconciliation</div></div><div class="panel-header-spacer"></div><span class="pill status open">${trace.shipments.length} shipments</span></div><div class="table-wrap"><table><thead><tr><th>Shipment reference</th><th>Finished lot</th><th>Recipient</th><th>Market</th><th>Quantity</th><th>Acknowledgement</th><th>Response</th></tr></thead><tbody>${trace.shipments.map(s=>`<tr><td class="code-text">${esc(s.reference)}</td><td class="code-text">${esc(s.lot_code)}</td><td><div class="table-primary">${esc(s.partner)}</div><div class="table-secondary">${esc(s.partner_kind)}</div></td><td>${s.country==='IN'?'India':'United States'}</td><td>${fmt(s.quantity)} ${esc(s.unit)}</td><td>${statusPill(s.acknowledgement)}</td><td><button class="button small" data-action="update-shipment-ack" data-shipment-id="${s.id}">Record response</button></td></tr>`).join('')}</tbody></table></div></section>`:''}`;
  }

  function renderAgents() {
    const runs = state.runs;
    const incidentOptions = state.incidents.map(x=>`<option value="${x.id}">${esc(x.code)} · ${esc(x.title)}</option>`).join('');
    return `${heading('Operations / autonomous workflows','Agent activity','Specialized agents coordinate investigation, deterministic traceability and approval-gated response tasks.',`<select class="select" id="agent-incident-select">${incidentOptions}</select><button class="button primary" data-action="run-selected-investigation">${icon('agents')} Run agents</button>`)}
      <div class="dashboard-grid"><section class="panel"><div class="panel-header"><div><div class="panel-title">Agent roster</div><div class="panel-subtitle">Orchestration stages available in this workspace</div></div><span class="pill status contained">7 roles</span></div><div class="agent-log">
        ${[
          ['Evidence Intake Agent','Validates the incident record and evidence metadata.','Deterministic'],
          ['Traceability Agent','Resolves source-to-finished-lot genealogy and shipment links.','Database tools'],
          ['Impact Assessment Agent','Calculates affected quantities and distribution scope.','Deterministic'],
          ['Regulatory Mapping Agent','Loads the India FSSAI and US FDA operational rule packs.','Rule packs'],
          ['Recall Coordination Agent','Creates proposed containment and recipient-response tasks.','Approval-gated'],
          ['Recall Verification Agent','Tracks shipment acknowledgement and recall effectiveness gaps.','Deterministic'],
          ['AI Reasoning Agent','Synthesizes evidence and uncertainties through Vultr inference when configured.','Vultr / fallback'],
        ].map((x,i)=>`<div class="agent-log-row"><div class="agent-icon">${icon('agents')}</div><div><div class="agent-log-name">${x[0]}</div><div class="agent-log-detail">${x[1]}</div></div><span class="pill status ${i===6 && !state.settings?.ai?.configured?'open':'contained'}">${x[2]}</span></div>`).join('')}
      </div></section><section class="panel"><div class="panel-header"><div><div class="panel-title">Execution guardrails</div><div class="panel-subtitle">The model proposes; backend rules enforce</div></div></div><div class="detail-section"><div class="readiness-checks" style="border:0;padding:0"><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Tenant-scoped database queries</span></div><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Deterministic lot and quantity calculations</span></div><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Human approval for recall actions</span></div><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>External notices remain drafts</span></div><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Audit entries for operator decisions</span></div></div><div class="approval-bar" style="margin-top:18px">This prototype does not send external communications, file with regulators, make legal decisions or connect to ERP/warehouse systems. Those integrations require explicit configuration and validation.</div></div></section></div>
      <section class="panel" style="margin-top:15px"><div class="panel-header"><div><div class="panel-title">Recent agent runs</div><div class="panel-subtitle">Execution source and observed result</div></div><div class="panel-header-spacer"></div><span class="code-text">${runs.length} recent</span></div>${runs.length ? `<div class="agent-log">${runs.map(r=>`<div class="agent-log-row"><div class="agent-icon">${icon('activity')}</div><div><div class="agent-log-name">${esc(r.run_type.replaceAll('_',' '))} · ${esc(r.provider)}</div><div class="agent-log-detail">${esc(r.summary)}</div></div><div style="text-align:right"><div class="pill status contained">${esc(r.status)}</div><div class="run-time" style="margin-top:5px">${timeAgo(r.created_at)} · ${r.duration_ms} ms</div></div></div>`).join('')}</div>`:`<div class="empty-state">No agent runs yet. Choose an incident and run the investigation.</div>`}</section>`;
  }

  function renderPartners() {
    const partners = state.partners.filter(p=>state.market==='GLOBAL'||p.country===state.market);
    const notices = state.notices;
    return `${heading('Network / external parties','Network partners','Suppliers, manufacturing sites, distributors and retailers connected to your product flow.',`<button class="button primary" data-action="new-partner">${icon('plus')} Add partner</button>`)}
      <div class="metric-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${metric('Network partners',partners.length,'Active partner records','partners')}${metric('Notice drafts',notices.filter(n=>n.status==='draft').length,'Awaiting external review','incidents')}${metric('Acknowledgements pending',state.dashboard?.metrics?.pending_acknowledgements||0,'Shipment-level response gaps','clock')}</div>
      <section class="panel"><div class="panel-header"><div><div class="panel-title">Partner directory</div><div class="panel-subtitle">Contact records and location coverage</div></div><div class="panel-header-spacer"></div><span class="pill status contained">${partners.length} partners</span></div><div class="table-wrap"><table><thead><tr><th>Organization</th><th>Role</th><th>Location</th><th>Contact</th><th>Risk index</th><th>Status</th></tr></thead><tbody>${partners.map(p=>`<tr><td><div class="table-primary">${esc(p.name)}</div><div class="table-secondary">${esc(p.email||'Contact not provided')}</div></td><td>${esc(p.kind)}</td><td>${p.country==='IN'?'India':'United States'} · ${esc(p.city)}</td><td>${esc(p.contact_name||'—')}</td><td><span class="code-text">${p.risk_score}/100</span></td><td>${statusPill(p.status)}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="panel" style="margin-top:15px"><div class="panel-header"><div><div class="panel-title">Recipient notice drafts</div><div class="panel-subtitle">Prepared after a human-approved coordination action · not sent externally</div></div></div>${notices.length?`<div class="table-wrap"><table><thead><tr><th>Recipient</th><th>Subject</th><th>Incident</th><th>Status</th><th>Created</th></tr></thead><tbody>${notices.map(n=>`<tr><td class="table-primary">${esc(n.partner)}</td><td>${esc(n.subject)}</td><td class="code-text">${esc((state.incidents.find(i=>i.id===n.incident_id)||{}).code||'—')}</td><td>${statusPill(n.status)}</td><td>${timeAgo(n.created_at)}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state">No notice drafts yet. Approve a partner-notification action within an incident to create recipient-specific drafts.</div>`}</section>`;
  }

  function renderSimulation() {
    return `${heading('Governance / preparedness','Mock recall drill','Stress-test the completeness of lot genealogy, recipient records and acknowledgement tracking without changing product status.',`<span class="pill status contained">Simulation only</span>`)}
      <div class="dashboard-grid"><section class="panel"><div class="panel-header"><div><div class="panel-title">Run a traceability readiness drill</div><div class="panel-subtitle">Choose a registered source or finished-goods lot</div></div></div><div class="detail-section"><form id="simulation-form"><div class="form-field"><label class="form-label">Lot code</label><input class="input" id="simulation-lot" value="ING-4502" required /></div><div class="form-field" style="margin-top:12px"><label class="form-label">Regulatory profile</label><select class="select" id="simulation-market"><option value="GLOBAL">India + United States</option><option value="IN">India · FSSAI profile</option><option value="US">United States · FDA profile</option></select></div><button class="button primary" style="margin-top:16px" type="submit">Run mock recall drill ${icon('arrow')}</button></form><div class="approval-bar" style="margin-top:16px">A readiness score is a product-generated diagnostic, not a legal compliance score, certification or assurance that a real recall will be effective.</div></div></section><section class="panel"><div class="panel-header"><div><div class="panel-title">What the drill evaluates</div><div class="panel-subtitle">Checks are computed from workspace records</div></div></div><div class="detail-section"><div class="readiness-checks" style="border:0;padding:0"><div class="readiness-check"><span class="check-dot">1</span><span>Source-to-finished-lot genealogy</span></div><div class="readiness-check"><span class="check-dot">2</span><span>Downstream shipment visibility</span></div><div class="readiness-check"><span class="check-dot">3</span><span>Recipient master-data completeness</span></div><div class="readiness-check"><span class="check-dot">4</span><span>Partner acknowledgement status</span></div><div class="readiness-check"><span class="check-dot">5</span><span>Quantity reconciliation and evidence gaps</span></div></div></div></section></div>
      <div id="simulation-result" style="margin-top:15px">${state.simulation ? simulationResult(state.simulation) : ''}</div>`;
  }
  function simulationResult(result) {
    return `<section class="panel"><div class="panel-header"><div><div class="panel-title">Drill result · ${esc(result.simulation_id)}</div><div class="panel-subtitle">Source lot ${esc(result.lot_code)} · ${esc(countryLabel(result.market))}</div></div><div class="panel-header-spacer"></div><span class="pill status contained">Completed</span></div><div class="score-banner"><div class="score-banner-value">${result.score}<span style="font-size:14px;color:#82998a">/100</span></div><div><div class="score-banner-label">Recall readiness snapshot</div><div class="score-banner-copy">A directional view of traceability and response records in this workspace.</div></div></div><div>${result.checks.map(c=>`<div class="check-result"><div class="check-result-icon ${c.status}">${c.status==='pass'?'✓':c.status==='warn'?'!':'×'}</div><div><div class="check-result-name">${esc(c.name)}</div><div class="check-result-detail">${esc(c.detail)}</div></div><span class="pill status ${c.status==='pass'?'contained':c.status==='warn'?'monitoring':'open'}" style="margin-left:auto">${esc(c.status)}</span></div>`).join('')}</div><div class="detail-section"><div class="detail-section-title">Recommended improvements</div>${result.recommendations.map(r=>`<div class="activity-text" style="margin:7px 0">• ${esc(r)}</div>`).join('')}<div class="profile-notice" style="margin-top:12px">${esc(result.disclaimer)}</div></div></section>`;
  }

  function renderCompliance() {
    return `${heading('Governance / market configuration','Regulatory profiles','A shared operating workflow with separate jurisdiction-specific reference packs. These are operational guides, not legal opinions.',`<span class="pill status contained">2 market profiles</span>`)}
      <div class="profile-grid">${state.profiles.map(p=>`<section class="panel profile-card"><div class="profile-country"><span style="font-size:17px">${p.code==='IN-FSSAI'?'🇮🇳':'🇺🇸'}</span>${esc(p.name)}</div><div class="profile-title">${esc(p.authority)}</div><div class="profile-framework">${esc(p.framework)}</div><div class="meta-label" style="margin-top:16px">Operational control areas</div><ul class="profile-list">${p.requirements.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="meta-label">Suggested workflow</div><ol class="profile-list">${p.workflow.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><div class="profile-notice">${esc(p.notice)}</div><div>${p.sources.map(s=>`<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('')}</div></section>`).join('')}</div>
      <div class="profile-notice" style="margin-top:15px">Important: the US FDA FSMA Section 204 traceability rule has a defined scope and the FDA has announced it will not enforce the rule before July 20, 2028. BatchBridge does not determine legal applicability. Verify the current effective dates, covered foods, exemptions and obligations before using this product operationally.</div>`;
  }

  function renderSettings() {
    const ai = state.settings?.ai || {};
    return `${heading('Workspace / configuration','Workspace settings','Organization profile, AI provider connection and operating environment.',`<button class="button" data-action="test-vultr">Test Vultr connection</button>`)}
      <div class="settings-grid"><section class="panel settings-section"><div class="settings-title">AI inference provider</div><div class="settings-description">The inference key is read only by the backend from its environment. It is never returned to the browser or stored in workspace records.</div>
        <div class="setting-row"><div class="setting-label">Provider</div><div class="setting-value">Vultr Serverless Inference</div></div><div class="setting-row"><div class="setting-label">Connection</div><div class="setting-value"><span class="status-dot ${ai.configured?'ready':''}"></span>${ai.configured?'API key configured':'Local deterministic fallback active'}</div></div><div class="setting-row"><div class="setting-label">Model</div><div class="setting-value">${esc(ai.model || 'rules-engine')}</div></div><div class="setting-row"><div class="setting-label">API base URL</div><div class="setting-value code-text">https://api.vultrinference.com/v1</div></div><div class="setting-row"><div class="setting-label">Key exposure</div><div class="setting-value">Not exposed to frontend</div></div><div class="profile-notice" style="margin-top:15px">To enable live reasoning, set VULTR_INFERENCE_API_KEY and VULTR_INFERENCE_MODEL in the server-side .env file, then restart the service. Never paste the key into this page, chat, browser storage or source control.</div>
      </section><section class="panel settings-section"><div class="settings-title">Organization workspace</div><div class="settings-description">Your tenant profile and current demo environment.</div><div class="setting-row"><div class="setting-label">Organization</div><div class="setting-value">${esc(state.settings?.tenant?.name)}</div></div><div class="setting-row"><div class="setting-label">Workspace slug</div><div class="setting-value code-text">${esc(state.settings?.tenant?.slug)}</div></div><div class="setting-row"><div class="setting-label">Plan</div><div class="setting-value">${esc(state.settings?.tenant?.plan)}</div></div><div class="setting-row"><div class="setting-label">Enabled markets</div><div class="setting-value">India · United States</div></div><div class="setting-row"><div class="setting-label">Signed-in user</div><div class="setting-value">${esc(state.user.email)}</div></div><div class="setting-row"><div class="setting-label">Role</div><div class="setting-value">${esc(state.user.role)}</div></div><div class="setting-row"><div class="setting-label">Evidence upload limit</div><div class="setting-value">${state.settings?.limits?.max_upload_mb || 15} MB / file</div></div></section></div>
      <section class="panel settings-section" style="margin-top:15px"><div class="settings-title">Production deployment checklist</div><div class="settings-description">Required before using this with real company or food-safety data.</div><div class="readiness-checks" style="margin-top:14px;border:0;padding:0"><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Change JWT_SECRET and demo credentials.</span></div><div class="readiness-check"><span class="check-dot">${icon('check')}</span><span>Use managed PostgreSQL, TLS, encrypted backups and private object storage.</span></div><div class="readiness-check"><span class="check-dot warn">!</span><span>Implement organization SSO/MFA, formal role matrices and security monitoring.</span></div><div class="readiness-check"><span class="check-dot warn">!</span><span>Connect validated ERP/WMS, email/SMS and partner identity integrations.</span></div><div class="readiness-check"><span class="check-dot warn">!</span><span>Complete penetration testing, load testing, disaster recovery and legal review.</span></div></div></section>`;
  }

  function openModal(title, subtitle, body) {
    $('#modal-root')?.remove();
    const root = document.createElement('div'); root.id = 'modal-root'; root.className = 'modal-backdrop';
    root.innerHTML = `<section class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div><div class="modal-title">${title}</div><div class="modal-subtitle">${subtitle}</div></div><button class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body">${body}</div></section>`;
    document.body.appendChild(root);
    root.addEventListener('click', e => { if (e.target === root) root.remove(); });
  }
  function closeModal() { $('#modal-root')?.remove(); }
  function registerWorkspaceModal() {
    openModal('Create a pilot workspace','Create an isolated organization workspace. Use a unique work email and a strong password.',`<form id="register-form" class="form-grid"><div class="form-field full"><label class="form-label">Organization name</label><input class="input" name="organization" required minlength="2" placeholder="e.g. Northstar Foods" /></div><div class="form-field full"><label class="form-label">Your full name</label><input class="input" name="full_name" required minlength="2" placeholder="Name of workspace administrator" /></div><div class="form-field full"><label class="form-label">Work email</label><input class="input" name="email" type="email" required /></div><div class="form-field full"><label class="form-label">Password · 12 characters minimum</label><input class="input" name="password" type="password" required minlength="12" autocomplete="new-password" /><div class="table-secondary">Include uppercase, lowercase, number and symbol.</div></div><div class="form-actions form-field full"><button type="button" class="button" data-action="close-modal">Cancel</button><button type="submit" class="button primary">Create workspace</button></div></form>`);
    $('#register-form').addEventListener('submit', async (e) => {
      e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      try { const result = await api('/api/auth/register',{method:'POST',body:JSON.stringify(data)}); state.token=result.access_token; state.user=result.user; sessionStorage.setItem('bb_token',state.token); closeModal(); await loadWorkspace(); state.view='overview'; renderApp(); toast('Workspace created. Welcome to BatchBridge.'); }
      catch(err) { toast(err.message,true); }
    });
  }
  function newIncidentModal() {
    openModal('Open a new incident','Create an incident from a registered source lot. The lot must exist in the traceability register.',`
      <form id="new-incident-form" class="form-grid">
        <div class="form-field full"><label class="form-label">Incident title</label><input class="input" name="title" required minlength="5" placeholder="e.g. Potential pathogen detected in ingredient lot" /></div>
        <div class="form-field"><label class="form-label">Product name</label><input class="input" name="product_name" required placeholder="Product / SKU name" /></div>
        <div class="form-field"><label class="form-label">Source lot code</label><input class="input" name="lot_code" required placeholder="e.g. ING-4502" /></div>
        <div class="form-field"><label class="form-label">Issue category</label><select class="select" name="issue_type"><option value="microbiological">Microbiological</option><option value="chemical">Chemical</option><option value="allergen">Allergen</option><option value="labeling">Labelling</option><option value="physical_contamination">Physical contamination</option><option value="quality">Other quality</option></select></div>
        <div class="form-field"><label class="form-label">Severity</label><select class="select" name="severity"><option value="critical">Critical</option><option value="high" selected>High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
        <div class="form-field"><label class="form-label">Market profile</label><select class="select" name="market"><option value="GLOBAL">India + US</option><option value="IN">India</option><option value="US">United States</option></select></div>
        <div class="form-field"><label class="form-label">Signal source</label><select class="select" name="source"><option value="supplier_notification">Supplier notification</option><option value="lab_result">Laboratory result</option><option value="customer_complaint">Customer complaint</option><option value="quality_audit">Quality audit</option><option value="manual">Manual entry</option></select></div>
        <div class="form-field full"><label class="form-label">Incident description</label><textarea class="textarea" name="description" required minlength="10" placeholder="Describe the signal, what is known and what remains unverified…"></textarea></div>
        <div class="form-actions form-field full"><button type="button" class="button" data-action="close-modal">Cancel</button><button type="submit" class="button primary">Create incident ${icon('arrow')}</button></div>
      </form>`);
    $('#new-incident-form').addEventListener('submit', createIncident);
  }
  async function createIncident(e) {
    e.preventDefault(); const form = e.currentTarget; const data = Object.fromEntries(new FormData(form).entries());
    try { const result = await api('/api/incidents',{method:'POST',body:JSON.stringify(data)}); closeModal(); await refreshData(); state.selectedIncidentId = result.id; state.view = 'incident'; renderApp(); toast(`Incident ${result.code} created.`); }
    catch(err) { toast(err.message,true); }
  }
  function newPartnerModal() {
    openModal('Add network partner','Create a supplier, facility, distributor or retailer record.',`<form id="new-partner-form" class="form-grid"><div class="form-field full"><label class="form-label">Organization name</label><input class="input" name="name" required /></div><div class="form-field"><label class="form-label">Partner role</label><select class="select" name="kind"><option value="supplier">Supplier</option><option value="manufacturer">Manufacturer</option><option value="distributor">Distributor</option><option value="retailer">Retailer</option><option value="laboratory">Laboratory</option><option value="logistics">Logistics</option></select></div><div class="form-field"><label class="form-label">Country</label><select class="select" name="country"><option value="IN">India</option><option value="US">United States</option></select></div><div class="form-field"><label class="form-label">City / state</label><input class="input" name="city" /></div><div class="form-field"><label class="form-label">Primary contact</label><input class="input" name="contact_name" /></div><div class="form-field full"><label class="form-label">Work email</label><input class="input" type="email" name="email" /></div><div class="form-actions form-field full"><button type="button" class="button" data-action="close-modal">Cancel</button><button type="submit" class="button primary">Add partner</button></div></form>`);
    $('#new-partner-form').addEventListener('submit', createPartner);
  }
  async function createPartner(e) {
    e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try { await api('/api/partners',{method:'POST',body:JSON.stringify(data)}); closeModal(); await refreshData(); renderView(); toast('Partner added to the network.'); }
    catch(err) { toast(err.message,true); }
  }
  async function runInvestigation(id) {
    toast('Agent workflow started. Resolving lot genealogy…');
    try {
      const result = await api(`/api/incidents/${id}/investigate`,{method:'POST'});
      state.lastAgents = result.agents; state.selectedIncidentId = id; state.view = 'incident';
      await refreshData(); renderApp();
      toast(`Investigation completed · ${result.trace.metrics.lots} lots traced · ${result.run.provider === 'vultr' ? 'Vultr reasoning' : 'local fallback'}.`);
    } catch(err) { toast(err.message,true); }
  }
  async function decideAction(id, decision) {
    const reason = decision === 'reject' ? (prompt('Reason for rejecting this proposed action:') || '') : (prompt('Approval note (optional):') || 'Reviewed by authorized operator');
    if (decision==='reject' && !reason.trim()) { toast('Please provide a rejection reason.',true); return; }
    try {
      const result = await api(`/api/actions/${id}/decision`,{method:'POST',body:JSON.stringify({decision,reason})});
      toast(result.side_effect || `Action ${decision}d.`);
      await refreshData(); renderView();
    } catch(err) { toast(err.message,true); }
  }
  async function runTraceSearch() {
    const val = $('#trace-search')?.value.trim(); if (!val) return;
    state.traceQuery = val;
    try { state.trace = await api(`/api/traceability/${encodeURIComponent(val)}`); renderView(); }
    catch(err) { state.trace = null; toast(err.message,true); renderView(); }
  }
  async function runSimulation(e) {
    e.preventDefault(); const lot = $('#simulation-lot').value.trim(); const market = $('#simulation-market').value;
    try { state.simulation = await api('/api/recall-simulations',{method:'POST',body:JSON.stringify({lot_code:lot,market})}); await refreshData(); renderView(); toast(`Readiness drill completed · ${state.simulation.score}/100`); }
    catch(err) { toast(err.message,true); }
  }
  async function testVultr() {
    try { const result = await api('/api/ai/test',{method:'POST'}); toast(`Vultr connected · ${result.available_models} models available.`); }
    catch(err) { toast(err.message,true); }
  }
  async function updateShipmentAcknowledgement(id) {
    const removedRaw = prompt('Quantity removed from sale (units):', '0');
    if (removedRaw === null) return;
    const returnedRaw = prompt('Quantity returned (units):', '0');
    if (returnedRaw === null) return;
    const note = prompt('Partner response note (optional):', 'Acknowledgement recorded during recall drill') || '';
    try {
      const result = await api(`/api/shipments/${id}/acknowledgement`, { method: 'POST', body: JSON.stringify({ acknowledgement: 'acknowledged', removed_quantity: Number(removedRaw), returned_quantity: Number(returnedRaw), note }) });
      state.trace = null; await refreshData(); renderView(); toast(`Response recorded for ${result.reference}.`);
    } catch (err) { toast(err.message, true); }
  }
  async function uploadEvidence(e) {
    const file = e.target.files?.[0]; if (!file || !state.selectedIncidentId) return;
    const form = new FormData(); form.append('file',file);
    try { const result = await api(`/api/incidents/${state.selectedIncidentId}/documents`,{method:'POST',body:form}); toast(`Evidence uploaded · SHA-256 ${result.sha256.slice(0,12)}…`); renderView(); }
    catch(err) { toast(err.message,true); }
    e.target.value = '';
  }
  async function saveIncident(id) {
    const status = $('#incident-status-edit').value; const owner = $('#incident-owner-edit').value;
    try { await api(`/api/incidents/${id}`,{method:'PATCH',body:JSON.stringify({status,owner})}); await refreshData(); renderView(); toast('Incident controls updated.'); }
    catch(err) { toast(err.message,true); }
  }
  function navigate(view) {
    state.view = view;
    if (view !== 'incident') state.selectedIncidentId = null;
    if (window.innerWidth <= 900) $('#sidebar')?.classList.remove('open');
    $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
    renderView();
    const crumb = $('.breadcrumb strong'); if (crumb) crumb.textContent = viewTitle(view);
  }
  function logout() { state.token=''; state.user=null; sessionStorage.removeItem('bb_token'); state.dashboard=null; renderLogin(); }

  document.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-action]'); if (!target) return;
    const action = target.dataset.action;
    if (action==='navigate') navigate(target.dataset.view);
    else if (action==='logout') logout();
    else if (action==='new-incident') newIncidentModal();
    else if (action==='request-workspace') registerWorkspaceModal();
    else if (action==='new-partner') newPartnerModal();
    else if (action==='close-modal') closeModal();
    else if (action==='open-incident') { state.selectedIncidentId=Number(target.dataset.id); navigate('incident'); }
    else if (action==='investigate') runInvestigation(Number(target.dataset.id));
    else if (action==='approve-action') decideAction(Number(target.dataset.id),'approve');
    else if (action==='reject-action') decideAction(Number(target.dataset.id),'reject');
    else if (action==='save-incident') saveIncident(Number(target.dataset.id));
    else if (action==='trace-search') runTraceSearch();
    else if (action==='run-selected-investigation') { const id=Number($('#agent-incident-select').value); if(id) runInvestigation(id); }
    else if (action==='test-vultr') testVultr();
    else if (action==='update-shipment-ack') updateShipmentAcknowledgement(Number(target.dataset.shipmentId));
    else if (action==='refresh') { await refreshData(); renderView(); }
    else if (action==='mobile-menu') $('#sidebar')?.classList.toggle('open');
    else if (action==='global-search') { navigate('incidents'); setTimeout(()=>$('#incident-search')?.focus(),80); }
  });
  document.addEventListener('submit', (event) => {
    if (event.target.id==='simulation-form') runSimulation(event);
  });
  document.addEventListener('change', (event) => {
    if (event.target.id==='evidence-file') uploadEvidence(event);
  });
  document.addEventListener('input', (event) => {
    if (event.target.id==='incident-search') {
      const q = event.target.value.toLowerCase();
      const filtered = state.incidents.filter(x => [x.code,x.title,x.lot_code,x.product_name].some(v=>String(v).toLowerCase().includes(q)) && (state.market==='GLOBAL'||x.market==='GLOBAL'||x.market===state.market));
      const table = $('#incident-table'); if(table) table.innerHTML=incidentTable(filtered,100);
    }
  });
  document.addEventListener('change', (event) => {
    if (event.target.id==='incident-status') {
      const val = event.target.value;
      const q = $('#incident-search')?.value.toLowerCase()||'';
      const filtered = state.incidents.filter(x => (!val||x.status===val) && [x.code,x.title,x.lot_code,x.product_name].some(v=>String(v).toLowerCase().includes(q)) && (state.market==='GLOBAL'||x.market==='GLOBAL'||x.market===state.market));
      const table = $('#incident-table'); if(table) table.innerHTML=incidentTable(filtered,100);
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey||event.ctrlKey) && event.key.toLowerCase()==='k') { event.preventDefault(); navigate('incidents'); setTimeout(()=>$('#incident-search')?.focus(),80); }
    if (event.key==='Escape') closeModal();
    if (event.key==='Enter' && event.target.id==='trace-search') runTraceSearch();
  });

  async function init() {
    if (!state.token) { renderLogin(); return; }
    try {
      const meData = await api('/api/auth/me'); state.user = meData.user;
      await loadWorkspace(); renderApp();
    } catch (_) { logout(); }
  }
  init();
})();
