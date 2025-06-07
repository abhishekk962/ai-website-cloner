import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_task_and_status():
    # Test POST /tasks
    response = client.post("/tasks", json={"url": "https://example.com"})
    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data
    task_id = data["task_id"]

    # Test GET /tasks/{task_id}
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] in ("PENDING", "SUCCESS", "FAILURE")

def test_extract_html_polling():
    # Test POST /extract-html
    response = client.post("/extract-html", json={"screenshot_url": "https://example.com/image.png"})
    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data
    task_id = data["task_id"]

    # Test GET /extract-html/{task_id}
    response = client.get(f"/extract-html/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] in ("PENDING", "SUCCESS", "FAILURE")
    # html may or may not be present depending on timing
