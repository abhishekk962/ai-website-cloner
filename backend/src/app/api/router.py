"""API routes for the application."""
import uuid
from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import StreamingResponse

from app.api.models import URLRequest
from app.services.tasks import process_url
from app.services.agent import stream_html_from_image, extract_html_chunks_from_stream
import asyncio

# In-memory task status store
TASK_STATUS = {}

router = APIRouter()

@router.post("/tasks")
def create_task(request: URLRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    TASK_STATUS[task_id] = {"task_id": task_id, "status": "PENDING"}
    def task_wrapper(url, task_id):
        try:
            result = process_url(url)
            TASK_STATUS[task_id] = {
                "task_id": task_id,
                "status": "SUCCESS",
                "screenshot_url": result["url"]
            }
        except Exception as e:
            TASK_STATUS[task_id] = {
                "task_id": task_id,
                "status": "FAILURE",
                "error": str(e)
            }
    background_tasks.add_task(task_wrapper, request.url, task_id)
    return {"task_id": task_id}

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    status = TASK_STATUS.get(task_id)
    if not status:
        return {"task_id": task_id, "status": "PENDING"}
    return status

@router.post("/extract-html")
def extract_html(request: Request):
    data = asyncio.run(request.json())
    screenshot_url = data.get("screenshot_url")
    if not screenshot_url:
        return {"error": "screenshot_url is required"}
    task_id = str(uuid.uuid4())
    TASK_STATUS[task_id] = {"task_id": task_id, "status": "PENDING"}
    def html_task(screenshot_url, task_id):
        try:
            # Run the async generator and collect the latest chunk
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            html_chunks = []
            async def run_stream():
                async for chunk in stream_html_from_image(screenshot_url):
                    if chunk:
                        html_chunks.append(chunk)
                        # Update task status with latest chunk while still pending
                        TASK_STATUS[task_id] = {
                            "task_id": task_id,
                            "status": "PENDING",
                            "html": html_chunks[-1]
                        }
            loop.run_until_complete(run_stream())
            # Save the latest chunk as the result
            TASK_STATUS[task_id] = {
                "task_id": task_id,
                "status": "SUCCESS",
                "html": html_chunks[-1] if html_chunks else ""
            }
        except Exception as e:
            TASK_STATUS[task_id] = {
                "task_id": task_id,
                "status": "FAILURE",
                "error": str(e)
            }
    # Run the html_task in the background
    import threading
    threading.Thread(target=html_task, args=(screenshot_url, task_id), daemon=True).start()
    return {"task_id": task_id}

@router.get("/extract-html/{task_id}")
def get_html_status(task_id: str):
    status = TASK_STATUS.get(task_id)
    if not status:
        return {"task_id": task_id, "status": "PENDING"}
    return status
