"""Browser service for taking screenshots."""
from app.core.config import settings
from hyperbrowser import Hyperbrowser
from hyperbrowser.models import StartScrapeJobParams, CreateSessionParams, ScrapeOptions

client = Hyperbrowser(api_key=settings.hyperbrowser_api_key)

def get_screenshot_url(url: str) -> str:
    """Take a screenshot of the given URL and return the screenshot URL."""
    result = client.scrape.start_and_wait(
        StartScrapeJobParams(
            url=url,
            session_options=CreateSessionParams(use_stealth=True, solve_captchas=False),
            scrape_options=ScrapeOptions(
                formats=["html", "screenshot"],
                only_main_content=False,
                exclude_tags=["span", "script"],
                wait_for=2000,
                screenshot_options={
                    "full_page": True,
                    "format": "png",
                }
            ),
        )
    )
    return result.data.screenshot
