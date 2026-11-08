# BatchBridge AI

**Unified food traceability and recall operations for India and the United States.**

BatchBridge is a SaaS-style operational prototype for food manufacturers, processors and distribution networks. It turns an incident signal into an evidence-linked investigation: trace the source lot through production genealogy, identify finished-goods lots and downstream shipment recipients, calculate exposure from stored records, prepare response tasks, collect human approvals and track recipient acknowledgements.

It is designed for the LabLab × Vultr **Powering the Future of Work** challenge: an enterprise workflow with multi-step agents, a real product-style web application and Vultr as the backend control layer.

> **Important status:** This repository is a deployable, production-oriented prototype and hackathon demonstration foundation. It is not yet a certified production food-safety system. Before real operational use, complete the hardening checklist below, validate regulatory workflows with qualified counsel, and connect real ERP/WMS, communication and partner systems. It does not make legal decisions, send recall notices, file with regulators or physically quarantine stock.

## What works in this build

- Organization workspace registration and sign-in with tenant-scoped records.
- Demo tenant with fictional cross-market partner, lot, production, finished-goods and shipment data.
- Incident intake against a registered source lot.
- Multi-stage agent workflow: evidence intake, traceability, impact assessment, regulatory mapping, recall coordination, verification and AI reasoning.
- Deterministic source-to-finished-lot genealogy and downstream shipment resolution. A query can start from an ingredient lot or a finished-goods lot.
- Quantity and recipient metrics derived from database records, not model guesses.
- Evidence upload (PDF, DOCX, XLSX, CSV, TXT, PNG, JPG) with file-size limit, SHA-256 fingerprint and text extraction for supported document types.
- Vultr Serverless Inference integration point using the OpenAI-compatible chat completions API. The API key remains server-side.
- Human approval/rejection gates for proposed actions. Approving a demo action can update internal lot status, create recipient-specific notice drafts, update acknowledgement tracking or generate a dossier snapshot.
- Recipient acknowledgement capture and quantity validation.
- Mock recall-readiness drill using actual records in the workspace.
- India FSSAI and US FDA operational reference profiles, kept separate by market.
- Audit activity feed and stored agent-run records.
- Dockerfile and Docker Compose stack using PostgreSQL.

## Demo access

The sample workspace is seeded on first start by default:

- **Email:** `demo@batchbridge.ai`
- **Password:** `BatchBridgeDemo#2026`

All demo organizations, suppliers, products, incidents, quantities, contacts and distribution records are fictional. Do not use demo data as real food-safety evidence.

To turn off demo seeding, set `SEED_DEMO_DATA=false` and register a new workspace from the sign-in page.

## Run locally on Windows 11

### Option A — one-click launcher

1. Install Python 3.12 (Python 3.11+ should also work).
2. Extract the repository folder.
3. Double-click `run-local.bat` or run `./run-local.ps1` from PowerShell.
4. The launcher creates `.venv`, copies `.env.example` to `.env` if needed, installs requirements and starts FastAPI.
5. Open **http://127.0.0.1:8000**.

The first run requires internet access to install Python packages. The application UI and API are served from the same origin; no Node/npm installation is required.

### Option B — manual setup

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
Copy-Item .env.example .env
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Open `http://127.0.0.1:8000`. API documentation is at `http://127.0.0.1:8000/docs`.

## Vultr Serverless Inference setup

BatchBridge supports Vultr's OpenAI-compatible API from the backend. Current base URL:

```text
https://api.vultrinference.com/v1
```

1. Create an inference API key in your Vultr console.
2. Open the repository's `.env` file on the server. Never put the key in `app/static/app.js`, HTML, a public config file, a screenshot, or Git.
3. Add:

```dotenv
VULTR_INFERENCE_API_KEY=YOUR_VULTR_SERVERLESS_INFERENCE_KEY
VULTR_INFERENCE_BASE_URL=https://api.vultrinference.com/v1
VULTR_INFERENCE_MODEL=deepseek-v4.1-flash-1017
```

4. Restart the backend.
5. Sign in and open **Workspace settings → Test Vultr connection**.
6. Open an incident and select **Run agent investigation**. The AI reasoning agent will use Vultr when configured. Otherwise the deterministic local fallback remains active and is labelled as such.

Model IDs can change. Confirm the model you intend to use against Vultr's live model catalogue before deployment. BatchBridge deliberately does not silently claim live LLM inference when the key is absent or the request fails.

## Docker / Vultr Cloud Compute deployment

Use a Vultr Cloud Compute instance with Docker Engine and the Compose plugin installed.

1. Copy `.env.example` to `.env`.
2. Set a unique, long `JWT_SECRET` (32+ random characters), a strong `DEMO_SEED_PASSWORD`, a unique `POSTGRES_PASSWORD` (use URL-safe alphanumeric characters), and your DNS name in `DOMAIN`.
3. Point the domain's A/AAAA record to the Vultr VM public IP. Open inbound TCP 80/443 (and UDP 443 for HTTP/3) in the Vultr firewall / OS firewall. Do not expose PostgreSQL publicly.
4. Add `VULTR_INFERENCE_API_KEY` if enabling inference.
5. For a production-style database, Compose sets `DATABASE_URL` to PostgreSQL; `POSTGRES_PASSWORD` is read from `.env`.
6. Decide whether to keep demo data (`SEED_DEMO_DATA=true`) or start clean (`false`).
7. Run:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f app
```

Caddy receives public traffic on ports 80/443, automatically provisions HTTPS certificates for a real DNS name, and reverse-proxies to the private app container. Open `https://YOUR_DOMAIN`. The FastAPI port is not published to the public host. Do not expose PostgreSQL to the public internet.

For production, set `APP_ENV=production`, use a unique secure `JWT_SECRET`, and use a managed PostgreSQL service or a properly backed-up private database. Docker Compose uses named PostgreSQL, application evidence and Caddy state volumes. The included Compose stack is a single-node deployment baseline; add managed monitoring, backups, upgrades and redundancy for a real enterprise service.

## Product workflow

1. **Open an incident** from a known source lot such as `ING-4502`.
2. **Run investigation.** The traceability agent resolves lot transformations and shipment recipients. The impact assessment calculates quantities from the stored records. The market mapping agent loads India, US or both reference profiles.
3. **Review findings and uncertainties.** Unknowns and incomplete records remain visible; the system does not infer missing lot relationships.
4. **Review proposed actions.** A quality manager can approve or reject the generated tasks.
5. **Record downstream responses.** Open Traceability and use **Record response** for shipment acknowledgements, removed quantities and returned quantities.
6. **Run a mock recall drill.** Use the simulation page to assess the current record set and identify gaps.

## Demo data to explore

| Lot | Role | Product / material |
|---|---|---|
| `ING-4502` | Ingredient | Organic tomato concentrate; cross-market source lot |
| `PRD-8821` | Production | Tomato sauce production run, India |
| `PRD-8822` | Production | Tomato sauce production run, United States |
| `FIN-8821-A` | Finished goods | Heritage Tomato Basil Sauce 500g |
| `FIN-8822-A` | Finished goods | Heritage Tomato Basil Sauce 500g |
| `ING-3910` | Ingredient | Chickpea flour |
| `ING-2104` | Ingredient | Ground paprika |

Try tracing both `ING-4502` and `FIN-8821-A` to see upstream and downstream resolution.

## Regulatory scope and limitations

The platform provides **configurable operational reference packs**, not a legal rules engine. India and United States flows are intentionally separate because their statutes, covered products, reporting and enforcement frameworks differ.

- India profile references the Food Safety and Standards Act, 2006, Section 28, and FSSAI Food Recall Procedure Regulations, 2017 / current FSSAI recall materials.
- US profile references applicable FDA recall guidance and applicable preventive-controls obligations. FSMA Section 204 enhanced traceability must only be applied to covered foods, covered entities and covered activities. FDA has announced that it will not enforce the Food Traceability Rule before July 20, 2028; re-check current official guidance before relying on it.
- No automated legal determination, official notification or government filing is performed.
- Recall initiation, public notices, product disposition and closure remain the responsibility of authorized people.

Primary references:

- FSSAI Food Recall: https://fssai.gov.in/food-law/food-recall
- FSSAI revised Food Recall FAQs: https://fssai.gov.in/upload/uploadfiles/files/08_05_2024-Frequently%20Asked%20Questions%20on%20food%20recall-%20revised.pdf
- FDA Recalls, Market Withdrawals & Safety Alerts: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts
- FDA Industry Guidance on Recalls: https://www.fda.gov/food/compliance-enforcement-food/industry-guidance-recalls
- FDA FSMA Food Traceability Rule: https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods

## Security and production-readiness checklist

This build includes password hashing (Argon2), signed expiring bearer tokens, tenant-scoped database access, basic login throttling, role checks on approvals, upload size/type allow-lists, private evidence storage, SHA-256 fingerprints, server-side API keys and basic security response headers. These are foundations, not a security certification.

Before real operational deployment:

- Enforce HTTPS, secure HttpOnly session cookies or enterprise SSO, MFA and account recovery.
- Replace in-process login throttling with a shared rate limiter (e.g. Redis) and configure alerting.
- Review all tenant-isolation and authorization paths with security tests and penetration testing.
- Move evidence storage to private object storage with encryption, malware scanning, retention rules and signed downloads.
- Run untrusted document parsing in a separate constrained worker; add OCR, file content inspection and stronger archive/PDF controls.
- Add formal role/permission management, data residency configuration, customer-managed retention and audit export.
- Integrate and validate ERP/WMS, email/SMS, EDI and partner portal identity/acknowledgement workflows.
- Add delivery retries, dead-letter handling, idempotency, background queues, observability, database migrations and tested disaster recovery.
- Have food-safety experts and qualified India/US regulatory counsel validate rule packs and operator procedures.
- Carry out performance tests, backup restore drills and incident-response exercises.

## Tests

```bash
python -m pip install pytest
pytest -q
```

The suite covers login, workspace isolation, lot genealogy from source and finished lots, agent investigation, human approval, notice drafting, mock recall calculation, evidence upload and shipment quantity validation.

## Hackathon materials

See [`HACKATHON_SUBMISSION.md`](HACKATHON_SUBMISSION.md) for a LabLab-ready project description and demo narrative, [`DEMO_CHECKLIST.md`](DEMO_CHECKLIST.md) for a recording run-through, and [`ARCHITECTURE.md`](ARCHITECTURE.md) for agent boundaries and action effects.

## Repository layout

```text
app/
  agents.py          # Agent orchestration and Vultr inference adapter
  config.py          # Environment configuration
  database.py        # SQLAlchemy engine/session
  main.py            # FastAPI endpoints and same-origin static app
  models.py          # Tenant, incident, lot, shipment and audit models
  rules.py           # India/US regulatory reference packs
  security.py        # Password hashing and signed bearer sessions
  seed.py            # Fictional cross-market demo dataset
  traceability.py    # Deterministic lot genealogy and downstream resolver
  static/            # Hand-authored UI, HTML, CSS and JavaScript
```

## License

MIT. See `LICENSE`.
