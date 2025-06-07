# AI Website Cloner

This project consists of a **backend** built with FastAPI and a **frontend** built with Next.js and TypeScript. The tool allows users to instantly clone web page designs into HTML by providing a URL. The app communicates with a backend service to process screenshots and extract HTML from the target website.

---

## Features

- **Enter a URL** to clone its design into HTML
- **Live preview** of the extracted HTML
- **Screenshot Task API**: Submit a URL and get a screenshot task ID. Poll for status and result. Uses the Hyperbrowser API for real screenshot generation.
- **HTML Extraction API**: Submit a screenshot URL, get a task ID, and poll for extracted HTML as it is generated (partial and final results).
- **Background Processing**: Uses FastAPI background tasks and threads for async work.
- **Status Polling**: All long-running tasks are tracked by task ID and can be polled for status and results.
- **Streaming/Chunked HTML Extraction**: Extracts and updates HTML in real time, with partial results available while processing.
- **Modern, responsive UI** with React and Next.js
- **Test Coverage**: Includes tests for API endpoints.

---

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
frontend/
  src/app/
    page.tsx          # Main page and logic
    components/       # UI components
```

---

## Getting Started

### Backend

#### 1. Install [uv](https://github.com/astral-sh/uv) (if not already installed)

```powershell
pip install uv
```

#### 2. Install dependencies

From the `backend` directory:

```powershell
uv sync
```

Or manually:

```powershell
uv venv .venv
.venv\Scripts\activate  # On Windows
uv pip install .
```

#### 3. Set up environment variables

Create a `.env` file in `backend/src/app/` with your API keys:

```
GEMINI_API_KEY=your_gemini_api_key_here
HYPERBROWSER_API_KEY=your_hyperbrowser_api_key_here
```

#### 4. Run the backend development server

```powershell
uv run fastapi dev
```

Or with uvicorn:

```powershell
uvicorn app.main:app --reload --app-dir src
```

#### 5. Run backend tests

```powershell
$env:PYTHONPATH="./src"; uv pip install pytest pytest-asyncio
$env:PYTHONPATH="./src"; python -m pytest tests
```

---

### Frontend

#### 1. Install dependencies

From the `frontend` directory:

```powershell
npm install
```

#### 2. Configure Backend URL

The frontend communicates with a backend API (default: `http://127.0.0.1:8000`). To change the backend URL, set the environment variable `NEXT_PUBLIC_BACKEND_URL` in a `.env.local` file at the project root:

```
NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000
```

#### 3. Run the frontend development server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

---

## How It Works

1. Enter a website URL in the input bar and submit.
2. The frontend sends the URL to the backend, which takes a screenshot and processes the page.
3. The backend returns a screenshot and begins extracting the HTML.
4. The frontend polls the backend for extraction progress and displays the HTML preview when ready.
5. Errors and loading states are shown in the UI as needed.

---

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

#### Polling Strategy

- After POST returns a `task_id`, poll the GET endpoint every 1–2 seconds.
- While `status` is `PENDING`, you can display the latest `html` value (partial result).
- When `status` is `SUCCESS` or `FAILURE`, stop polling and display the final result or error.

---

## Customization

- Update styles in the CSS modules under `frontend/src/app/components/` and `frontend/src/app/`
- Adjust backend endpoints in the code if your API differs from the default

---

## Notes

- The backend is designed for local/demo use. For production, add authentication, input validation, and persistent storage.
- The Gemini and Hyperbrowser API keys must be valid and have access to the required services.
- The screenshot logic in `browser.py` uses the Hyperbrowser API for real screenshots.
