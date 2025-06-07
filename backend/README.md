# AI Website Cloner Backend

This is a FastAPI backend for screenshot and HTML extraction tasks given a website URL. It supports background processing, status polling, and HTML extraction from screenshots using Gemini API and Hyperbrowser API.

## Features
- **Screenshot Task API**: Submit a URL and get a screenshot task ID. Poll for status and result. Uses the Hyperbrowser API for real screenshot generation.
- **HTML Extraction API**: Submit a screenshot URL, get a task ID, and poll for extracted HTML as it is generated (partial and final results).
- **Background Processing**: Uses FastAPI background tasks and threads for async work.
- **Status Polling**: All long-running tasks are tracked by task ID and can be polled for status and results.
- **Streaming/Chunked HTML Extraction**: Extracts and updates HTML in real time, with partial results available while processing.
- **Test Coverage**: Includes tests for API endpoints.

## Project Structure
```
backend/
  src/app/
    main.py           # FastAPI app entry point
    api/
      models.py       # Pydantic models for request validation
      router.py       # All API endpoints
    core/
      config.py       # App configuration
    services/
      agent.py        # Gemini API integration and HTML extraction
      browser.py      # Screenshot logic (uses Hyperbrowser API)
      tasks.py        # Background task logic
  tests/
    test_endpoints.py # Endpoint tests
```

## Setup Instructions

### 1. Install [uv](https://github.com/astral-sh/uv) (if not already installed)
```
pip install uv
```

### 2. Install dependencies
From the `backend` directory:
```
uv venv .venv
.venv\Scripts\activate  # On Windows
uv pip install -r requirements.txt  # Or use pyproject.toml if available
```

If you have a `pyproject.toml` (recommended):
```
uv pip install .
```

### 3. Set up environment variables
Create a `.env` file in `src/app/` with your API keys:
```
GEMINI_API_KEY=your_gemini_api_key_here
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
```

### 4. Run the FastAPI app
From the `backend` directory:
```
uvicorn app.main:app --reload --app-dir src
```

### 5. Run tests
```
$env:PYTHONPATH="./src"; uv pip install pytest pytest-asyncio
$env:PYTHONPATH="./src"; python -m pytest tests
```

## API Usage

### Screenshot Task
- **POST /tasks**
  - Body: `{ "url": "https://example.com" }`
  - Response: `{ "task_id": "..." }`
- **GET /tasks/{task_id}**
  - Response: `{ "task_id": "...", "status": "PENDING"|"SUCCESS"|"FAILURE", ... }`

### HTML Extraction Task
- **POST /extract-html**
  - Body: `{ "screenshot_url": "https://...png" }`
  - Response: `{ "task_id": "..." }`
- **GET /extract-html/{task_id}**
  - Response while pending: `{ "task_id": "...", "status": "PENDING", "html": "<html>...partial...</html>" }`
  - On success: `{ "task_id": "...", "status": "SUCCESS", "html": "<html>...final...</html>" }`
  - On failure: `{ "task_id": "...", "status": "FAILURE", "error": "..." }`

### Polling Strategy
- After POST returns a `task_id`, poll the GET endpoint every 1–2 seconds.
- While `status` is `PENDING`, you can display the latest `html` value (partial result).
- When `status` is `SUCCESS` or `FAILURE`, stop polling and display the final result or error.

## Notes
- The backend is designed for local/demo use. For production, add authentication, input validation, and persistent storage.
- The Gemini and Hyperbrowser API keys must be valid and have access to the required services.
- The screenshot logic in `browser.py` uses the Hyperbrowser API for real screenshots.


