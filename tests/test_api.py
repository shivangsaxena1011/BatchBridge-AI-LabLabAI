"""End-to-end API tests. The test suite uses a disposable SQLite file."""
import os
import sys
import tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

_TEST_DIR = Path(tempfile.mkdtemp(prefix="batchbridge-test-"))
os.environ["DATA_DIR"] = str(_TEST_DIR)
os.environ["UPLOAD_DIR"] = str(_TEST_DIR / "uploads")
os.environ["DATABASE_URL"] = f"sqlite:///{(_TEST_DIR / 'test.db').as_posix()}"
os.environ["APP_ENV"] = "test"
os.environ["SEED_DEMO_DATA"] = "true"
os.environ["JWT_SECRET"] = "test-secret-for-batchbridge-api-suite-only-123456"

from fastapi.testclient import TestClient
from app.main import app


def test_health_and_login():
    with TestClient(app) as client:
        assert client.get('/api/health').status_code == 200
        response = client.post('/api/auth/login', json={"email": "demo@batchbridge.ai", "password": "BatchBridgeDemo#2026"})
        assert response.status_code == 200
        assert response.json()["token_type"] == "bearer"
        token = response.json()["access_token"]
        me = client.get('/api/auth/me', headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200
        assert me.json()["user"]["role"] == "admin"


def _login(client):
    response = client.post('/api/auth/login', json={"email": "demo@batchbridge.ai", "password": "BatchBridgeDemo#2026"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


def test_traceability_from_source_and_finished_lot():
    with TestClient(app) as client:
        headers = _login(client)
        source = client.get('/api/traceability/ING-4502', headers=headers)
        assert source.status_code == 200
        data = source.json()
        assert data['metrics']['finished_lots'] == 4
        assert data['metrics']['partners'] == 5
        finished = client.get('/api/traceability/FIN-8821-A', headers=headers)
        assert finished.status_code == 200
        assert any(x['code'] == 'ING-4502' for x in finished.json()['lots'])


def test_investigation_approval_simulation_and_upload():
    with TestClient(app) as client:
        headers = _login(client)
        investigation = client.post('/api/incidents/1/investigate', headers=headers)
        assert investigation.status_code == 200
        payload = investigation.json()
        assert len(payload['agents']) == 7
        assert payload['trace']['metrics']['finished_lots'] == 4
        action = next(x for x in payload['actions'] if x['action_type'] == 'notify_partner')
        approval = client.post(f"/api/actions/{action['id']}/decision", headers=headers, json={"decision": "approve", "reason": "Reviewed in test"})
        assert approval.status_code == 200
        assert approval.json()['notice_count'] > 0
        notices = client.get('/api/notices', headers=headers)
        assert notices.status_code == 200 and notices.json()['total'] > 0
        simulation = client.post('/api/recall-simulations', headers=headers, json={"lot_code": "ING-4502", "market": "GLOBAL"})
        assert simulation.status_code == 200
        assert 0 <= simulation.json()['score'] <= 100
        upload = client.post('/api/incidents/1/documents', headers=headers, files={"file": ("lab-result.txt", b"ING-4502 laboratory review pending", "text/plain")})
        assert upload.status_code == 201
        assert len(upload.json()['sha256']) == 64
        detail = client.get('/api/incidents/1', headers=headers)
        assert detail.status_code == 200
        assert detail.json()['documents'][0]['filename'] == 'lab-result.txt'
        assert detail.json()['incident']['analysis']['agents']


def test_workspace_registration_is_tenant_isolated():
    with TestClient(app) as client:
        response = client.post('/api/auth/register', json={
            "organization": "Isolated Test Kitchens",
            "full_name": "Test Admin",
            "email": "isolated@example.com",
            "password": "SecureTestPass#2026",
        })
        assert response.status_code == 201
        headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
        incidents = client.get('/api/incidents', headers=headers)
        assert incidents.status_code == 200
        assert incidents.json()['total'] == 0
        trace = client.get('/api/traceability/ING-4502', headers=headers)
        assert trace.status_code == 404


def test_invalid_acknowledgement_quantity_is_rejected():
    with TestClient(app) as client:
        headers = _login(client)
        # Shipment 1 belongs to this tenant's seeded data and has 540 units.
        response = client.post('/api/shipments/1/acknowledgement', headers=headers, json={
            "acknowledgement": "acknowledged", "removed_quantity": 400, "returned_quantity": 200, "note": "Invalid total"
        })
        assert response.status_code == 422


def test_frontend_assets_and_ai_status_do_not_expose_credentials():
    with TestClient(app) as client:
        headers = _login(client)
        root = client.get('/')
        assert root.status_code == 200
        assert 'BatchBridge AI' in root.text
        assert client.get('/assets/styles.css').status_code == 200
        assert client.get('/assets/app.js').status_code == 200
        status = client.get('/api/ai/status', headers=headers)
        assert status.status_code == 200
        body = status.json()
        assert body['key_exposed'] is False
        assert 'api_key' not in body and 'vultr_api_key' not in body
