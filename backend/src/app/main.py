"""Main application entry point."""
import sys
import os
# Ensure src is in Python path before any other imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router

# Initialize the FastAPI application
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Ensure src is in Python path
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    uvicorn.run(app, host="127.0.0.1", port=8000)
