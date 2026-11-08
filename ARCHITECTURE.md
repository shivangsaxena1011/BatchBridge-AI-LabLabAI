# Architecture and agent execution boundaries

## Request path

Browser → same-origin FastAPI API → tenant-scoped service query → deterministic traceability tools → agent orchestration → optional Vultr Serverless Inference → persisted findings / proposed actions → human decision → audit activity.

## Agent responsibilities

| Agent | Responsibility | Allowed execution |
|---|---|---|
| Evidence Intake | Validate incident metadata and evidence inventory | File metadata and extracted text inspection |
| Traceability | Resolve input/output lot relationships and shipment recipients | Read-only SQL queries |
| Impact Assessment | Sum lot quantities and shipments; flag mismatches | Deterministic calculations |
| Regulatory Mapping | Load selected country reference pack | Static, versioned reference data |
| Recall Coordination | Prepare proposed operational tasks | Create pending approval records only |
| Recall Verification | Identify acknowledgement and return gaps | Deterministic shipment queries |
| AI Reasoning | Explain confirmed facts, uncertainties and suggested next steps | Vultr chat completion; no direct database writes |

## Action approval effects in this prototype

- **Internal hold:** changes the local status of linked finished-goods lot records to `quarantined`. It does not connect to warehouse equipment or prevent physical shipment.
- **Partner notice preparation:** creates partner-specific message drafts. It does not send email or other external messages.
- **Acknowledgement request:** updates local tracking status to `requested`. It does not send a message.
- **Regulatory dossier:** stores a structured snapshot for authorized review. It is not submitted to a regulator.
- **Effectiveness check:** records the coordination step. A human must reconcile shipment acknowledgements and quantities.

## Tenant isolation

Every organization-owned table carries `tenant_id`. API access is resolved from an expiring signed bearer token; query paths filter by the authenticated tenant. Registration creates an isolated tenant and administrator. This requires independent security review and additional controls before enterprise rollout.

## Vultr inference boundary

The server sends `Authorization: Bearer <key>` to the OpenAI-compatible Vultr Serverless Inference endpoint. The key is loaded from server environment variables and is not returned by any settings endpoint. LLM output is treated as untrusted text. It cannot select arbitrary tools or commit database changes. Deterministic services compute all lot and shipment relationships.
