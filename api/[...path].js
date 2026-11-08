/**
 * Vercel Serverless Function & Edge API Proxy for BatchBridge AI
 * 
 * In production when BACKEND_API_URL is configured (pointing to your Vultr VM / Docker backend),
 * all requests to /api/* are seamlessly proxied to the persistent FastAPI backend.
 * 
 * When BACKEND_API_URL is not set (e.g. standalone Vercel preview or decoupled frontend),
 * this handler provides a high-fidelity mock implementation matching the exact seed data,
 * deterministic traceability graph, and multi-agent workflow defined in app/seed.py and app/main.py.
 */

const DEMO_TENANT = {
  name: "Heritage Organics Ltd.",
  slug: "heritage-organics",
  plan: "enterprise",
  markets: ["IN", "US"]
};

const DEMO_USER = {
  id: 1,
  email: "demo@batchbridge.ai",
  full_name: "Shivang Saxena",
  role: "quality_manager",
  tenant_id: 1
};

const DEMO_TRACE = {
  query: "ING-4502",
  found: true,
  root: { id: "ING-4502", type: "ingredient", label: "Raw Virginia Peanuts (Graded)", quantity: 12000, unit: "KG", status: "quarantined", market: "GLOBAL", facility: "AgriSource Rajkot" },
  metrics: {
    lots: 5,
    finished_lots: 4,
    partners: 5,
    shipments: 6,
    finished_quantity: 18400,
    shipped_quantity: 13200,
    on_hand_estimate: 5200,
    pending_acknowledgements: 6
  },
  lots: [
    { id: 1, code: "ING-4502", product_name: "Raw Virginia Peanuts (Graded)", sku: "RAW-PEANUT-01", type: "ingredient", quantity: 12000, unit: "KG", status: "quarantined", market: "GLOBAL", facility: "AgriSource Rajkot" },
    { id: 2, code: "FIN-8821-A", product_name: "Organic Peanut Butter Smooth 400g (Domestic)", sku: "PBM-400-IN", type: "finished", quantity: 5000, unit: "JARS", status: "quarantined", market: "IN", facility: "Kandla SEZ Unit 1" },
    { id: 3, code: "FIN-8821-B", product_name: "Organic Peanut Butter Smooth 400g (Export US)", sku: "PBM-400-US", type: "finished", quantity: 6000, unit: "JARS", status: "quarantined", market: "US", facility: "Kandla SEZ Unit 1" },
    { id: 4, code: "FIN-8822-A", product_name: "Crunchy Organic Peanut Butter 500g", sku: "PBC-500-IN", type: "finished", quantity: 4400, unit: "JARS", status: "quarantined", market: "IN", facility: "Kandla SEZ Unit 1" },
    { id: 5, code: "FIN-8822-B", product_name: "Peanut Paste Industrial Drum 200kg", sku: "PBP-200-GL", type: "finished", quantity: 3000, unit: "KG", status: "quarantined", market: "GLOBAL", facility: "Kandla SEZ Unit 1" }
  ],
  nodes: [
    { id: "ING-4502", type: "ingredient", label: "Raw Virginia Peanuts (Graded)", quantity: 12000, unit: "KG", status: "quarantined", market: "GLOBAL" },
    { id: "FIN-8821-A", type: "finished", label: "Organic Peanut Butter Smooth 400g (Domestic)", quantity: 5000, unit: "JARS", status: "quarantined", market: "IN" },
    { id: "FIN-8821-B", type: "finished", label: "Organic Peanut Butter Smooth 400g (Export US)", quantity: 6000, unit: "JARS", status: "quarantined", market: "US" },
    { id: "FIN-8822-A", type: "finished", label: "Crunchy Organic Peanut Butter 500g", quantity: 4400, unit: "JARS", status: "quarantined", market: "IN" },
    { id: "FIN-8822-B", type: "finished", label: "Peanut Paste Industrial Drum 200kg", quantity: 3000, unit: "KG", status: "quarantined", market: "GLOBAL" },
    { id: "partner:3", type: "partner", label: "Reliance Retail Distribution Hub", country: "IN", kind: "distributor", status: "in_progress" },
    { id: "partner:4", type: "partner", label: "Nature Basket Retail Network", country: "IN", kind: "retailer", status: "in_progress" },
    { id: "partner:5", type: "partner", label: "Pacific Rim Logistics Corp.", country: "US", kind: "logistics", status: "in_progress" },
    { id: "partner:6", type: "partner", label: "GreenChoice Organics US Distribution", country: "US", kind: "distributor", status: "in_progress" }
  ],
  edges: [
    { from: "ING-4502", to: "FIN-8821-A", label: "Grinding & Homogenization Batch B-101", input_quantity: 3200, output_quantity: 5000 },
    { from: "ING-4502", to: "FIN-8821-B", label: "Grinding & Homogenization Batch B-102", input_quantity: 3800, output_quantity: 6000 },
    { from: "ING-4502", to: "FIN-8822-A", label: "Roasting & Coarse Blend Batch B-103", input_quantity: 2600, output_quantity: 4400 },
    { from: "ING-4502", to: "FIN-8822-B", label: "Bulk Maceration Batch B-104", input_quantity: 2400, output_quantity: 3000 },
    { from: "FIN-8821-A", to: "partner:3", label: "SHP-2026-001", quantity: 2800, shipment_id: 1 },
    { from: "FIN-8821-A", to: "partner:4", label: "SHP-2026-002", quantity: 1200, shipment_id: 2 },
    { from: "FIN-8821-B", to: "partner:5", label: "SHP-2026-003", quantity: 3200, shipment_id: 3 },
    { from: "FIN-8821-B", to: "partner:6", label: "SHP-2026-004", quantity: 2800, shipment_id: 4 },
    { from: "FIN-8822-A", to: "partner:3", label: "SHP-2026-005", quantity: 2000, shipment_id: 5 },
    { from: "FIN-8822-B", to: "partner:4", label: "SHP-2026-006", quantity: 1200, shipment_id: 6 }
  ],
  shipments: [
    { id: 1, reference: "SHP-2026-001", lot_code: "FIN-8821-A", partner_id: 3, partner: "Reliance Retail Distribution Hub", partner_kind: "distributor", country: "IN", quantity: 2800, unit: "JARS", acknowledgement: "in_progress", removed_quantity: 0, returned_quantity: 0, shipped_at: "2026-03-01T10:00:00Z" },
    { id: 2, reference: "SHP-2026-002", lot_code: "FIN-8821-A", partner_id: 4, partner: "Nature Basket Retail Network", partner_kind: "retailer", country: "IN", quantity: 1200, unit: "JARS", acknowledgement: "in_progress", removed_quantity: 0, returned_quantity: 0, shipped_at: "2026-03-02T11:30:00Z" },
    { id: 3, reference: "SHP-2026-003", lot_code: "FIN-8821-B", partner_id: 5, partner: "Pacific Rim Logistics Corp.", partner_kind: "logistics", country: "US", quantity: 3200, unit: "JARS", acknowledgement: "in_progress", removed_quantity: 0, returned_quantity: 0, shipped_at: "2026-03-02T14:15:00Z" },
    { id: 4, reference: "SHP-2026-004", lot_code: "FIN-8821-B", partner_id: 6, partner: "GreenChoice Organics US Distribution", partner_kind: "distributor", country: "US", quantity: 2800, unit: "JARS", acknowledgement: "in_progress", removed_quantity: 0, returned_quantity: 0, shipped_at: "2026-03-03T09:00:00Z" },
    { id: 5, reference: "SHP-2026-005", lot_code: "FIN-8822-A", partner_id: 3, partner: "Reliance Retail Distribution Hub", partner_kind: "distributor", country: "IN", quantity: 2000, unit: "JARS", acknowledgement: "in_progress", removed_quantity: 0, returned_quantity: 0, shipped_at: "2026-03-03T16:45:00Z" },
    { id: 6, reference: "SHP-2026-006", lot_code: "FIN-8822-B", partner_id: 4, partner: "Nature Basket Retail Network", partner_kind: "retailer", country: "IN", quantity: 1200, unit: "KG", acknowledgement: "in_progress", removed_quantity: 0, returned_quantity: 0, shipped_at: "2026-03-04T12:00:00Z" }
  ]
};

const DEMO_INCIDENTS = [
  {
    id: 1,
    code: "INC-2026-0842",
    title: "Aflatoxin exceedance alert in raw peanut lot ING-4502",
    product_name: "Organic Peanut Butter Smooth 400g",
    lot_code: "ING-4502",
    issue_type: "chemical_contaminant",
    severity: "critical",
    status: "investigating",
    market: "GLOBAL",
    description: "Third-party laboratory screening report indicated total aflatoxin levels of 24.8 mcg/kg (regulatory threshold: 15 mcg/kg FSSAI, 20 mcg/kg US FDA) in raw Virginia peanut delivery lot ING-4502. Two production runs have completed processing into consumer packaged goods.",
    source: "laboratory_signal",
    owner: "Shivang Saxena",
    impacted_lots: 4,
    impacted_partners: 5,
    affected_quantity: 18400,
    unit: "JARS",
    recall_progress: 35,
    analysis: {
      summary: "Raw material ING-4502 traced through 2 production batches into 4 finished goods lots. 13,200 consumer units have been dispatched to 5 downstream partners across India and US markets. Regulatory stop-sale notices drafted with human approval gates.",
      findings: [
        "Aflatoxin total detected at 24.8 mcg/kg (exceeds FSSAI 15 mcg/kg and US FDA 20 mcg/kg limits).",
        "Raw material batch ING-4502 (12,000 kg) fully consumed across 4 finished-goods packaging runs.",
        "6 commercial shipments dispatched; 13,200 units in transit or at distribution centers."
      ],
      uncertainties: [
        "Retail shelf scan completion pending for Nature Basket Mumbai & Pune outlets.",
        "Port customs clearance status pending for Pacific Rim Logistics Long Beach delivery."
      ],
      provider: "Vultr Serverless Inference",
      model: "deepseek-v4.1-flash-1017",
      agents: [
        { name: "Evidence Intake Agent", detail: "Parsed Certificate of Analysis (COA-2026-0842) and verified SHA-256 fingerprint.", status: "completed" },
        { name: "Deterministic Traceability Agent", detail: "Traversed 2 production transformations. Found 4 finished-goods lots and 5 downstream partners.", status: "completed" },
        { name: "Impact Assessment Agent", detail: "Computed exposure: 18,400 units finished, 13,200 shipped, 5,200 warehouse inventory on hold.", status: "completed" },
        { name: "Regulatory Mapping Agent", detail: "Loaded dual-market frameworks: India FSSAI Food Safety & Standards (Recall Procedure) 2017 and US FDA 21 CFR Part 7 / FSMA Rule 204.", status: "completed" },
        { name: "Recall Coordination Agent", detail: "Formulated 5 quarantine, stop-sale, and notification action tasks with human-in-the-loop review gates.", status: "completed" },
        { name: "Verification & Audit Agent", detail: "Immutable audit hash recorded for run. No unauthorized schema writes detected.", status: "completed" },
        { name: "Vultr AI Reasoning Analyst", detail: "Evidence-constrained synthesis completed. No hallucinations detected; strict database facts confirmed.", status: "completed" }
      ]
    },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  }
];

const DEMO_PARTNERS = [
  { id: 1, name: "AgriSource India Pvt. Ltd.", kind: "supplier", country: "IN", city: "Rajkot, Gujarat", contact_name: "Ramesh Patel", email: "ramesh@agrisource.in", status: "active", risk_score: 18 },
  { id: 2, name: "Heritage Processing Hub (Unit 1)", kind: "manufacturer", country: "IN", city: "Kandla SEZ, Gujarat", contact_name: "Quality Cell", email: "quality-kandla@heritageorganics.com", status: "active", risk_score: 12 },
  { id: 3, name: "Reliance Retail Distribution Hub", kind: "distributor", country: "IN", city: "Bhiwandi, Maharashtra", contact_name: "Suresh Menon", email: "dc-bhiwandi@relianceretail.example", status: "active", risk_score: 25 },
  { id: 4, name: "Nature Basket Retail Network", kind: "retailer", country: "IN", city: "Mumbai & Pune", contact_name: "Pooja Sharma", email: "procurement@naturebasket.example", status: "active", risk_score: 30 },
  { id: 5, name: "Pacific Rim Logistics Corp.", kind: "logistics", country: "US", city: "Long Beach, CA", contact_name: "David Miller", email: "import-ops@pacificrimlog.example", status: "active", risk_score: 22 },
  { id: 6, name: "GreenChoice Organics US Distribution", kind: "distributor", country: "US", city: "Vernon, CA", contact_name: "Karen Chen", email: "compliance@greenchoice.example", status: "active", risk_score: 20 }
];

const DEMO_ACTIONS = [
  { id: 1, incident_id: 1, action_type: "quarantine_inventory", title: "Request internal quality hold", description: "Place identified affected finished-goods lots (FIN-8821-A, FIN-8821-B, FIN-8822-A, FIN-8822-B) on hold at plant storage.", target: "Plant quality leads", risk_level: "high", status: "approved" },
  { id: 2, incident_id: 1, action_type: "notify_partner", title: "Prepare downstream partner stop-sale notices", description: "Generate recipient-specific notices for 5 downstream distribution partners.", target: "Downstream recipients", risk_level: "high", status: "pending_approval" },
  { id: 3, incident_id: 1, action_type: "request_acknowledgement", title: "Collect stop-sale and stock reconciliations", description: "Request stock-on-hand, stop-sale and removed-quantity confirmation for 6 shipment records.", target: "Distribution network", risk_level: "medium", status: "pending_approval" },
  { id: 4, incident_id: 1, action_type: "regulatory_dossier", title: "Prepare jurisdiction-specific recall dossiers", description: "Compile confirmed incident facts, lot genealogy, shipment scope and evidence for FSSAI and US FDA review.", target: "Applicable authorities · counsel review", risk_level: "medium", status: "pending_approval" },
  { id: 5, incident_id: 1, action_type: "effectiveness_check", title: "Schedule recall effectiveness checks", description: "Track partner acknowledgements and escalate unacknowledged shipments at 24h intervals.", target: "Recall coordinator", risk_level: "medium", status: "pending_approval" }
];

const DEMO_ACTIVITIES = [
  { id: 1, incident_id: 1, actor: "Shivang Saxena", actor_type: "user", action: "incident_opened", detail: "Incident INC-2026-0842 opened for source lot ING-4502.", created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 2, incident_id: 1, actor: "Shivang Saxena", actor_type: "user", action: "evidence_uploaded", detail: "Evidence file Certificate_of_Analysis_Aflatoxin_Lot_ING4502.pdf uploaded and hashed.", created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 3, incident_id: 1, actor: "Recall Coordination Agent", actor_type: "agent", action: "investigation_completed", detail: "7-agent autonomous investigation executed. 4 finished lots identified.", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 4, incident_id: 1, actor: "Shivang Saxena", actor_type: "user", action: "action_approved", detail: "Approved internal quality hold for finished lots FIN-8821-A, FIN-8821-B, FIN-8822-A, FIN-8822-B.", created_at: new Date(Date.now() - 3600000 * 1).toISOString() }
];

const DEMO_RUNS = [
  { id: 1, incident_id: 1, run_type: "deterministic_genealogy_trace", status: "completed", provider: "Local deterministic engine", model: "graph-traversal", summary: "Traversed 2 production transformations and identified 4 affected finished goods lots.", duration_ms: 85, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 2, incident_id: 1, run_type: "vultr_ai_reasoning_synthesis", status: "completed", provider: "Vultr Serverless Inference", model: "deepseek-v4.1-flash-1017", summary: "Evidence-grounded synthesis completed without hallucination. Dual-market regulatory requirements mapped.", duration_ms: 310, created_at: new Date(Date.now() - 3600000 * 2 + 1000).toISOString() }
];

const DEMO_DOCUMENTS = [
  { id: 1, filename: "Certificate_of_Analysis_Aflatoxin_Lot_ING4502.pdf", size_bytes: 421000, sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", uploaded_by: "Shivang Saxena", created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: 2, filename: "Supplier_Delivery_Challan_ING4502.pdf", size_bytes: 184500, sha256: "5d41402abc4b2a76b9719d911017c592ef43e142d7658c8959d0408542b8b92b", uploaded_by: "Shivang Saxena", created_at: new Date(Date.now() - 3600000 * 3).toISOString() }
];

const DEMO_NOTICES = [
  { id: 1, incident_id: 1, partner_id: 3, partner: "Reliance Retail Distribution Hub", subject: "Action requested: Organic Peanut Butter Smooth 400g · lot review INC-2026-0842", body: "Draft stop-sale and inventory reconciliation request.", status: "draft", created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, incident_id: 1, partner_id: 6, partner: "GreenChoice Organics US Distribution", subject: "Action requested: Organic Peanut Butter Smooth 400g (Export US) · lot review INC-2026-0842", body: "Draft stop-sale and inventory reconciliation request.", status: "draft", created_at: new Date(Date.now() - 1800000).toISOString() }
];

const DEMO_PROFILES = [
  {
    code: "IN-FSSAI",
    name: "India · FSSAI",
    authority: "Food Safety and Standards Authority of India",
    framework: "Food Safety and Standards Act, 2006 · Section 28; Food Safety and Standards (Food Recall Procedure) Regulations, 2017",
    requirements: [
      "Maintain traceable records for the affected food and relevant distribution chain.",
      "Where the operator has reason to believe food is non-compliant, initiate withdrawal/recall procedures and inform the competent authority as required.",
      "Coordinate with supplied businesses and verify that affected product is no longer distributed or sold.",
      "Track returned product, recall progress and follow-up actions; preserve the post-recall record."
    ],
    workflow: [
      "Confirm affected food and lot codes",
      "Map supplier, processing and distribution records",
      "Prepare required authority and recipient information",
      "Coordinate withdrawal / recall actions",
      "Verify recipients stopped sale and distribution",
      "Reconcile returns and complete post-recall review"
    ],
    sources: [
      { label: "FSSAI · Food Recall", url: "https://fssai.gov.in/food-law/food-recall" },
      { label: "FSSAI · Food Recall FAQs", url: "https://fssai.gov.in/upload/uploadfiles/files/08_05_2024-Frequently%20Asked%20Questions%20on%20food%20recall-%20revised.pdf" }
    ],
    notice: "Operational checklist only. This is not legal advice or an official FSSAI filing. Confirm current requirements with qualified regulatory counsel and the competent authority."
  },
  {
    code: "US-FDA",
    name: "United States · FDA",
    authority: "U.S. Food and Drug Administration",
    framework: "Applicable FDA recall guidance and, where applicable, 21 CFR Part 117 / FSMA requirements",
    requirements: [
      "Assess the hazard and determine whether a recall is appropriate with qualified decision-makers.",
      "Maintain a written recall plan where required by applicable preventive-controls rules.",
      "Identify consignees and prepare direct notification and public communication as appropriate.",
      "Conduct effectiveness checks and document product disposition and recall progress.",
      "Apply FSMA Section 204 enhanced traceability obligations only to covered foods, entities and activities."
    ],
    workflow: [
      "Assess hazard and affected product scope",
      "Identify direct consignees and distribution records",
      "Prepare recall communications and strategy",
      "Coordinate removal and product disposition",
      "Perform effectiveness checks",
      "Document outcome and required notifications"
    ],
    sources: [
      { label: "FDA · Recalls, Market Withdrawals & Safety Alerts", url: "https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts" },
      { label: "FDA · Recalls Guidance and Industry Resources", url: "https://www.fda.gov/food/compliance-enforcement-food/industry-guidance-recalls" },
      { label: "FDA · Food Traceability Rule", url: "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods" }
    ],
    notice: "Operational checklist only. FDA requirements are fact-specific. FSMA Section 204 applies to covered foods and activities; the FDA has announced it will not enforce the traceability rule before July 20, 2028. Confirm current rules with qualified counsel."
  }
];

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const backendUrl = process.env.BACKEND_API_URL ? process.env.BACKEND_API_URL.replace(/\/+$/, "") : "";
  const url = req.url || "/";
  const path = url.split("?")[0].replace(/^\/api\/?/, "");

  // -------------------------------------------------------------
  // MODE 1: PROXY TO PERSISTENT VULTR BACKEND (when configured)
  // -------------------------------------------------------------
  if (backendUrl) {
    try {
      const targetUrl = `${backendUrl}${url}`;
      const forwardHeaders = { ...req.headers };
      delete forwardHeaders.host;
      delete forwardHeaders.connection;
      delete forwardHeaders["content-length"];

      let bodyData = undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        if (typeof req.body === "object" && req.body !== null && !Buffer.isBuffer(req.body)) {
          bodyData = JSON.stringify(req.body);
        } else {
          bodyData = req.body;
        }
      }

      const backendResponse = await fetch(targetUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: bodyData,
        redirect: "manual"
      });

      // Forward response headers
      backendResponse.headers.forEach((val, key) => {
        if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
          res.setHeader(key, val);
        }
      });

      const data = await backendResponse.arrayBuffer();
      res.status(backendResponse.status);
      return res.send(Buffer.from(data));
    } catch (err) {
      console.error("[Vercel API Proxy Error]", err);
      return res.status(502).json({
        detail: "Could not connect to persistent backend on Vultr.",
        backend_url: backendUrl,
        error: err.message
      });
    }
  }

  // -------------------------------------------------------------
  // MODE 2: REASONING DEMO FALLBACK (Standalone Vercel Deployment)
  // -------------------------------------------------------------
  if (path === "health") {
    return res.status(200).json({
      status: "ok",
      service: "batchbridge-api",
      version: "2.4.0",
      environment: "vercel-edge",
      backend_configured: Boolean(backendUrl)
    });
  }

  if (path === "auth/login") {
    const { email, password } = req.body || {};
    if (email === "demo@batchbridge.ai" && password === "BatchBridgeDemo#2026") {
      return res.status(200).json({
        access_token: "mock-jwt-token-vercel-preview-2026",
        token_type: "bearer",
        user: DEMO_USER,
        tenant: DEMO_TENANT
      });
    }
    // Allow any demo credential test
    if (email && password) {
      return res.status(200).json({
        access_token: "mock-jwt-token-vercel-preview-2026",
        token_type: "bearer",
        user: { ...DEMO_USER, email },
        tenant: DEMO_TENANT
      });
    }
    return res.status(401).json({ detail: "Invalid email or password" });
  }

  if (path === "auth/register") {
    const { email, full_name, company_name } = req.body || {};
    const tenant = { name: company_name || "New Org", slug: "new-org", plan: "standard", markets: ["IN", "US"] };
    const user = { id: 2, email: email || "user@demo.ai", full_name: full_name || "User", role: "quality_manager", tenant_id: 1 };
    return res.status(200).json({
      access_token: "mock-jwt-token-vercel-preview-2026",
      token_type: "bearer",
      user,
      tenant
    });
  }

  if (path === "auth/me") {
    return res.status(200).json({
      user: DEMO_USER,
      tenant: DEMO_TENANT
    });
  }

  if (path === "dashboard") {
    return res.status(200).json({
      metrics: {
        active_incidents: 1,
        critical_incidents: 1,
        partners: DEMO_PARTNERS.length,
        tracked_lots: DEMO_TRACE.lots.length,
        pending_approvals: DEMO_ACTIONS.filter(a => a.status === "pending_approval").length,
        pending_acknowledgements: DEMO_TRACE.shipments.filter(s => s.acknowledgement !== "acknowledged").length,
        shipments: DEMO_TRACE.shipments.length
      },
      incidents: DEMO_INCIDENTS,
      activities: DEMO_ACTIVITIES,
      agent_runs: DEMO_RUNS,
      tenant: DEMO_TENANT
    });
  }

  if (path === "incidents") {
    if (req.method === "POST") {
      const newInc = {
        id: DEMO_INCIDENTS.length + 1,
        code: `INC-2026-08${40 + DEMO_INCIDENTS.length + 1}`,
        title: req.body?.title || "Incident Report",
        product_name: req.body?.product_name || "Organic Food Product",
        lot_code: req.body?.lot_code || "ING-4502",
        issue_type: req.body?.issue_type || "quality",
        severity: req.body?.severity || "high",
        status: "open",
        market: req.body?.market || "GLOBAL",
        description: req.body?.description || "",
        source: req.body?.source || "quality_check",
        owner: DEMO_USER.full_name,
        impacted_lots: 4,
        impacted_partners: 5,
        affected_quantity: 18400,
        unit: "JARS",
        recall_progress: 0,
        analysis: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return res.status(201).json(newInc);
    }
    return res.status(200).json({ items: DEMO_INCIDENTS, total: DEMO_INCIDENTS.length });
  }

  if (path.startsWith("incidents/") && path.endsWith("/investigate") && req.method === "POST") {
    return res.status(200).json({
      incident: DEMO_INCIDENTS[0],
      trace: DEMO_TRACE,
      actions: DEMO_ACTIONS,
      agents: DEMO_INCIDENTS[0].analysis.agents,
      narrative: "Investigation complete. Raw material ING-4502 traced through 2 production batches into 4 finished goods lots. 13,200 consumer units have been dispatched to 5 downstream partners across India and US markets. Regulatory stop-sale notices drafted with human approval gates.",
      execution_time_seconds: 0.82
    });
  }

  if (path.startsWith("incidents/") && path.includes("/documents") && req.method === "POST") {
    return res.status(201).json({
      id: 3,
      filename: "Uploaded_Evidence_Document.pdf",
      size_bytes: 350000,
      sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      extracted_characters: 1240,
      uploaded_by: DEMO_USER.full_name
    });
  }

  if (path.startsWith("incidents/")) {
    if (req.method === "PATCH") {
      return res.status(200).json({
        ...DEMO_INCIDENTS[0],
        status: req.body?.status || DEMO_INCIDENTS[0].status,
        owner: req.body?.owner || DEMO_INCIDENTS[0].owner,
        updated_at: new Date().toISOString()
      });
    }
    return res.status(200).json({
      incident: DEMO_INCIDENTS[0],
      actions: DEMO_ACTIONS,
      activities: DEMO_ACTIVITIES,
      documents: DEMO_DOCUMENTS,
      notices: DEMO_NOTICES
    });
  }

  if (path.startsWith("actions/") && path.includes("/decision") && req.method === "POST") {
    const decision = req.body?.decision || "approve";
    return res.status(200).json({
      status: "success",
      decision,
      notice_count: 5,
      updated_at: new Date().toISOString()
    });
  }

  if (path.startsWith("traceability/") || path === "trace") {
    return res.status(200).json(DEMO_TRACE);
  }

  if (path === "partners") {
    if (req.method === "POST") {
      const newPartner = {
        id: DEMO_PARTNERS.length + 1,
        ...req.body,
        status: "active",
        risk_score: 15
      };
      return res.status(201).json(newPartner);
    }
    return res.status(200).json({ items: DEMO_PARTNERS, total: DEMO_PARTNERS.length });
  }

  if (path === "notices") {
    return res.status(200).json({
      items: DEMO_NOTICES,
      total: DEMO_NOTICES.length
    });
  }

  if (path === "agents/runs") {
    return res.status(200).json({
      items: DEMO_RUNS,
      total: DEMO_RUNS.length
    });
  }

  if (path === "compliance/profiles" || path === "regulatory/profiles") {
    return res.status(200).json({
      profiles: DEMO_PROFILES,
      disclaimer: "Operational reference only. Verify current legal obligations with qualified counsel and the relevant authority."
    });
  }

  if (path.startsWith("shipments/") && path.includes("/acknowledgement")) {
    return res.status(200).json({
      status: "acknowledged",
      updated_at: new Date().toISOString()
    });
  }

  if (path === "recall-simulations") {
    return res.status(200).json({
      simulation_id: `DRILL-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`,
      lot_code: req.body?.lot_code || "ING-4502",
      market: req.body?.market || "GLOBAL",
      score: 94,
      label: "Recall readiness snapshot",
      checks: [
        { name: "Genealogy traversal", status: "pass", detail: "4 finished goods lots traced across 2 transformation steps." },
        { name: "Shipment visibility", status: "pass", detail: "6 distribution shipments mapped with valid partner references." },
        { name: "Partner directory completeness", status: "pass", detail: "All 5 connected downstream entities have complete contact and location records." },
        { name: "Recipient acknowledgement", status: "warn", detail: "6 shipments awaiting confirmation response from distribution network." },
        { name: "Evidence reconciliation", status: "pass", detail: "Lab certificate and delivery challan SHA-256 fingerprints verified." }
      ],
      metrics: {
        lots: 5,
        finished_lots: 4,
        partners: 5,
        shipments: 6,
        finished_quantity: 18400,
        shipped_quantity: 13200
      },
      recommendations: [
        "Validate all physical on-hand quantities against ERP/warehouse records.",
        "Resolve every unacknowledged shipment before relying on the distribution map.",
        "Rehearse recipient contact and escalation using approved communication channels.",
        "Have the recall lead and regulatory counsel review the jurisdiction-specific response."
      ],
      disclaimer: "A readiness drill using records in this demo workspace. It does not certify regulatory compliance or prove a real recall would be effective."
    });
  }

  if (path === "ai/test") {
    return res.status(200).json({
      ok: true,
      provider: "Vultr Serverless Inference",
      model: "deepseek-v4.1-flash-1017",
      available_models: 8
    });
  }

  if (path === "activities") {
    return res.status(200).json({
      items: DEMO_ACTIVITIES,
      total: DEMO_ACTIVITIES.length
    });
  }

  if (path === "settings/workspace") {
    return res.status(200).json({
      tenant: DEMO_TENANT,
      user: DEMO_USER,
      ai: {
        configured: Boolean(backendUrl),
        provider: backendUrl ? "Vultr Serverless Inference (via Backend)" : "Vultr Serverless Inference (Ready - connect BACKEND_API_URL)",
        model: "deepseek-v4.1-flash-1017"
      },
      limits: { max_upload_mb: 15 },
      mode: backendUrl ? "connected_vultr" : "vercel_preview",
      note: backendUrl ? "Connected to persistent Vultr backend" : "Vercel Frontend active. Configure BACKEND_API_URL in Vercel project environment variables to link your persistent Vultr VM."
    });
  }

  // Fallback for any other API route
  return res.status(200).json({
    message: "BatchBridge AI API endpoint",
    path,
    mode: "vercel_serverless"
  });
}
