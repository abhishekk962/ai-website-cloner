"""Processing functions for the application."""
from app.services.browser import get_screenshot_url

def process_url(url: str):
    """Process a URL and return its screenshot URL."""
    screenshot_url = get_screenshot_url(url)
    return {"url": screenshot_url, "status": "processed"}
