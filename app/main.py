from __future__ import annotations

import hashlib, json, os, re, time, uuid
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import httpx
import jwt
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, desc, or_
from sqlalchemy.orm import Session

from app.config import settings, STATIC_DIR, UPLOAD_DIR
from app.database import Base, engine, get_db, SessionLocal
from app.models import Tenant, User, Partner, Lot, LotTransformation, Shipment, Incident, IncidentAction, Activity, EvidenceDocument, AgentRun, PartnerNotice, utcnow
from app.security import verify_password, create_access_token, get_current_user, hash_password
from app.seed import seed_demo
from app.rules import REGULATORY_PROFILES, profile_for_market
from app.traceability import build_trace
from app.agents import run_investigation

@asynccontextmanager
async def lifespan(application: FastAPI):
    Base.metadata.create_all(bind=engine)
    if settings.seed_demo_data:
        with SessionLocal() as db:
            seed_demo(db)
    yield

app = FastAPI(title="BatchBridge AI API", version=settings.app_version, description="Evidence-led food traceability and recall operations", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=False, allow_methods=["GET", "POST", "PATCH", "PUT", "OPTIONS"], allow_headers=["Authorization", "Content-Type"])

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

LOGIN_ATTEMPTS: dict[str, list[float]] = {}

class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)

class RegisterInput(BaseModel):
    organization: str = Field(min_length=2, max_length=160)
    full_name: str = Field(min_length=2, max_length=140)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

class IncidentInput(BaseModel):
    title: str = Field(min_length=5, max_length=220)
    product_name: str = Field(min_length=2, max_length=180)
    lot_code: str = Field(min_length=2, max_length=100)
    issue_type: str = "quality"
    severity: Literal["low", "medium", "high", "critical"] = "high"
    market: Literal["IN", "US", "GLOBAL"] = "IN"
    description: str = Field(min_length=10, max_length=5000)
    source: str = "manual"

class IncidentUpdate(BaseModel):
    status: Literal["open", "investigating", "contained", "monitoring", "closed"] | None = None
    owner: str | None = Field(default=None, max_length=140)
    severity: Literal["low", "medium", "high", "critical"] | None = None

class ActionDecision(BaseModel):
    decision: Literal["approve", "reject"]
    reason: str = Field(default="", max_length=1000)

class PartnerInput(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    kind: Literal["supplier", "manufacturer", "distributor", "retailer", "laboratory", "logistics"]
    country: Literal["IN", "US"]
    city: str = ""
    contact_name: str = ""
    email: str = ""

class ShipmentAckInput(BaseModel):
    acknowledgement: Literal["acknowledged", "unable_to_locate", "in_progress"]
    removed_quantity: float = Field(default=0, ge=0)
    returned_quantity: float = Field(default=0, ge=0)
    note: str = Field(default="", max_length=1000)

class SimulationInput(BaseModel):
    lot_code: str = Field(min_length=2, max_length=100)
    market: Literal["IN", "US", "GLOBAL"] = "GLOBAL"


def _user_dict(user: User):
    return {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role, "tenant_id": user.tenant_id}

def _incident_dict(x: Incident):
    return {"id": x.id, "code": x.code, "title": x.title, "product_name": x.product_name, "lot_code": x.lot_code, "issue_type": x.issue_type, "severity": x.severity, "status": x.status, "market": x.market, "description": x.description, "source": x.source, "impacted_lots": x.impacted_lots, "impacted_partners": x.impacted_partners, "affected_quantity": x.affected_quantity, "unit": x.unit, "recall_progress": x.recall_progress, "owner": x.owner, "analysis": x.analysis or {}, "created_at": x.created_at.isoformat() if x.created_at else None, "updated_at": x.updated_at.isoformat() if x.updated_at else None}

def _action_dict(x: IncidentAction):
    return {"id": x.id, "incident_id": x.incident_id, "action_type": x.action_type, "title": x.title, "description": x.description, "target": x.target, "status": x.status, "risk_level": x.risk_level, "payload": x.payload or {}, "approved_by": x.approved_by, "decided_at": x.decided_at.isoformat() if x.decided_at else None, "created_at": x.created_at.isoformat() if x.created_at else None}

def _activity_dict(x: Activity):
    return {"id": x.id, "incident_id": x.incident_id, "actor": x.actor, "actor_type": x.actor_type, "action": x.action, "detail": x.detail, "metadata": x.metadata_json or {}, "created_at": x.created_at.isoformat() if x.created_at else None}

def _partner_dict(x: Partner):
    return {"id": x.id, "name": x.name, "kind": x.kind, "country": x.country, "city": x.city, "contact_name": x.contact_name, "email": x.email, "status": x.status, "risk_score": x.risk_score}

def _notice_dict(x: PartnerNotice, partner: Partner | None = None):
    return {"id": x.id, "incident_id": x.incident_id, "partner_id": x.partner_id, "partner": partner.name if partner else "Partner", "subject": x.subject, "body": x.body, "status": x.status, "created_at": x.created_at.isoformat() if x.created_at else None}

def _audit(db: Session, user: User | None, tenant_id: int, incident_id: int | None, action: str, detail: str, actor: str | None = None, actor_type: str | None = None, metadata: dict | None = None):
    db.add(Activity(tenant_id=tenant_id, incident_id=incident_id, actor=actor or (user.full_name if user else "System"), actor_type=actor_type or ("user" if user else "system"), action=action, detail=detail, metadata_json=metadata or {}))

def _require_incident(db: Session, tenant_id: int, incident_id: int) -> Incident:
    incident = db.query(Incident).filter(Incident.id == incident_id, Incident.tenant_id == tenant_id).first()
    if not incident: raise HTTPException(404, "Incident not found")
    return incident

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "batchbridge-api", "version": settings.app_version, "environment": settings.app_env}

@app.post("/api/auth/login")
def login(data: LoginInput, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    hits = [t for t in LOGIN_ATTEMPTS.get(ip, []) if now - t < 900]
    if len(hits) >= 8:
        raise HTTPException(429, "Too many sign-in attempts. Please try again in 15 minutes.")
    user = db.query(User).filter(func.lower(User.email) == data.email.lower()).first()
    if not user or not user.active or not verify_password(data.password, user.password_hash):
        hits.append(now); LOGIN_ATTEMPTS[ip] = hits
        raise HTTPException(401, "Email or password is incorrect")
    LOGIN_ATTEMPTS[ip] = []
    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer", "expires_in": settings.jwt_expire_minutes * 60, "user": _user_dict(user)}

@app.post("/api/auth/register", status_code=201)
def register(data: RegisterInput, db: Session = Depends(get_db)):
    if db.query(User).filter(func.lower(User.email) == data.email.lower()).first():
        raise HTTPException(409, "An account with this email already exists")
    # Password quality checks are deliberately simple and explainable; enable SSO/MFA for enterprise rollout.
    if not any(c.islower() for c in data.password) or not any(c.isupper() for c in data.password) or not any(c.isdigit() for c in data.password) or not any(not c.isalnum() for c in data.password):
        raise HTTPException(422, "Use at least one lowercase letter, uppercase letter, number and symbol")
    base = re.sub(r"[^a-z0-9]+", "-", data.organization.lower()).strip("-")[:55] or "food-business"
    slug = base
    suffix = 2
    while db.query(Tenant).filter(Tenant.slug == slug).first():
        slug = f"{base}-{suffix}"; suffix += 1
    tenant = Tenant(name=data.organization, slug=slug, plan="Pilot", markets=["IN", "US"])
    db.add(tenant); db.flush()
    user = User(tenant_id=tenant.id, email=data.email.lower(), full_name=data.full_name, password_hash=hash_password(data.password), role="admin")
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_access_token(user), "token_type": "bearer", "expires_in": settings.jwt_expire_minutes * 60, "user": _user_dict(user)}

@app.get("/api/auth/me")
def me(user: User = Depends(get_current_user)):
    return {"user": _user_dict(user)}

@app.get("/api/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = user.tenant_id
    incidents = db.query(Incident).filter(Incident.tenant_id == tenant_id).order_by(desc(Incident.updated_at)).all()
    partners = db.query(Partner).filter(Partner.tenant_id == tenant_id).all()
    lots = db.query(Lot).filter(Lot.tenant_id == tenant_id).all()
    shipments = db.query(Shipment).filter(Shipment.tenant_id == tenant_id).all()
    pending_actions = db.query(IncidentAction).filter(IncidentAction.tenant_id == tenant_id, IncidentAction.status == "pending_approval").count()
    pending_ack = sum(1 for x in shipments if x.acknowledgement != "acknowledged")
    active = [x for x in incidents if x.status not in ("closed", "contained")]
    critical = sum(1 for x in incidents if x.severity == "critical" and x.status != "closed")
    recent_activity = db.query(Activity).filter(Activity.tenant_id == tenant_id).order_by(desc(Activity.created_at)).limit(8).all()
    runs = db.query(AgentRun).filter(AgentRun.tenant_id == tenant_id).order_by(desc(AgentRun.created_at)).limit(5).all()
    return {
        "metrics": {"active_incidents": len(active), "critical_incidents": critical, "partners": len(partners), "tracked_lots": len(lots), "pending_approvals": pending_actions, "pending_acknowledgements": pending_ack, "shipments": len(shipments)},
        "incidents": [_incident_dict(x) for x in incidents[:8]],
        "activities": [_activity_dict(x) for x in recent_activity],
        "agent_runs": [{"id": x.id, "run_type": x.run_type, "status": x.status, "provider": x.provider, "model": x.model, "summary": x.summary, "duration_ms": x.duration_ms, "created_at": x.created_at.isoformat() if x.created_at else None} for x in runs],
        "tenant": {"name": db.query(Tenant).filter(Tenant.id == tenant_id).first().name, "markets": db.query(Tenant).filter(Tenant.id == tenant_id).first().markets},
    }

@app.get("/api/incidents")
def list_incidents(status_filter: str | None = None, market: str | None = None, q: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Incident).filter(Incident.tenant_id == user.tenant_id)
    if status_filter: query = query.filter(Incident.status == status_filter)
    if market and market != "GLOBAL": query = query.filter(Incident.market.in_([market, "GLOBAL"]))
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Incident.code.ilike(like), Incident.title.ilike(like), Incident.lot_code.ilike(like), Incident.product_name.ilike(like)))
    items = query.order_by(desc(Incident.updated_at)).all()
    return {"items": [_incident_dict(x) for x in items], "total": len(items)}

@app.post("/api/incidents", status_code=201)
def create_incident(data: IncidentInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    source_lot = db.query(Lot).filter(Lot.tenant_id == user.tenant_id, func.lower(Lot.code) == data.lot_code.lower()).first()
    if not source_lot:
        raise HTTPException(422, "The source lot is not in the traceability register. Add the lot or verify the code before opening this incident.")
    count = db.query(Incident).filter(Incident.tenant_id == user.tenant_id).count() + 1
    incident = Incident(tenant_id=user.tenant_id, code=f"BB-{utcnow().year}-{count:03d}", title=data.title, product_name=data.product_name, lot_code=source_lot.code, issue_type=data.issue_type, severity=data.severity, market=data.market, description=data.description, source=data.source, owner=user.full_name, status="open")
    db.add(incident); db.flush()
    _audit(db, user, user.tenant_id, incident.id, "incident_opened", f"Incident {incident.code} opened for source lot {incident.lot_code}.")
    db.commit(); db.refresh(incident)
    return _incident_dict(incident)

@app.get("/api/incidents/{incident_id}")
def incident_detail(incident_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    incident = _require_incident(db, user.tenant_id, incident_id)
    actions = db.query(IncidentAction).filter(IncidentAction.tenant_id == user.tenant_id, IncidentAction.incident_id == incident_id).order_by(IncidentAction.id.asc()).all()
    activities = db.query(Activity).filter(Activity.tenant_id == user.tenant_id, Activity.incident_id == incident_id).order_by(desc(Activity.created_at)).limit(50).all()
    docs = db.query(EvidenceDocument).filter(EvidenceDocument.tenant_id == user.tenant_id, EvidenceDocument.incident_id == incident_id).order_by(desc(EvidenceDocument.created_at)).all()
    notices = db.query(PartnerNotice).filter(PartnerNotice.tenant_id == user.tenant_id, PartnerNotice.incident_id == incident_id).order_by(desc(PartnerNotice.created_at)).all()
    notice_data = []
    for n in notices:
        p = db.query(Partner).filter(Partner.id == n.partner_id, Partner.tenant_id == user.tenant_id).first()
        notice_data.append(_notice_dict(n, p))
    return {"incident": _incident_dict(incident), "actions": [_action_dict(x) for x in actions], "activities": [_activity_dict(x) for x in activities], "documents": [{"id": d.id, "filename": d.filename, "content_type": d.content_type, "size_bytes": d.size_bytes, "sha256": d.sha256, "uploaded_by": d.uploaded_by, "created_at": d.created_at.isoformat() if d.created_at else None, "has_extracted_text": bool(d.extracted_text)} for d in docs], "notices": notice_data}

@app.patch("/api/incidents/{incident_id}")
def update_incident(incident_id: int, data: IncidentUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    incident = _require_incident(db, user.tenant_id, incident_id)
    changes = data.model_dump(exclude_none=True)
    if not changes: return _incident_dict(incident)
    for key, value in changes.items(): setattr(incident, key, value)
    incident.updated_at = utcnow()
    _audit(db, user, user.tenant_id, incident.id, "incident_updated", "Updated " + ", ".join(changes.keys()) + ".", metadata=changes)
    db.commit(); db.refresh(incident)
    return _incident_dict(incident)

@app.post("/api/incidents/{incident_id}/investigate")
def investigate(incident_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    incident = _require_incident(db, user.tenant_id, incident_id)
    result = run_investigation(db, incident, user.full_name)
    return {"incident": _incident_dict(result["incident"]), "trace": result["trace"], "actions": [_action_dict(x) for x in result["actions"]], "agents": result["agents"], "run": {"id": result["run"].id, "provider": result["run"].provider, "model": result["run"].model, "duration_ms": result["run"].duration_ms}}

@app.get("/api/traceability/{lot_code}")
def traceability(lot_code: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = build_trace(db, user.tenant_id, lot_code)
    if not result["found"]: raise HTTPException(404, "Lot code not found in this workspace")
    return result

@app.get("/api/partners")
def list_partners(q: str | None = None, country: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Partner).filter(Partner.tenant_id == user.tenant_id)
    if q: query = query.filter(or_(Partner.name.ilike(f"%{q}%"), Partner.city.ilike(f"%{q}%")))
    if country: query = query.filter(Partner.country == country)
    items = query.order_by(Partner.country, Partner.kind, Partner.name).all()
    return {"items": [_partner_dict(x) for x in items], "total": len(items)}

@app.post("/api/partners", status_code=201)
def create_partner(data: PartnerInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if db.query(Partner).filter(Partner.tenant_id == user.tenant_id, func.lower(Partner.name) == data.name.lower()).first():
        raise HTTPException(409, "A partner with this name already exists")
    item = Partner(tenant_id=user.tenant_id, **data.model_dump())
    db.add(item); db.flush()
    _audit(db, user, user.tenant_id, None, "partner_created", f"Partner {item.name} added to the network.")
    db.commit(); db.refresh(item)
    return _partner_dict(item)

@app.get("/api/actions")
def list_actions(status_filter: str | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(IncidentAction).filter(IncidentAction.tenant_id == user.tenant_id)
    if status_filter: query = query.filter(IncidentAction.status == status_filter)
    items = query.order_by(desc(IncidentAction.created_at)).limit(100).all()
    return {"items": [_action_dict(x) for x in items], "total": len(items)}

@app.post("/api/actions/{action_id}/decision")
def decide_action(action_id: int, data: ActionDecision, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    action = db.query(IncidentAction).filter(IncidentAction.id == action_id, IncidentAction.tenant_id == user.tenant_id).first()
    if not action: raise HTTPException(404, "Proposed action not found")
    if user.role not in ("admin", "quality_manager", "recall_lead"):
        raise HTTPException(403, "Only an authorized quality manager or recall lead may decide this action")
    if action.status != "pending_approval": raise HTTPException(409, "This action has already been decided")
    incident = _require_incident(db, user.tenant_id, action.incident_id)
    action.status = "approved" if data.decision == "approve" else "rejected"
    action.approved_by = user.full_name
    action.decided_at = utcnow()
    action.payload = {**(action.payload or {}), "decision_reason": data.reason}
    side_effect = ""
    if data.decision == "approve":
        if action.action_type == "quarantine_inventory":
            trace = build_trace(db, user.tenant_id, incident.lot_code)
            codes = [x["code"] for x in trace["lots"] if x["type"] == "finished"]
            if codes:
                db.query(Lot).filter(Lot.tenant_id == user.tenant_id, Lot.code.in_(codes)).update({"status": "quarantined"}, synchronize_session=False)
            side_effect = f"Internal quality state updated for {len(codes)} affected finished-goods lots. This does not physically stop shipment or notify a facility system."
        elif action.action_type == "notify_partner":
            trace = build_trace(db, user.tenant_id, incident.lot_code)
            existing = {x.partner_id for x in db.query(PartnerNotice).filter(PartnerNotice.tenant_id == user.tenant_id, PartnerNotice.incident_id == incident.id).all()}
            created = 0
            for shipment in trace["shipments"]:
                pid = shipment["partner_id"]
                if pid in existing: continue
                partner = db.query(Partner).filter(Partner.id == pid, Partner.tenant_id == user.tenant_id).first()
                if not partner: continue
                subject = f"Action requested: {incident.product_name} · lot review {incident.code}"
                body = (f"This is a draft operational notice for review.\n\nIncident: {incident.code}\nProduct: {incident.product_name}\nAffected lot: {shipment['lot_code']}\nShipment reference: {shipment['reference']}\nRequested response: confirm stop-sale status, stock on hand, quantity removed and quantity returned.\n\nDo not distribute or sell potentially affected stock pending instructions from your organization's authorized recall lead.\n\nThis message has not been sent. Verify facts and approve external communication through your organization's process.")
                db.add(PartnerNotice(tenant_id=user.tenant_id, incident_id=incident.id, partner_id=pid, subject=subject, body=body, status="draft")); created += 1; existing.add(pid)
            side_effect = f"Created {created} recipient-specific notice drafts. No email or external message was sent."
        elif action.action_type == "request_acknowledgement":
            trace = build_trace(db, user.tenant_id, incident.lot_code)
            shipment_ids = [x["id"] for x in trace["shipments"]]
            if shipment_ids:
                db.query(Shipment).filter(Shipment.tenant_id == user.tenant_id, Shipment.id.in_(shipment_ids), Shipment.acknowledgement == "pending").update({"acknowledgement": "requested"}, synchronize_session=False)
            side_effect = f"Updated acknowledgement tracking for {len(shipment_ids)} shipment records. This does not send a notification."
        elif action.action_type == "regulatory_dossier":
            trace = build_trace(db, user.tenant_id, incident.lot_code)
            action.payload = {**(action.payload or {}), "dossier": {"incident": _incident_dict(incident), "trace_metrics": trace["metrics"], "regulatory_profiles": [p["code"] for p in profile_for_market(incident.market)], "generated_at": utcnow().isoformat(), "review_required": True}}
            side_effect = "A structured dossier snapshot was generated for authorized review. It is not an official regulatory filing."
        elif action.action_type == "effectiveness_check":
            side_effect = "Effectiveness check is now active in the incident workspace. Reconcile acknowledgements and returns before closure."
        _audit(db, user, user.tenant_id, incident.id, "action_approved", f"Approved: {action.title}. {side_effect}", metadata={"action_id": action.id, "action_type": action.action_type})
    else:
        _audit(db, user, user.tenant_id, incident.id, "action_rejected", f"Rejected: {action.title}. {data.reason}", metadata={"action_id": action.id})
    db.commit(); db.refresh(action)
    return {"action": _action_dict(action), "side_effect": side_effect or "No operational change was made.", "notice_count": db.query(PartnerNotice).filter(PartnerNotice.tenant_id == user.tenant_id, PartnerNotice.incident_id == incident.id).count()}

@app.get("/api/notices")
def list_notices(incident_id: int | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(PartnerNotice).filter(PartnerNotice.tenant_id == user.tenant_id)
    if incident_id: q = q.filter(PartnerNotice.incident_id == incident_id)
    items = q.order_by(desc(PartnerNotice.created_at)).all()
    return {"items": [_notice_dict(x, db.query(Partner).filter(Partner.id == x.partner_id, Partner.tenant_id == user.tenant_id).first()) for x in items], "total": len(items)}

@app.post("/api/shipments/{shipment_id}/acknowledgement")
def update_acknowledgement(shipment_id: int, data: ShipmentAckInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id, Shipment.tenant_id == user.tenant_id).first()
    if not shipment: raise HTTPException(404, "Shipment not found")
    if data.removed_quantity + data.returned_quantity > shipment.quantity:
        raise HTTPException(422, "Removed plus returned quantity cannot exceed the shipped quantity")
    shipment.acknowledgement = data.acknowledgement
    shipment.removed_quantity = data.removed_quantity
    shipment.returned_quantity = data.returned_quantity
    shipment.recall_note = data.note
    incident = db.query(Incident).filter(Incident.tenant_id == user.tenant_id, Incident.lot_code == db.query(Lot.code).filter(Lot.id == shipment.lot_id).scalar_subquery()).order_by(desc(Incident.created_at)).first()
    _audit(db, user, user.tenant_id, incident.id if incident else None, "shipment_acknowledged", f"Shipment {shipment.reference} acknowledgement updated to {shipment.acknowledgement}.", metadata={"removed_quantity": data.removed_quantity, "returned_quantity": data.returned_quantity})
    db.commit()
    return {"id": shipment.id, "reference": shipment.reference, "acknowledgement": shipment.acknowledgement, "removed_quantity": shipment.removed_quantity, "returned_quantity": shipment.returned_quantity}

@app.post("/api/recall-simulations")
def run_simulation(data: SimulationInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trace = build_trace(db, user.tenant_id, data.lot_code)
    if not trace["found"]: raise HTTPException(404, "Lot code not found")
    metrics = trace["metrics"]
    shipments = trace["shipments"]
    partner_records_complete = all(bool(x["partner"]) and bool(x["country"]) for x in shipments)
    acked = sum(1 for x in shipments if x["acknowledgement"] == "acknowledged")
    ack_rate = round(acked / len(shipments) * 100) if shipments else 100
    checks = [
        {"name": "Lot genealogy resolution", "status": "pass" if metrics["lots"] >= 2 else "fail", "detail": f"{metrics['lots']} lot records linked from the selected source."},
        {"name": "Finished-goods identification", "status": "pass" if metrics["finished_lots"] > 0 else "fail", "detail": f"{metrics['finished_lots']} finished-goods lots identified."},
        {"name": "Downstream shipment visibility", "status": "pass" if metrics["shipments"] > 0 else "warn", "detail": f"{metrics['shipments']} shipment records mapped; {metrics['partners']} partners identified."},
        {"name": "Recipient master data", "status": "pass" if partner_records_complete else "warn", "detail": "Partner names and country records are present for mapped shipments." if partner_records_complete else "Some partner records are incomplete."},
        {"name": "Acknowledgement readiness", "status": "pass" if ack_rate == 100 else "warn", "detail": f"{ack_rate}% of mapped shipments are acknowledged."},
        {"name": "Quantity reconciliation", "status": "warn" if metrics["shipped_quantity"] > metrics["finished_quantity"] else "pass", "detail": f"{metrics['finished_quantity']:,.0f} finished units vs {metrics['shipped_quantity']:,.0f} shipped units. Physical counts must be confirmed."},
    ]
    score = round(sum(100 if x["status"] == "pass" else 50 if x["status"] == "warn" else 0 for x in checks) / len(checks))
    _audit(db, user, user.tenant_id, None, "mock_recall_completed", f"Mock recall run for {data.lot_code}: readiness score {score}/100.", metadata={"lot_code": data.lot_code, "score": score})
    db.commit()
    return {"simulation_id": f"DRILL-{utcnow().strftime('%Y%m%d-%H%M%S')}", "lot_code": data.lot_code, "market": data.market, "score": score, "label": "Recall readiness snapshot", "checks": checks, "metrics": metrics, "recommendations": ["Validate all physical on-hand quantities against ERP/warehouse records.", "Resolve every unacknowledged shipment before relying on the distribution map.", "Rehearse recipient contact and escalation using approved communication channels.", "Have the recall lead and regulatory counsel review the jurisdiction-specific response."], "disclaimer": "A readiness drill using records in this demo workspace. It does not certify regulatory compliance or prove a real recall would be effective."}

@app.get("/api/compliance/profiles")
def compliance_profiles(user: User = Depends(get_current_user)):
    return {"profiles": profile_for_market("GLOBAL"), "disclaimer": "Operational reference only. Verify current legal obligations with qualified counsel and the relevant authority."}

@app.get("/api/agents/runs")
def agent_runs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(AgentRun).filter(AgentRun.tenant_id == user.tenant_id).order_by(desc(AgentRun.created_at)).limit(30).all()
    return {"items": [{"id": x.id, "incident_id": x.incident_id, "run_type": x.run_type, "status": x.status, "provider": x.provider, "model": x.model, "summary": x.summary, "duration_ms": x.duration_ms, "created_at": x.created_at.isoformat() if x.created_at else None} for x in items]}

@app.get("/api/ai/status")
def ai_status(user: User = Depends(get_current_user)):
    return {
        "configured": settings.has_ai_configured,
        "provider": settings.active_ai_provider,
        "base_url": settings.active_ai_base_url,
        "model": settings.active_ai_model,
        "key_present": settings.has_ai_configured,
        "key_exposed": False,
        "available_providers": [
            {"id": "gemini", "name": "Google Gemini", "model": settings.gemini_model, "configured": bool(settings.gemini_api_key)},
            {"id": "vultr", "name": "Vultr Serverless Inference", "model": settings.vultr_model, "configured": bool(settings.vultr_api_key)},
        ]
    }

@app.post("/api/ai/test")
def ai_test(user: User = Depends(get_current_user)):
    if user.role not in ("admin", "quality_manager"):
        raise HTTPException(403, "Administrator or quality manager role required")
    if not settings.has_ai_configured:
        raise HTTPException(409, "Neither GEMINI_API_KEY nor VULTR_INFERENCE_API_KEY is configured on the server")
    
    # Priority 1: Google Gemini (if configured)
    if settings.gemini_api_key:
        headers = {"Authorization": f"Bearer {settings.gemini_api_key}", "Content-Type": "application/json"}
        payload = {
            "model": settings.gemini_model,
            "messages": [{"role": "user", "content": "Ping: confirm operational readiness in 3 words."}],
            "max_completion_tokens": 50,
            "temperature": 0.1
        }
        try:
            response = httpx.post(f"{settings.gemini_base_url.rstrip('/')}/chat/completions", headers=headers, json=payload, timeout=settings.ai_timeout_seconds)
            response.raise_for_status()
            data = response.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "Ready").strip()
            return {"ok": True, "provider": "Google Gemini", "model": settings.gemini_model, "detail": reply}
        except httpx.HTTPStatusError as exc:
            raise HTTPException(502, f"Google Gemini API returned HTTP {exc.response.status_code}")
        except Exception:
            raise HTTPException(502, "Could not reach Google Gemini API. Check server network and GEMINI_API_KEY.")

    # Priority 2: Vultr Serverless Inference
    headers = {"Authorization": f"Bearer {settings.vultr_api_key}"}
    try:
        response = httpx.get(f"{settings.vultr_base_url.rstrip('/')}/models", headers=headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        return {"ok": True, "provider": "Vultr Serverless Inference", "model": settings.vultr_model, "available_models": len(data.get("data", []))}
    except httpx.HTTPStatusError as exc:
        raise HTTPException(502, f"Vultr inference returned HTTP {exc.response.status_code}")
    except Exception:
        raise HTTPException(502, "Could not reach Vultr Serverless Inference. Check server network, key and base URL.")

@app.get("/api/activities")
def activities(incident_id: int | None = None, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Activity).filter(Activity.tenant_id == user.tenant_id)
    if incident_id: q = q.filter(Activity.incident_id == incident_id)
    items = q.order_by(desc(Activity.created_at)).limit(100).all()
    return {"items": [_activity_dict(x) for x in items]}

@app.post("/api/incidents/{incident_id}/documents", status_code=201)
async def upload_document(incident_id: int, file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    incident = _require_incident(db, user.tenant_id, incident_id)
    safe_name = Path(file.filename or "evidence.bin").name
    suffix = Path(safe_name).suffix.lower()
    allowed = {".pdf", ".txt", ".csv", ".xlsx", ".docx", ".png", ".jpg", ".jpeg"}
    if suffix not in allowed: raise HTTPException(415, "Supported evidence: PDF, DOCX, XLSX, CSV, TXT, PNG and JPG")
    content = await file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(content) > settings.max_upload_mb * 1024 * 1024: raise HTTPException(413, f"File exceeds the {settings.max_upload_mb} MB upload limit")
    if not content: raise HTTPException(422, "The uploaded file is empty")
    stored_name = f"{uuid.uuid4().hex}{suffix}"
    dest = UPLOAD_DIR / stored_name
    dest.write_bytes(content)
    extracted = ""
    try:
        if suffix == ".pdf":
            import fitz
            doc = fitz.open(stream=content, filetype="pdf")
            extracted = "\n".join(page.get_text("text") for page in doc)[:120000]
        elif suffix in (".txt", ".csv"):
            extracted = content.decode("utf-8", errors="replace")[:120000]
        elif suffix == ".xlsx":
            from openpyxl import load_workbook
            import io
            wb = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
            parts = []
            for ws in wb.worksheets:
                parts.append(f"[Sheet: {ws.title}]")
                for row in ws.iter_rows(values_only=True): parts.append(" | ".join("" if c is None else str(c) for c in row))
            extracted = "\n".join(parts)[:120000]
        elif suffix == ".docx":
            from docx import Document
            import io
            doc = Document(io.BytesIO(content))
            extracted = "\n".join(p.text for p in doc.paragraphs)[:120000]
    except Exception:
        extracted = "Text extraction was not available for this file. The original evidence file has been retained."
    digest = hashlib.sha256(content).hexdigest()
    doc_row = EvidenceDocument(tenant_id=user.tenant_id, incident_id=incident.id, filename=safe_name, stored_name=stored_name, content_type=file.content_type or "application/octet-stream", size_bytes=len(content), sha256=digest, extracted_text=extracted, uploaded_by=user.full_name)
    db.add(doc_row)
    _audit(db, user, user.tenant_id, incident.id, "evidence_uploaded", f"Evidence file {safe_name} uploaded and SHA-256 fingerprint recorded.", metadata={"sha256": digest, "size_bytes": len(content)})
    db.commit(); db.refresh(doc_row)
    return {"id": doc_row.id, "filename": doc_row.filename, "size_bytes": doc_row.size_bytes, "sha256": digest, "extracted_characters": len(extracted), "uploaded_by": doc_row.uploaded_by}

@app.get("/api/incidents/{incident_id}/evidence/{document_id}")
def get_evidence_text(incident_id: int, document_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(EvidenceDocument).filter(EvidenceDocument.id == document_id, EvidenceDocument.incident_id == incident_id, EvidenceDocument.tenant_id == user.tenant_id).first()
    if not doc: raise HTTPException(404, "Evidence document not found")
    return {"id": doc.id, "filename": doc.filename, "sha256": doc.sha256, "extracted_text": doc.extracted_text[:20000]}

@app.get("/api/settings/workspace")
def workspace_settings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    return {
        "tenant": {"name": tenant.name, "slug": tenant.slug, "plan": tenant.plan, "markets": tenant.markets},
        "user": _user_dict(user),
        "ai": {
            "configured": settings.has_ai_configured,
            "provider": settings.active_ai_provider,
            "model": settings.active_ai_model,
            "base_url": settings.active_ai_base_url
        },
        "limits": {"max_upload_mb": settings.max_upload_mb}
    }

# Static application served by the same origin as the API.
assets_dir = STATIC_DIR / "assets" if (STATIC_DIR / "assets").is_dir() else STATIC_DIR
app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/", include_in_schema=False)
def root():
    return FileResponse(STATIC_DIR / "index.html")

@app.get("/{full_path:path}", include_in_schema=False)
def frontend_fallback(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi"):
        raise HTTPException(404, "Not found")
    candidate = (STATIC_DIR / full_path).resolve()
    if STATIC_DIR.resolve() not in candidate.parents and candidate != STATIC_DIR.resolve():
        raise HTTPException(404, "Not found")
    if candidate.is_file(): return FileResponse(candidate)
    return FileResponse(STATIC_DIR / "index.html")
