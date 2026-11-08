from __future__ import annotations
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Tenant, User, Partner, Lot, LotTransformation, Shipment, Incident, IncidentAction, Activity, utcnow
from app.security import hash_password
from app.config import settings


def seed_demo(db: Session):
    tenant = db.query(Tenant).filter(Tenant.slug == "northstar-foods").first()
    if tenant:
        return tenant
    tenant = Tenant(name="Northstar Foods Group", slug="northstar-foods", plan="Enterprise Pilot", markets=["IN", "US"])
    db.add(tenant); db.flush()
    db.add(User(tenant_id=tenant.id, email="demo@batchbridge.ai", full_name="Alex Morgan", password_hash=hash_password(settings.demo_seed_password), role="admin"))
    db.flush()
    partners_data = [
        ("Global Agro Foods", "supplier", "IN", "Indore", "Meera Patel", "quality@globalagro.example", 72),
        ("Northstar Foods · Plant 01", "manufacturer", "IN", "Pune", "Ravi Shah", "plant01@northstar.example", 12),
        ("FreshLink Distribution", "distributor", "IN", "Mumbai", "Kavita Rao", "ops@freshlink.example", 18),
        ("MetroMart India", "retailer", "IN", "Bengaluru", "Arjun Nair", "recalls@metromart.example", 8),
        ("Orchard Distribution East", "distributor", "US", "New Jersey", "Taylor Reed", "quality@orchard.example", 21),
        ("GreenBasket Markets", "retailer", "US", "New York", "Jordan Lee", "recalls@greenbasket.example", 9),
        ("ValleyFresh Retail", "retailer", "US", "Pennsylvania", "Morgan Clark", "safety@valleyfresh.example", 14),
        ("Northstar Foods · Plant 02", "manufacturer", "US", "New Jersey", "Sam Rivera", "plant02@northstar.example", 10),
        ("Meridian Analytics Lab", "laboratory", "IN", "Pune", "Dr. Nisha Kulkarni", "lab@meridian.example", 4),
    ]
    partners = {}
    for name, kind, country, city, contact, email, risk in partners_data:
        p = Partner(tenant_id=tenant.id, name=name, kind=kind, country=country, city=city, contact_name=contact, email=email, risk_score=risk)
        db.add(p); db.flush(); partners[name] = p
    now = utcnow()
    lot_specs = [
        ("ING-4502", "Organic tomato concentrate", "ING-TOM-01", "ingredient", 1800, "kg", "GLOBAL", "Global Agro Foods", "quarantined", now-timedelta(days=14)),
        ("PRD-8821", "Tomato basil sauce · production run", "RUN-8821", "production", 840, "kg", "IN", "Northstar Foods · Plant 01", "held", now-timedelta(days=11)),
        ("PRD-8822", "Tomato basil sauce · production run", "RUN-8822", "production", 690, "kg", "US", "Northstar Foods · Plant 02", "held", now-timedelta(days=10)),
        ("FIN-8821-A", "Heritage Tomato Basil Sauce 500g", "SKU-TBS-500", "finished", 1260, "units", "IN", "Northstar Foods · Plant 01", "quarantined", now-timedelta(days=9)),
        ("FIN-8821-B", "Heritage Tomato Basil Sauce 500g", "SKU-TBS-500", "finished", 420, "units", "IN", "Northstar Foods · Plant 01", "released", now-timedelta(days=9)),
        ("FIN-8822-A", "Heritage Tomato Basil Sauce 500g", "SKU-TBS-500", "finished", 1020, "units", "US", "Northstar Foods · Plant 02", "released", now-timedelta(days=8)),
        ("FIN-8822-B", "Heritage Tomato Basil Sauce 500g", "SKU-TBS-500", "finished", 360, "units", "US", "Northstar Foods · Plant 02", "released", now-timedelta(days=8)),
        ("ING-3910", "Chickpea flour", "ING-CHK-02", "ingredient", 900, "kg", "IN", "Global Agro Foods", "released", now-timedelta(days=20)),
        ("FIN-3910-A", "Organic Chickpea Spread 250g", "SKU-OCS-250", "finished", 2400, "units", "IN", "Northstar Foods · Plant 01", "released", now-timedelta(days=15)),
        ("FIN-3910-B", "Organic Chickpea Spread 250g", "SKU-OCS-250", "finished", 1800, "units", "US", "Northstar Foods · Plant 02", "released", now-timedelta(days=14)),
        ("ING-2104", "Ground paprika", "ING-SPC-11", "ingredient", 620, "kg", "IN", "Global Agro Foods", "released", now-timedelta(days=30)),
        ("FIN-2104-A", "Smoked Paprika Seasoning 80g", "SKU-SPS-080", "finished", 3100, "units", "IN", "Northstar Foods · Plant 01", "released", now-timedelta(days=24)),
    ]
    lots = {}
    for code, product, sku, typ, qty, unit, market, facility, state, dt in lot_specs:
        supplier = partners.get(facility)
        if typ == "ingredient": supplier = partners["Global Agro Foods"]
        lot = Lot(tenant_id=tenant.id, code=code, product_name=product, sku=sku, lot_type=typ, quantity=qty, unit=unit, market=market, facility=facility, supplier_partner_id=supplier.id if supplier else None, status=state, received_at=dt if typ == "ingredient" else None, produced_at=dt if typ != "ingredient" else None)
        db.add(lot); db.flush(); lots[code] = lot
    transforms = [
        ("ING-4502", "PRD-8821", 1000, 840, "Tomato sauce production"),
        ("ING-4502", "PRD-8822", 800, 690, "Tomato sauce production"),
        ("PRD-8821", "FIN-8821-A", 600, 1260, "Filling and packaging"),
        ("PRD-8821", "FIN-8821-B", 200, 420, "Filling and packaging"),
        ("PRD-8822", "FIN-8822-A", 500, 1020, "Filling and packaging"),
        ("PRD-8822", "FIN-8822-B", 180, 360, "Filling and packaging"),
        ("ING-3910", "FIN-3910-A", 500, 2400, "Spread production"),
        ("ING-3910", "FIN-3910-B", 400, 1800, "Spread production"),
        ("ING-2104", "FIN-2104-A", 620, 3100, "Seasoning blend and packaging"),
    ]
    for src, dst, inq, outq, proc in transforms:
        db.add(LotTransformation(tenant_id=tenant.id, input_lot_id=lots[src].id, output_lot_id=lots[dst].id, input_quantity=inq, output_quantity=outq, process_name=proc, occurred_at=now-timedelta(days=8)))
    shipment_specs = [
        ("SHP-IN-10481", "FIN-8821-A", "FreshLink Distribution", 540, "pending", 0, 0),
        ("SHP-IN-10482", "FIN-8821-A", "MetroMart India", 420, "acknowledged", 420, 0),
        ("SHP-US-22018", "FIN-8822-A", "Orchard Distribution East", 620, "pending", 0, 0),
        ("SHP-US-22019", "FIN-8822-A", "GreenBasket Markets", 280, "acknowledged", 180, 0),
        ("SHP-US-22020", "FIN-8822-B", "ValleyFresh Retail", 180, "pending", 0, 0),
        ("SHP-IN-10483", "FIN-3910-A", "MetroMart India", 1200, "acknowledged", 0, 0),
        ("SHP-US-22021", "FIN-3910-B", "GreenBasket Markets", 900, "acknowledged", 0, 0),
        ("SHP-IN-10484", "FIN-2104-A", "FreshLink Distribution", 1800, "acknowledged", 0, 0),
    ]
    for ref, lot_code, dest, qty, ack, removed, returned in shipment_specs:
        db.add(Shipment(tenant_id=tenant.id, reference=ref, lot_id=lots[lot_code].id, partner_id=partners[dest].id, quantity=qty, unit="units", shipped_at=now-timedelta(days=6), acknowledgement=ack, removed_quantity=removed, returned_quantity=returned))
    db.flush()
    incidents = [
        Incident(tenant_id=tenant.id, code="BB-2026-001", title="Potential microbiological contamination in tomato concentrate", product_name="Heritage Tomato Basil Sauce 500g", lot_code="ING-4502", issue_type="microbiological", severity="critical", status="investigating", market="GLOBAL", description="Supplier laboratory notification indicates a potential microbiological hazard in ingredient lot ING-4502. Finished goods and downstream recipients require traceability review.", source="supplier_notification", impacted_lots=6, impacted_partners=5, affected_quantity=3060, unit="units", recall_progress=35, owner="Alex Morgan"),
        Incident(tenant_id=tenant.id, code="BB-2026-002", title="Allergen declaration mismatch on chickpea spread", product_name="Organic Chickpea Spread 250g", lot_code="ING-3910", issue_type="labeling", severity="high", status="contained", market="GLOBAL", description="A packaging artwork version may not match the approved allergen declaration. Verify all affected production lots before release.", source="quality_audit", impacted_lots=2, impacted_partners=2, affected_quantity=4200, unit="units", recall_progress=78, owner="Jordan Lee"),
        Incident(tenant_id=tenant.id, code="BB-2026-003", title="Foreign material complaint under investigation", product_name="Smoked Paprika Seasoning 80g", lot_code="ING-2104", issue_type="physical_contamination", severity="medium", status="monitoring", market="IN", description="A customer complaint reports a possible foreign particle. Confirm sample chain of custody and supplier evidence before deciding further action.", source="customer_complaint", impacted_lots=1, impacted_partners=2, affected_quantity=3100, unit="units", recall_progress=12, owner="Ravi Shah"),
    ]
    db.add_all(incidents); db.flush()
    primary = incidents[0]
    actions = [
        ("quarantine_inventory", "Place remaining ING-4502-linked stock on quality hold", "Create internal hold requests for on-hand affected lots at both facilities.", "Northstar Foods · Plant 01 / Plant 02", "high"),
        ("notify_partner", "Notify downstream distribution partners", "Prepare recipient-specific recall notices for shipments linked to affected finished lots.", "5 downstream partners", "high"),
        ("request_acknowledgement", "Request recipient acknowledgement and stock count", "Ask recipients to confirm stop-sale, on-hand quantity and units removed.", "Distribution network", "medium"),
        ("regulatory_dossier", "Prepare country-specific regulatory dossier", "Assemble the incident facts, affected lots, distribution scope and action log for authorized review.", "India + United States", "medium"),
    ]
    for typ, title, desc, target, risk in actions:
        db.add(IncidentAction(tenant_id=tenant.id, incident_id=primary.id, action_type=typ, title=title, description=desc, target=target, risk_level=risk, status="pending_approval"))
    db.add_all([
        Activity(tenant_id=tenant.id, incident_id=primary.id, actor="Alex Morgan", actor_type="user", action="incident_opened", detail="Supplier notification recorded and incident BB-2026-001 opened."),
        Activity(tenant_id=tenant.id, incident_id=primary.id, actor="System", actor_type="system", action="source_lot_linked", detail="Ingredient lot ING-4502 linked to 2 production runs and 4 finished-goods lots."),
        Activity(tenant_id=tenant.id, incident_id=primary.id, actor="Traceability Agent", actor_type="agent", action="recipient_map_created", detail="5 downstream partner records identified across India and the United States."),
    ])
    db.commit()
    return tenant
