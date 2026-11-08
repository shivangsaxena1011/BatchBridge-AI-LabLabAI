from __future__ import annotations
from collections import deque
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models import Lot, LotTransformation, Shipment, Partner


def build_trace(db: Session, tenant_id: int, lot_code: str) -> dict:
    root = db.query(Lot).filter(Lot.tenant_id == tenant_id, Lot.code.ilike(lot_code)).first()
    if not root:
        return {"query": lot_code, "found": False, "nodes": [], "edges": [], "lots": [], "shipments": [], "metrics": {"lots": 0, "partners": 0, "shipped_quantity": 0, "finished_quantity": 0}}
    nodes: dict[str, dict] = {}
    edges: list[dict] = []
    lots: dict[int, Lot] = {root.id: root}
    queue_down = deque([root.id])
    seen_down = {root.id}
    edge_keys = set()
    while queue_down:
        current_id = queue_down.popleft()
        transforms = db.query(LotTransformation).filter(LotTransformation.tenant_id == tenant_id, LotTransformation.input_lot_id == current_id).all()
        for trans in transforms:
            child = db.query(Lot).filter(Lot.id == trans.output_lot_id, Lot.tenant_id == tenant_id).first()
            if not child: continue
            lots[child.id] = child
            edge_key = (trans.input_lot_id, trans.output_lot_id)
            if edge_key not in edge_keys:
                edges.append({"from": lots[current_id].code, "to": child.code, "label": trans.process_name, "input_quantity": trans.input_quantity, "output_quantity": trans.output_quantity})
                edge_keys.add(edge_key)
            if child.id not in seen_down:
                seen_down.add(child.id); queue_down.append(child.id)
    # Walk upstream as well, so a search from a finished lot can still resolve its source ingredients.
    queue_up = deque([root.id])
    seen_up = {root.id}
    while queue_up:
        current_id = queue_up.popleft()
        transforms = db.query(LotTransformation).filter(LotTransformation.tenant_id == tenant_id, LotTransformation.output_lot_id == current_id).all()
        for trans in transforms:
            parent = db.query(Lot).filter(Lot.id == trans.input_lot_id, Lot.tenant_id == tenant_id).first()
            child = db.query(Lot).filter(Lot.id == trans.output_lot_id, Lot.tenant_id == tenant_id).first()
            if not parent or not child: continue
            lots[parent.id] = parent
            edge_key = (trans.input_lot_id, trans.output_lot_id)
            if edge_key not in edge_keys:
                edges.append({"from": parent.code, "to": child.code, "label": trans.process_name, "input_quantity": trans.input_quantity, "output_quantity": trans.output_quantity})
                edge_keys.add(edge_key)
            if parent.id not in seen_up:
                seen_up.add(parent.id); queue_up.append(parent.id)
    for lot in lots.values():
        nodes[lot.code] = {"id": lot.code, "type": lot.lot_type, "label": lot.product_name, "quantity": lot.quantity, "unit": lot.unit, "status": lot.status, "market": lot.market, "facility": lot.facility}
    shipments = []
    partner_ids = set()
    for lot in lots.values():
        if lot.lot_type != "finished": continue
        for shipment in db.query(Shipment).filter(Shipment.tenant_id == tenant_id, Shipment.lot_id == lot.id).all():
            partner = db.query(Partner).filter(Partner.id == shipment.partner_id, Partner.tenant_id == tenant_id).first()
            if not partner: continue
            partner_ids.add(partner.id)
            pnode_id = f"partner:{partner.id}"
            nodes[pnode_id] = {"id": pnode_id, "type": "partner", "label": partner.name, "country": partner.country, "kind": partner.kind, "status": shipment.acknowledgement}
            edges.append({"from": lot.code, "to": pnode_id, "label": shipment.reference, "quantity": shipment.quantity, "shipment_id": shipment.id})
            shipments.append({"id": shipment.id, "reference": shipment.reference, "lot_code": lot.code, "partner_id": partner.id, "partner": partner.name, "partner_kind": partner.kind, "country": partner.country, "quantity": shipment.quantity, "unit": shipment.unit, "acknowledgement": shipment.acknowledgement, "removed_quantity": shipment.removed_quantity, "returned_quantity": shipment.returned_quantity, "shipped_at": shipment.shipped_at.isoformat() if shipment.shipped_at else None})
    finished = [x for x in lots.values() if x.lot_type == "finished"]
    finished_quantity = sum(x.quantity for x in finished)
    shipped_quantity = sum(x["quantity"] for x in shipments)
    pending = sum(1 for x in shipments if x["acknowledgement"] != "acknowledged")
    return {
        "query": root.code, "found": True, "root": nodes[root.code], "nodes": list(nodes.values()), "edges": edges,
        "lots": [ {"id": x.id, "code": x.code, "product_name": x.product_name, "sku": x.sku, "type": x.lot_type, "quantity": x.quantity, "unit": x.unit, "market": x.market, "facility": x.facility, "status": x.status} for x in lots.values() ],
        "shipments": shipments,
        "metrics": {"lots": len(lots), "finished_lots": len(finished), "partners": len(partner_ids), "shipments": len(shipments), "finished_quantity": round(finished_quantity, 2), "shipped_quantity": round(shipped_quantity, 2), "on_hand_estimate": round(max(0, finished_quantity - shipped_quantity), 2), "pending_acknowledgements": pending},
    }
