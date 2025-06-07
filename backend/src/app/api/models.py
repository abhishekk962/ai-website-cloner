"""API models for request/response validation."""
from pydantic import BaseModel

class URLRequest(BaseModel):
    """Request model for screenshot tasks."""
    url: str
